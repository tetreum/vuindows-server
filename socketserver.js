const WebSocketServer = require('websocket').server;
const User = require('./controllers/User');
const Filesystem = require('./controllers/Filesystem');
const Utils = require('./utils');

class SocketServer {
    constructor (webServer) {
        this.server = new WebSocketServer({
            httpServer: webServer,
            autoAcceptConnections: false
        });

        this.setupListeners();
    }

    setupListeners () {
        this.server.on('request', (request) => {

            if (request.requestedProtocols.length < 1 || request.requestedProtocols[0].length < 1) {
                request.reject();
                return;
            }

            const token = request.protocolFullCaseMap[request.requestedProtocols[0]];
            const user = User.validateToken(token);

            if (!user) {
                request.reject();
                console.log('['+ Utils.currentDate + '] Connection from origin ' + request.origin + ' rejected.');
                return;
            }

            this.connection = request.accept(token.toLowerCase(), request.origin);

            console.log('['+ Utils.currentDate + '] ' + user.name + " logged in");

            this.connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    console.log('Received Message: ' + message.utf8Data);
                    this.parseRequest(user, JSON.parse(message.utf8Data));
                }
                else if (message.type === 'binary') {
                    console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                    this.connection.sendBytes(message.binaryData);
                }
            });
            this.connection.on('close', (reasonCode, description) => {
                console.log('['+ Utils.currentDate + '] Peer ' + this.connection.remoteAddress + ' disconnected.');
            });
        });
    }

    parseRequest (user, request) {
        let promise;
        switch (request._action) {
            case "ls":
                promise = (new Filesystem(user)).ls(request.folder);
                break;
            case "mv":
                promise = (new Filesystem(user)).mv(request.origin, request.destination);
                break;
            case "rename":
                promise = (new Filesystem(user)).rename(request.origin, request.destination);
                break;
            case "mkdir":
                promise = (new Filesystem(user)).mkdir(request.path);
                break;
            case "rm":
                promise = (new Filesystem(user)).rm(request.path);
                break;
            case "file_explorer/favorites/toggle":
                promise = (new Filesystem(user)).toggleFavorite(request.name, request.path);
                break;
            case "file_explorer/favorites/list":
                promise = (new Filesystem(user)).getFavorites();
                break;
            case "file_explorer/get":
                promise = (new Filesystem(user)).getFile();
                break;
            case "account/change":
                promise = (new User(null, null, user)).change(request.username, request.password);
                break;
            default:
                this.reply(request, 'command not found', 1);
                return;
        }

        promise.then(response => {
            this.reply(request, response);
        }).catch(response => {
            console.error(response);
            const message = typeof response == 'object' ? response.message : response;
            this.reply(request, message, 1);
        });
    }

    reply (request, response, error = 0) {
        this.connection.sendUTF(JSON.stringify({
            _uuid: request._uuid,
            error: error,
            response: response,
        }));
    }
}

module.exports = SocketServer;
const WebServer = require('./webserver');
const SocketServer = require('./socketserver');
const defaultGateway = require('default-gateway');
const os = require('os');


const port = 8081;

defaultGateway.v4().then(response => {
    const localIp = os.networkInterfaces()[response.interface].find(el => {
        return el.family == 'IPv4';
    }).address;

    const webServer = new WebServer(localIp, port);
    const socketServer = new SocketServer(webServer.server);
});
const WebServer = require('./webserver');
const SocketServer = require('./socketserver');

const port = 8081;

const webServer = new WebServer(port);
const socketServer = new SocketServer(webServer.server);
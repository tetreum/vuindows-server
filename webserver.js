
const http = require("http");
const Url = require('url');
const UserController = require("./controllers/User");

class WebServer  {
    constructor (port) {
        this.HTTP_STATUS_OK = 200;
        this.HTTP_STATUS_NO_CONTENT = 204;
        this.HTTP_STATUS_BAD_REQUEST = 400;
        this.HTTP_STATUS_NOT_FOUND = 404;

        this.server = http.createServer((req, res) => {
            let data = '';
            req.on('data', chunk => {
                data += chunk;
            })
            req.on('end', () => {
                try {
                    data = JSON.parse(data);
                } catch (e) {}
                this.router(req, res, data);
            })
        });

        this.server.listen(port, () => {
          console.log(`Server running on port ${port}`);
        });
    }

    router (req, res, data) {
        const parsedUrl = Url.parse(req.url, true);

        if (req.method == "OPTIONS") {
            return this.reply(res, "", 0, this.HTTP_STATUS_NO_CONTENT);
        }

        switch (parsedUrl.pathname.substring(1)) {
            case "api/login":
                if (typeof data.username == "undefined" || typeof data.password == "undefined") {
                    return this.reply(res, "missing params", 1, this.HTTP_STATUS_BAD_REQUEST);
                }
                const controller = new UserController(req, res, data);
                controller.login(data.username, data.password);
                break;
            default:
                this.reply(res, "not found", 1, this.HTTP_STATUS_NOT_FOUND);
                break;
        }
    }

    reply (res, message, error = 0, statusCode = 200) {
        res.writeHead(statusCode, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
            'Access-Control-Max-Age': 2592000,
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
            error: error,
            message: message
        }));
    }
}

module.exports = WebServer;
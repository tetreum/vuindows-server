
const http = require("http");
const fs = require('fs').promises;
const Url = require('url');
const path = require('path');
const UserController = require("./controllers/User");

class WebServer  {
    constructor (port) {
        this.HTTP_STATUS_OK = 200;
        this.HTTP_STATUS_NO_CONTENT = 204;
        this.HTTP_STATUS_BAD_REQUEST = 400;
        this.HTTP_STATUS_NOT_FOUND = 404;
        this.contentTypes = {
            "jpg" : "image/jpeg",
            "jpeg" : "image/jpeg",
            "gif" : "image/gif",
            "png" : "image/png",
            "webp" : "image/webp",
            "css" : "text/css",
            "html" : "text/html",
            "htm" : "text/html",
            "js" : "application/x-javascript",
        };

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

        let route = parsedUrl.pathname.substring(1);

        if (route.length === 0) {
            route = "index.html";
        }

        switch (route) {
            case "api/login":
                if (typeof data.username == "undefined" || typeof data.password == "undefined") {
                    return this.reply(res, "missing params", 1, this.HTTP_STATUS_BAD_REQUEST);
                }
                const controller = new UserController(req, res, data);
                controller.login(data.username, data.password);
                break;
            default:
                fs.readFile("./client/" + route)
                    .then(contents => {
                        res.setHeader("Content-Type", this.getFileContentType(route));
                        res.writeHead(200);
                        res.end(contents);
                    })
                    .catch(err => {
                        res.writeHead(404);
                        res.end("not found");
                        return;
                    });
                break;
        }
    }

    getFileContentType (fileName) {
        const fileExtension = path.parse(fileName).ext.substring(1);

        if (typeof this.contentTypes[fileExtension] === "undefined") {
            console.error("Error extension " + fileExtension + " is not covered by webserver");
            return "text/html";
        }
        
        return this.contentTypes[fileExtension];
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
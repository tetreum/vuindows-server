
const https = require("https");
const http = require("http");
const fs = require('fs').promises;
const Url = require('url');
const path = require('path');
const UserController = require("./controllers/User");
const Certificate = require("./certificate");

class WebServer  {
    constructor (host, port) {
        this.HTTP_STATUS_OK = 200;
        this.HTTP_STATUS_NO_CONTENT = 204;
        this.HTTP_STATUS_BAD_REQUEST = 400;
        this.HTTP_STATUS_ACCESS_DENIED = 403;
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
            'ttf' : 'font/ttf'
        };

        this.start(host, port);
    }

    isProduction () {
        let isProduction = false;
        process.argv.forEach(function (val, index, array) {
            if (val === "--production") {
                isProduction = true;
            }
        });

        return isProduction;
    }

    start (host, port) {

        const onRequest = (req, res) => {
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
        };
        let protocol = "http";

        if (this.isProduction()) {
            const cert = new Certificate();
            this.server = https.createServer(cert.get(host), onRequest);
            protocol += "s";
        } else {
            this.server = http.createServer(onRequest);
        }

        this.server.listen(port, () => {
          console.log(`Vuindows Server running at ${protocol}://${host}:${port}`);
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
            case "api/fs/get":
                if (typeof req.headers.authorization === "undefined" ||
                    typeof parsedUrl.query.path === "undefined" || 
                    parsedUrl.query.path.length < 1) {
                    return this.reply(res, "missing params", 1, this.HTTP_STATUS_BAD_REQUEST);
                }
                const user = UserController.validateToken(req.headers.authorization);
                if (!user) {
                    return this.reply(res, "missing params", 1, this.HTTP_STATUS_ACCESS_DENIED);
                }

                fs.readFile(parsedUrl.query.path)
                    .then(contents => {
                        this.rawReply(res, contents, {
                            "Content-Type" : this.getFileContentType(parsedUrl.query.path)
                        });
                    })
                    .catch(err => {
                        return this.reply(res, "invalid params", 1, this.HTTP_STATUS_BAD_REQUEST);
                    });
                break;
            case "api/login":
                if (typeof data.username == "undefined" || typeof data.password == "undefined") {
                    return this.reply(res, "missing params", 1, this.HTTP_STATUS_BAD_REQUEST);
                }
                const controller = new UserController(req, res, data);
                controller.login(data.username, data.password);
                break;
            default:
                if (route.includes("/../")) { // hack attempt
                    return;
                }
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

    rawReply (res, message, headers) {
        let headerList = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
            'Access-Control-Max-Age': 2592000,
            'Content-Type': 'application/json'
        };

        Object.keys(headers).forEach(key => {
            headerList[key] = headers[key];
        });

        res.writeHead(this.HTTP_STATUS_OK, headerList);
        res.end(message);
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
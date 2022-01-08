const DB = require('../database.js');

class Controller {
    constructor (req, res, data) {
        this.req = req;
        this.res = res;
        this.data = data;
        this.db = new DB();
    }

    reply (message, statusCode = 200) {
        this.res.statusCode = statusCode;
        this.res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
        this.res.setHeader('Access-Control-Allow-Origin', '*');
        this.res.setHeader('Content-Type', 'application/json');
        this.res.end(JSON.stringify({
            error: 0,
            message: message
        }));
    }

    error (message, error = 0, statusCode = 200) {
        this.res.statusCode = statusCode;
        this.res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
        this.res.setHeader('Access-Control-Allow-Origin', '*');
        this.res.setHeader('Content-Type', 'application/json');
        this.res.end(JSON.stringify({
            error: error,
            message: message
        }));
    }
}

module.exports = Controller;
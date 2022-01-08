const Controller = require('./Controller');
const Config = require('../config/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const os = require('os');


class User extends Controller {
    async login (username, password) {
        password = await bcrypt.hash(password, Config.salt);

        const user = this.db.first('SELECT * FROM users WHERE username = ? AND password = ?', username, password);

        if (user === undefined) {
            return this.error("login failed", 1, 400);
        }

        const token = jwt.sign({
            name: user.username,
            id: user.id
        }, Config.token_secret);

        user.token = token;
        user.platform = os.platform();

        delete(user.password);

        return this.reply(user);
    }

    static validateToken (token) {
        try {
            return jwt.verify(token, Config.token_secret);
        } catch (e) {
            return false;
        }
    }
}

module.exports = User;
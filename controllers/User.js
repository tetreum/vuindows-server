const Controller = require('./Controller');
const Config = require('../config/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const os = require('os');


class User extends Controller {

    change (username, password) {
        return new Promise(async (resolve, reject) => {
            password = await bcrypt.hash(password, Config.salt);

            this.db.update('UPDATE users SET username = ?, password = ? WHERE id = ?', username, password, this.data.id);

            resolve(true);
        });
    }

    async login (username, password) {
        password = await bcrypt.hash(password, Config.salt);

        let user = this.db.first('SELECT * FROM users WHERE username = ? AND password = ?', username, password);

        if (user === undefined) {
            return this.error("login failed", 1, 400);
        }

        const token = jwt.sign({
            name: user.username,
            id: user.id
        }, Config.token_secret);

        user.token = token;
        user.platform = os.platform();

        user = this.clearUser(user);

        return this.reply(user);
    }

    clearUser (user) {
        delete(user.password);

        return user;
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
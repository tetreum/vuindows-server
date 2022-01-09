const path = require('path');
const DatabaseSQLite = require('better-sqlite3');
const bcrypt = require('bcrypt');
const Config = require('./config/config');

class Database {

    constructor () {
        const dbPath = path.resolve(__dirname, 'data/vuindow.db');
        this.db = new DatabaseSQLite(dbPath);

        this.setup();
    }

    first (query) {
        [].shift.apply(arguments);
        return this.db.prepare(query).get(...arguments);
    }

    get (query) {
        [].shift.apply(arguments);
        return this.db.prepare(query).all(...arguments);
    }

    insert (query) {
        [].shift.apply(arguments);
        return this.db.prepare(query).run(...arguments);
    }

    remove (query) {
        [].shift.apply(arguments);
        return this.db.prepare(query).run(...arguments);
    }

    setup () {
        const tables = this.first(`SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%'`);

        if (tables !== undefined) {
            return;
        }

        console.log("Setting up db");

        this.setupUsers();
        this.setupFavorites();
    }

    async setupUsers () {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS 'users' (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                'username' VARCHAR(50) NOT NULL,
                'password' VARCHAR(50) NOT NULL,
                'status' TINYINT NOT NULL DEFAULT '1',
                'created_at' DATETIME NOT NULL,
                UNIQUE ('username','password')
            );
        `);

        const password = await bcrypt.hash("admin", Config.salt);

        this.insert("INSERT INTO users (username, password, created_at) VALUES ('admin', '" + password + "', '" + this.currentDate() + "')");
    }

    async setupFavorites () {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS 'fs_favorites' (
                'user' INTEGER NOT NULL,
                'name' VARCHAR(150) NOT NULL,
                'path' VARCHAR(250) NOT NULL,
                'created_at' DATETIME NOT NULL,
                UNIQUE ('user','path')
            );
        `);
    }

    currentDate () {
        const since = new Date();
        return since.getFullYear() + '-' + this.pad(since.getMonth() + 1) + '-' + this.pad(since.getDate()) + ' ' + this.pad(since.getHours()) + ':' + this.pad(since.getMinutes()) + ':' + this.pad(since.getSeconds());
    }

    pad(number) {
        if ( number < 10 ) {
          return '0' + number;
        }
        return number;
      }
}

module.exports = Database;
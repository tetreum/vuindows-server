const fs = require('fs');
const path = require('path');
const os = require('os');
const child = require('child_process');
const DB = require('../database.js');
const Controller = require('./SocketController.js');

class Filesystem extends Controller {
    getFile (path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path).then(contents => {
                resolve(contents);
            });
        });
    }

    getFavorites () {
        return new Promise((resolve, reject) => {
            const db = new DB();
            const entries = db.get('SELECT * FROM fs_favorites WHERE user = ?', this.user.id);
            resolve(entries);
        });
    }

    toggleFavorite (name, path) {
        return new Promise((resolve, reject) => {
            if (!name || !path) {
                throw new TypeError('missing required params');
            }
            const db = new DB();
            const entry = db.first('SELECT * FROM fs_favorites WHERE user = ? AND path = ?', this.user.id, path);
            
            if (!entry) {
                db.insert("INSERT INTO fs_favorites (user, name, path, created_at) VALUES (?, ?, ?, ?)", [
                    this.user.id, name, path, db.currentDate()
                ]);
            } else {
                db.remove("DELETE FROM fs_favorites WHERE user = ? AND path = ?", [
                    this.user.id, path
                ]);
            }
            resolve(true);
        });
    }
    rm (path) {
        return new Promise((resolve, reject) => {
            if (!path) {
                throw new TypeError('folder is required');
            }

            if (fs.statSync(path).isDirectory()) {
                fs.rmdirSync(path);
            } else {
                fs.rmSync(path);
            }

            resolve(true);
        });
    }
    mkdir (folder) {
        return new Promise((resolve, reject) => {
            if (!folder) {
                throw new TypeError('folder is required');
            }

            fs.mkdirSync(folder, {
                recursive: true,
            });

            resolve(this.statFile(folder));
        });
    }
    async mv (sourcePath, destinationPath, overwrite = false) {
        if (!sourcePath || !destinationPath) {
            throw new TypeError('`sourcePath` and `destinationPath` required');
        }
        const parsedSource = path.parse(sourcePath);
        const parsedDestination = path.parse(destinationPath);

        if (parsedSource.ext.length > 0 && parsedDestination.ext.length == 0) {
            destinationPath = path.join(destinationPath, parsedSource.base);
        }

        if (!overwrite && fs.existsSync(destinationPath)) {
            throw new Error(`The destination file exists: ${destinationPath}`);
        }

        // it's not just a rename
        if (parsedSource.dir !== parsedDestination.dir) {
            fs.mkdirSync(path.dirname(destinationPath), {
                recursive: true,
            });
        }
    
        try {
            fs.renameSync(sourcePath, destinationPath);
            return true;
        } catch (error) {
            if (error.code === 'EXDEV') {
                fs.copyFileSync(sourcePath, destinationPath);
                fs.unlinkSync(sourcePath);
                return true;
            } else {
                throw error;
            }
        }
    }

    statFile (filePath) {
        const parsedPath = path.parse(filePath);
        const stats = fs.statSync(filePath);

        let obj = JSON.parse(JSON.stringify(stats));
        obj.directory = stats.isDirectory();
        obj.name = parsedPath.base;
        obj.path = filePath;

        return obj;
    }

    ls (directory) {
        return new Promise((resolve, reject) => {

            // windows doesnt have a "root folder" so we list its drives instead
            if (directory === "/" && os.platform() === "win32") {
                this.getWindowsDrives().then(drives => {
                    const list = [];
                    drives.forEach(drive => {
                        list.push({
                            directory: true,
                            name: drive,
                            path: drive + path.sep,
                        });
                    });
                    resolve(list);
                });
                return;
            }

            fs.readdir(directory, {withFileTypes: false}, (err, files) => {
                if (err) {
                    return reject(err);
                } 
                const list = [];
                const totalFiles = files.length - 1;

                files.forEach((fileName, i) => {
                    try {
                        const filePath = path.join(directory, fileName);
                        let obj = this.statFile(filePath);
                        list.push(obj);
                    } catch (e) {
                    }

                    if (i == totalFiles) {
                        resolve(list);
                    }
                });
            });
        });
    }

    getWindowsDrives () {
        return new Promise((resolve, reject) => {
            child.exec('wmic logicaldisk get name', (error, stdout) => {
                if (error) {
                    return reject(error);
                }
                resolve(
                    stdout.split('\r\r\n')
                        .filter(value => /[A-Za-z]:/.test(value))
                        .map(value => value.trim())
                );
            });
        });
    }
}

module.exports = Filesystem;
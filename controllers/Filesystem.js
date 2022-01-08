const fs = require('fs');
const path = require('path');

class Filesystem {
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

        fs.mkdirSync(path.dirname(destinationPath), {
            recursive: true,
        });
    
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

    ls (directory) {
        return new Promise((resolve, reject) => {
            fs.readdir(directory, {withFileTypes: false}, (err, files) => {
                if (err) {
                    return reject(err);
                } 
                const list = [];
                const totalFiles = files.length - 1;

                files.forEach((fileName, i) => {
                    try {
                        const filePath = path.join(directory, fileName);
                        const stats = fs.statSync(filePath);

                        let obj = JSON.parse(JSON.stringify(stats));
                        obj.directory = stats.isDirectory();
                        obj.name = fileName;
                        obj.path = filePath;
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
}

module.exports = Filesystem;
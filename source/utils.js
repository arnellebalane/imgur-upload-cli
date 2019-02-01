import fs from 'fs';
import path from 'path';
import util from 'util';
import userHome from 'user-home';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

class ModuleConfig {
    constructor(fileName) {
        this.configPath = path.join(userHome, fileName);
    }

    _readConfig() {
        return readFile(this.configPath)
            .then(buffer => buffer.toString('ascii'))
            .then(contents => JSON.parse(contents))
            .catch(() => ({}));
    }

    _writeConfig(contents) {
        return writeFile(
            this.configPath,
            JSON.stringify(contents, null, '  ')
        );
    }

    async get(key, defaultValue=null) {
        const contents = await this._readConfig();
        return key in contents ? contents[key] : defaultValue;
    }

    async set(key, value) {
        const contents = await this._readConfig();
        contents[key] = value;
        return this._writeConfig(contents);
    }

    async append(key, ...values) {
        const contents = await this._readConfig();
        if (!(key in contents)) {
            contents[key] = [];
        }
        contents[key].push(...values);
        return this._writeConfig(contents);
    }
}

export function base64File(filePath) {
    return readFile(filePath)
        .then(buffer => buffer.toString('base64'));
}

export const moduleConfig = new ModuleConfig('.imgur-upload');

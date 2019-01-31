import fs from 'fs';
import util from 'util';

const readFile = util.promisify(fs.readFile);

export function base64File(filePath) {
    return readFile(filePath)
        .then(buffer => buffer.toString('base64'));
}

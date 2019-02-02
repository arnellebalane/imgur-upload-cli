#!/usr/bin/env node
import meow from 'meow';
import ora from 'ora';
import api from '.';

const cli = meow(`
    Upload images:
      $ imgur-upload path/to/image.jpg
      $ imgur-upload path/to/image-one.jpg path/to/image-two.jpg
      $ imgur-upload path/to/*.jpg

    Upload latest image in a directory:
      $ imgur-upload latest path/to/directory
        (if directory is not passed, defaults to the base directory)

    Get base directory:
      $ imgur-upload basedir

    Set base directory:
      $ imgur-upload basedir path/to/base-directory

    View upload history:
      $ imgur-upload history

    Clear upload history:
      $ imgur-upload clear
`);


// Map commands to api methods
const commands = {
    async upload(imagePaths) {
        const result = imagePaths.length > 1
            ? await api.uploadAlbum(imagePaths)
            : await api.uploadImage(imagePaths[0]);
        console.log(result);
    },

    async basedir(dirPath) {
        const result = dirPath
            ? await api.setBaseDirectory(dirPath)
            : await api.getBaseDirectory(dirPath);
        console.log(result);
    },

    async history() {
        const result = await api.getHistory();
        console.log(result);
    },

    async clear() {
        const result = await api.clearHistory();
        console.log(result);
    }
};


// Normalize commands and inputs
let [command, ...inputs] = cli.input;

if (!['basedir', 'history', 'clear'].includes(command)) {
    inputs = [command, ...inputs];
    command = 'upload';
}

// Execute commands
(async () => {
    if (typeof commands[command] === 'function') {
        await commands[command](inputs);
    } else {
        console.log(`Unknown command: ${command}`);
    }
})();

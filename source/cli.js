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


const spinner = ora();


// Map commands to api methods
const commands = {
    async upload(imagePaths) {
        if (imagePaths.length > 1) {
            spinner.text = 'Uploading images to an album';
            spinner.start();

            const result = await api.uploadAlbum(imagePaths);
            spinner.stop();

            console.log(`Album URL: http://imgur.com/a/${result.id}`);
            console.log('Image URLs:');
            imagePaths.map((imagePath, i) => {
                console.log(`  ${imagePath} => ${result.images[i].link}`);
            });
        } else {
            spinner.text = `Uploading ${imagePaths[0]}`;
            spinner.start();

            const result = await api.uploadImage(imagePaths[0]);
            spinner.stop();

            console.log(result.link);
        }
    },

    async basedir([dirPath]) {
        if (dirPath) {
            spinner.text = 'Setting base directory';
            spinner.start();

            await api.setBaseDirectory(dirPath);
            spinner.stop();

            console.log(`Base directory now set to ${dirPath}`);
        } else {
            spinner.text = 'Getting base directory';
            spinner.start();

            const result = await api.getBaseDirectory();
            spinner.stop();

            if (result) {
                console.log(result);
            } else {
                console.log('Base directory is currently not set.');
            }
        }
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

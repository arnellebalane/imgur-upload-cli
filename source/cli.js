#!/usr/bin/env node
import meow from 'meow';
import ora from 'ora';
import chalk from 'chalk';
import api from '.';

/* eslint-disable max-len */
const cli = meow(`
    ${chalk.dim.underline('Upload images:')}
      ${chalk.dim('$')} ${chalk.green('imgur-upload')} ${chalk.yellow('path/to/image.jpg')}
      ${chalk.dim('$')} ${chalk.green('imgur-upload')} ${chalk.yellow('path/to/image-one.jpg path/to/image-two.jpg')}
      ${chalk.dim('$')} ${chalk.green('imgur-upload')} ${chalk.yellow('path/to/*.jpg')}

    ${chalk.dim.underline('Upload latest image in a directory:')}
      ${chalk.dim('$')} ${chalk.green('imgur-upload')} ${chalk.blue('latest')} ${chalk.yellow('path/to/directory')}
        ${chalk.dim('(if directory is not passed, defaults to the base directory)')}

    ${chalk.dim.underline('Get base directory:')}
      ${chalk.dim('$')} ${chalk.green('imgur-upload')} ${chalk.blue('basedir')}

    ${chalk.dim.underline('Set base directory:')}
      ${chalk.dim('$')} ${chalk.green('imgur-upload')} ${chalk.blue('basedir')} ${chalk.yellow('path/to/base-directory')}

    ${chalk.dim.underline('View upload history:')}
      ${chalk.dim('$')} ${chalk.green('imgur-upload')} ${chalk.blue('history')}

    ${chalk.dim.underline('Clear upload history:')}
      ${chalk.dim('$')} ${chalk.green('imgur-upload')} ${chalk.blue('clear')}
`);
/* eslint-enable max-len */


const spinner = ora();


// Map commands to api methods
const commands = {
    async upload(imagePaths) {
        if (imagePaths.length > 1) {
            spinner.text = chalk.blue('Uploading images to an album');
            spinner.start();

            const result = await api.uploadAlbum(imagePaths);
            spinner.stop();

            console.log(chalk.dim('Album URL:'), chalk.green(`http://imgur.com/a/${result.id}`));
            console.log(chalk.dim('Image URLs:'));
            imagePaths.forEach((imagePath, i) => {
                console.log(`  ${chalk.yellow(imagePath)} ${chalk.dim('=>')} ${chalk.green(result.images[i].link)}`);
            });
        } else {
            spinner.text = chalk.blue(`Uploading ${imagePaths[0]}`);
            spinner.start();

            const result = await api.uploadImage(imagePaths[0]);
            spinner.stop();

            console.log(chalk.green(result.link));
        }
    },

    async basedir([dirPath]) {
        if (dirPath) {
            spinner.text = chalk.blue('Setting base directory');
            spinner.start();

            await api.setBaseDirectory(dirPath);
            spinner.stop();

            console.log(chalk.green('Base directory now set to'), chalk.yellow(dirPath));
        } else {
            spinner.text = chalk.blue('Getting base directory');
            spinner.start();

            const result = await api.getBaseDirectory();
            spinner.stop();

            if (result) {
                console.log(chalk.yellow(result));
            } else {
                console.log(chalk.red('Base directory is currently not set.'));
            }
        }
    },

    async history() {
        spinner.text = chalk.blue('Getting upload history');
        spinner.start();

        const result = await api.getHistory();
        spinner.stop();

        result.forEach(({deletehash, link}) => {
            console.log(`${chalk.yellow(deletehash)}${chalk.dim(':')} ${chalk.green(link)}`);
        });
    },

    async clear() {
        spinner.text = chalk.blue('Clearing upload history');
        spinner.start();

        await api.clearHistory();
        spinner.stop();

        console.log(chalk.green('Upload history cleared.'));
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

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const meow = require('meow');
const unique = require('array-unique');
const request = require('request');
const userhome = require('user-home');
const spinner = require('ora')();


const cli = meow([`
    Usage:

      Uploading images
        imgur-upload path/to/image.jpg
        imgur-upload path/to/image-one.jpg path/to/image-two.jpg
        imgur-upload path/to/*.jpg

      Uploading latest image in a directory
        imgur-upload latest path/to/directory

      Setting default image in a directory
        imgur-upload basedir path/to/directory
        imgur-upload latest

      Viewing upload history
        imgur-upload history

      Clear upload history
        imgur-upload clear

    Options:

      --delete, -d     Delete image file after being uploaded
`], {
    alias: {
        'd': 'delete'
    },
    boolean: ['delete']
});



/** normalize command and parameter values **/

switch (cli.input[0]) {
    case 'latest':
    case 'basedir':
        var command = cli.input[0];
        var parameter = cli.input[1];
        break;

    case 'history':
    case 'clear':
        var command = cli.input[0];
        break;

    default:
        var command = 'upload';
        var parameters = unique(cli.input);
}

const flags = cli.flags;



/** execute commands **/

if (command === 'upload' && parameters.length === 1) {
    spinner.start();
    spinner.text = `Uploading ${parameters[0]}`;

    uploadImage(parameters[0], null, function(link) {
        spinner.stop();
        addUploadHistoryItem(link);
        if (flags.delete) {
            deleteImage(parameters[0]);
        }
        console.log(link);
    });
}


else if (command === 'upload' && parameters.length > 1) {
    spinner.start();

    uploadAlbum(parameters, function(link) {
        spinner.stop();
        addUploadHistoryItem(link);
        console.log(link);
    });
}


else if (command === 'history') {
    const history = moduleConfig().history;
    if (history) {
        history.forEach(function(link) {
            console.log(link);
        });
    }
}


else if (command === 'clear') {
    clearUploadHistory();
    console.log('imgur-upload history cleared');
}


else if (command === 'basedir' && parameter) {
    setBaseDir(parameter);
}


else if (command === 'basedir' && !parameter) {
    try {
        console.log(getBaseDir());
    } catch (e) {
        console.log(e.message);
    }
}


else if (command === 'latest' && parameter) {
    spinner.start();

    uploadLatestImageInDirectory(parameter, function(link) {
        spinner.stop();
        addUploadHistoryItem(link);
        console.log(link);
    });
}


else if (command === 'latest' && !parameter) {
    try {
        const basedir = getBaseDir();
        spinner.start();

        uploadLatestImageInDirectory(basedir, function(link) {
            spinner.stop();
            addUploadHistoryItem(link);
            console.log(link);
        });
    } catch (e) {
        console.log(e.message);
    }
}




function uploadImage(image, album, callback) {
    const data = {
        url: 'https://api.imgur.com/3/image',
        method: 'POST',
        formData: {
            image: fs.createReadStream(image)
        }
    };
    if (album) {
        data.formData.album = album;
    }
    sendApiRequest(data, function(response) {
        callback(`http://imgur.com/${response.data.id}`);
    });
}


function uploadAlbum(images, callback) {
    spinner.text = 'Creating album';
    const data = {
        url: 'https://api.imgur.com/3/album',
        method: 'POST'
    };
    sendApiRequest(data, function(response) {
        const albumid = response.data.deletehash;
        let index = 0;
        (function uploadAlbumImage() {
            if (index < images.length) {
                const image = images[index++];
                spinner.text = `Uploading ${image}`;
                uploadImage(image, albumid, function() {
                    if (flags.delete) {
                        deleteImage(image);
                    }
                    uploadAlbumImage();
                });
            } else {
                callback(`http://imgur.com/a/${response.data.id}`);
            }
        })();
    });
}


function uploadLatestImageInDirectory(directory, callback) {
    fs.readdir(directory, function(error, files) {
        const images = files.filter(function(file) {
            return /\.(jpg|jpeg|png|gif|bmp)$/.test(file);
        });
        const latestImage = images.reduce(function(latest, current) {
            const latestStat = fs.statSync(path.join(directory, latest));
            const currentStat = fs.statSync(path.join(directory, current));
            const latestModifiedTime = new Date(latestStat.mtime);
            const currentModifiedTime = new Date(currentStat.mtime);
            if (latestModifiedTime.valueOf() > currentModifiedTime.valueOf()) {
                return latest;
            }
            return current;
        }, images[0]);
        const latestImagePath = path.join(directory, latestImage);

        spinner.text = `Uploading ${latestImagePath}`;
        uploadImage(latestImagePath, null, function(link) {
            if (flags.delete) {
                deleteImage(latestImagePath);
            }
            callback(link);
        });
    });
}


function sendApiRequest(data, callback) {
    data.headers = data.headers || {};
    data.headers['Authorization'] = 'Client-ID ae51d45d93313f1';
    request(data, function(error, response, body) {
        if (error) {
            throw error;
        }
        callback(JSON.parse(body));
    });
}


function deleteImage(image) {
    fs.unlinkSync(image);
}


function setBaseDir(basedir) {
    const config = moduleConfig();
    config.basedir = basedir;
    moduleConfig(config);
}


function getBaseDir(basedir) {
    const config = moduleConfig();
    if (config.basedir) {
        return config.basedir;
    }
    throw new Error('imgur-upload basedir is not yet set');
}


function addUploadHistoryItem(link) {
    const config = moduleConfig();
    if (!('history' in config)) {
        config.history = [];
    }
    config.history.push(link);
    moduleConfig(config);
}


function clearUploadHistory() {
    const config = moduleConfig();
    config.history = [];
    moduleConfig(config);
}


function moduleConfig(config) {
    const configDirectory = path.join(userhome, '.imgur-upload');
    try {
        fs.statSync(configDirectory);
    } catch (e) {
        fs.mkdirSync(configDirectory);
    }
    const configFile = path.join(configDirectory, 'config.json');
    try {
        fs.statSync(configFile);
    } catch (e) {
        fs.writeFileSync(configFile, '{}');
    }

    if (config) {
        return fs.writeFileSync(configFile, JSON.stringify(config));
    }
    const contents = fs.readFileSync(configFile);
    return JSON.parse(contents);
}

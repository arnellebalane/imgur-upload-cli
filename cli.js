var fs = require('fs');
var path = require('path');
var meow = require('meow');
var unique = require('array-unique');
var request = require('request');
var userhome = require('user-home');
var ora = require('ora');


var cli = meow([
    'Usage:',
    '',
    '  Uploading images',
    '    imgur-upload path/to/image.jpg',
    '    imgur-upload path/to/image-one.jpg path/to/image-two.jpg',
    '    imgur-upload path/to/*.jpg',
    '',
    '  Uploading latest image in a directory',
    '    imgur-upload latest path/to/directory',
    '',
    '  Setting default image source directory',
    '    imgur-upload basedir path/to/directory',
    '    imgur-upload latest',
    '',
    '  Viewing upload history',
    '    imgur-upload history',
    '  Clear upload history',
    '    imgur-upload clear',
    '',
    'Options:',
    '  --delete, -d     Delete image file after being uploaded'
], {
    alias: {
        'd': 'delete'
    },
    boolean: ['delete']
});


var options = {
    delete: cli.flags.delete,
    command: 'upload',
    paths: unique(cli.input)
};

if (cli.input[0] === 'latest') {
    options.command = 'latest';
    options.path = cli.input[1];
    delete options.paths;
} else if (cli.input[0] === 'basedir') {
    options.command = 'basedir';
    options.path = cli.input[1];
    delete options.paths;
} else if (cli.input[0] === 'history') {
    options.command = 'history';
    delete options.paths;
} else if (cli.input[0] === 'clear') {
    options.command = 'clear';
    delete options.paths;
}

var spinner = ora();


if (options.command === 'upload' && options.paths.length === 1) {
    spinner.start();
    spinner.text = 'Uploading ' + options.paths[0];
    uploadImage(options.paths[0], null, function(link) {
        spinner.stop();
        addUploadHistoryItem(link);
        console.log(link);
    });
} else if (options.command === 'upload' && options.paths.length > 1) {
    spinner.start();
    uploadAlbum(options.paths, function(link) {
        spinner.stop();
        addUploadHistoryItem(link);
        console.log(link);
    });
} else if (options.command === 'history') {
    moduleConfig().history.forEach(function(link) {
        console.log(link);
    });
} else if (options.command === 'clear') {
    clearUploadHistory();
    console.log('imgur-upload history cleared');
} else if (options.command === 'basedir' && options.path) {
    setBaseDir(options.path);
} else if (options.command === 'basedir' && !options.path) {
    try {
        console.log(getBaseDir());
    } catch (e) {
        console.log(e.message);
    }
}




function uploadImage(image, album, callback) {
    var data = {
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
        callback('http://imgur.com/' + response.data.id);
    });
}


function uploadAlbum(images, callback) {
    spinner.text = 'Creating album';
    var data = {
        url: 'https://api.imgur.com/3/album',
        method: 'POST'
    };
    sendApiRequest(data, function(response) {
        var albumid = response.data.deletehash;
        var index = 0;
        (function uploadAlbumImage() {
            if (index < images.length) {
                var image = images[index++];
                spinner.text = 'Uploading ' + image;
                uploadImage(image, albumid, uploadAlbumImage);
            } else {
                callback('http://imgur.com/a/' + response.data.id);
            }
        })();
    });
}


function sendApiRequest(data, callback) {
    data.headers = data.headers || {};
    data.headers['Authorization'] = 'Client-ID ae51d45d93313f1';
    request(data, function(error, response, body) {
        if (error) {
            throw error();
        }
        callback(JSON.parse(body));
    });
}


function setBaseDir(basedir) {
    var config = moduleConfig();
    config.basedir = basedir;
    moduleConfig(config);
}


function getBaseDir(basedir) {
    var config = moduleConfig();
    if (config.basedir) {
        return config.basedir;
    }
    throw new Error('imgur-upload basedir is not yet set');
}


function addUploadHistoryItem(link) {
    var config = moduleConfig();
    if (!('history' in config)) {
        config.history = [];
    }
    config.history.push(link);
    moduleConfig(config);
}


function clearUploadHistory() {
    var config = moduleConfig();
    config.history = [];
    moduleConfig(config);
}


function moduleConfig(config) {
    var configDirectory = path.join(userhome, '.imgur-upload');
    try {
        fs.statSync(configDirectory);
    } catch (e) {
        fs.mkdirSync(configDirectory);
    }
    var configFile = path.join(configDirectory, 'config.json');
    try {
        fs.statSync(configFile);
    } catch (e) {
        fs.writeFileSync(configFile, '{}');
    }

    if (config) {
        return fs.writeFileSync(configFile, JSON.stringify(config));
    }
    var contents = fs.readFileSync(configFile);
    return JSON.parse(contents);
}

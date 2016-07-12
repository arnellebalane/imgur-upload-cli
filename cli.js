var fs = require('fs');
var meow = require('meow');
var unique = require('array-unique');
var request = require('request');
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
    delete optoins.paths;
}

var spinner = ora();


if (options.command === 'upload' && options.paths.length === 1) {
    spinner.start();
    spinner.text = 'Uploading ' + options.paths[0];
    uploadImage(options.paths[0], null, function(link) {
        spinner.stop();
        console.log(link);
    });
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

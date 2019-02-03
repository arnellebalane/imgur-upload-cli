import '@babel/polyfill';
import fs from 'fs';
import path from 'path';
import util from 'util';
import trash from 'trash';
import config from './config';
import axios from './axios';
import {
    base64File,
    moduleConfig
} from './utils';

const readDir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

async function uploadImage(imagePath, album=null) {
    const data = {
        image: await base64File(imagePath)
    };

    if (album) {
        data.album = album;
    }

    return axios.post(config.API_IMAGE_URL, data)
        .then(async response => {
            /* eslint-disable-next-line no-use-before-define */
            await addHistory(imagePath, response);
            return response;
        });
}

async function uploadAlbum(imagePaths) {
    const album = await axios.post(config.API_ALBUM_URL);
    const albumID = album.deletehash;

    const images = await Promise.all(imagePaths.map(
        imagePath => uploadImage(imagePath, albumID)
    ));

    return {...album, images};
}

function deleteImages(imagePaths) {
    return trash(imagePaths);
}

function getHistory() {
    return moduleConfig.get('history', []);
}

function addHistory(imagePath, data) {
    return moduleConfig.append('history', {
        id: data.id,
        path: imagePath,
        link: data.link,
        deletehash: data.deletehash
    });
}

function clearHistory() {
    return moduleConfig.set('history', []);
}

function setBaseDirectory(baseDirPath) {
    return moduleConfig.set('baseDir', baseDirPath);
}

function getBaseDirectory() {
    return moduleConfig.get('baseDir', null);
}

async function getLatestImage(dirPath) {
    const files = await readDir(dirPath);
    const images = files.filter(
        fileName => /\.(jpe?g|png|gif|bmp)$/.test(fileName)
    );

    return images.reduce((latest, current) => {
        const currentPath = path.join(dirPath, current);
        const [latestTime, currentTime] = Promise.all([
            stat(latest).then(s => new Date(s.mtime)),
            stat(currentPath).then(s => new Date(s.mtime))
        ]);
        return latestTime > currentTime ? latest : currentPath;
    }, path.join(dirPath, images[0]));
}

async function uploadLatestImage(dirPath) {
    if (!dirPath) {
        dirPath = await getBaseDirectory();
        if (!dirPath) {
            return Promise.reject(
                new Error('Please provide a directory, or set the base directory.')
            );
        }
    }

    const imagePath = await getLatestImage(dirPath);
    if (!imagePath) {
        return Promise.reject(
            new Error('No image found in the specified directory.')
        );
    }

    return uploadImage(imagePath);
}

export default {
    uploadImage,
    uploadAlbum,
    deleteImages,
    getHistory,
    clearHistory,
    setBaseDirectory,
    getBaseDirectory,
    uploadLatestImage
};

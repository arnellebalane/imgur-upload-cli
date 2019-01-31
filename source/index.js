import '@babel/polyfill';
import fs from 'fs';
import util from 'util';
import config from './config';
import axios from './axios';

const readFile = util.promisify(fs.readFile);

function base64File(filePath) {
    return readFile(filePath)
        .then(buffer => buffer.toString('base64'));
}

export async function uploadImage(imagePath, album=null) {
    const data = {
        image: await base64File(imagePath)
    };

    if (album) {
        data.album = album;
    }

    return axios.post(config.API_IMAGE_URL, data);
}

export function uploadAlbum(imagePaths) {

}

export function displayHistory() {

}

export function clearHistory() {

}

export function setBaseDirectory(baseDirPath) {

}

export function getBaseDirectory() {

}

export function uploadLatest(dirPath) {

}

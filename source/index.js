import '@babel/polyfill';
import config from './config';
import axios from './axios';
import {base64File} from './utils';

export async function uploadImage(imagePath, album=null) {
    const data = {
        image: await base64File(imagePath)
    };

    if (album) {
        data.album = album;
    }

    return axios.post(config.API_IMAGE_URL, data);
}

export async function uploadAlbum(imagePaths) {
    const album = await axios.post(config.API_ALBUM_URL);
    const albumID = album.deletehash;

    return Promise.all(imagePaths.map(
        imagePath => uploadImage(imagePath, albumID)
    ));
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

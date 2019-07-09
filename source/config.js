const DEFAULT_API_CLIENT_ID = 'ae51d45d93313f1';

export default {
    API_CLIENT_ID: process.env.IMGUR_CLIENT_ID || DEFAULT_API_CLIENT_ID,
    API_IMAGE_URL: 'https://api.imgur.com/3/image',
    API_ALBUM_URL: 'https://api.imgur.com/3/album',
};

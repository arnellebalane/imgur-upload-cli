
const DEFAULT_API_CLIENT_ID = 'ae51d45d93313f1';

function getApiClientId() {
    let apiClientId = process.env.IMGUR_CLIENT_ID;
    if (!apiClientId) {
        apiClientId = DEFAULT_API_CLIENT_ID;
    }
    return apiClientId;
}

export default {
    API_CLIENT_ID: getApiClientId(),
    API_IMAGE_URL: 'https://api.imgur.com/3/image',
    API_ALBUM_URL: 'https://api.imgur.com/3/album',
};

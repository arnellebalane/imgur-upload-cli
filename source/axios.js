import axios from 'axios';
import config from './config';

axios.interceptors.request.use(request => {
    let apiClientId = process.env.IMGUR_CLIENT_ID;
    if (!apiClientId) {
        apiClientId = config.DEFAULT_API_CLIENT_ID;
    }
    request.headers.Authorization = `Client-ID ${apiClientId}`;
    return request;
});

axios.interceptors.response.use(response => response.data.data);

export default axios;

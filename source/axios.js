import axios from 'axios';
import config from './config';

axios.interceptors.request.use(request => {
    request.headers.Authorization = `Client-ID ${config.API_CLIENT_ID}`;
    return request;
});

axios.interceptors.response.use(response => response.data.data);

export default axios;

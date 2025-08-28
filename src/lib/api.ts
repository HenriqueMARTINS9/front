import axios from 'axios';


export const api = axios.create({
    baseURL: 'http://vps.virtualsomm.ch:8081',
});
/* This file sends requests to the server using axios for token-based requests */

import axios from 'axios';
axios.defaults.withCredentials = true; //send the cookie back to the server with token

const serverURL = 'http://localhost:8000';

export async function onRegistration(registrationData) {
    return await axios.post(`${serverURL}/auth/register`, registrationData);
};

export async function onLogin(loginData) {
    return await axios.post(`${serverURL}/auth/login`, loginData);
};

export async function onLogout() {
    return await axios.get(`${serverURL}/auth/logout`);
};

export async function fetchProtectedInfo() {
    return await axios.get(`${serverURL}/auth/protected`);
};

export async function fetchProtectedInfoSSO() {
    return await axios.get(`${serverURL}/auth/protected-sso`);
};

export async function onSSOSuccess() {
    return await axios.get(`${serverURL}/auth/login/success`);
};

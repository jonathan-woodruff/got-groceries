/* authentication state handling */

import { createSlice } from '@reduxjs/toolkit';

const userAuthFromLocalStorage = () => {
    const isAuth = localStorage.getItem('isAuth');
    if (isAuth && JSON.parse(isAuth) === true) {
        return true;
    }
    return false;
};

const initialState = {
    isAuth: userAuthFromLocalStorage(),
    ssoLogin: false
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authenticateUser: (state) => {
            state.isAuth = true;
        },
        unauthenticateUser: (state) => {
            state.isAuth = false;
        },
        sso: (state) => {
            state.ssoLogin = true;
        },
        notSSO: (state) => {
            state.ssoLogin = false;
        }
    }
});

export const { authenticateUser, unauthenticateUser, sso, notSSO } = authSlice.actions;

export default authSlice.reducer;
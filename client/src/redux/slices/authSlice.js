/* authentication state handling */

import { createSlice } from '@reduxjs/toolkit';

const userAuthFromLocalStorage = () => {
    const isAuth = localStorage.getItem('isAuth');
    if (isAuth && JSON.parse(isAuth) === true) {
        return true;
    }
    return false;
};

const userEmailFromLocalStorage = () => {
    const userEmail = localStorage.getItem('userEmail');
    return userEmail ? userEmail : null;
}

const initialState = {
    isAuth: userAuthFromLocalStorage(),
    ssoLogin: false,
    userEmail: userEmailFromLocalStorage()
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
        },
        assignUser: (state, action) => {
            state.userEmail = action.payload.userEmail;
        }
    }
});

export const { authenticateUser, unauthenticateUser, sso, notSSO, assignUser } = authSlice.actions;

export default authSlice.reducer;
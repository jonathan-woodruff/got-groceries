/* Use this to define variables that can be used anywhere on the client */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    clientURL: 'http://got-groceries-client.onrender.com',
    serverURL: 'http://got-groceries.onrender.com'
};

export const globalsSlice = createSlice({
    name: 'glob',
    initialState,
    reducers: { }
});

export default globalsSlice.reducer;
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import globalsSlice from './slices/globalsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    glob: globalsSlice
  },
});

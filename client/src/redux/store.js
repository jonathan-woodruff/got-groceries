import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import globalsSlice from './slices/globalsSlice';
import mealsSlice from './slices/mealsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    glob: globalsSlice,
    meals: mealsSlice
  },
});

/* meals state handling */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedMealsList: []
};

export const mealsSlice = createSlice({
    name: 'meals',
    initialState,
    reducers: {
        addMeal: (state, action) => {
            const meal = action.payload.meal;
            state.selectedMealsList.append(meal);
        },
        removeMeal: (state,action) => {
            const meal = action.payload.meal;
            const index = state.selectedMealsList.findIndex(mealName => {
                return mealName === meal;
            });
            state.selectedMealsList.splice(index, 1);
        }
    }
});

export const { addMeal, removeMeal } = mealsSlice.actions;

export default mealsSlice.reducer;
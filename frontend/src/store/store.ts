import { configureStore } from '@reduxjs/toolkit';
import tagHierarchySlice from './slices/tagHierarchySlice';
import twrUpdateSlice from './slices/twrUpdateSlice';

export const store = configureStore({
    reducer: {
        tagHierarchy: tagHierarchySlice,
        twrUpdate: twrUpdateSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

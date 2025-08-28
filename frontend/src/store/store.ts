import { configureStore } from '@reduxjs/toolkit';
import tagHierarchySlice from './slices/tagHierarchySlice';

export const store = configureStore({
    reducer: {
        tagHierarchy: tagHierarchySlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

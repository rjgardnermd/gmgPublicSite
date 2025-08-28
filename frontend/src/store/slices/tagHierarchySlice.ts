import { createSlice } from '@reduxjs/toolkit';
import type { TagHierarchyNode } from '../../models/TagHierarchy';

interface TagHierarchyState {
    data: TagHierarchyNode | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TagHierarchyState = {
    data: null,
    status: 'idle',
    error: null,
};

export const tagHierarchySlice = createSlice({
    name: 'tagHierarchy',
    initialState,
    reducers: {
        setLoading: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        setSuccess: (state, action) => {
            state.status = 'succeeded';
            state.data = action.payload;
            state.error = null;
        },
        setError: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
        clearData: (state) => {
            state.data = null;
            state.status = 'idle';
            state.error = null;
        },
    },
});

export const { setLoading, setSuccess, setError, clearData } = tagHierarchySlice.actions;
export default tagHierarchySlice.reducer;

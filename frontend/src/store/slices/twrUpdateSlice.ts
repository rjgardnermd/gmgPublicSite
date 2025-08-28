import { createSlice } from '@reduxjs/toolkit';
import type { TwrUpdateData } from '../../models/TwrUpdate';

interface TwrUpdateState {
    data: TwrUpdateData | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    lastUpdated: string | null;
}

const initialState: TwrUpdateState = {
    data: null,
    status: 'idle',
    error: null,
    lastUpdated: null,
};

export const twrUpdateSlice = createSlice({
    name: 'twrUpdate',
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
            state.lastUpdated = new Date().toISOString();
        },
        setError: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
        clearData: (state) => {
            state.data = null;
            state.status = 'idle';
            state.error = null;
            state.lastUpdated = null;
        },
    },
});

export const { setLoading, setSuccess, setError, clearData } = twrUpdateSlice.actions;
export default twrUpdateSlice.reducer;

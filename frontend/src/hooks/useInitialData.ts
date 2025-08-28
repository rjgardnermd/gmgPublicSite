import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setLoading, setSuccess, setError } from '../store/slices/tagHierarchySlice';
import { setSuccess as setTwrSuccess, setError as setTwrError } from '../store/slices/twrUpdateSlice';
import { reporterApi } from '../api/reporterApi';

export const useInitialData = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const fetchInitialData = async () => {
            // Fetch tag hierarchy
            dispatch(setLoading());
            try {
                const tagData = await reporterApi.getTagHierarchy();
                dispatch(setSuccess(tagData));
            } catch (error) {
                console.error('Failed to fetch tag hierarchy:', error);
                dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch tag hierarchy'));
            }

            // Fetch TWR data
            try {
                const twrData = await reporterApi.getTwr();
                dispatch(setTwrSuccess(twrData));
            } catch (error) {
                console.error('Failed to fetch TWR data:', error);
                dispatch(setTwrError(error instanceof Error ? error.message : 'Failed to fetch TWR data'));
            }
        };

        fetchInitialData();
    }, [dispatch]);
};

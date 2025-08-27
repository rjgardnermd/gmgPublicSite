import { env } from '../config/env';
import type { TagHierarchyNode } from '../models/TagHierarchy';

class HubApi {
    private baseUrl: string;
    private authToken: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXIiLCJleHAiOjE3NTk5MTIzMzJ9.tnDADx_af64feWGdq0DVfeEGSuw5KdnM0SX7-wkqJy4';

    constructor() {
        this.baseUrl = `http://${env.hubHost}:${env.hubPort}`;
    }

    async getTagHierarchy(): Promise<TagHierarchyNode> {
        try {
            const response = await fetch(`${this.baseUrl}/get-tag-hierarchy`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching tag hierarchy:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const hubApi = new HubApi();

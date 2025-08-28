import { env } from '../config/env';
import type { TagHierarchyNode } from '../models/TagHierarchy';

class ReporterApi {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `http://${env.reporterHost}:${env.reporterPort}`;
    }

    async getTagHierarchy(): Promise<TagHierarchyNode> {
        try {
            const response = await fetch(`${this.baseUrl}/get-portfolio-tag-hierarchy`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
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
export const reporterApi = new ReporterApi();

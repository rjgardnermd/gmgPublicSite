import type { TagHierarchyNode } from '../models/TagHierarchy';
import type { TwrUpdateData } from '../models/TwrUpdate';
import { env } from '../config/env';

class ReporterApi {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `http://${env.reporterHost}:${env.reporterPort}`;
    }

    async getTagHierarchy(): Promise<TagHierarchyNode> {
        const response = await fetch(`${this.baseUrl}/get-portfolio-tag-hierarchy`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getTwr(): Promise<TwrUpdateData> {
        const response = await fetch(`${this.baseUrl}/get-twr`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}

export const reporterApi = new ReporterApi();

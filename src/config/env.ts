export interface Env {
  reporterHost: string;
  reporterPort: number;
}

export const env: Env = {
  reporterHost: import.meta.env.VITE_REPORTER_HOST || 'localhost',
  reporterPort: Number(import.meta.env.VITE_REPORTER_PORT) || 8007,
};

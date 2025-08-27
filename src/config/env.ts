export interface Env {
  hubHost: string;
  hubPort: number;
}

export const env: Env = {
  hubHost: import.meta.env.VITE_HUB_HOST || 'localhost',
  hubPort: Number(import.meta.env.VITE_HUB_PORT) || 3000,
};

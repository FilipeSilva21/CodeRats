export interface AppConfig {
  backendUrl: string;
  wsUrl: string;
}

export let sharedConfig: AppConfig = {
  backendUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080'
};

export const injectConfig = (config: AppConfig) => {
  sharedConfig = config;
};

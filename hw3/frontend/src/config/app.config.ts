// Application configuration
// This file manages the data storage mode and other app settings

export type DataMode = 'localStorage' | 'api';

interface AppConfig {
  dataMode: DataMode;
  apiBaseUrl: string;
}

/**
 * Get the current data storage mode
 * Priority: process.env > localStorage setting > default
 */
function getDataMode(): DataMode {
  // Check environment variable first
  const envMode = process.env.REACT_APP_DATA_MODE;
  if (envMode === 'localStorage' || envMode === 'api') {
    return envMode;
  }

  // Check localStorage for user preference
  const savedMode = localStorage.getItem('app_data_mode');
  if (savedMode === 'localStorage' || savedMode === 'api') {
    return savedMode as DataMode;
  }

  // Default to localStorage for development convenience
  return 'localStorage';
}

/**
 * Set the data storage mode
 */
export function setDataMode(mode: DataMode): void {
  localStorage.setItem('app_data_mode', mode);
  window.location.reload();
}

/**
 * Application configuration object
 */
export const appConfig: AppConfig = {
  dataMode: getDataMode(),
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
};

// Log current mode for debugging
console.log(`[App Config] Data mode: ${appConfig.dataMode}`);


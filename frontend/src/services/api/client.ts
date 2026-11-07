import axios from 'axios';

// Environment variable with safe fallback
export const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

export interface HealthCheckResult {
  isOnline: boolean;
  statusText: string;
  statusCode?: number;
  latencyMs?: number;
  details?: Record<string, unknown>;
}

/**
 * Checks connection to the FastAPI backend
 */
export async function checkBackendHealth(
  baseUrl = DEFAULT_API_BASE_URL,
  healthEndpoint = '/health'
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const url = `${baseUrl.replace(/\/$/, '')}${healthEndpoint}`;

  try {
    const response = await axios.get(url, {
      timeout: 4000,
      headers: { 'Accept': 'application/json' },
    });
    const latencyMs = Date.now() - startTime;

    return {
      isOnline: response.status >= 200 && response.status < 300,
      statusText: `Connected (${latencyMs}ms) - Status ${response.status}`,
      statusCode: response.status,
      latencyMs,
      details: response.data,
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    let message = 'Backend unreachable';

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = 'Connection timed out (>4000ms)';
    } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      message = `Cannot connect to FastAPI at ${baseUrl}. Ensure backend server is running.`;
    } else if (error.response) {
      message = `Server responded with HTTP ${error.response.status}`;
    }

    return {
      isOnline: false,
      statusText: message,
      statusCode: error.response?.status,
      latencyMs,
    };
  }
}

import { timeout } from "rxjs";

export const environment = {
  production: false,
  apiBaseUrl: '/api',
  auth: {
    mock: true,
    idle: {
      timeoutMs: 5 * 60 * 1000, // 15 minutes
      warningDurationMs: 1 * 60 * 1000 // 2 minutes
    }
   }
};

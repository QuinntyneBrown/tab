import { InjectionToken } from '@angular/core';

/** Absolute base URL of the backend API, e.g. `https://api.example.com/api/v1`. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

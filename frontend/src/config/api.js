/**
 * Dynamic API Base URL Configuration
 * In Local Development: defaults to http://localhost:5000
 * In Render Production: set VITE_API_URL=https://your-backend-service.onrender.com in Render Environment Variables
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Shared HTTP client for all API services
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100/api';

// Cache for ongoing requests to prevent duplicates
const ongoingRequests = new Map();

// Generic fetch wrapper with error handling, authentication, and deduplication
export const httpClient = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Adding auth token to request:', endpoint);
  } else {
    console.log('⚠️ No auth token found for request:', endpoint);
  }

  // Create a unique key for request deduplication (method + url + body)
  const requestKey = `${config.method || 'GET'}_${url}_${JSON.stringify(config.body || '')}`;

  // Exclude certain endpoints from deduplication (like login, register, logout)
  const excludeFromCache = endpoint.includes('/login') || 
                          endpoint.includes('/register') || 
                          endpoint.includes('/logout') || 
                          endpoint.includes('/verify-email') ||
                          endpoint.includes('/reset-password');

  // Check if the same request is already ongoing (except for excluded endpoints)
  if (!excludeFromCache && ongoingRequests.has(requestKey)) {
    console.log('🔄 Reusing ongoing request:', endpoint);
    return ongoingRequests.get(requestKey);
  }

  // Create the request promise
  const requestPromise = (async () => {
    try {
      console.log('�📡 Making API call to:', url);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error Response:', {
          url,
          status: response.status,
          error: data.error || data.message
        });
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ API Success:', endpoint, 'Status:', response.status);
      return data;
    } catch (error) {
      console.error('💥 API Error:', endpoint, error);
      throw error;
    } finally {
      // Remove from ongoing requests when done (only if it was cached)
      if (!excludeFromCache) {
        ongoingRequests.delete(requestKey);
      }
    }
  })();

  // Store the request promise only if not excluded from cache
  if (!excludeFromCache) {
    ongoingRequests.set(requestKey, requestPromise);
  }

  return requestPromise;
};

// HTTP methods helpers
export const http = {
  get: (endpoint, options = {}) => httpClient(endpoint, { method: 'GET', ...options }),
  post: (endpoint, data, options = {}) => httpClient(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data), 
    ...options 
  }),
  put: (endpoint, data, options = {}) => httpClient(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data), 
    ...options 
  }),
  delete: (endpoint, options = {}) => httpClient(endpoint, { method: 'DELETE', ...options }),
};

export default httpClient;

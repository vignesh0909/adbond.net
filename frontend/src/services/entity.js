// API service for backend integration
const API_BASE_URL = 'http://localhost:4100/api';

// Generic fetch wrapper with error handling
const fetchAPI = async (endpoint, options = {}) => {
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
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Entity Management APIs
export const entityAPI = {
    // Register new entity (public endpoint)
    register: async (entityData) => {
        return await fetchAPI('/entities/register', {
            method: 'POST',
            body: JSON.stringify(entityData),
        });
    },

    // Get all public entities
    getPublicEntities: async (entityType = '') => {
        const queryParam = entityType ? `?entity_type=${entityType}` : '';
        return await fetchAPI(`/entities/public${queryParam}`);
    },

    // Get entities by type with pagination
    getEntitiesByType: async (type, page = 1, limit = 10) => {
        return await fetchAPI(`/entities/type/${type}?page=${page}&limit=${limit}`);
    },

    // Get all entities (authenticated)
    getAllEntities: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const queryString = queryParams ? `?${queryParams}` : '';
        return await fetchAPI(`/entities${queryString}`);
    },

    // Get entity by ID
    getEntityById: async (entityId) => {
        return await fetchAPI(`/entities/${entityId}`);
    },

    // Update entity
    updateEntity: async (entityId, entityData) => {
        return await fetchAPI(`/entities/${entityId}`, {
            method: 'PUT',
            body: JSON.stringify(entityData),
        });
    },

    // Update verification status (admin only)
    updateVerificationStatus: async (entityId, status) => {
        return await fetchAPI(`/entities/${entityId}/verification`, {
            method: 'PUT',
            body: JSON.stringify({ verification_status: status }),
        });
    },

    // Delete entity (admin only)
    deleteEntity: async (entityId) => {
        return await fetchAPI(`/entities/${entityId}`, {
            method: 'DELETE',
        });
    },
};

export default { entityAPI };
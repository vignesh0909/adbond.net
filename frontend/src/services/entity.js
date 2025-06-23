import { http } from './httpClient';

// Entity Management APIs
export const entityAPI = {
  // Register new entity (public endpoint)
  register: async (entityData) => {
    return await http.post('/entities/register', entityData);
  },

  // Get all public entities
  getPublicEntities: async (entityType = '') => {
    const queryParam = entityType ? `?entity_type=${entityType}` : '';
    return await http.get(`/entities/public${queryParam}`);
  },

  // Get entities by type with pagination
  getEntitiesByType: async (type, page = 1, limit = 10) => {
    return await http.get(`/entities/type/${type}?page=${page}&limit=${limit}`);
  },

  // Get all entities (authenticated)
  getAllEntities: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const queryString = queryParams ? `?${queryParams}` : '';
    return await http.get(`/entities${queryString}`);
  },

  // Get entity by ID
  getEntityById: async (entityId) => {
    return await http.get(`/entities/${entityId}`);
  },

  // Get public entity by ID (no authentication required)
  getPublicEntityById: async (entityId) => {
    return await http.get(`/entities/public/${entityId}`);
  },

  // Update entity
  updateEntity: async (entityId, entityData) => {
    return await http.put(`/entities/${entityId}`, entityData);
  },

  // Update verification status (admin only)
  updateVerificationStatus: async (entityId, status) => {
    return await http.put(`/entities/${entityId}/verification`, { verification_status: status });
  },

  // Delete entity (admin only)
  deleteEntity: async (entityId) => {
    return await http.delete(`/entities/${entityId}`);
  },
};

export default entityAPI;
import { http } from './httpClient';

export const affiliateCompaniesAPI = {
  // Get all affiliate companies (requires authentication)
  async getCompanies(filters = {}) {
    try {
      // Build query string manually
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = `/affiliate-companies/fetch${queryString ? `?${queryString}` : ''}`;
      
      const response = await http.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch companies');
    }
  },

  // Get company details by ID
  async getCompanyById(companyId) {
    try {
      const response = await http.get(`/affiliate-companies/${companyId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch company details');
    }
  },

  // Get company contacts (access control applied on backend)
  async getCompanyContacts(companyId) {
    try {
      const response = await http.get(`/affiliate-companies/${companyId}/contacts`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch company contacts');
    }
  },

  // Search contacts across companies
  async searchContacts(searchTerm, filters = {}) {
    try {
      const queryParams = new URLSearchParams({ q: searchTerm, ...filters });
      const queryString = queryParams.toString();
      const endpoint = `/affiliate-companies/contacts/search?${queryString}`;
      
      const response = await http.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to search contacts');
    }
  }
};

export const verificationAPI = {
  // Get user verification status
  async getVerificationStatus() {
    try {
      const response = await http.get('/users/verification-status');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get verification status');
    }
  },

  // Verify identity
  async verifyIdentity(method, data) {
    try {
      const response = await http.post('/users/verify-identity', {
        verification_method: method,
        ...data
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Identity verification failed');
    }
  },

  // Resend email verification
  async resendEmailVerification(email) {
    try {
      const response = await http.post('/users/resend-verification', { email });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
  },

  // Verify email token
  async verifyEmailToken(token) {
    try {
      const response = await http.get(`/users/verify-email/${token}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Email verification failed');
    }
  }
};

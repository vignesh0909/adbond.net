// Utility functions for the application
export const utils = {
    // Format currency
    formatCurrency: (amount, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    },
  
    // Format date
    formatDate: (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  
    // Validate email
    isValidEmail: (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
  
    // Validate URL
    isValidUrl: (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
  
    // Format phone number
    formatPhone: (phone) => {
      // Remove all non-digit characters
      const cleaned = phone.replace(/\D/g, '');
      
      // Apply US phone number format
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      } else if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
      }
      
      return phone; // Return original if format doesn't match
    },
  
    // Debounce function for search inputs
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
  
    // Capitalize first letter of each word
    titleCase: (str) => {
      return str.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    },
  
    // Generate random ID
    generateId: () => {
      return Math.random().toString(36).substr(2, 9);
    },
  
    // Get initials from name
    getInitials: (name) => {
      if (!name) return 'U';
      const names = name.split(' ');
      if (names.length === 1) return names[0][0].toUpperCase();
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    },
  
    // Calculate time ago
    timeAgo: (dateString) => {
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now - date) / 1000);
  
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
      return `${Math.floor(diffInSeconds / 31536000)}y ago`;
    },
  };
  
  export default utils;
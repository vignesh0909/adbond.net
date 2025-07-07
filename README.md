
# AdBond.net

A comprehensive affiliate marketing platform with entity management, review system, and administrative controls.

## Recent Improvements ✨

### API Service Refactoring & Duplicate Call Elimination
- **Modular API Architecture**: Refactored all API services into modular, reusable components
- **Request Deduplication**: Implemented intelligent request deduplication to prevent duplicate API calls
- **Enhanced Error Handling**: Consistent error handling across all API calls with user-friendly feedback
- **Performance Optimization**: Debounced API calls and request cancellation for better performance

### Admin Panel UX Enhancements
- **Loading Animations**: Added loading spinners for all entity approval/rejection actions
- **Toast Notifications**: Implemented success and error toast notifications using react-toastify
- **Better User Feedback**: Clear visual feedback for all administrative actions
- **Improved Error Handling**: User-friendly error messages with actionable guidance

### Technical Improvements
- **Custom Hooks**: Created reusable API call hooks for better state management
- **React StrictMode**: Disabled in development to prevent duplicate API calls
- **Centralized HTTP Client**: Single HTTP client with consistent configuration
- **Documentation**: Comprehensive migration guides and improvement documentation

## Project Structure

```
├── backend/              # Node.js/Express backend
├── frontend/            # React/Vite frontend
├── ui-server/           # Production UI server
└── README.md           # Project documentation
```

## Quick Start

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
npm install
npm start
```

## Key Features

- **Entity Management**: Register and manage business entities
- **Review System**: User reviews and ratings for entities
- **Admin Panel**: Comprehensive administrative controls
- **Offer Management**: Handle affiliate offers and commissions
- **User Authentication**: Secure user registration and login
- **Responsive Design**: Mobile-first responsive interface

## Documentation

- [API Service Migration Guide](frontend/src/services/MIGRATION_GUIDE.md)
- [Duplicate API Fixes](frontend/src/DUPLICATE_API_FIXES.md)
- [Admin UX Improvements](frontend/src/ADMIN_UX_IMPROVEMENTS.md)

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- React Toastify

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication

## Contributing

1. Follow the migration guide when updating API calls
2. Use the centralized HTTP client for new API integrations
3. Implement proper loading states and error handling
4. Add appropriate toast notifications for user actions
5. Test for duplicate API call prevention

## License

[Add your license information here]
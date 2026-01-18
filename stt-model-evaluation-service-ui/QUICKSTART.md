# Quick Start Guide

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

## Default Login

The application requires a backend API. For development, you can use mock data or configure your backend API endpoint in `vite.config.ts`.

## Project Structure Overview

### Key Directories

- **`src/api/`** - API service layer for backend communication
- **`src/views/`** - Page components organized by feature
- **`src/components/`** - Reusable UI components (can be added as needed)
- **`src/stores/`** - Pinia state management stores
- **`src/types/`** - TypeScript type definitions
- **`src/router/`** - Vue Router configuration
- **`src/layouts/`** - Layout components

### Feature Modules

1. **Sample Management** (`src/views/samples/`)
   - SampleList.vue - List and filter samples
   - SampleUpload.vue - Upload new samples
   - SampleDetail.vue - View and edit sample details

2. **Model Management** (`src/views/models/`)
   - ModelList.vue - List all models
   - ModelForm.vue - Create/edit models
   - ModelDetail.vue - View model details and test connection

3. **Task Management** (`src/views/tasks/`)
   - TaskList.vue - List and manage test tasks
   - TaskForm.vue - Create new test tasks
   - TaskDetail.vue - View task details and logs
   - TaskResults.vue - View test results
   - InstantTest.vue - Quick test interface

4. **Evaluation Reports** (`src/views/reports/`)
   - ReportList.vue - List all evaluation reports
   - ReportDetail.vue - Detailed report with charts and analysis

5. **System Management** (`src/views/system/`)
   - UserManagement.vue - Manage users and roles
   - SystemConfig.vue - Configure system settings
   - AuditLogs.vue - View audit logs

## API Integration

The frontend expects a RESTful API backend. Update the API base URL in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://your-backend-url:port',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Development Tips

1. **Hot Module Replacement**: The dev server supports HMR for instant updates
2. **TypeScript**: All components are typed for better development experience
3. **Element Plus**: UI components from Element Plus are used throughout
4. **State Management**: Pinia stores are used for global state
5. **Routing**: Vue Router handles navigation with route guards for authentication

## Next Steps

1. Configure your backend API endpoint
2. Implement authentication flow
3. Customize UI components as needed
4. Add additional features or components
5. Set up CI/CD pipeline

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, Vite will automatically try the next available port.

### API Connection Issues
Check that your backend API is running and the proxy configuration in `vite.config.ts` is correct.

### Type Errors
Run `npm run build` to check for TypeScript errors, or use your IDE's TypeScript checker.

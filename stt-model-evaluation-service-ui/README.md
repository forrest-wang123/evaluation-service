# STT Model Evaluation Service UI

A comprehensive frontend application for Speech-to-Text (STT) model evaluation built with Vue 3 + TypeScript.

## Features

### 1. Sample Management
- **Sample Upload**: Upload audio files (mp3, wav, aac, pcm) with metadata
- **Sample Management**: View, edit, and delete samples
- **Batch Operations**: Import/export sample sets
- **Audio Processing**: Automatic format conversion and metadata labeling
- **Audio Playback**: Built-in audio player for sample preview

### 2. Model Management
- **Model Integration**: Support for HTTP API, gRPC, and WebSocket interfaces
- **Connection Configuration**: Configure endpoints, ports, and protocols
- **Authentication**: Support for API Key, Token, Username/Password, and OAuth
- **Model Testing**: Test connection validity
- **Model Grouping**: Group models by vendor, version, or scenario

### 3. Task Management
- **Test Task Definition**: Create tasks with execution parameters
- **Sample Selection**: Manual selection or conditional filtering
- **Model Selection**: Single model or comparative testing
- **Task Execution**: Real-time progress monitoring and control
- **Execution Logs**: View detailed execution logs
- **Task Control**: Pause, resume, and cancel tasks
- **Instant Testing**: Real-time recording or upload for quick testing

### 4. Evaluation Reports
- **Comprehensive Reports**: Automatic scoring and grade assessment (A+/A/B/C/D)
- **Detailed Metrics**: Accuracy, performance, and robustness analysis
- **Visualization**: Charts and graphs for metric trends
- **Error Analysis**: Error type distribution and analysis
- **Export & Sharing**: PDF/Excel export and shareable links

### 5. System Management
- **User Management**: Role-based access control (Admin, Tester, Viewer)
- **Permission Management**: Project/team isolation
- **System Configuration**: Configure evaluation metric weights and alert thresholds
- **Audit Logs**: Operation audit trail

## Technology Stack

- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Next-generation frontend build tool
- **Pinia**: State management
- **Vue Router**: Official router for Vue.js
- **Element Plus**: Vue 3 component library
- **ECharts**: Data visualization
- **Axios**: HTTP client
- **Day.js**: Date manipulation library

## Project Structure

```
stt-model-evaluation-service-ui/
├── src/
│   ├── api/              # API service layer
│   │   ├── index.ts      # Axios configuration
│   │   ├── auth.ts       # Authentication API
│   │   ├── samples.ts    # Sample management API
│   │   ├── models.ts     # Model management API
│   │   ├── tasks.ts      # Task management API
│   │   ├── reports.ts    # Report API
│   │   └── system.ts     # System management API
│   ├── components/       # Reusable components
│   ├── layouts/          # Layout components
│   │   └── MainLayout.vue
│   ├── router/           # Route configuration
│   │   └── index.ts
│   ├── stores/           # Pinia stores
│   │   ├── user.ts       # User store
│   │   └── samples.ts    # Sample store
│   ├── styles/           # Global styles
│   │   └── main.scss
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── views/            # Page components
│   │   ├── Login.vue
│   │   ├── samples/      # Sample management views
│   │   ├── models/       # Model management views
│   │   ├── tasks/        # Task management views
│   │   ├── reports/      # Report views
│   │   └── system/       # System management views
│   ├── App.vue           # Root component
│   └── main.ts           # Application entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0 or yarn >= 1.22.0

### Installation

1. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview

Preview the production build:

```bash
npm run preview
```

## Configuration

### Authentication Configuration

The login feature can be enabled or disabled by modifying `src/config/auth.ts`:

```typescript
export const AUTH_CONFIG = {
  // Set to false to temporarily disable login (no login required to access)
  // Set to true to enable login (login required to access)
  ENABLE_AUTH: false  // Currently login is disabled
}
```

**When `ENABLE_AUTH` is `false`:**
- All pages are accessible without login
- A default guest user with admin role is automatically set
- Login page redirects to home page
- User dropdown menu shows guest information

**When `ENABLE_AUTH` is `true`:**
- Users must log in to access protected pages
- Login page works normally
- User authentication is required

### API Configuration

The API base URL is configured in `vite.config.ts`. By default, it proxies `/api` requests to `http://localhost:8080`. You can modify this in the proxy configuration:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

### Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Features Overview

### Sample Management
- Upload audio files with metadata (name, industry, scenario, noise level)
- Batch import/export via Excel
- Audio fingerprinting to prevent duplicates
- Audio playback and preview

### Model Management
- Support for multiple interface types (HTTP API, gRPC, WebSocket)
- Flexible authentication configuration
- Connection testing
- Model grouping and comparison

### Task Management
- Create test tasks with flexible sample and model selection
- Real-time execution monitoring
- Task control (pause, resume, cancel)
- Execution logs viewing
- Instant testing for quick validation

### Evaluation Reports
- Comprehensive evaluation with automatic scoring
- Grade assessment (A+/A/B/C/D)
- Detailed metric analysis with charts
- Error distribution visualization
- PDF/Excel export
- Shareable report links

### System Management
- User and role management
- Project/team isolation
- System configuration (metric weights, alert thresholds, SLA targets)
- Audit logging

## API Integration

The application expects a RESTful API backend. The API endpoints should follow these patterns:

- `POST /api/auth/login` - User login
- `GET /api/samples` - Get sample list
- `POST /api/samples/upload` - Upload sample
- `GET /api/models` - Get model list
- `POST /api/models` - Create model
- `GET /api/tasks` - Get task list
- `POST /api/tasks` - Create task
- `GET /api/reports` - Get report list
- `GET /api/system/users` - Get user list
- `GET /api/system/config` - Get system configuration

See the `src/api` directory for complete API interface definitions.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

# Resumic.ai

A modern resume builder application with AI-powered features.

## Project Structure

The project is organized into two main directories:

### Frontend (`/frontend`)
- React + TypeScript application
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Framer Motion for animations

### Backend (`/backend`)
- Node.js + Express + TypeScript
- MongoDB for database
- JWT for authentication
- Express Validator for input validation

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/resumic-ai.git
cd resumic-ai
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend and backend dependencies
npm install --workspaces
```

3. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Update the values in `.env` with your configuration

4. Start the development servers:
```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## Development

### Frontend
- Located in `/frontend`
- Uses Vite for fast development
- Hot module replacement enabled
- ESLint for code linting
- TypeScript for type safety

### Backend
- Located in `/backend`
- Express.js server with TypeScript
- MongoDB with Mongoose ODM
- JWT authentication
- API routes under `/api`
- Environment variables in `.env`

## Building for Production

```bash
# Build both frontend and backend
npm run build

# Start production servers
npm run start
```

## Testing

```bash
# Run tests for both frontend and backend
npm run test

# Run frontend tests
npm run test --workspace=frontend

# Run backend tests
npm run test --workspace=backend
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
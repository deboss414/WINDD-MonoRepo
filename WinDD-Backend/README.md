# WinDD Backend

This is the backend server for the WinDD application, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/windd-backend.git
cd windd-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/windd
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Development

To start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`.

## Production

To build and start the production server:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/users/login` - Login with email and password
- `POST /api/users/register` - Register a new user
- `POST /api/users/logout` - Logout the current user

## Testing

To run tests:
```bash
npm test
```

## License

This project is licensed under the MIT License. 
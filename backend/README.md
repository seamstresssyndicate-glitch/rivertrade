# Rivertrade Backend Server

Node.js/Express backend for the Rivertrade investment platform.

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
The `.env` file is already created with default values. Update if needed:
- `API_KEY`: Change `rivertrade-secret-api-key-2026` to your own secret
- `JWT_SECRET`: Update with your own JWT secret
- `PORT`: Default is 5000

### 3. Run the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check if server is running (no auth required)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Investments
- `GET /api/investments` - Get all investment plans
- `POST /api/investments/create` - Create new investment
- `GET /api/investments/:investmentId` - Get investment details
- `PUT /api/investments/:investmentId` - Update investment

### Portfolio
- `GET /api/portfolio/:userId` - Get user portfolio
- `POST /api/portfolio/:userId/deposit` - Add funds
- `GET /api/portfolio/:userId/earnings` - Get earnings

## Authentication

All API endpoints (except `/health`) require the `X-API-Key` header:

```javascript
fetch('http://localhost:5000/api/investments', {
  headers: {
    'X-API-Key': 'rivertrade-secret-api-key-2026'
  }
})
```

## Example Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: rivertrade-secret-api-key-2026" \
  -d '{"email":"user@example.com","password":"pass123","fullName":"John Doe"}'
```

### Get Investment Plans
```bash
curl http://localhost:5000/api/investments \
  -H "X-API-Key: rivertrade-secret-api-key-2026"
```

## Next Steps

1. Replace mock database with actual database (MongoDB, PostgreSQL, etc.)
2. Implement proper password hashing with bcryptjs
3. Add JWT token authentication
4. Add input validation and sanitization
5. Add logging and error tracking
6. Add unit and integration tests

# Digital Wallet System

A robust digital wallet system with user authentication, wallet operations, transaction processing, fraud detection, and admin reporting.

## Features

- **User Authentication & Session Management**
  - Secure user registration and login
  - JWT-based authentication
  - Protected routes with middleware
  - Session tracking and last login updates

- **Wallet Operations**
  - Deposit and withdraw virtual cash
  - Transfer funds between users
  - Transaction history with pagination
  - Multiple currency support
  - Real-time balance updates

- **Transaction Processing & Validation**
  - Atomic transactions with MongoDB transactions
  - Balance validation and overdraft protection
  - Transaction status tracking (PENDING, COMPLETED, FAILED)
  - Transaction rollback on failure

- **Fraud Detection**
  - Rule-based fraud detection system
  - Suspicious pattern detection
  - Transaction flagging and monitoring
  - Daily fraud reports
  - Risk scoring for transactions

- **Admin & Reporting**
  - User management and status control
  - Transaction monitoring and flagging
  - System statistics and analytics
  - Fraud reports and risk assessment
  - User activity tracking

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn
- Git

## Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd digital-wallet
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure MongoDB:
   - Ensure MongoDB is installed and running
   - For transaction support, configure MongoDB as a replica set:
     ```sh
     # Edit MongoDB config
     sudo nano /usr/local/etc/mongod.conf
     
     # Add replication config
     replication:
       replSetName: rs0
     
     # Restart MongoDB
     brew services restart mongodb/brew/mongodb-community@6.0
     
     # Initialize replica set
     mongosh --eval "rs.initiate()"
     ```

4. Set up environment variables:
   ```sh
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Start the application:
   ```sh
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/digital-wallet

# JWT Configuration
JWT_SECRET=digital-wallet-secure-key-2024
JWT_EXPIRES_IN=24h

# Fraud Detection
LARGE_TRANSACTION_THRESHOLD_USD=10000
LARGE_TRANSACTION_THRESHOLD_EUR=8500
LARGE_TRANSACTION_THRESHOLD_GBP=7500

# Cleanup Configuration
TRANSACTION_CLEANUP_DAYS=30

# Logging Configuration
LOG_LEVEL=info
```

**Note:** Do not commit the `.env` file to version control. It is already included in `.gitignore`.

## API Documentation

The API is documented using Swagger UI. Access it at:
- http://localhost:3000/api-docs

## API Endpoints

### Authentication

#### Register a User
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "email": "your-email@example.com",
    "password": "your-password",
    "firstName": "Your",
    "lastName": "Name"
  }
  ```
- **Response:** User profile and JWT token

#### Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "your-email@example.com",
    "password": "your-password"
  }
  ```
- **Response:** User profile and JWT token

#### Get User Profile
- **Endpoint:** `GET /api/auth/profile`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`
- **Response:** User profile with wallet information

### Wallet Operations

#### Get Wallet Balance
- **Endpoint:** `GET /api/wallet/balance`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`
- **Response:** Current balance and currency

#### Deposit Funds
- **Endpoint:** `POST /api/wallet/deposit`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body:**
  ```json
  {
    "amount": 100,
    "currency": "USD"
  }
  ```
- **Response:** Transaction details

#### Withdraw Funds
- **Endpoint:** `POST /api/wallet/withdraw`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body:**
  ```json
  {
    "amount": 50,
    "currency": "USD"
  }
  ```
- **Response:** Transaction details

#### Transfer Funds
- **Endpoint:** `POST /api/wallet/transfer`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body:**
  ```json
  {
    "toUserId": "recipient-user-id",
    "amount": 25,
    "currency": "USD"
  }
  ```
- **Response:** Transaction details

#### Get Transaction History
- **Endpoint:** `GET /api/wallet/transactions`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`
- **Query Parameters:**
  - `limit`: Number of transactions (default: 10, max: 100)
  - `skip`: Number of transactions to skip (default: 0)
- **Response:** List of transactions with pagination

### Admin Features

#### Make a User Admin
```sh
mongosh digital-wallet --eval 'db.users.updateOne({ email: "your-email@example.com" }, { $set: { isAdmin: true } })'
```

#### Get All Users
- **Endpoint:** `GET /api/admin/users`
- **Headers:** `Authorization: Bearer YOUR_ADMIN_JWT_TOKEN`
- **Response:** List of all users

#### Get User Details
- **Endpoint:** `GET /api/admin/users/{userId}`
- **Headers:** `Authorization: Bearer YOUR_ADMIN_JWT_TOKEN`
- **Response:** Detailed user information

#### Update User Status
- **Endpoint:** `PATCH /api/admin/users/{userId}/status`
- **Headers:** `Authorization: Bearer YOUR_ADMIN_JWT_TOKEN`
- **Body:**
  ```json
  {
    "isActive": false
  }
  ```
- **Response:** Updated user status

#### Get Flagged Transactions
- **Endpoint:** `GET /api/admin/transactions/flagged`
- **Headers:** `Authorization: Bearer YOUR_ADMIN_JWT_TOKEN`
- **Response:** List of flagged transactions

#### Get Daily Fraud Report
- **Endpoint:** `GET /api/admin/reports/fraud`
- **Headers:** `Authorization: Bearer YOUR_ADMIN_JWT_TOKEN`
- **Response:** Daily fraud statistics and flagged transactions

#### Get System Statistics
- **Endpoint:** `GET /api/admin/statistics`
- **Headers:** `Authorization: Bearer YOUR_ADMIN_JWT_TOKEN`
- **Response:** System-wide statistics and metrics

## Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- MongoDB transactions for data consistency

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
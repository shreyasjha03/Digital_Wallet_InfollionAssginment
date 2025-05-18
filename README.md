# Digital Wallet System

A robust digital wallet system with user authentication, wallet operations, transaction processing, fraud detection, and admin reporting.

## Features

- **User Authentication & Session Management**
  - Secure user registration and login
  - JWT-based authentication
  - Protected routes with middleware

- **Wallet Operations**
  - Deposit and withdraw virtual cash
  - Transfer funds between users
  - Transaction history
  - Multiple currency support

- **Transaction Processing & Validation**
  - Atomic transactions
  - Balance validation
  - Transaction status tracking

- **Fraud Detection**
  - Rule-based fraud detection
  - Suspicious pattern detection
  - Transaction flagging
  - Daily fraud reports

- **Admin & Reporting**
  - User management
  - Transaction monitoring
  - System statistics
  - Fraud reports

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn

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
   - Ensure MongoDB is installed and running.
   - If you need to use transactions, configure MongoDB as a replica set:
     - Edit `/usr/local/etc/mongod.conf` (or your MongoDB config file) and add:
       ```yaml
       replication:
         replSetName: rs0
       ```
     - Restart MongoDB:
       ```sh
       brew services restart mongodb/brew/mongodb-community@6.0
       ```
     - Initialize the replica set:
       ```sh
       mongosh --eval "rs.initiate()"
       ```

4. Start the application:
   ```sh
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/digital-wallet
JWT_SECRET=your-secret-key
NODE_ENV=development

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
```

- **PORT**: The port on which the server will run (default: 3000).
- **MONGODB_URI**: The MongoDB connection string (default: mongodb://localhost:27017/digital-wallet).
- **JWT_SECRET**: A secret key used to sign JWT tokens (replace with a strong, unique value).
- **NODE_ENV**: The environment (development, production, test).
- **SMTP_HOST**: SMTP server host (e.g., smtp.gmail.com).
- **SMTP_PORT**: SMTP server port (e.g., 587 for TLS).
- **SMTP_USER**: SMTP username (your email).
- **SMTP_PASS**: SMTP password or app-specific password.
- **EMAIL_FROM**: Email address to send notifications from.

**Note:** Do not commit the `.env` file to version control. It is already included in `.gitignore`.

## API Documentation

The API is documented using Swagger UI. Access it at:
- http://localhost:3000/api-docs

## Authentication

### Register a User
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

### Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "your-email@example.com",
    "password": "your-password"
  }
  ```
- **Response:** Includes a JWT token. Save this token for authenticated requests.

### Get User Profile
- **Endpoint:** `GET /api/auth/profile`
- **Headers:**
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

## Wallet Operations

### Get Wallet Balance
- **Endpoint:** `GET /api/wallet/balance`
- **Headers:**
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

### Deposit Funds
- **Endpoint:** `POST /api/wallet/deposit`
- **Headers:**
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body:**
  ```json
  {
    "amount": 100,
    "currency": "USD"
  }
  ```

### Withdraw Funds
- **Endpoint:** `POST /api/wallet/withdraw`
- **Headers:**
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body:**
  ```json
  {
    "amount": 50,
    "currency": "USD"
  }
  ```

### Transfer Funds
- **Endpoint:** `POST /api/wallet/transfer`
- **Headers:**
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body:**
  ```json
  {
    "toUserId": "recipient-user-id",
    "amount": 25,
    "currency": "USD"
  }
  ```

### Get Transaction History
- **Endpoint:** `GET /api/wallet/transactions`
- **Headers:**
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Query Parameters (Optional):**
  - `limit`: Number of transactions to return (e.g., `?limit=10`)
  - `skip`: Number of transactions to skip (e.g., `?skip=0`)

## Admin Features

### Make a User Admin
To make a user an admin, update the user in the MongoDB database:
```sh
mongosh digital-wallet --eval 'db.users.updateOne({ email: "your-email@example.com" }, { $set: { isAdmin: true } })'
```

### Get All Users
- **Endpoint:** `GET /api/admin/users`
- **Headers:**
  ```
  Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
  ```

### Get User Details
- **Endpoint:** `GET /api/admin/users/{userId}`
- **Headers:**
  ```
  Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
  ```

### Update User Status
- **Endpoint:** `PATCH /api/admin/users/{userId}/status`
- **Headers:**
  ```
  Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
  ```
- **Body:**
  ```json
  {
    "isActive": false
  }
  ```

### Get Flagged Transactions
- **Endpoint:** `GET /api/admin/transactions/flagged`
- **Headers:**
  ```
  Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
  ```

### Get Daily Fraud Report
- **Endpoint:** `GET /api/admin/reports/fraud`
- **Headers:**
  ```
  Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
  ```

### Get System Statistics
- **Endpoint:** `GET /api/admin/statistics`
- **Headers:**
  ```
  Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
  ```

## Testing with Swagger UI

1. Open http://localhost:3000/api-docs in your browser.
2. Click the **Authorize** button (lock icon) at the top right.
3. Enter your JWT token in the format:
   ```
   Bearer YOUR_JWT_TOKEN
   ```
4. Click **Authorize** and then **Close**.
5. Expand any endpoint, click **Try it out**, fill in the required fields, and click **Execute**.

## Testing with curl

### Example: Register a User
```sh
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password","firstName":"Your","lastName":"Name"}'
```

### Example: Login
```sh
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

### Example: Get Wallet Balance
```sh
curl http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example: Deposit Funds
```sh
curl -X POST http://localhost:3000/api/wallet/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount":100,"currency":"USD"}'
```

### Example: Get All Users (Admin)
```sh
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## Troubleshooting

- **MongoDB Connection Issues:**
  - Ensure MongoDB is running: `brew services list | grep mongodb`
  - Check MongoDB logs: `cat /usr/local/var/log/mongodb/mongo.log`
  - If using transactions, ensure MongoDB is configured as a replica set.

- **Authentication Issues:**
  - Ensure the JWT token is valid and not expired.
  - Check that the user has the correct permissions (e.g., admin for admin endpoints).

- **API Errors:**
  - Check the server logs for detailed error messages.
  - Ensure all required fields are provided in the request body.

## License

This project is licensed under the MIT License. 
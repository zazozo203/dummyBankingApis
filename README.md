A simple banking backend built with Node.js, Express, JWT authentication, Prisma ORM, and PostgreSQL.
This project was created as part of the Koinsave Backend Developer Practical Task.

** Features**
 Authentication
 User registration
 User login
 JWT token generation
 Protected routes
 Transactions
 Send money between users
 Prevent overdraft
 Prevent double-spending with idempotency keys
 Record all transactions in the database

** Extras**

Input validation
Logging middleware
Clean API structure
Environment variables support

**Tech Stack**

Node.js
Express.js
Prisma ORM
PostgreSQL
JWT (jsonwebtoken)
Validator.js

**Setup Instructions**
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

Install dependencies
npm install

**Create .env file**
DATABASE_URL="postgresql://user:password@localhost:5432/bankdb"
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="1h"
PORT=4000

**Run Prisma setup**

npx prisma migrate dev

**Start the server**

npm start

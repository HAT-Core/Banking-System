# HATCore Banking Management System

A highly normalized, full-stack enterprise banking system engineered to handle multi-tiered role-based access, global financial catalogs, and secure customer transactions. Built with a React.js frontend and a Node.js/MSSQL backend, this system emphasizes data integrity, stateless authentication, and modular architecture.

## 1. System Architecture & Modules

The application is segregated into three strictly isolated environments using Role-Based Access Control (RBAC):

### Admin Dashboard (System Configuration)
*   **Catalog Management:** Full CRUD capabilities for global financial parameters, including Supported Partner Banks and Utility Billers (categorized by Government/Private).
*   **Loan Product Management:** Dynamic adjustment of interest rates and maximum term limits for various loan types (e.g., Auto Finance, Personal Credit).
*   **User Management:** Centralized control to view employee/customer metrics and lock/unlock user accounts across the system.
*   **Analytics:** Real-time dashboard statistics aggregating total users, active staff, and partner integrations.

### Employee Portal (Branch Operations)
*   **KYC Verification:** Workflow for branch staff to review and verify ('pending' to 'verified') Customer identities before accounts can be activated.
*   **Account Authorization:** System design requires an `employee_id` to authorize the creation of any new customer bank account or loan product.

### Customer Portal (Retail Banking)
*   **Account Management:** Support for multiple account types (Savings, Current) tied to a single verified user.
*   **Transaction Engine:** Execution of deposits, withdrawals, and internal transfers. 
*   **Utility Billing:** Users can subscribe to registered billers, set specific billing days, and toggle auto-pay functionality.
*   **Loan Tracking:** Real-time visibility into active loans, interest rates, and pending installment payments.

---

## 2. Technology Stack

### Frontend (Client-Side)
*   **Core Framework:** React.js
*   **Routing:** `react-router-dom` utilizing strictly protected routes based on decoded user roles.
*   **HTTP Client:** `axios` configured with custom Request and Response Interceptors for centralized header configuration and global error handling.
*   **UI Library:** Material-UI (MUI) for deeply customizable, theme-driven components.
*   **Animation:** `framer-motion` for physics-based page transitions and micro-interactions.

### Backend (Server-Side)
*   **Core Framework:** Node.js with Express.js
*   **Authentication:** JSON Web Tokens (JWT) for stateless session management.
*   **Cryptography:** `bcrypt` for secure, one-way password hashing.
*   **Database Driver:** `mssql` (Microsoft SQL Server) with parameterized queries to prevent SQL injection.

---

## 3. Security Implementation

*   **Stateless JWT Authentication:** Upon login, the server cryptographically signs a JWT. The frontend stores this in `localStorage`.
*   **Axios Interceptors:** A global frontend interceptor automatically attaches the `Authorization: Bearer <token>` header to every outgoing HTTP request, eliminating redundant code. A response interceptor catches `401 Unauthorized` responses and automatically purges the session.
*   **Express Middleware:** Custom backend middleware (`protect`, `authorizeAdmin`) intercepts incoming requests, mathematically verifies the JWT signature against the server's `.env` secret, and checks the role clearance before allowing access to the controller logic.

---

## 4. Database Engineering (MSSQL)

The database is highly normalized up to Boyce-Codd Normal Form (BCNF) to eliminate redundancy and update anomalies. 

### Key Schema Features
*   **Strict Constraints:** Extensive use of `CHECK` constraints (e.g., ensuring CNIC is exactly 13 digits, balances cannot drop below 0, users must be 18+).
*   **Data Integrity:** Complete reliance on `FOREIGN KEY` relationships. You cannot create an account for a user that doesn't exist, nor can a loan exist without an underlying account.
*   **Transitive Dependency Removal:** The `loan` table links directly to `account_id` rather than `customer_id`, as the account already strictly determines the customer (BCNF compliance).

### Core Tables
1.  **Users & Roles:** `user_account`, `admin`, `employee`, `customer`
2.  **Financial Assets:** `account`, `transactions`, `interbank_transfer`
3.  **Global Catalogs:** `supported_bank`, `biller`, `loan_type`
4.  **Financial Services:** `loan`, `installment`, `billing_subscription`, `bill`, `bill_payment`
5.  **Security:** `audit_log` (Tracks all critical `INSERT`/`UPDATE` actions system-wide).

---

## 5. RESTful API Documentation

The backend adheres strictly to REST conventions, utilizing standard HTTP methods (GET, POST, PUT, DELETE).

### Authentication
*   `POST /api/auth/login` - Validates credentials, issues JWT.
*   `POST /api/auth/register` - Hashes password, creates base user record.

### Admin Catalogs (Requires Admin Token)
*   `GET /api/admin/catalogs/banks` - Fetch all partner banks.
*   `POST /api/admin/catalogs/banks` - Insert a new partner bank.
*   `GET /api/admin/catalogs/billers` - Fetch all utility billers.
*   `POST /api/admin/catalogs/billers` - Insert a new utility biller.
*   `GET /api/admin/catalogs/loans` - Fetch loan products and rates.
*   `PUT /api/admin/catalogs/loans/:id` - Modify interest rate for a specific loan type.

### Admin User Management (Requires Admin Token)
*   `GET /api/admin/users/employees` - Fetch all staff records.
*   `GET /api/admin/users/customers` - Fetch all retail customer records.
*   `PUT /api/admin/users/:id/status` - Update user access status (active/locked).
*   `GET /api/admin/dashboard/stats` - Fetch aggregate platform metrics.

---

## 6. Local Installation & Setup

### Prerequisites
*   Node.js (v16+)
*   Microsoft SQL Server & SSMS (or Azure Data Studio)

### Step 1: Database Initialization
1.  Create a new SQL Server database named `BankingAppDB`.
2.  Execute the provided `schema.sql` script to generate the relational structure.

### Step 2: Backend Configuration
1.  Navigate to the `/backend` directory.
2.  Run `npm install` to download dependencies.
3.  Create a `.env` file in the `/backend` root:
    
```env
    PORT=5000
    DB_USER=your_sql_username
    DB_PASSWORD=your_sql_password
    DB_SERVER=localhost
    DB_DATABASE=BankingAppDB
    JWT_SECRET=your_secure_random_string
```
4.  Start the Node server: `node server.js` (Runs on `http://localhost:5000`)

### Step 3: Frontend Configuration
1.  Navigate to the `/frontend` directory.
2.  Run `npm install` to download dependencies.
3.  Ensure your `src/pages/utils/api.js` points to your local backend URL.
4.  Start the React development server: `npm run dev` (Runs on `http://localhost:3000`)
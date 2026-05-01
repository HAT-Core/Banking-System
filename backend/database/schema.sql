-- 1. user_account
CREATE TABLE user_account (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'employee', 'customer')),
    status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'locked')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    cnic VARCHAR(13) NOT NULL UNIQUE CHECK (LEN(cnic) = 13),
    -- BCNF FIX: Added UNIQUE constraint to phone
    phone VARCHAR(15) NOT NULL UNIQUE CHECK (LEN(phone) = 11 AND phone LIKE '03%'),
    address VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL CHECK (DATEDIFF(YEAR, date_of_birth, GETDATE()) >= 18)
);

-- 2. admin
CREATE TABLE admin (
    admin_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE REFERENCES user_account(user_id)
);

-- 3. employee
CREATE TABLE employee (
    employee_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE REFERENCES user_account(user_id),
    job_title VARCHAR(50) NOT NULL
);

-- 4. customer
CREATE TABLE customer (
    customer_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE REFERENCES user_account(user_id),
    kyc_status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    verified_by_employee INT NULL REFERENCES employee(employee_id),
    verified_date DATETIME NULL,
    CONSTRAINT chk_customer_kyc CHECK (
        (kyc_status = 'pending' AND verified_by_employee IS NULL AND verified_date IS NULL)
        OR
        (kyc_status IN ('verified', 'rejected') AND verified_by_employee IS NOT NULL AND verified_date IS NOT NULL)
    )
);

-- 5. account
CREATE TABLE account (
    account_id INT PRIMARY KEY IDENTITY(1,1),
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    account_type VARCHAR(10) NOT NULL CHECK (account_type IN ('savings', 'current')),
    balance DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_by_employee INT NOT NULL REFERENCES employee(employee_id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed'))
);

-- 6. transactions
CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY IDENTITY(1,1),
    from_account INT NULL REFERENCES account(account_id),
    to_account INT NULL REFERENCES account(account_id),
    amount DECIMAL(15,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdraw', 'internal_transfer', 'external_transfer', 'bill', 'loan')),
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    scheduled_date DATETIME NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending')),
    CONSTRAINT chk_transaction_accounts CHECK (from_account IS NOT NULL OR to_account IS NOT NULL)
);

-- 7. supported_bank
CREATE TABLE supported_bank (
    bank_id INT PRIMARY KEY IDENTITY(1,1),
    bank_name VARCHAR(100) NOT NULL UNIQUE,
    is_active BIT NOT NULL DEFAULT 1
);

-- 8. interbank_transfer
CREATE TABLE interbank_transfer (
    ib_transfer_id INT PRIMARY KEY IDENTITY(1,1),
    transaction_id INT NOT NULL UNIQUE REFERENCES transactions(transaction_id),
    from_bank_id INT NOT NULL REFERENCES supported_bank(bank_id),
    from_account_number VARCHAR(30) NOT NULL,
    to_bank_id INT NOT NULL REFERENCES supported_bank(bank_id),
    to_account_number VARCHAR(30) NOT NULL,
    settlement_status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'settled')),
    settlement_date DATETIME NULL
);

-- 9. loan_type
CREATE TABLE loan_type (
    loan_type_id INT PRIMARY KEY IDENTITY(1,1),
    type_name VARCHAR(50) NOT NULL UNIQUE,
    interest_rate DECIMAL(5,2) NOT NULL,
    max_years INT NOT NULL
);

-- 10. loan
CREATE TABLE loan (
    loan_id INT PRIMARY KEY IDENTITY(1,1),
    -- BCNF FIX: Removed customer_id because account_id already determines the customer
    account_id INT NOT NULL REFERENCES account(account_id),
    loan_type_id INT NOT NULL REFERENCES loan_type(loan_type_id),
    approved_by_employee INT NOT NULL REFERENCES employee(employee_id),
    amount DECIMAL(15,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'defaulted'))
);

-- 11. installment
CREATE TABLE installment (
    installment_id INT PRIMARY KEY IDENTITY(1,1),
    loan_id INT NOT NULL REFERENCES loan(loan_id),
    due_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    paid_date DATE NULL,
    transaction_id INT UNIQUE REFERENCES transactions(transaction_id)
);

-- 12. biller
CREATE TABLE biller (
    biller_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(10) NOT NULL CHECK (category IN ('government', 'private'))
);

-- 13. billing_subscription
CREATE TABLE billing_subscription (
    subscription_id INT PRIMARY KEY IDENTITY(1,1),
    account_id INT NOT NULL REFERENCES account(account_id),
    biller_id INT NOT NULL REFERENCES biller(biller_id),
    reference_number VARCHAR(50) NOT NULL,
    billing_day INT NOT NULL CHECK (billing_day BETWEEN 1 AND 28),
    amount DECIMAL(15,2) NOT NULL,
    auto_pay BIT NOT NULL DEFAULT 1,
    status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    CONSTRAINT uq_billing_subscription UNIQUE (account_id, biller_id, reference_number)
);

-- 14. bill
CREATE TABLE bill (
    bill_id INT PRIMARY KEY IDENTITY(1,1),
    subscription_id INT NOT NULL REFERENCES billing_subscription(subscription_id),
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed'))
);

-- 15. bill_payment
CREATE TABLE bill_payment (
    bill_payment_id INT PRIMARY KEY IDENTITY(1,1),
    bill_id INT NOT NULL UNIQUE REFERENCES bill(bill_id),
    transaction_id INT NOT NULL UNIQUE REFERENCES transactions(transaction_id),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    result VARCHAR(10) NOT NULL CHECK (result IN ('success', 'failed'))
);

-- 16. audit_log
CREATE TABLE audit_log (
    log_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL REFERENCES user_account(user_id),
    record_id INT NOT NULL,
    action VARCHAR(1023) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    action_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
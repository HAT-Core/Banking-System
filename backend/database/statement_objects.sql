-- View: Full ledger with running balance (No new tables needed)
CREATE OR ALTER VIEW vw_transaction_ledger AS
SELECT 
    t.transaction_id,
    a.account_id,
    t.transaction_type,
    t.transaction_date,
    t.status,
    t.from_account,
    t.to_account,
    t.amount,
    CASE WHEN t.to_account = a.account_id THEN 'credit' ELSE 'debit' END AS direction,
    CASE WHEN t.to_account = a.account_id THEN t.amount ELSE -t.amount END AS signed_amount,
    SUM(CASE WHEN t.to_account = a.account_id THEN t.amount ELSE -t.amount END) 
        OVER (
            PARTITION BY a.account_id 
            ORDER BY t.transaction_date, t.transaction_id
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS running_balance
FROM transactions t
JOIN account a ON (t.from_account = a.account_id OR t.to_account = a.account_id)
WHERE t.status = 'success';
GO

-- Procedure: Generate monthly statement (Calculates opening balance on the fly)
CREATE OR ALTER PROCEDURE sp_generate_statement
    @accountId INT,
    @month     INT,
    @year      INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @startDate DATETIME = DATEFROMPARTS(@year, @month, 1);
    DECLARE @endDate   DATETIME = DATEADD(MONTH, 1, @startDate);
    DECLARE @openingBalance DECIMAL(15,2);

    -- Calculate opening balance dynamically from all past transactions
    SELECT @openingBalance = ISNULL(SUM(
        CASE WHEN to_account = @accountId THEN amount ELSE -amount END
    ), 0)
    FROM transactions
    WHERE (from_account = @accountId OR to_account = @accountId)
      AND status = 'success'
      AND transaction_date < @startDate;

    -- Result 1: Ledger rows for the specific month
    SELECT 
        t.transaction_id,
        t.transaction_type,
        t.transaction_date,
        t.amount,
        CASE WHEN t.to_account = @accountId THEN 'credit' ELSE 'debit' END AS direction,
        @openingBalance + SUM(
            CASE WHEN t.to_account = @accountId THEN t.amount ELSE -t.amount END
        ) OVER (
            ORDER BY t.transaction_date, t.transaction_id
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS running_balance
    FROM transactions t
    WHERE (t.from_account = @accountId OR t.to_account = @accountId)
      AND t.status = 'success'
      AND t.transaction_date >= @startDate
      AND t.transaction_date <  @endDate
    ORDER BY t.transaction_date, t.transaction_id;

    -- Result 2: Summary totals
    SELECT 
        @openingBalance AS opening_balance,
        ISNULL(SUM(CASE WHEN to_account   = @accountId THEN amount ELSE 0 END), 0) AS total_credits,
        ISNULL(SUM(CASE WHEN from_account = @accountId THEN amount ELSE 0 END), 0) AS total_debits,
        @openingBalance + ISNULL(SUM(
            CASE WHEN to_account = @accountId THEN amount ELSE -amount END
        ), 0) AS closing_balance
    FROM transactions
    WHERE (from_account = @accountId OR to_account = @accountId)
      AND status = 'success'
      AND transaction_date >= @startDate
      AND transaction_date <  @endDate;
END;
GO
CREATE VIEW vw_EmployeePerformanceReport AS
SELECT 
    e.employee_id,
    u.first_name + ' ' + u.last_name AS employee_name,
    e.job_title,
    (SELECT COUNT(*) FROM customer c WHERE c.verified_by_employee = e.employee_id) AS total_kyc_verified,
    (SELECT COUNT(*) FROM account a WHERE a.created_by_employee = e.employee_id) AS total_accounts_opened,
    (SELECT COUNT(*) FROM loan l WHERE l.approved_by_employee = e.employee_id) AS total_loans_approved,
    ISNULL((SELECT SUM(amount) FROM loan l WHERE l.approved_by_employee = e.employee_id), 0) AS total_loan_value
FROM 
    employee e
JOIN 
    user_account u ON e.user_id = u.user_id;
GO

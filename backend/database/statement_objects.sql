-- Snapshot table: tracks last transaction per account (populated by trigger)
CREATE TABLE account_snapshot (
    account_id          INT PRIMARY KEY REFERENCES account(account_id),
    last_transaction_id INT NULL REFERENCES transactions(transaction_id),
    last_updated        DATETIME DEFAULT GETDATE()
);
GO

-- View: full ledger with running balance using window function
CREATE VIEW vw_transaction_ledger AS
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

-- Trigger: upsert account_snapshot after every transaction insert
CREATE TRIGGER trg_after_transaction
ON transactions
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    MERGE account_snapshot AS target
    USING (
        SELECT from_account AS account_id, transaction_id FROM inserted WHERE from_account IS NOT NULL
        UNION ALL
        SELECT to_account,   transaction_id FROM inserted WHERE to_account   IS NOT NULL
    ) AS src (account_id, transaction_id)
    ON target.account_id = src.account_id
    WHEN MATCHED THEN
        UPDATE SET last_transaction_id = src.transaction_id, last_updated = GETDATE()
    WHEN NOT MATCHED THEN
        INSERT (account_id, last_transaction_id, last_updated)
        VALUES (src.account_id, src.transaction_id, GETDATE());
END;
GO

-- Procedure: generate monthly statement for an account
CREATE PROCEDURE sp_generate_statement
    @accountId INT,
    @month     INT,
    @year      INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @startDate DATETIME = DATEFROMPARTS(@year, @month, 1);
    DECLARE @endDate   DATETIME = DATEADD(MONTH, 1, @startDate);

    -- Opening balance: all successful txns before this month
    DECLARE @openingBalance DECIMAL(15,2);
    SELECT @openingBalance = ISNULL(SUM(
        CASE WHEN to_account = @accountId THEN amount ELSE -amount END
    ), 0)
    FROM transactions
    WHERE (from_account = @accountId OR to_account = @accountId)
      AND status = 'success'
      AND transaction_date < @startDate;

    -- Result set 1: ledger rows with cumulative running balance
    SELECT
        t.transaction_id,
        t.transaction_type,
        t.transaction_date,
        t.amount,
        t.from_account,
        t.to_account,
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

    -- Result set 2: monthly summary totals
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
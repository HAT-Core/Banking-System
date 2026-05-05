
CREATE OR ALTER PROCEDURE sp_mark_overdue_installments
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE installment
    SET status = 'overdue'
    WHERE status = 'pending'
      AND due_date < CAST(GETDATE() AS DATE);
END;
GO


CREATE OR ALTER VIEW delinquent_accounts_view AS
SELECT
    a.account_id,
    a.status                                            AS account_status,
    a.balance,
    u.first_name,
    u.last_name,
    u.phone,
    u.cnic,
    COUNT(i.installment_id)                             AS overdue_count,
    SUM(i.amount)                                       AS total_overdue_amount,
    MIN(i.due_date)                                     AS earliest_overdue_date
FROM installment i
JOIN loan       l  ON i.loan_id       = l.loan_id
JOIN account    a  ON l.account_id    = a.account_id
JOIN customer   c  ON a.customer_id   = c.customer_id
JOIN user_account u ON c.user_id      = u.user_id
WHERE i.status = 'overdue'
GROUP BY
    a.account_id, a.status, a.balance,
    u.first_name, u.last_name, u.phone, u.cnic;
GO


CREATE OR ALTER PROCEDURE sp_freeze_account
    @account_id  INT,
    @employee_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        
        IF NOT EXISTS (
            SELECT 1 FROM account
            WHERE account_id = @account_id AND status = 'active'
        )
        BEGIN
            ROLLBACK;
            RETURN;
        END

        UPDATE account
        SET status = 'frozen'
        WHERE account_id = @account_id;

        INSERT INTO audit_log (user_id, record_id, action, table_name)
        SELECT
            e.user_id,
            @account_id,
            CONCAT('Account frozen due to overdue installments. Actioned by employee_id: ', @employee_id),
            'account'
        FROM employee e
        WHERE e.employee_id = @employee_id;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_unfreeze_account
    @account_id  INT,
    @employee_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        IF NOT EXISTS (
            SELECT 1 FROM account
            WHERE account_id = @account_id AND status = 'frozen'
        )
        BEGIN
            ROLLBACK;
            RETURN;
        END

        UPDATE account
        SET status = 'active'
        WHERE account_id = @account_id;

        INSERT INTO audit_log (user_id, record_id, action, table_name)
        SELECT
            e.user_id,
            @account_id,
            CONCAT('Account unfrozen. Actioned by employee_id: ', @employee_id),
            'account'
        FROM employee e
        WHERE e.employee_id = @employee_id;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH
END;
GO


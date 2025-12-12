-- Activate all test users
UPDATE "User" SET status = 'ACTIVE' WHERE status = 'PENDING';

-- Verify the update
SELECT id, email, name, role, status FROM "User";

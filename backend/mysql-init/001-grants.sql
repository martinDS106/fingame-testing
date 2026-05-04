-- Dev-only: allow Prisma migrate dev to create shadow database(s)
-- (Prisma uses a shadow DB to compute schema diffs safely)

GRANT ALL PRIVILEGES ON *.* TO 'fin_game'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;


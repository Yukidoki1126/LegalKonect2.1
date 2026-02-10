## How to Add Davao Law Firms to Render PostgreSQL

### Option 1: Generate Fresh Password Hash (Recommended)

1. Run this in your **local terminal** (in backend folder):
```bash
php artisan tinker
```

2. Then run this in tinker:
```php
echo Hash::make('password123');
```

3. Copy the output hash (starts with `$2y$12$...`)

4. Open `davao_firms_postgresql.sql` and replace all instances of:
```sql
'$2y$12$LQ3aX7Fp6+/Iuil6g8M4Pog'
```
with your newly generated hash

### Option 2: Run via Render Shell

1. Go to your Render dashboard
2. Select your Web Service
3. Click "Shell" tab
4. Run:
```bash
php artisan db:seed --class=LawFirmSeeder
php artisan db:seed --class=DavaoRatingsSeeder
```

### Option 3: Execute SQL in pgAdmin

1. Open **pgAdmin** and connect to your Render PostgreSQL database

2. Get connection details from Render:
   - Dashboard → PostgreSQL → Info
   - Copy: Host, Database, User, Password, Port

3. In pgAdmin:
   - Create new server connection
   - Paste Render credentials
   - Connect to database

4. Open Query Tool (Tools → Query Tool)

5. **IMPORTANT**: Generate proper password hash first:
   - Run locally: `php artisan tinker` then `Hash::make('password123')`
   - Copy the hash
   - Replace the hash in the SQL file

6. Copy and paste the entire contents of `davao_firms_postgresql.sql`

7. Execute the script (F5 or Play button)

8. Check verification queries at the bottom of the script

### What the SQL Script Does

1. ✅ Creates 8 user accounts for law firm owners
2. ✅ Creates 8 law firm profiles in Davao City
3. ✅ Links specializations:
   - Sudagar: Corporate Law, Real Estate Law, Family Law
   - Cabanero: Criminal Law, Labor Law
   - Zamora: Tax Law, Corporate Law
   - Caubang: Family Law, Immigration Law, Real Estate Law
   - Angeles: Intellectual Property, Corporate Law
   - Guinomla: Corporate Law, Real Estate Law
   - Latog: Labor Law, Criminal Law
   - Bajenting: Corporate Law, Tax Law

4. ✅ (Optional) Adds 4-5 star ratings (requires existing clients)

### After Running

Verify with these queries:
```sql
-- Count law firms
SELECT COUNT(*) FROM law_firms;

-- List Davao firms
SELECT firm_name, address, experience_range FROM law_firms 
WHERE address LIKE '%Davao%';

-- Check specializations
SELECT lf.firm_name, s.name 
FROM law_firms lf
JOIN law_firm_specialization lfs ON lf.id = lfs.law_firm_id
JOIN specializations s ON s.id = lfs.specialization_id
WHERE lf.address LIKE '%Davao%';
```

### Troubleshooting

**Error: "duplicate key value violates unique constraint"**
- The firms already exist. Either:
  - Delete existing firms first: `DELETE FROM users WHERE email LIKE '%davao%' OR email LIKE '%sudagar%' OR email LIKE '%cabanero%';`
  - Or skip this step

**Error: "column does not exist"**
- Check your table structure matches
- Run: `\d law_firms` in psql to see columns

**Ratings not appearing**
- You need clients in the database first
- Uncomment the ratings section in the SQL file after clients exist

### Login Credentials

All Davao firms use:
- **Password**: `password123`
- **Emails**:
  - contact@sudagarlaw.ph
  - info@cabanerolaw.com
  - zamora@zamoralegal.ph
  - legal@caubanglaw.com
  - contact@angeleslaw.ph
  - info@guinomlalaw.com
  - latog@latoglegal.ph
  - contact@bajentinglaw.com

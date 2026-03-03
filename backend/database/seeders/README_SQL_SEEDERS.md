# PostgreSQL Seeder Script

## File
**preference_test_seeder.sql** - Complete seeder with 30 law firms, specializations, and ratings

## How to Run in pgAdmin

### Simple Steps:
1. Open **pgAdmin 4**
2. Connect to your database: `legalkonect21_db_klm7`
3. Right-click on your database → **Query Tool**
4. Open file: `preference_test_seeder.sql`
5. Click **Execute (F5)**
6. ✅ Done!

The script will:
- Add 30 law firm users
- Create 30 law firm profiles
- Link specializations to each firm
- Add ratings/reviews (if you have at least 1 client account)

## Login Credentials
All law firms use password: **password123**

Example logins:
- starter@davaolegal.ph
- rising@mndalegal.ph
- pearl@mindanaolaw.ph
- solutions@downtowncorp.ph
- business@lananglaw.com
- (30 firms total - see SQL file for complete list)

## Password Hash Details
The password hash used is:
```
$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
```
This is the bcrypt hash for: **password123**

## Data Distribution
- **Experience**: 6 firms per range (1-3, 3-5, 5-8, 8-10, 10+ years)
- **Ratings**: 2.5★ to 5.0★ (2-15 reviews per firm)
- **Distance**: 0-30km from Davao center (7.0731, 125.6122)
- **Specializations**: Family, Corporate, Criminal, Labor, Real Estate, Tax, Immigration Law

## Notes

**Ratings**
- If you don't have a client account yet, the script will skip ratings
- Create a client account first, then run the script to include ratings
- Or run it now and ratings will be added when you have clients

## Troubleshooting

**Error: "relation does not exist"**
- Make sure migrations have been run first on Render

**Error: "duplicate key value"**
- Users/firms already exist. Either:
  - Delete existing test firms first, OR
  - Ignore the error (duplicate entries will be skipped)

**No ratings shown**
- Create a client account first
- Re-run the script to add ratings

**Specializations not linking**
- Check that specializations table has data: `SELECT * FROM specializations;`
- Run SpecializationSeeder first if empty

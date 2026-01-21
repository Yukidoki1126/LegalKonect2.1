@echo off
echo ===============================================
echo   LegalKonect Demo Data Seeder
echo ===============================================
echo.
echo This will create:
echo   - 8 demo clients
echo   - 8 demo law firms
echo   - 40 appointments
echo   - ~30 ratings
echo.
echo Running database seeder...
echo.

php artisan db:seed --class=DemoDataSeeder

echo.
echo ===============================================
echo   Seeding Complete!
echo ===============================================
echo.
echo Next Steps:
echo 1. Refresh your Analytics page in the browser
echo 2. Press F12 to open console and check for data
echo 3. Login with demo accounts:
echo    - Client: client0@demo.com / password
echo    - Law Firm: lawfirm0@demo.com / password
echo    - Admin: admin@legalkonect.com / admin123
echo.
echo See SEEDER_SUCCESS.md for more details
echo.
pause

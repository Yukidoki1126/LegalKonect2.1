-- ============================================
-- DAVAO LAW FIRMS - PostgreSQL Insert Script
-- Run this in pgAdmin for your Render database
-- ============================================

-- NOTE: Replace the password hashes below with actual bcrypt hashes
-- You can generate them by running in Laravel tinker:
-- Hash::make('password123')

BEGIN;

-- Step 1: Insert Users for Law Firms
-- The password below is bcrypt hash of 'password123'
-- Generate new hashes using: php artisan tinker then Hash::make('password123')

INSERT INTO users (name, email, password, role, created_at, updated_at) 
VALUES 
('Attorney Ramon Sudagar', 'contact@sudagarlaw.ph', '$2y$12$mZKzMC8.Bk8JdmYAy5YK.ejWhDcPL84vRgC2K.x5EAxF.p8QrgRNa', 'law_firm', NOW(), NOW()),
('Attorney Maria Cabanero', 'info@cabanerolaw.com', '$2y$12$XPUHe1CljYOoS6TxuHR8l./19LLj4GUiff0AZjE/t9armsC.fbsZO', 'law_firm', NOW(), NOW()),
('Attorney Carlos Zamora', 'zamora@zamoralegal.ph', '$2y$12$1i0Dxjhx4f5v53b1RQ607.Li1R11HHd/qrOs68lOIFtgG9WnOsc5y', 'law_firm', NOW(), NOW()),
('Attorney Elena Caubang', 'legal@caubanglaw.com', '$2y$12$W7pDMTEvI4C3Tr90hoCvduI2.pCIg3KDfS2J8En.iJeLHy0sTe4yi', 'law_firm', NOW(), NOW()),
('Attorney Ricardo Angeles', 'contact@angeleslaw.ph', '$2y$12$SKibUhsbKvsXMlPIsGsbYOpQtg5pNnCBXgRTJdCv8HoqyhnmBA3/q', 'law_firm', NOW(), NOW()),
('Attorney Jose Guinomla', 'info@guinomlalaw.com', '$2y$12$zX2/jHt79o/qJ5ofk5miJuCDCKltZWlxx4sUBLR6mTmAIEl928MkK', 'law_firm', NOW(), NOW()),
('Attorney Patricia Latog', 'latog@latoglegal.ph', '$2y$12$Sim8EXR0vhOx0RY2ftfTUO1pzLsNMAP9Hve7sVqOAAj46..FaZT36', 'law_firm', NOW(), NOW()),
('Attorney Michael Bajenting', 'contact@bajentinglaw.com', '$2y$12$ctggKva4g.5btQ2WvoBjn.R/vlvJ1BQlih8SmaDTKsUdYHT3r9nZW', 'law_firm', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Step 2: Insert Law Firms
-- Note: Replace user_id with actual IDs from your database
INSERT INTO law_firms (
    user_id, firm_name, license_number, phone, address, 
    latitude, longitude, experience_range, description, 
    verification_status, verified_at, created_at, updated_at
)
SELECT 
    u.id,
    'Sudagar Law Office',
    'LIC-DVO001',
    '+639171234501',
    '3rd Floor, Damosa Building, J.P. Laurel Avenue, Bajada, Davao City',
    7.0731,
    125.6122,
    '20+ years',
    'Sudagar Law Office is one of Davao City''s premier law firms, providing comprehensive legal services to individuals and businesses. With over two decades of experience, we are committed to delivering excellence in legal representation.',
    'approved',
    NOW(),
    NOW(),
    NOW()
FROM users u WHERE u.email = 'contact@sudagarlaw.ph'
ON CONFLICT DO NOTHING;

INSERT INTO law_firms (
    user_id, firm_name, license_number, phone, address, 
    latitude, longitude, experience_range, description, 
    verification_status, verified_at, created_at, updated_at
)
SELECT 
    u.id,
    'Cabanero Law Office',
    'LIC-DVO002',
    '+639181234502',
    '5th Floor, NCCC Mall, C.M. Recto Avenue, Davao City',
    7.0644,
    125.6085,
    '15-20 years',
    'Cabanero Law Office specializes in criminal defense and labor law matters. We are dedicated to protecting the rights of our clients with integrity and professionalism.',
    'approved',
    NOW(),
    NOW(),
    NOW()
FROM users u WHERE u.email = 'info@cabanerolaw.com'
ON CONFLICT DO NOTHING;

INSERT INTO law_firms (
    user_id, firm_name, license_number, phone, address, 
    latitude, longitude, experience_range, description, 
    verification_status, verified_at, created_at, updated_at
)
SELECT 
    u.id,
    'Zamora Law Office',
    'LIC-DVO003',
    '+639191234503',
    '2nd Floor, Gaisano Mall, Bajada, Davao City',
    7.0764,
    125.6147,
    '10-15 years',
    'Zamora Law Office provides expert legal counsel in taxation and financial matters. Our team ensures compliance and strategic planning for businesses throughout Mindanao.',
    'approved',
    NOW(),
    NOW(),
    NOW()
FROM users u WHERE u.email = 'zamora@zamoralegal.ph'
ON CONFLICT DO NOTHING;

INSERT INTO law_firms (
    user_id, firm_name, license_number, phone, address, 
    latitude, longitude, experience_range, description, 
    verification_status, verified_at, created_at, updated_at
)
SELECT 
    u.id,
    'Caubang Law Office',
    'LIC-DVO004',
    '+639201234504',
    '4th Floor, SM Lanang Premier, J.P. Laurel Avenue, Lanang, Davao City',
    7.0907,
    125.6275,
    '15-20 years',
    'Caubang Law Office is known for compassionate and effective representation in family law matters. We help families navigate legal challenges with sensitivity and expertise.',
    'approved',
    NOW(),
    NOW(),
    NOW()
FROM users u WHERE u.email = 'legal@caubanglaw.com'
ON CONFLICT DO NOTHING;

INSERT INTO law_firms (
    user_id, firm_name, license_number, phone, address, 
    latitude, longitude, experience_range, description, 
    verification_status, verified_at, created_at, updated_at
)
SELECT 
    u.id,
    'Angeles Law Office',
    'LIC-DVO005',
    '+639211234505',
    'Ground Floor, Abreeza Mall, J.P. Laurel Avenue, Davao City',
    7.0789,
    125.6189,
    '5-10 years',
    'Angeles Law Office specializes in intellectual property and technology law, serving startups and established businesses in Davao and beyond. We protect innovation and creativity.',
    'approved',
    NOW(),
    NOW(),
    NOW()
FROM users u WHERE u.email = 'contact@angeleslaw.ph'
ON CONFLICT DO NOTHING;

INSERT INTO law_firms (
    user_id, firm_name, license_number, phone, address, 
    latitude, longitude, experience_range, description, 
    verification_status, verified_at, created_at, updated_at
)
SELECT 
    u.id,
    'Guinomla Law Firm',
    'LIC-DVO006',
    '+639221234506',
    '6th Floor, Victoria Plaza Mall, Ilustre Street, Davao City',
    7.0731,
    125.6050,
    '20+ years',
    'Guinomla Law Firm is a leading advocate for environmental protection and sustainable development. We provide comprehensive legal services for environmental compliance and land use matters.',
    'approved',
    NOW(),
    NOW(),
    NOW()
FROM users u WHERE u.email = 'info@guinomlalaw.com'
ON CONFLICT DO NOTHING;

INSERT INTO law_firms (
    user_id, firm_name, license_number, phone, address, 
    latitude, longitude, experience_range, description, 
    verification_status, verified_at, created_at, updated_at
)
SELECT 
    u.id,
    'Latog Law Office',
    'LIC-DVO007',
    '+639231234507',
    '3rd Floor, Felcris Centrale Mall, Quimpo Boulevard, Davao City',
    7.0682,
    125.6095,
    '10-15 years',
    'Latog Law Office provides dedicated legal representation in labor disputes and civil matters. We fight for the rights of workers and individuals throughout Davao region.',
    'approved',
    NOW(),
    NOW(),
    NOW()
FROM users u WHERE u.email = 'latog@latoglegal.ph'
ON CONFLICT DO NOTHING;

INSERT INTO law_firms (
    user_id, firm_name, license_number, phone, address, 
    latitude, longitude, experience_range, description, 
    verification_status, verified_at, created_at, updated_at
)
SELECT 
    u.id,
    'Bajenting Law Office',
    'LIC-DVO008',
    '+639241234508',
    '2nd Floor, Gmall of Davao, Tulip Drive, Lanang, Davao City',
    7.0920,
    125.6301,
    '15-20 years',
    'Bajenting Law Office offers expert legal services in corporate and commercial law. We assist businesses with legal compliance, transactions, and strategic planning throughout Mindanao.',
    'approved',
    NOW(),
    NOW(),
    NOW()
FROM users u WHERE u.email = 'contact@bajentinglaw.com'
ON CONFLICT DO NOTHING;

-- Step 3: Link Specializations
-- First, get the specialization IDs (adjust names if different in your DB)
-- Sudagar: Corporate Law, Real Estate Law, Family Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id)
SELECT lf.id, s.id
FROM law_firms lf, specializations s
WHERE lf.firm_name = 'Sudagar Law Office'
AND s.name IN ('Corporate Law', 'Real Estate Law', 'Family Law')
ON CONFLICT DO NOTHING;

-- Cabanero: Criminal Law, Labor Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id)
SELECT lf.id, s.id
FROM law_firms lf, specializations s
WHERE lf.firm_name = 'Cabanero Law Office'
AND s.name IN ('Criminal Law', 'Labor Law')
ON CONFLICT DO NOTHING;

-- Zamora: Tax Law, Corporate Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id)
SELECT lf.id, s.id
FROM law_firms lf, specializations s
WHERE lf.firm_name = 'Zamora Law Office'
AND s.name IN ('Tax Law', 'Corporate Law')
ON CONFLICT DO NOTHING;

-- Caubang: Family Law, Immigration Law, Real Estate Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id)
SELECT lf.id, s.id
FROM law_firms lf, specializations s
WHERE lf.firm_name = 'Caubang Law Office'
AND s.name IN ('Family Law', 'Immigration Law', 'Real Estate Law')
ON CONFLICT DO NOTHING;

-- Angeles: Intellectual Property, Corporate Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id)
SELECT lf.id, s.id
FROM law_firms lf, specializations s
WHERE lf.firm_name = 'Angeles Law Office'
AND s.name IN ('Intellectual Property', 'Corporate Law')
ON CONFLICT DO NOTHING;

-- Guinomla: Corporate Law, Real Estate Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id)
SELECT lf.id, s.id
FROM law_firms lf, specializations s
WHERE lf.firm_name = 'Guinomla Law Firm'
AND s.name IN ('Corporate Law', 'Real Estate Law')
ON CONFLICT DO NOTHING;

-- Latog: Labor Law, Criminal Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id)
SELECT lf.id, s.id
FROM law_firms lf, specializations s
WHERE lf.firm_name = 'Latog Law Office'
AND s.name IN ('Labor Law', 'Criminal Law')
ON CONFLICT DO NOTHING;

-- Bajenting: Corporate Law, Tax Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id)
SELECT lf.id, s.id
FROM law_firms lf, specializations s
WHERE lf.firm_name = 'Bajenting Law Office'
AND s.name IN ('Corporate Law', 'Tax Law')
ON CONFLICT DO NOTHING;

-- Step 4: Add Ratings
-- This will add 4-5 high-quality ratings per Davao law firm
-- NOTE: Requires existing clients in your database. If this fails, you can skip it and run it separately later.
DO $$
DECLARE
    firm_id INT;
    client_ids INT[];
    client_id INT;
    i INT;
BEGIN
    -- Get first 3 client IDs (if they exist)
    SELECT ARRAY(SELECT id FROM clients LIMIT 3) INTO client_ids;
    
    -- Only proceed if we have clients
    IF array_length(client_ids, 1) > 0 THEN
        -- Add ratings for each Davao firm
        FOR firm_id IN SELECT id FROM law_firms WHERE firm_name IN (
            'Sudagar Law Office', 'Cabanero Law Office', 'Zamora Law Office',
            'Caubang Law Office', 'Angeles Law Office', 'Guinomla Law Firm',
            'Latog Law Office', 'Bajenting Law Office'
        )
        LOOP
            -- Add 4-5 ratings per firm
            FOR i IN 1..5 LOOP
                client_id := client_ids[1 + (i % array_length(client_ids, 1))];
                
                INSERT INTO ratings (client_id, law_firm_id, rating, review, created_at, updated_at)
                VALUES (
                    client_id,
                    firm_id,
                    4 + (random() * 1)::int, -- Random 4 or 5 stars
                    CASE (random() * 9)::int
                        WHEN 0 THEN 'Excellent legal service! Very professional and knowledgeable.'
                        WHEN 1 THEN 'Highly recommend! They handled my case with great expertise.'
                        WHEN 2 THEN 'Outstanding representation. Very responsive and thorough.'
                        WHEN 3 THEN 'Professional and reliable. Got great results for my case.'
                        WHEN 4 THEN 'Best law firm in Davao! Highly recommended.'
                        WHEN 5 THEN 'Very satisfied with their service. They are experts in their field.'
                        WHEN 6 THEN 'Efficient and effective legal assistance. Worth every peso.'
                        WHEN 7 THEN 'Top-notch legal services. Very patient in explaining everything.'
                        ELSE 'Exceptional legal expertise and customer service.'
                    END,
                    NOW() - (random() * 120 || ' days')::interval,
                    NOW() - (random() * 120 || ' days')::interval
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE 'Successfully added ratings for Davao law firms';
    ELSE
        RAISE NOTICE 'No clients found - skipping ratings. You can add ratings later.';
    END IF;
END $$;

COMMIT;

-- ============================================
-- Verification Queries
-- ============================================

-- Check inserted law firms
SELECT id, firm_name, address, experience_range 
FROM law_firms 
WHERE firm_name LIKE '%Davao%' OR firm_name IN (
    'Sudagar Law Office', 'Cabanero Law Office', 'Zamora Law Office',
    'Caubang Law Office', 'Angeles Law Office', 'Guinomla Law Firm',
    'Latog Law Office', 'Bajenting Law Office'
)
ORDER BY created_at DESC;

-- Check specializations
SELECT lf.firm_name, s.name as specialization
FROM law_firms lf
JOIN law_firm_specializations lfs ON lf.id = lfs.law_firm_id
JOIN specializations s ON lfs.specialization_id = s.id
WHERE lf.firm_name LIKE '%Davao%' OR lf.firm_name IN (
    'Sudagar Law Office', 'Cabanero Law Office', 'Zamora Law Office',
    'Caubang Law Office', 'Angeles Law Office', 'Guinomla Law Firm',
    'Latog Law Office', 'Bajenting Law Office'
)
ORDER BY lf.firm_name, s.name;

-- Check ratings
SELECT lf.firm_name, COUNT(r.id) as rating_count, AVG(r.rating) as avg_rating
FROM law_firms lf
LEFT JOIN ratings r ON lf.id = r.law_firm_id
WHERE lf.firm_name LIKE '%Davao%' OR lf.firm_name IN (
    'Sudagar Law Office', 'Cabanero Law Office', 'Zamora Law Office',
    'Caubang Law Office', 'Angeles Law Office', 'Guinomla Law Firm',
    'Latog Law Office', 'Bajenting Law Office'
)
GROUP BY lf.firm_name
ORDER BY lf.firm_name;

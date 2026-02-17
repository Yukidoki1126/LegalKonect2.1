-- ============================================
-- PreferenceTestSeeder SQL Script for PostgreSQL
-- Run this in pgAdmin Query Tool
-- ============================================

-- Password: password123
-- Each user has a unique bcrypt hash for the same password

BEGIN;

-- Step 0: Clean up existing test data (if any)
DELETE FROM ratings WHERE law_firm_id IN (
    SELECT lf.id FROM law_firms lf
    JOIN users u ON lf.user_id = u.id
    WHERE u.email IN (
        'starter@davaolegal.ph','rising@mndalegal.ph','pearl@mindanaolaw.ph',
        'community@torillegal.ph','harbor@sasalaw.ph','partners@matinalaw.ph',
        'probono@buhanginlaw.ph','trade@panacanlegal.ph','agrilaw@calinanlegal.ph',
        'legal@tugboklaw.ph','highlands@mariloglaw.ph','clinic@baguiodistrictlaw.ph',
        'solutions@downtowncorp.ph','contact@roxaslegal.ph','premier@davaolegal.com',
        'office@quirinolegal.ph','hub@rectolegal.ph','services@talomolaw.ph',
        'community@agdaolaw.ph','business@lananglaw.com','associates@ecolandlaw.ph',
        'harbor@panacanlaw.ph','center@catalunanlaw.ph','firm@mintallaw.ph',
        'partners@torilhighland.ph','coastal@bagoaplay.ph','premier@calinanlegal.com',
        'clinic@baguioprobono.ph','environment@mariloglaw.com','family@calinanlaw.ph'
    )
);

DELETE FROM law_firm_specializations WHERE law_firm_id IN (
    SELECT lf.id FROM law_firms lf
    JOIN users u ON lf.user_id = u.id
    WHERE u.email IN (
        'starter@davaolegal.ph','rising@mndalegal.ph','pearl@mindanaolaw.ph',
        'community@torillegal.ph','harbor@sasalaw.ph','partners@matinalaw.ph',
        'probono@buhanginlaw.ph','trade@panacanlegal.ph','agrilaw@calinanlegal.ph',
        'legal@tugboklaw.ph','highlands@mariloglaw.ph','clinic@baguiodistrictlaw.ph',
        'solutions@downtowncorp.ph','contact@roxaslegal.ph','premier@davaolegal.com',
        'office@quirinolegal.ph','hub@rectolegal.ph','services@talomolaw.ph',
        'community@agdaolaw.ph','business@lananglaw.com','associates@ecolandlaw.ph',
        'harbor@panacanlaw.ph','center@catalunanlaw.ph','firm@mintallaw.ph',
        'partners@torilhighland.ph','coastal@bagoaplay.ph','premier@calinanlegal.com',
        'clinic@baguioprobono.ph','environment@mariloglaw.com','family@calinanlaw.ph'
    )
);

DELETE FROM law_firms WHERE user_id IN (
    SELECT id FROM users WHERE email IN (
        'starter@davaolegal.ph','rising@mndalegal.ph','pearl@mindanaolaw.ph',
        'community@torillegal.ph','harbor@sasalaw.ph','partners@matinalaw.ph',
        'probono@buhanginlaw.ph','trade@panacanlegal.ph','agrilaw@calinanlegal.ph',
        'legal@tugboklaw.ph','highlands@mariloglaw.ph','clinic@baguiodistrictlaw.ph',
        'solutions@downtowncorp.ph','contact@roxaslegal.ph','premier@davaolegal.com',
        'office@quirinolegal.ph','hub@rectolegal.ph','services@talomolaw.ph',
        'community@agdaolaw.ph','business@lananglaw.com','associates@ecolandlaw.ph',
        'harbor@panacanlaw.ph','center@catalunanlaw.ph','firm@mintallaw.ph',
        'partners@torilhighland.ph','coastal@bagoaplay.ph','premier@calinanlegal.com',
        'clinic@baguioprobono.ph','environment@mariloglaw.com','family@calinanlaw.ph'
    )
);

DELETE FROM users WHERE email IN (
    'starter@davaolegal.ph','rising@mndalegal.ph','pearl@mindanaolaw.ph',
    'community@torillegal.ph','harbor@sasalaw.ph','partners@matinalaw.ph',
    'probono@buhanginlaw.ph','trade@panacanlegal.ph','agrilaw@calinanlegal.ph',
    'legal@tugboklaw.ph','highlands@mariloglaw.ph','clinic@baguiodistrictlaw.ph',
    'solutions@downtowncorp.ph','contact@roxaslegal.ph','premier@davaolegal.com',
    'office@quirinolegal.ph','hub@rectolegal.ph','services@talomolaw.ph',
    'community@agdaolaw.ph','business@lananglaw.com','associates@ecolandlaw.ph',
    'harbor@panacanlaw.ph','center@catalunanlaw.ph','firm@mintallaw.ph',
    'partners@torilhighland.ph','coastal@bagoaplay.ph','premier@calinanlegal.com',
    'clinic@baguioprobono.ph','environment@mariloglaw.com','family@calinanlaw.ph'
);

-- Step 1: Insert Users for Law Firms
INSERT INTO users (name, email, password, role, email_verified_at, created_at, updated_at) VALUES
('Attorney Ana Reyes', 'starter@davaolegal.ph', '$2y$10$WPRmSJEogOAvfC1xSDKkFO/x6JWAVxNTy1BgEpDzJlnvVxfNTdbve', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Leo Bautista', 'rising@mndalegal.ph', '$2y$10$EVOHQCQ/DKQsAC4RymtppeikG4/FoAjs3YpDYNXtjYhzA.pGG.ddq', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Rosa Aquino', 'pearl@mindanaolaw.ph', '$2y$10$71EWWynRNle2eQtOk2y21.JC227f938a.aHc8S1tsihAYb2Llolhu', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Pedro Navarro', 'community@torillegal.ph', '$2y$10$Siz2loaON2pyI2ovh2e4FOYSmhvbiUX6t0bbDSawkxJd6ea9jA6Vm', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Maria Del Rosario', 'harbor@sasalaw.ph', '$2y$10$34DiJHc.XY8FpI3L8Gqt4uOyK1YYvBYg00ypZU2tVS0VJM2.XPV8S', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Juan Cruz Mendoza', 'partners@matinalaw.ph', '$2y$10$2MF6Hv9qopSNfmdnwkGT8enxkeHc/UWfWPibXCmbCsjbAjmgQ49hm', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Carlos Villareal', 'probono@buhanginlaw.ph', '$2y$10$AW0qUHGIn9OpKFYeLWlE4.E5tBNHpnM4FkUATASuqcMp10NCnQLT6', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Sandra Lim', 'trade@panacanlegal.ph', '$2y$10$Jf7ZV1GkgRbm.NNUZeMm4eGPjsHWNVzD60fVJXiGfVZxOOs5JbkMi', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Roberto Salcedo', 'agrilaw@calinanlegal.ph', '$2y$10$NN/3i97XhKr2sDVFk8wFuOaeBcXEau6z..LrjOdQJhEE.jee0V.jO', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Elena Magbanua', 'legal@tugboklaw.ph', '$2y$10$JYo8Jm1IGXkhF.NC3mBlgOVvfIJlLgX44XKMDMX1qjDnIhPrH8.PS', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Miguel Santos', 'highlands@mariloglaw.ph', '$2y$10$K3HrCUBFysVPULuUJhcMduGN1ii0zfr7KDL1lp2/CUAX5cbIjeU5C', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Fatima Dimaampao', 'clinic@baguiodistrictlaw.ph', '$2y$10$T/AWmi3Mm3sKRYQ0mKKok.9FzAiv9ravJ.4ca538hapbQJ5RPPbva', 'law_firm', NOW(), NOW(), NOW()),
('Attorney James Lim', 'solutions@downtowncorp.ph', '$2y$10$hfFBoZkKzkH0/8TlK6H7QOc.DIfILA73A9ELn2GS/rxwqyG/ZU1T.', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Sarah Chen', 'contact@roxaslegal.ph', '$2y$10$eRaeCZ0xDBNh0QzWyamdVuKfpjTcYYeYrZ9Ef0WDRJAQICShq37Ja', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Roberto Martinez', 'premier@davaolegal.com', '$2y$10$0c7TisLOVHyijlTzQWRPou9R7foAJ8MsWpjoLdDvY2O2PNKYQuVtq', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Linda Tan', 'office@quirinolegal.ph', '$2y$10$eStDeWA9uKz8/i6C5kt1c.af5ezvBX1Ln30dQ6/l3HxAkHk8UCglq', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Mark Gonzales', 'hub@rectolegal.ph', '$2y$10$X6cDBPpeQEd2JjSXidclp.VPn8eccQjEsjro2Mr1Mh8Hr2p5fBPSm', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Grace Villanueva', 'services@talomolaw.ph', '$2y$10$2hdzRt5eh1RDyWwgr7DCLesnecRTteIXlWtdqqvBfpCX8CGStN3c.', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Ramon Castro', 'community@agdaolaw.ph', '$2y$10$TIcD9h3ioAz3gzge7tvOku5z3O0DYUFATTVyao/qc3c1CVhRZiP1W', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Patricia Ong', 'business@lananglaw.com', '$2y$10$Opto5/sdoQdCLUrNa8/xuOgmWU9Ys926c4TPYpbdaqY.5H2NObWGe', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Daniel Reyes', 'associates@ecolandlaw.ph', '$2y$10$1mhIHv0.bjNI41rXBT1OoOxLhojNKtb.AtXOMyDXpJv0EmqEsTAQ6', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Victor Santos', 'harbor@panacanlaw.ph', '$2y$10$aLNJq13Ige8Rz1ZWaTdSre7M8lF.DpVroiUYJEB/TOCJxLv5UuJ66', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Maria Lopez', 'center@catalunanlaw.ph', '$2y$10$6GlXEHHQWobCRTncTIRnqOh9IMOSgK.HdinRHYqGnISMWV1zoMaIe', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Jose Ramirez', 'firm@mintallaw.ph', '$2y$10$oq5.gCWihVqUz7eupSExGu6VNqFjehJJ81wm.hDYg1n.NWqw1dTZe', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Angela Cruz', 'partners@torilhighland.ph', '$2y$10$vEp/m.dLwaPIZrEynD3aVOV2SFqSRcwyES7qiZEKdqeetXlHM9PjC', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Christopher Lee', 'coastal@bagoaplay.ph', '$2y$10$73s4HLcEnFRlksQa3M3qjeycjP8DjdKy8wmtqygXH01Dp7HYaUbx6', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Benjamin Tan', 'premier@calinanlegal.com', '$2y$10$SmCUKG7EyZW.OdFm0/Ln9ezQi/KlIumYDMm/3jpx6V9SThJUYc/D2', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Diana Flores', 'clinic@baguioprobono.ph', '$2y$10$eOs3lol8cGnij./Xm6YvO.u9qhgatWCOb5FgjFt3GSeJgWYa3Kgie', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Michael Ramos', 'environment@mariloglaw.com', '$2y$10$vKs36fQ9I1bP9JjCa.MAsOyBONpxb2WZKm/C6cBu2QD4pPYbKDN2a', 'law_firm', NOW(), NOW(), NOW()),
('Attorney Rosalie Garcia', 'family@calinanlaw.ph', '$2y$10$AciqYhTwPMyJ8UkhidwdTuUAzHjAAytPURdiVZ9meZRdSzkca3LCa', 'law_firm', NOW(), NOW(), NOW());

-- Step 2: Insert Law Firms (using user_id from inserted users)
INSERT INTO law_firms (user_id, firm_name, license_number, phone, address, latitude, longitude, experience_range, description, verification_status, verified_at, created_at, updated_at)
SELECT 
    u.id,
    data.firm_name,
    data.license_number,
    data.phone,
    data.address,
    data.latitude,
    data.longitude,
    data.experience_range,
    data.description,
    'approved',
    NOW(),
    NOW(),
    NOW()
FROM (VALUES
    ('starter@davaolegal.ph', 'Davao Starter Legal Aid', 'LIC-PT001', '+639170001001', 'Door 5, Torres Building, San Pedro Street, Davao City', 7.0745, 125.6130, '1-3 years', 'A young firm passionate about accessible family and criminal law services for Davao residents.'),
    ('rising@mndalegal.ph', 'Mindanao Rising Legal Group', 'LIC-PT002', '+639170001002', '2nd Floor, Uyanguren Commercial, C.M. Recto Avenue, Davao City', 7.0720, 125.6100, '5-8 years', 'Serving Davao businesses with corporate and tax law solutions for over 7 years.'),
    ('pearl@mindanaolaw.ph', 'Pearl of Mindanao Law Center', 'LIC-PT003', '+639170001003', '4th Floor, Pacific Heights Tower, Davao City', 7.0715, 125.6140, '8-10 years', 'Expert labor and immigration lawyers proudly serving the working community of Davao.'),
    ('community@torillegal.ph', 'Toril Community Legal Services', 'LIC-PT004', '+639170001004', 'Toril Proper, Davao City', 7.0180, 125.5700, '3-5 years', 'Community-based law practice serving Toril families with affordable legal aid.'),
    ('harbor@sasalaw.ph', 'Sasa Harbor Law Office', 'LIC-PT005', '+639170001005', 'Sasa Wharf Road, Sasa, Davao City', 7.1200, 125.6400, '10+ years', 'Established firm serving the Sasa business district with corporate and property law expertise.'),
    ('partners@matinalaw.ph', 'Matina Legal Partners', 'LIC-PT006', '+639170001006', 'McArthur Highway, Matina, Davao City', 7.0400, 125.5900, '5-8 years', 'Matina-based law practice focused on criminal defense and labor rights.'),
    ('probono@buhanginlaw.ph', 'Buhangin Pro Bono Firm', 'LIC-PT007', '+639170001007', 'Buhangin Proper, Davao City', 7.1100, 125.6050, '1-3 years', 'New firm with a mission to provide accessible legal services in the Buhangin community.'),
    ('trade@panacanlegal.ph', 'Panacan Trade Law Associates', 'LIC-PT008', '+639170001008', 'Panacan Commercial Area, Davao City', 7.1500, 125.6500, '10+ years', 'Two decades of excellence in trade, corporate, and tax law for Mindanao enterprises.'),
    ('agrilaw@calinanlegal.ph', 'Calinan Agricultural Law Office', 'LIC-PT009', '+639170001009', 'Calinan Public Market Area, Calinan, Davao City', 7.1658, 125.4500, '8-10 years', 'Calinan''s trusted firm for family matters, labor disputes, and agricultural property transactions.'),
    ('legal@tugboklaw.ph', 'Tugbok District Legal Services', 'LIC-PT010', '+639170001010', 'Mintal Highway, Tugbok District, Davao City', 7.0250, 125.5050, '10+ years', 'Serving the growing Tugbok district with comprehensive legal services for residents and businesses.'),
    ('highlands@mariloglaw.ph', 'Marilog Highlands Law Group', 'LIC-PT011', '+639170001011', 'Marilog District, Davao City', 7.2800, 125.4200, '10+ years', 'Experienced firm serving the highland communities of Marilog district with dedicated legal care.'),
    ('clinic@baguiodistrictlaw.ph', 'Baguio District Legal Clinic', 'LIC-PT012', '+639170001012', 'Baguio District, Davao City', 7.2400, 125.4600, '3-5 years', 'A community-oriented firm providing affordable legal services in outer Davao City districts.'),
    ('solutions@downtowncorp.ph', 'Downtown Corporate Solutions', 'LIC-PT013', '+639170001013', 'Magallanes Street, Poblacion District, Davao City', 7.0750, 125.6110, '8-10 years', 'Premier corporate law practice in the heart of downtown Davao.'),
    ('contact@roxaslegal.ph', 'Roxas Avenue Legal Center', 'LIC-PT014', '+639170001014', 'Roxas Avenue, Davao City', 7.0680, 125.6080, '5-8 years', 'Compassionate family law services in downtown Davao.'),
    ('premier@davaolegal.com', 'Davao Premier Legal Associates', 'LIC-PT015', '+639170001015', 'Bolton Street, Davao City', 7.0730, 125.6095, '10+ years', 'Experienced criminal defense and labor law specialists.'),
    ('office@quirinolegal.ph', 'Quirino Avenue Law Office', 'LIC-PT016', '+639170001016', 'Quirino Avenue, Davao City', 7.0765, 125.6125, '3-5 years', 'Young and dynamic firm focused on property and business law.'),
    ('hub@rectolegal.ph', 'Claro M. Recto Legal Hub', 'LIC-PT017', '+639170001017', 'C.M. Recto Avenue, Davao City', 7.0710, 125.6105, '1-3 years', 'Fresh perspective on tax and corporate compliance.'),
    ('services@talomolaw.ph', 'Talomo Legal Services', 'LIC-PT018', '+639170001018', 'McArthur Highway, Talomo, Davao City', 7.0500, 125.6050, '8-10 years', 'Dedicated legal representation for Talomo residents.'),
    ('community@agdaolaw.ph', 'Agdao Community Lawyers', 'LIC-PT019', '+639170001019', 'Agdao District, Davao City', 7.0850, 125.6200, '5-8 years', 'Serving working-class families with affordable legal aid.'),
    ('business@lananglaw.com', 'Lanang Business Law Group', 'LIC-PT020', '+639170001020', 'J.P. Laurel Avenue, Lanang, Davao City', 7.0900, 125.6280, '10+ years', 'Expert business law services for Lanang enterprises.'),
    ('associates@ecolandlaw.ph', 'Ecoland Legal Associates', 'LIC-PT021', '+639170001021', 'Ecoland Drive, Matina, Davao City', 7.0600, 125.6150, '3-5 years', 'Modern law firm serving the Ecoland community.'),
    ('harbor@panacanlaw.ph', 'Panacan Harbor Law', 'LIC-PT022', '+639170001022', 'Panacan, Davao City', 7.1400, 125.6450, '1-3 years', 'Young firm specializing in maritime and labor law.'),
    ('center@catalunanlaw.ph', 'Catalunan Grande Legal Center', 'LIC-PT023', '+639170001023', 'Catalunan Grande, Davao City', 7.1100, 125.5800, '8-10 years', 'Trusted legal services in the Catalunan district.'),
    ('firm@mintallaw.ph', 'Mintal District Law Firm', 'LIC-PT024', '+639170001024', 'Mintal, Tugbok District, Davao City', 7.0300, 125.5100, '5-8 years', 'Defending workers'' rights in Tugbok district.'),
    ('partners@torilhighland.ph', 'Toril Highland Legal Partners', 'LIC-PT025', '+639170001025', 'Toril District, Davao City', 7.0100, 125.5650, '10+ years', 'Comprehensive legal services for southern Davao.'),
    ('coastal@bagoaplay.ph', 'Bago Aplaya Coastal Law', 'LIC-PT026', '+639170001026', 'Bago Aplaya, Talomo District, Davao City', 7.0200, 125.6200, '3-5 years', 'Serving coastal communities with accessible legal aid.'),
    ('premier@calinanlegal.com', 'Calinan Premier Law Associates', 'LIC-PT027', '+639170001027', 'Calinan District, Davao City', 7.1700, 125.4550, '10+ years', 'Premium corporate law services in rural Davao.'),
    ('clinic@baguioprobono.ph', 'Baguio Pro Bono Legal Clinic', 'LIC-PT028', '+639170001028', 'Baguio District, Davao City', 7.2350, 125.4650, '1-3 years', 'Affordable legal aid for highland communities.'),
    ('environment@mariloglaw.com', 'Marilog Environmental Law Group', 'LIC-PT029', '+639170001029', 'Marilog District, Davao City', 7.2750, 125.4250, '5-8 years', 'Sustainable development and environmental law experts.'),
    ('family@calinanlaw.ph', 'Calinan Family Law Center', 'LIC-PT030', '+639170001030', 'Calinan Public Market, Calinan, Davao City', 7.1680, 125.4480, '8-10 years', 'Compassionate family law representation for rural families.')
) AS data(email, firm_name, license_number, phone, address, latitude, longitude, experience_range, description)
JOIN users u ON u.email = data.email;

-- Step 3: Attach Specializations (get specialization IDs and law firm IDs)
-- Family Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id, created_at, updated_at)
SELECT lf.id, s.id, NOW(), NOW()
FROM law_firms lf
JOIN users u ON lf.user_id = u.id
JOIN specializations s ON s.name = 'Family Law'
WHERE u.email IN (
    'starter@davaolegal.ph',
    'community@torillegal.ph',
    'probono@buhanginlaw.ph',
    'contact@roxaslegal.ph',
    'services@talomolaw.ph',
    'community@agdaolaw.ph',
    'associates@ecolandlaw.ph',
    'center@catalunanlaw.ph',
    'partners@torilhighland.ph',
    'coastal@bagoaplay.ph',
    'agrilaw@calinanlegal.ph',
    'highlands@mariloglaw.ph',
    'clinic@baguiodistrictlaw.ph',
    'clinic@baguioprobono.ph',
    'family@calinanlaw.ph'
);

-- Corporate Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id, created_at, updated_at)
SELECT lf.id, s.id, NOW(), NOW()
FROM law_firms lf
JOIN users u ON lf.user_id = u.id
JOIN specializations s ON s.name = 'Corporate Law'
WHERE u.email IN (
    'rising@mndalegal.ph',
    'harbor@sasalaw.ph',
    'trade@panacanlegal.ph',
    'legal@tugboklaw.ph',
    'highlands@mariloglaw.ph',
    'solutions@downtowncorp.ph',
    'office@quirinolegal.ph',
    'hub@rectolegal.ph',
    'business@lananglaw.com',
    'harbor@panacanlaw.ph',
    'partners@torilhighland.ph',
    'premier@calinanlegal.com',
    'environment@mariloglaw.com'
);

-- Criminal Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id, created_at, updated_at)
SELECT lf.id, s.id, NOW(), NOW()
FROM law_firms lf
JOIN users u ON lf.user_id = u.id
JOIN specializations s ON s.name = 'Criminal Law'
WHERE u.email IN (
    'starter@davaolegal.ph',
    'partners@matinalaw.ph',
    'probono@buhanginlaw.ph',
    'premier@davaolegal.com',
    'services@talomolaw.ph',
    'center@catalunanlaw.ph',
    'firm@mintallaw.ph',
    'legal@tugboklaw.ph',
    'clinic@baguiodistrictlaw.ph',
    'family@calinanlaw.ph'
);

-- Labor Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id, created_at, updated_at)
SELECT lf.id, s.id, NOW(), NOW()
FROM law_firms lf
JOIN users u ON lf.user_id = u.id
JOIN specializations s ON s.name = 'Labor Law'
WHERE u.email IN (
    'pearl@mindanaolaw.ph',
    'partners@matinalaw.ph',
    'premier@davaolegal.com',
    'services@talomolaw.ph',
    'community@agdaolaw.ph',
    'harbor@panacanlaw.ph',
    'agrilaw@calinanlegal.ph',
    'firm@mintallaw.ph',
    'highlands@mariloglaw.ph',
    'clinic@baguioprobono.ph'
);

-- Real Estate Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id, created_at, updated_at)
SELECT lf.id, s.id, NOW(), NOW()
FROM law_firms lf
JOIN users u ON lf.user_id = u.id
JOIN specializations s ON s.name = 'Real Estate Law'
WHERE u.email IN (
    'community@torillegal.ph',
    'harbor@sasalaw.ph',
    'trade@panacanlegal.ph',
    'solutions@downtowncorp.ph',
    'office@quirinolegal.ph',
    'business@lananglaw.com',
    'associates@ecolandlaw.ph',
    'center@catalunanlaw.ph',
    'partners@torilhighland.ph',
    'agrilaw@calinanlegal.ph',
    'premier@calinanlegal.com',
    'clinic@baguiodistrictlaw.ph',
    'environment@mariloglaw.com'
);

-- Tax Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id, created_at, updated_at)
SELECT lf.id, s.id, NOW(), NOW()
FROM law_firms lf
JOIN users u ON lf.user_id = u.id
JOIN specializations s ON s.name = 'Tax Law'
WHERE u.email IN (
    'rising@mndalegal.ph',
    'harbor@sasalaw.ph',
    'trade@panacanlegal.ph',
    'solutions@downtowncorp.ph',
    'hub@rectolegal.ph',
    'business@lananglaw.com',
    'firm@mintallaw.ph',
    'premier@calinanlegal.com',
    'environment@mariloglaw.com'
);

-- Immigration Law
INSERT INTO law_firm_specializations (law_firm_id, specialization_id, created_at, updated_at)
SELECT lf.id, s.id, NOW(), NOW()
FROM law_firms lf
JOIN users u ON lf.user_id = u.id
JOIN specializations s ON s.name = 'Immigration Law'
WHERE u.email IN (
    'pearl@mindanaolaw.ph',
    'probono@buhanginlaw.ph',
    'contact@roxaslegal.ph',
    'community@agdaolaw.ph',
    'coastal@bagoaplay.ph',
    'legal@tugboklaw.ph'
);

-- ============================================
-- Step 4: Add Ratings for Law Firms
-- Generates ratings for each law firm
-- ============================================

-- Insert ratings (uses the first available client)
DO $$
DECLARE
    client_id_val INTEGER;
    law_firm_record RECORD;
    rating_value DECIMAL;
    num_ratings INTEGER;
    i INTEGER;
BEGIN
    -- Get first client
    SELECT id INTO client_id_val FROM clients LIMIT 1;
    
    IF client_id_val IS NULL THEN
        RAISE NOTICE '⚠️  No clients found - skipping ratings. Create a client account first to see ratings.';
    ELSE
        RAISE NOTICE '✅ Found client ID %. Adding ratings...', client_id_val;
        
        -- Rating data for each firm
        FOR law_firm_record IN 
            SELECT lf.id, u.email,
                CASE u.email
                    WHEN 'starter@davaolegal.ph' THEN 3.0
                    WHEN 'rising@mndalegal.ph' THEN 4.5
                    WHEN 'pearl@mindanaolaw.ph' THEN 4.0
                    WHEN 'community@torillegal.ph' THEN 2.5
                    WHEN 'harbor@sasalaw.ph' THEN 4.5
                    WHEN 'partners@matinalaw.ph' THEN 3.5
                    WHEN 'probono@buhanginlaw.ph' THEN 5.0
                    WHEN 'trade@panacanlegal.ph' THEN 4.0
                    WHEN 'agrilaw@calinanlegal.ph' THEN 3.0
                    WHEN 'legal@tugboklaw.ph' THEN 4.5
                    WHEN 'highlands@mariloglaw.ph' THEN 5.0
                    WHEN 'clinic@baguiodistrictlaw.ph' THEN 3.5
                    WHEN 'solutions@downtowncorp.ph' THEN 4.5
                    WHEN 'contact@roxaslegal.ph' THEN 4.0
                    WHEN 'premier@davaolegal.com' THEN 5.0
                    WHEN 'office@quirinolegal.ph' THEN 3.5
                    WHEN 'hub@rectolegal.ph' THEN 3.0
                    WHEN 'services@talomolaw.ph' THEN 4.5
                    WHEN 'community@agdaolaw.ph' THEN 3.5
                    WHEN 'business@lananglaw.com' THEN 5.0
                    WHEN 'associates@ecolandlaw.ph' THEN 4.0
                    WHEN 'harbor@panacanlaw.ph' THEN 2.5
                    WHEN 'center@catalunanlaw.ph' THEN 4.0
                    WHEN 'firm@mintallaw.ph' THEN 3.5
                    WHEN 'partners@torilhighland.ph' THEN 4.5
                    WHEN 'coastal@bagoaplay.ph' THEN 3.0
                    WHEN 'premier@calinanlegal.com' THEN 5.0
                    WHEN 'clinic@baguioprobono.ph' THEN 4.0
                    WHEN 'environment@mariloglaw.com' THEN 4.5
                    WHEN 'family@calinanlaw.ph' THEN 3.5
                    ELSE 4.0
                END as target_rating,
                CASE u.email
                    WHEN 'starter@davaolegal.ph' THEN 4
                    WHEN 'rising@mndalegal.ph' THEN 5
                    WHEN 'pearl@mindanaolaw.ph' THEN 6
                    WHEN 'community@torillegal.ph' THEN 3
                    WHEN 'harbor@sasalaw.ph' THEN 5
                    WHEN 'partners@matinalaw.ph' THEN 4
                    WHEN 'probono@buhanginlaw.ph' THEN 2
                    WHEN 'trade@panacanlegal.ph' THEN 7
                    WHEN 'agrilaw@calinanlegal.ph' THEN 3
                    WHEN 'legal@tugboklaw.ph' THEN 6
                    WHEN 'highlands@mariloglaw.ph' THEN 8
                    WHEN 'clinic@baguiodistrictlaw.ph' THEN 2
                    WHEN 'solutions@downtowncorp.ph' THEN 10
                    WHEN 'contact@roxaslegal.ph' THEN 8
                    WHEN 'premier@davaolegal.com' THEN 12
                    WHEN 'office@quirinolegal.ph' THEN 5
                    WHEN 'hub@rectolegal.ph' THEN 3
                    WHEN 'services@talomolaw.ph' THEN 9
                    WHEN 'community@agdaolaw.ph' THEN 6
                    WHEN 'business@lananglaw.com' THEN 15
                    WHEN 'associates@ecolandlaw.ph' THEN 7
                    WHEN 'harbor@panacanlaw.ph' THEN 2
                    WHEN 'center@catalunanlaw.ph' THEN 8
                    WHEN 'firm@mintallaw.ph' THEN 5
                    WHEN 'partners@torilhighland.ph' THEN 11
                    WHEN 'coastal@bagoaplay.ph' THEN 4
                    WHEN 'premier@calinanlegal.com' THEN 10
                    WHEN 'clinic@baguioprobono.ph' THEN 5
                    WHEN 'environment@mariloglaw.com' THEN 7
                    WHEN 'family@calinanlaw.ph' THEN 6
                    ELSE 3
                END as num_ratings
            FROM law_firms lf
            JOIN users u ON lf.user_id = u.id
            WHERE u.email IN (
                'starter@davaolegal.ph','rising@mndalegal.ph','pearl@mindanaolaw.ph',
                'community@torillegal.ph','harbor@sasalaw.ph','partners@matinalaw.ph',
                'probono@buhanginlaw.ph','trade@panacanlegal.ph','agrilaw@calinanlegal.ph',
                'legal@tugboklaw.ph','highlands@mariloglaw.ph','clinic@baguiodistrictlaw.ph',
                'solutions@downtowncorp.ph','contact@roxaslegal.ph','premier@davaolegal.com',
                'office@quirinolegal.ph','hub@rectolegal.ph','services@talomolaw.ph',
                'community@agdaolaw.ph','business@lananglaw.com','associates@ecolandlaw.ph',
                'harbor@panacanlaw.ph','center@catalunanlaw.ph','firm@mintallaw.ph',
                'partners@torilhighland.ph','coastal@bagoaplay.ph','premier@calinanlegal.com',
                'clinic@baguioprobono.ph','environment@mariloglaw.com','family@calinanlaw.ph'
            )
        LOOP
            rating_value := law_firm_record.target_rating;
            num_ratings := law_firm_record.num_ratings;
            
            -- Create ratings
            FOR i IN 1..num_ratings LOOP
                INSERT INTO ratings (
                    client_id, 
                    law_firm_id, 
                    rating, 
                    review, 
                    created_at, 
                    updated_at
                ) VALUES (
                    client_id_val,
                    law_firm_record.id,
                    rating_value + (RANDOM() * 0.4 - 0.2), -- Add slight variation
                    'Test review ' || i,
                    NOW() - (INTERVAL '1 day' * FLOOR(RANDOM() * 30)),
                    NOW() - (INTERVAL '1 day' * FLOOR(RANDOM() * 30))
                );
            END LOOP;
            
            RAISE NOTICE '   Added % ratings for firm ID %', num_ratings, law_firm_record.id;
        END LOOP;
    END IF;
    
END $$;

COMMIT;

-- ============================================
-- Verification & Summary
-- ============================================

SELECT '═══════════════════════════════════════' as "SEEDER SUMMARY";

SELECT 'Users Added' as metric, COUNT(*) as count 
FROM users 
WHERE role = 'law_firm' 
AND email IN (
    'starter@davaolegal.ph','rising@mndalegal.ph','pearl@mindanaolaw.ph',
    'community@torillegal.ph','harbor@sasalaw.ph','partners@matinalaw.ph',
    'probono@buhanginlaw.ph','trade@panacanlegal.ph','agrilaw@calinanlegal.ph',
    'legal@tugboklaw.ph','highlands@mariloglaw.ph','clinic@baguiodistrictlaw.ph',
    'solutions@downtowncorp.ph','contact@roxaslegal.ph','premier@davaolegal.com',
    'office@quirinolegal.ph','hub@rectolegal.ph','services@talomolaw.ph',
    'community@agdaolaw.ph','business@lananglaw.com','associates@ecolandlaw.ph',
    'harbor@panacanlaw.ph','center@catalunanlaw.ph','firm@mintallaw.ph',
    'partners@torilhighland.ph','coastal@bagoaplay.ph','premier@calinanlegal.com',
    'clinic@baguioprobono.ph','environment@mariloglaw.com','family@calinanlaw.ph'
)

UNION ALL
SELECT 'Law Firms Added', COUNT(*) FROM law_firms

UNION ALL
SELECT 'Specialization Links', COUNT(*) FROM law_firm_specializations

UNION ALL
SELECT 'Ratings Added', COUNT(*) FROM ratings;

-- Show all firms with ratings
SELECT 
    lf.firm_name,
    lf.experience_range,
    lf.address,
    ROUND(AVG(r.rating)::numeric, 1) as avg_rating,
    COUNT(r.id) as review_count
FROM law_firms lf
LEFT JOIN ratings r ON lf.id = r.law_firm_id
GROUP BY lf.firm_name, lf.experience_range, lf.address
ORDER BY avg_rating DESC NULLS LAST, review_count DESC;

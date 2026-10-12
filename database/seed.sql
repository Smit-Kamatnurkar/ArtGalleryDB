-- ============================================================================
-- ArtGalleryDB — Sample Data (DML: INSERT)
-- Database : artgallery_db
--
-- Realistic sample records with valid foreign key references.
-- The two application accounts below use DEVELOPMENT-ONLY passwords:
--   admin@artgallery.edu  / admin123    (role ADMIN)
--   student@artgallery.edu / student123 (role USER)
-- These BCrypt hashes must be changed for any non-local use.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Users (passwords are BCrypt hashes of the dev-only credentials above)
-- ----------------------------------------------------------------------------
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@artgallery.edu',   '$2y$10$HWk8PtAPpQW9W.yV2JQUBeyr6lTOn/BJRqB/Pjy3gomYX56Ph6t5K', 'Dr. Vance',        'ADMIN'),
('student@artgallery.edu', '$2y$10$cyBcf6TDo11epqJle.qrvOU/CyFWAgoZwRGXzYZRUJBTctuneCmTe', 'Student Intern',   'USER');

-- ----------------------------------------------------------------------------
-- Curators
-- ----------------------------------------------------------------------------
INSERT INTO curators (full_name, department, email, security_clearance) VALUES
('Dr. Helena Voss',    'Modern & Contemporary', 'helena.voss@gallery.art',  'CHIEF'),
('Marcus Beaumont',    'Classical Antiquities', 'marcus.b@gallery.art',     'SENIOR'),
('Yuki Tanaka',        'Prints & Drawings',     'yuki.tanaka@gallery.art',  'STANDARD'),
('Prof. Anselm Kroll', 'Sculpture & Installations', 'anselm.kroll@gallery.art', 'SENIOR');

-- ----------------------------------------------------------------------------
-- Artists (registry ids are explicit business keys)
-- ----------------------------------------------------------------------------
INSERT INTO artists (id, name, country, country_code, active_period, bio, movement, image_url, verified_master) VALUES
('ART-0081', 'Katsushika Hokusai', 'Japan', 'JPN', '1760 – 1849', 'Edo Period master printmaker & illustrator', 'Ukiyo-e Woodblock Prints', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9t5VQjyP4DmJG-Z0gpyQ4a_FsGom1Fxvww2eNmlx220e8m4TzElxH1uBvWn0I9Qm_Rr5-h8P2UhidelLTF5lRxT92kCoSMJHFhNefcl5hte0agHV52KcK5THwiAPrxFzkTDwtztMC7TxDStRIrYFJtZ3fdSuq1xAGeJ6egdQibiVuE-z-BgKTydsP8Sq7IfP2_zlJC5R7Zw1FeMpaHXZvIgetZffjwrswM5hdlURMM0Rk8Zrdbf4J', TRUE),
('ART-0082', 'Artemisia Gentileschi', 'Italy', 'ITA', '1593 – 1656', 'Italian Baroque monumental narrative painter', 'Baroque Realism', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4ukDruy-mU59_FDWPSwRjT4KIeCkADwS2HJE4blmxPpFXPsGWcPE7xnPvwfuPpPZrcsm9uSQANJW6NBVRqIJHuYS4WyvesctsVCwTx6FGgM_-quZDkClZ9VNlvZMdTkHld_q2iSVfo1-1bMHzwnML85_TrVUwPC9lT7lb2XXmsbEE2lwE5JSX2BtuTnzhGggyri3npsk6-IP7BYmbeRWmCXxN9OwpEcCxveA5KhfHNIHaESAU-yn', TRUE),
('ART-0083', 'Hilma af Klint', 'Sweden', 'SWE', '1862 – 1944', 'Mystical monumental abstract compositions', 'Pioneering Abstract Geometry', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDuUAAG0ZMZ-Fc2Sq1P4YfvK27wvNf0sTvdW2vjzt8R-AJWFfMyzyhlhg3CA6YylPInUf2MLrwMx4lPGwqt_WhX4XSDGdH0RL7Xaj9t0l_rus5gZSB0CNZjVd0ZLCuPjCDX4UUJ6_IpWcinxf7q2UqLObzEPmCgZIG8TTgUz99oCvz0ghRnxwDam-TMmd1L9QkfEPaeSYpErXVDSGoCsr9CVSSjuj0P73zuFnVxuhZWraKFDMp6iRu', TRUE),
('ART-0084', 'Paul Cézanne', 'France', 'FRA', '1839 – 1906', 'Structural form & Mont Sainte-Victoire studies', 'Post-Impressionism', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmvRJz8Wj2NPmoYocXjhbK-2is4H0h0srv-v8WBzx6UCNymfvN5umqsBNDxbzXGurL9iKflFA2Qef1v72LpRzP7pUxRYPi1dTzn-YSAb1WtUxHSpIuIAT0hHPfRYQ9Mmpk44NoKoQR0Zei1ZiaJA7viRfsTe0_Ld6jEes-Lh35um7D5Tuilk6e-poo1uQJw5jgXENJuHrf73HLQy2u9FdupkMF7-jDsX7sanC7iElr4DV3c3zcn_Gv', TRUE),
('ART-0085', 'Amrita Sher-Gil', 'India', 'IND', '1913 – 1941', 'Avant-garde pioneer of 20th c. modern Indian art', 'Modern Figurative Realism', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK2cdJQfEep3IjaYfFDzXXRtuJQZL0StDCZ8ZI2ab5iAZAqH_ZuE4CZqSuorEGWFu2YehrT9g3FO440pHeKDaPNTpSJznBcZZfwHt0YrlyRVpgJW0fIDO39BTbfn2Xc-lC5ZHg3k8-CMA8FPrFNffW_AvDQiwUwZfQRDwFSEgp-7EAXqo5XdYYLGPvaNttRQvIkFmO8z_JLRj9-sKU6icjxhSgzoDezEJ_e50u8TxCfwuAgo1kaK9h', TRUE),
('ART-0014', 'Elena Rostova', 'Ukraine', 'UKR', '1945 – 2012', 'Color field & earth pigment monumental tapestries', 'Contemporary Minimalism', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4ukDruy-mU59_FDWPSwRjT4KIeCkADwS2HJE4blmxPpFXPsGWcPE7xnPvwfuPpPZrcsm9uSQANJW6NBVRqIJHuYS4WyvesctsVCwTx6FGgM_-quZDkClZ9VNlvZMdTkHld_q2iSVfo1-1bMHzwnML85_TrVUwPC9lT7lb2XXmsbEE2lwE5JSX2BtuTnzhGggyri3npsk6-IP7BYmbeRWmCXxN9OwpEcCxveA5KhfHNIHaESAU-yn', FALSE),
('ART-0008', 'Marcus Chen', 'Taiwan', 'TWN', '1961 – Present', 'Heavy bronze patina geometric sculptures', 'Modernist Sculpture', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC23NI_v0C-YiS2vGbx2LHVWbvgZy_Fj9vSsnpVd3E4b33hneRQogVNQ8PkTVt1EGqvr_Tym3UC6J3Bz5Czu77Fdewg6nLAOEFE3kEbSYI4uTQZK7xR0f7j-V5zQPeeIevTyvADPIs6nbL0LrZrSSbvzwPmFS0S0_hs3usSBZLhPH-621yKsAFI2AkSPJe8vpwb-_lA_yKgBS9DW1D2x0CQY3ZfKfh-FwbWf8NubqdrxCEsp62xhMJ1', TRUE),
('ART-0021', 'Søren Lindqvist', 'Denmark', 'DNK', '1954 – Present', 'Archival silver gelatin architectural photographer', 'New Topographics', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK2cdJQfEep3IjaYfFDzXXRtuJQZL0StDCZ8ZI2ab5iAZAqH_ZuE4CZqSuorEGWFu2YehrT9g3FO440pHeKDaPNTpSJznBcZZfwHt0YrlyRVpgJW0fIDO39BTbfn2Xc-lC5ZHg3k8-CMA8FPrFNffW_AvDQiwUwZfQRDwFSEgp-7EAXqo5XdYYLGPvaNttRQvIkFmO8z_JLRj9-sKU6icjxhSgzoDezEJ_e50u8TxCfwuAgo1kaK9h', FALSE),
('ART-0003', 'Nadia Al-Mansoor', 'Morocco', 'MAR', '1970 – Present', 'Handspun natural dye fiber artist', 'Textile Expressionism', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDuUAAG0ZMZ-Fc2Sq1P4YfvK27wvNf0sTvdW2vjzt8R-AJWFfMyzyhlhg3CA6YylPInUf2MLrwMx4lPGwqt_WhX4XSDGdH0RL7Xaj9t0l_rus5gZSB0CNZjVd0ZLCuPjCDX4UUJ6_IpWcinxf7q2UqLObzEPmCgZIG8TTgUz99oCvz0ghRnxwDam-TMmd1L9QkfEPaeSYpErXVDSGoCsr9CVSSjuj0P73zuFnVxuhZWraKFDMp6iRu', FALSE),
('ART-0033', 'Piet Mondrian', 'Netherlands', 'NLD', '1872 – 1944', 'Geometric abstraction and primary color grids', 'De Stijl Neoplasticism', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmvRJz8Wj2NPmoYocXjhbK-2is4H0h0srv-v8WBzx6UCNymfvN5umqsBNDxbzXGurL9iKflFA2Qef1v72LpRzP7pUxRYPi1dTzn-YSAb1WtUxHSpIuIAT0hHPfRYQ9Mmpk44NoKoQR0Zei1ZiaJA7viRfsTe0_Ld6jEes-Lh35um7D5Tuilk6e-poo1uQJw5jgXENJuHrf73HLQy2u9FdupkMF7-jDsX7sanC7iElr4DV3c3zcn_Gv', TRUE),
('ART-0042', 'Edward Hopper', 'United States', 'USA', '1882 – 1967', 'American realist painter of urban solitude', 'American Realism', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD74XYOm6FsKOKjz0pe2oT6YO_aJa98mZItHH1ztblnuI1zg70sLG0-5qSPiVPyPOCt_qd7QNSGHLY1Lw-vARw2Rdwwtit12fv9AfhyaiqDO0VkcR_PeBak0CEdXEmkQaMJphu6RBIcswjIB4rbjHhih9whT3-XnGXpFiYI30gC2ZnpwFxN5H_QYkW7tGinbAr0IL-_NpVqkMT0ii0aDOfA3ZBeGs2CLHQwP0dqX4MB6wW0639if67o', TRUE),
('ART-0050', 'Helen Frankenthaler', 'United States', 'USA', '1928 – 2011', 'Soak-stain pioneer of Color Field painting', 'Color Field Abstraction', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4ukDruy-mU59_FDWPSwRjT4KIeCkADwS2HJE4blmxPpFXPsGWcPE7xnPvwfuPpPZrcsm9uSQANJW6NBVRqIJHuYS4WyvesctsVCwTx6FGgM_-quZDkClZ9VNlvZMdTkHld_q2iSVfo1-1bMHzwnML85_TrVUwPC9lT7lb2XXmsbEE2lwE5JSX2BtuTnzhGggyri3npsk6-IP7BYmbeRWmCXxN9OwpEcCxveA5KhfHNIHaESAU-yn', TRUE),
('ART-0061', 'Eduardo Chillida', 'Spain', 'ESP', '1924 – 2002', 'Monumental forged iron and granite sculpture', 'Abstract Sculpture', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC23NI_v0C-YiS2vGbx2LHVWbvgZy_Fj9vSsnpVd3E4b33hneRQogVNQ8PkTVt1EGqvr_Tym3UC6J3Bz5Czu77Fdewg6nLAOEFE3kEbSYI4uTQZK7xR0f7j-V5zQPeeIevTyvADPIs6nbL0LrZrSSbvzwPmFS0S0_hs3usSBZLhPH-621yKsAFI2AkSPJe8vpwb-_lA_yKgBS9DW1D2x0CQY3ZfKfh-FwbWf8NubqdrxCEsp62xhMJ1', TRUE);

-- ----------------------------------------------------------------------------
-- Artworks
-- ----------------------------------------------------------------------------
INSERT INTO artworks (code, title, artist_id, medium, dimensions, price, year_created, status, image_url, curator_id, vault_location, last_appraisal_date) VALUES
('ART-2024-089', 'Nocturne in Ochre V', 'ART-0014', 'Oil on Linen', '120 × 160 cm', 48500.00, 2021, 'Archived', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4ukDruy-mU59_FDWPSwRjT4KIeCkADwS2HJE4blmxPpFXPsGWcPE7xnPvwfuPpPZrcsm9uSQANJW6NBVRqIJHuYS4WyvesctsVCwTx6FGgM_-quZDkClZ9VNlvZMdTkHld_q2iSVfo1-1bMHzwnML85_TrVUwPC9lT7lb2XXmsbEE2lwE5JSX2BtuTnzhGggyri3npsk6-IP7BYmbeRWmCXxN9OwpEcCxveA5KhfHNIHaESAU-yn', 1, 'Vault B-14', '2024-11-02'),
('ART-2024-090', 'Equilibrium Series IV', 'ART-0008', 'Patinated Bronze', '45 × 30 × 30 cm', 32000.00, 2023, 'Vaulted', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC23NI_v0C-YiS2vGbx2LHVWbvgZy_Fj9vSsnpVd3E4b33hneRQogVNQ8PkTVt1EGqvr_Tym3UC6J3Bz5Czu77Fdewg6nLAOEFE3kEbSYI4uTQZK7xR0f7j-V5zQPeeIevTyvADPIs6nbL0LrZrSSbvzwPmFS0S0_hs3usSBZLhPH-621yKsAFI2AkSPJe8vpwb-_lA_yKgBS9DW1D2x0CQY3ZfKfh-FwbWf8NubqdrxCEsp62xhMJ1', 4, 'Vault A-02', '2024-12-15'),
('ART-2024-091', 'Brutalist Geometry No. 12', 'ART-0021', 'Gelatin Silver Print', '90 × 120 cm', 14200.00, 2019, 'In Transit', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK2cdJQfEep3IjaYfFDzXXRtuJQZL0StDCZ8ZI2ab5iAZAqH_ZuE4CZqSuorEGWFu2YehrT9g3FO440pHeKDaPNTpSJznBcZZfwHt0YrlyRVpgJW0fIDO39BTbfn2Xc-lC5ZHg3k8-CMA8FPrFNffW_AvDQiwUwZfQRDwFSEgp-7EAXqo5XdYYLGPvaNttRQvIkFmO8z_JLRj9-sKU6icjxhSgzoDezEJ_e50u8TxCfwuAgo1kaK9h', NULL, NULL, '2024-10-20'),
('ART-2024-092', 'Tapestry of the Solstice', 'ART-0003', 'Handspun Wool', '180 × 240 cm', 21500.00, 2022, 'Archived', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDuUAAG0ZMZ-Fc2Sq1P4YfvK27wvNf0sTvdW2vjzt8R-AJWFfMyzyhlhg3CA6YylPInUf2MLrwMx4lPGwqt_WhX4XSDGdH0RL7Xaj9t0l_rus5gZSB0CNZjVd0ZLCuPjCDX4UUJ6_IpWcinxf7q2UqLObzEPmCgZIG8TTgUz99oCvz0ghRnxwDam-TMmd1L9QkfEPaeSYpErXVDSGoCsr9CVSSjuj0P73zuFnVxuhZWraKFDMp6iRu', 3, 'Vault C-07', '2024-09-30'),
('ART-2023-112', 'Composition with Yellow, Blue and Ochre', 'ART-0033', 'Oil on linen', '80 × 80 cm', 1450000.00, 1929, 'Exhibited', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmvRJz8Wj2NPmoYocXjhbK-2is4H0h0srv-v8WBzx6UCNymfvN5umqsBNDxbzXGurL9iKflFA2Qef1v72LpRzP7pUxRYPi1dTzn-YSAb1WtUxHSpIuIAT0hHPfRYQ9Mmpk44NoKoQR0Zei1ZiaJA7viRfsTe0_Ld6jEes-Lh35um7D5Tuilk6e-poo1uQJw5jgXENJuHrf73HLQy2u9FdupkMF7-jDsX7sanC7iElr4DV3c3zcn_Gv', 1, 'Wing North — Hall 2', '2025-01-10'),
('ART-2023-044', 'Nighthawks Study #3', 'ART-0042', 'Oil on canvas', '75 × 110 cm', 875000.00, 1941, 'Exhibited', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD74XYOm6FsKOKjz0pe2oT6YO_aJa98mZItHH1ztblnuI1zg70sLG0-5qSPiVPyPOCt_qd7QNSGHLY1Lw-vARw2Rdwwtit12fv9AfhyaiqDO0VkcR_PeBak0CEdXEmkQaMJphu6RBIcswjIB4rbjHhih9whT3-XnGXpFiYI30gC2ZnpwFxN5H_QYkW7tGinbAr0IL-_NpVqkMT0ii0aDOfA3ZBeGs2CLHQwP0dqX4MB6wW0639if67o', 2, 'Wing East — Hall 1', '2024-12-01'),
('ART-2024-001', 'Study for Broad Canvas VI', 'ART-0050', 'Acrylic on unprimed canvas', '210 × 260 cm', 620000.00, 1968, 'Exhibited', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4ukDruy-mU59_FDWPSwRjT4KIeCkADwS2HJE4blmxPpFXPsGWcPE7xnPvwfuPpPZrcsm9uSQANJW6NBVRqIJHuYS4WyvesctsVCwTx6FGgM_-quZDkClZ9VNlvZMdTkHld_q2iSVfo1-1bMHzwnML85_TrVUwPC9lT7lb2XXmsbEE2lwE5JSX2BtuTnzhGggyri3npsk6-IP7BYmbeRWmCXxN9OwpEcCxveA5KhfHNIHaESAU-yn', 1, 'Wing West — Hall 3', '2024-11-18'),
('ART-2022-078', 'Geometric Monolith 12', 'ART-0061', 'Forged iron and granite', '140 × 90 × 90 cm', 410000.00, 1974, 'Exhibited', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC23NI_v0C-YiS2vGbx2LHVWbvgZy_Fj9vSsnpVd3E4b33hneRQogVNQ8PkTVt1EGqvr_Tym3UC6J3Bz5Czu77Fdewg6nLAOEFE3kEbSYI4uTQZK7xR0f7j-V5zQPeeIevTyvADPIs6nbL0LrZrSSbvzwPmFS0S0_hs3usSBZLhPH-621yKsAFI2AkSPJe8vpwb-_lA_yKgBS9DW1D2x0CQY3ZfKfh-FwbWf8NubqdrxCEsp62xhMJ1', 4, 'Sculpture Court', '2024-08-25'),
('ART-1999-011', 'The Great Wave (Restrike)', 'ART-0081', 'Woodblock Print on Washi', '38 × 25 cm', 125000.00, 1831, 'Vaulted', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9t5VQjyP4DmJG-Z0gpyQ4a_FsGom1Fxvww2eNmlx220e8m4TzElxH1uBvWn0I9Qm_Rr5-h8P2UhidelLTF5lRxT92kCoSMJHFhNefcl5hte0agHV52KcK5THwiAPrxFzkTDwtztMC7TxDStRIrYFJtZ3fdSuq1xAGeJ6egdQibiVuE-z-BgKTydsP8Sq7IfP2_zlJC5R7Zw1FeMpaHXZvIgetZffjwrswM5hdlURMM0Rk8Zrdbf4J', 3, 'Print Room Vault', '2024-07-14'),
('ART-1998-004', 'Judith Slaying Holofernes (Study)', 'ART-0082', 'Oil on canvas', '114 × 93 cm', 2100000.00, 1620, 'Vaulted', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4ukDruy-mU59_FDWPSwRjT4KIeCkADwS2HJE4blmxPpFXPsGWcPE7xnPvwfuPpPZrcsm9uSQANJW6NBVRqIJHuYS4WyvesctsVCwTx6FGgM_-quZDkClZ9VNlvZMdTkHld_q2iSVfo1-1bMHzwnML85_TrVUwPC9lT7lb2XXmsbEE2lwE5JSX2BtuTnzhGggyri3npsk6-IP7BYmbeRWmCXxN9OwpEcCxveA5KhfHNIHaESAU-yn', 2, 'Vault S-01', '2023-05-22'),
('ART-2005-038', 'The Ten Largest No. 7', 'ART-0083', 'Tempera on Paper', '270 × 190 cm', 980000.00, 1907, 'Exhibited', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDuUAAG0ZMZ-Fc2Sq1P4YfvK27wvNf0sTvdW2vjzt8R-AJWFfMyzyhlhg3CA6YylPInUf2MLrwMx4lPGwqt_WhX4XSDGdH0RL7Xaj9t0l_rus5gZSB0CNZjVd0ZLCuPjCDX4UUJ6_IpWcinxf7q2UqLObzEPmCgZIG8TTgUz99oCvz0ghRnxwDam-TMmd1L9QkfEPaeSYpErXVDSGoCsr9CVSSjuj0P73zuFnVxuhZWraKFDMp6iRu', 1, 'Wing North — Hall 4', '2024-06-09'),
('ART-2002-021', 'Mont Sainte-Victoire (1902)', 'ART-0084', 'Oil on canvas', '81 × 65 cm', 55000000.00, 1902, 'Acquired', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmvRJz8Wj2NPmoYocXjhbK-2is4H0h0srv-v8WBzx6UCNymfvN5umqsBNDxbzXGurL9iKflFA2Qef1v72LpRzP7pUxRYPi1dTzn-YSAb1WtUxHSpIuIAT0hHPfRYQ9Mmpk44NoKoQR0Zei1ZiaJA7viRfsTe0_Ld6jEes-Lh35um7D5Tuilk6e-poo1uQJw5jgXENJuHrf73HLQy2u9FdupkMF7-jDsX7sanC7iElr4DV3c3zcn_Gv', 2, 'Permanent Collection', '2023-02-11'),
('ART-2019-055', 'Three Girls (Facsimile Series)', 'ART-0085', 'Gouache on Paper', '52 × 64 cm', 78000.00, 1935, 'Vaulted', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK2cdJQfEep3IjaYfFDzXXRtuJQZL0StDCZ8ZI2ab5iAZAqH_ZuE4CZqSuorEGWFu2YehrT9g3FO440pHeKDaPNTpSJznBcZZfwHt0YrlyRVpgJW0fIDO39BTbfn2Xc-lC5ZHg3k8-CMA8FPrFNffW_AvDQiwUwZfQRDwFSEgp-7EAXqo5XdYYLGPvaNttRQvIkFmO8z_JLRj9-sKU6icjxhSgzoDezEJ_e50u8TxCfwuAgo1kaK9h', 3, 'Vault B-02', '2024-04-19'),
('ART-2024-101', 'Equilibrium Series V', 'ART-0008', 'Patinated Bronze', '60 × 35 × 35 cm', 44500.00, 2024, 'Vaulted', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC23NI_v0C-YiS2vGbx2LHVWbvgZy_Fj9vSsnpVd3E4b33hneRQogVNQ8PkTVt1EGqvr_Tym3UC6J3Bz5Czu77Fdewg6nLAOEFE3kEbSYI4uTQZK7xR0f7j-V5zQPeeIevTyvADPIs6nbL0LrZrSSbvzwPmFS0S0_hs3usSBZLhPH-621yKsAFI2AkSPJe8vpwb-_lA_yKgBS9DW1D2x0CQY3ZfKfh-FwbWf8NubqdrxCEsp62xhMJ1', 4, 'Vault A-03', '2025-01-05'),
('ART-2024-102', 'Nocturne in Ochre VI', 'ART-0014', 'Oil on Linen', '100 × 140 cm', 39200.00, 2022, 'Archived', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4ukDruy-mU59_FDWPSwRjT4KIeCkADwS2HJE4blmxPpFXPsGWcPE7xnPvwfuPpPZrcsm9uSQANJW6NBVRqIJHuYS4WyvesctsVCwTx6FGgM_-quZDkClZ9VNlvZMdTkHld_q2iSVfo1-1bMHzwnML85_TrVUwPC9lT7lb2XXmsbEE2lwE5JSX2BtuTnzhGggyri3npsk6-IP7BYmbeRWmCXxN9OwpEcCxveA5KhfHNIHaESAU-yn', 1, 'Vault B-15', '2024-11-02'),
('ART-2024-103', 'Solstice Fragment II', 'ART-0003', 'Handspun Wool', '120 × 180 cm', 18700.00, 2023, 'In Transit', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDuUAAG0ZMZ-Fc2Sq1P4YfvK27wvNf0sTvdW2vjzt8R-AJWFfMyzyhlhg3CA6YylPInUf2MLrwMx4lPGwqt_WhX4XSDGdH0RL7Xaj9t0l_rus5gZSB0CNZjVd0ZLCuPjCDX4UUJ6_IpWcinxf7q2UqLObzEPmCgZIG8TTgUz99oCvz0ghRnxwDam-TMmd1L9QkfEPaeSYpErXVDSGoCsr9CVSSjuj0P73zuFnVxuhZWraKFDMp6iRu', NULL, NULL, '2024-12-20');

-- ----------------------------------------------------------------------------
-- Exhibitions
-- ----------------------------------------------------------------------------
INSERT INTO exhibitions (title, curator_id, start_date, end_date, gallery_wing) VALUES
('De Stijl: Order and Abstraction', 1, '2025-03-01', '2025-06-15', 'Wing North'),
('American Realism Reconsidered', 2, '2025-01-10', '2025-04-20', 'Wing East'),
('Fiber and Field: Contemporary Textiles', 3, '2025-02-05', '2025-05-30', 'Wing West'),
('Bronze Futures: Chen and Chillida', 4, '2024-11-01', '2025-02-28', 'Sculpture Court'),
('Abstract Pioneers: Klint and Frankenthaler', 1, '2025-04-01', '2025-08-30', 'Wing North');

-- ----------------------------------------------------------------------------
-- Sales (artworks with status 'Acquired' or sold pieces)
-- ----------------------------------------------------------------------------
INSERT INTO sales (artwork_id, buyer_name, buyer_email, sale_price, sale_date, commission_rate, status) VALUES
(12, 'Whitmore Collection Trust', 'trust@whitmore.example', 52500000.00, '2024-01-15', 0.10, 'Completed');

-- ----------------------------------------------------------------------------
-- Query history (seeds the "Recent Executed Queries" dashboard panel)
-- ----------------------------------------------------------------------------
INSERT INTO query_history (sql_text, execution_time_ms, rows_returned, status, executed_by, executed_at) VALUES
('SELECT a.name, COUNT(w.id), AVG(w.price) FROM artists a JOIN artworks w ON a.id = w.artist_id GROUP BY a.name;', 3, 13, 'success', 'admin@artgallery.edu', CURRENT_TIMESTAMP - INTERVAL '2 minutes'),
('SELECT * FROM exhibitions WHERE end_date >= CURRENT_DATE ORDER BY start_date ASC;', 2, 5, 'success', 'admin@artgallery.edu', CURRENT_TIMESTAMP - INTERVAL '11 minutes'),
('SELECT title, price, status FROM artworks WHERE price > 100000 AND status = ''Exhibited'' ORDER BY price DESC;', 2, 4, 'success', 'admin@artgallery.edu', CURRENT_TIMESTAMP - INTERVAL '28 minutes');

COMMIT;

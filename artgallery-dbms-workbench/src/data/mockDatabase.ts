import { Artist, Artwork, QueryHistoryItem, SchemaTable } from '../types/database';

export const INITIAL_ARTISTS: Artist[] = [
  {
    id: 'ART-0081',
    name: 'Katsushika Hokusai',
    country: 'Japan',
    countryCode: 'JPN',
    activePeriod: '1760 – 1849',
    bio: 'Edo Period master printmaker & illustrator',
    artworksCount: 18,
    samplePieceTitle: 'The Great Wave off Kanagawa (1831)',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9t5VQjyP4DmJG-Z0gpyQ4a_FsGom1Fxvww2eNmlx220e8m4TzElxH1uBvWn0I9Qm_Rr5-h8P2UhidelLTF5lRxT92kCoSMJHFhNefcl5hte0agHV52KcK5THwiAPrxFzkTDwtztMC7TxDStRIrYFJtZ3fdSuq1xAGeJ6egdQibiVuE-z-BgKTydsP8Sq7IfP2_zlJC5R7Zw1FeMpaHXZvIgetZffjwrswM5hdlURMM0Rk8Zrdbf4J',
    movement: 'Ukiyo-e Woodblock Prints'
  },
  {
    id: 'ART-0082',
    name: 'Artemisia Gentileschi',
    country: 'Italy',
    countryCode: 'ITA',
    activePeriod: '1593 – 1656',
    bio: 'Italian Baroque monumental narrative painter',
    artworksCount: 9,
    samplePieceTitle: 'Judith Slaying Holofernes (1620)',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4ukDruy-mU59_FDWPSwRjT4KIeCkADwS2HJE4blmxPpFXPsGWcPE7xnPvwfuPpPZrcsm9uSQANJW6NBVRqIJHuYS4WyvesctsVCwTx6FGgM_-quZDkClZ9VNlvZMdTkHld_q2iSVfo1-1bMHzwnML85_TrVUwPC9lT7lb2XXmsbEE2lwE5JSX2BtuTnzhGggyri3npsk6-IP7BYmbeRWmCXxN9OwpEcCxveA5KhfHNIHaESAU-yn',
    movement: 'Baroque Realism'
  },
  {
    id: 'ART-0083',
    name: 'Hilma af Klint',
    country: 'Sweden',
    countryCode: 'SWE',
    activePeriod: '1862 – 1944',
    bio: 'Mystical monumental abstract compositions',
    artworksCount: 32,
    samplePieceTitle: 'The Ten Largest No. 7 (1907)',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDuUAAG0ZMZ-Fc2Sq1P4YfvK27wvNf0sTvdW2vjzt8R-AJWFfMyzyhlhg3CA6YylPInUf2MLrwMx4lPGwqt_WhX4XSDGdH0RL7Xaj9t0l_rus5gZSB0CNZjVd0ZLCuPjCDX4UUJ6_IpWcinxf7q2UqLObzEPmCgZIG8TTgUz99oCvz0ghRnxwDam-TMmd1L9QkfEPaeSYpErXVDSGoCsr9CVSSjuj0P73zuFnVxuhZWraKFDMp6iRu',
    movement: 'Pioneering Abstract Geometry'
  },
  {
    id: 'ART-0084',
    name: 'Paul Cézanne',
    country: 'France',
    countryCode: 'FRA',
    activePeriod: '1839 – 1906',
    bio: 'Structural form & Mont Sainte-Victoire studies',
    artworksCount: 24,
    samplePieceTitle: 'Mont Sainte-Victoire (1902)',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmvRJz8Wj2NPmoYocXjhbK-2is4H0h0srv-v8WBzx6UCNymfvN5umqsBNDxbzXGurL9iKflFA2Qef1v72LpRzP7pUxRYPi1dTzn-YSAb1WtUxHSpIuIAT0hHPfRYQ9Mmpk44NoKoQR0Zei1ZiaJA7viRfsTe0_Ld6jEes-Lh35um7D5Tuilk6e-poo1uQJw5jgXENJuHrf73HLQy2u9FdupkMF7-jDsX7sanC7iElr4DV3c3zcn_Gv',
    movement: 'Post-Impressionism'
  },
  {
    id: 'ART-0085',
    name: 'Amrita Sher-Gil',
    country: 'India',
    countryCode: 'IND',
    activePeriod: '1913 – 1941',
    bio: 'Avant-garde pioneer of 20th c. modern Indian art',
    artworksCount: 14,
    samplePieceTitle: 'Three Girls (1935)',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK2cdJQfEep3IjaYfFDzXXRtuJQZL0StDCZ8ZI2ab5iAZAqH_ZuE4CZqSuorEGWFu2YehrT9g3FO440pHeKDaPNTpSJznBcZZfwHt0YrlyRVpgJW0fIDO39BTbfn2Xc-lC5ZHg3k8-CMA8FPrFNffW_AvDQiwUwZfQRDwFSEgp-7EAXqo5XdYYLGPvaNttRQvIkFmO8z_JLRj9-sKU6icjxhSgzoDezEJ_e50u8TxCfwuAgo1kaK9h',
    movement: 'Modern Figurative Realism'
  },
  {
    id: 'ART-0014',
    name: 'Elena Rostova',
    country: 'Ukraine',
    countryCode: 'UKR',
    activePeriod: '1945 – 2012',
    bio: 'Color field & earth pigment monumental tapestries',
    artworksCount: 11,
    samplePieceTitle: 'Nocturne in Ochre V',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4ukDruy-mU59_FDWPSwRjT4KIeCkADwS2HJE4blmxPpFXPsGWcPE7xnPvwfuPpPZrcsm9uSQANJW6NBVRqIJHuYS4WyvesctsVCwTx6FGgM_-quZDkClZ9VNlvZMdTkHld_q2iSVfo1-1bMHzwnML85_TrVUwPC9lT7lb2XXmsbEE2lwE5JSX2BtuTnzhGggyri3npsk6-IP7BYmbeRWmCXxN9OwpEcCxveA5KhfHNIHaESAU-yn',
    movement: 'Contemporary Minimalism'
  },
  {
    id: 'ART-0008',
    name: 'Marcus Chen',
    country: 'Taiwan',
    countryCode: 'TWN',
    activePeriod: '1961 – Present',
    bio: 'Heavy bronze patina geometric sculptures',
    artworksCount: 16,
    samplePieceTitle: 'Equilibrium Series IV',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC23NI_v0C-YiS2vGbx2LHVWbvgZy_Fj9vSsnpVd3E4b33hneRQogVNQ8PkTVt1EGqvr_Tym3UC6J3Bz5Czu77Fdewg6nLAOEFE3kEbSYI4uTQZK7xR0f7j-V5zQPeeIevTyvADPIs6nbL0LrZrSSbvzwPmFS0S0_hs3usSBZLhPH-621yKsAFI2AkSPJe8vpwb-_lA_yKgBS9DW1D2x0CQY3ZfKfh-FwbWf8NubqdrxCEsp62xhMJ1',
    movement: 'Modernist Sculpture'
  },
  {
    id: 'ART-0021',
    name: 'Søren Lindqvist',
    country: 'Denmark',
    countryCode: 'DNK',
    activePeriod: '1954 – Present',
    bio: 'Archival silver gelatin architectural photographer',
    artworksCount: 7,
    samplePieceTitle: 'Brutalist Geometry No. 12',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK2cdJQfEep3IjaYfFDzXXRtuJQZL0StDCZ8ZI2ab5iAZAqH_ZuE4CZqSuorEGWFu2YehrT9g3FO440pHeKDaPNTpSJznBcZZfwHt0YrlyRVpgJW0fIDO39BTbfn2Xc-lC5ZHg3k8-CMA8FPrFNffW_AvDQiwUwZfQRDwFSEgp-7EAXqo5XdYYLGPvaNttRQvIkFmO8z_JLRj9-sKU6icjxhSgzoDezEJ_e50u8TxCfwuAgo1kaK9h',
    movement: 'New Topographics'
  },
  {
    id: 'ART-0003',
    name: 'Nadia Al-Mansoor',
    country: 'Morocco',
    countryCode: 'MAR',
    activePeriod: '1970 – Present',
    bio: 'Handspun natural dye fiber artist',
    artworksCount: 11,
    samplePieceTitle: 'Tapestry of the Solstice',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDuUAAG0ZMZ-Fc2Sq1P4YfvK27wvNf0sTvdW2vjzt8R-AJWFfMyzyhlhg3CA6YylPInUf2MLrwMx4lPGwqt_WhX4XSDGdH0RL7Xaj9t0l_rus5gZSB0CNZjVd0ZLCuPjCDX4UUJ6_IpWcinxf7q2UqLObzEPmCgZIG8TTgUz99oCvz0ghRnxwDam-TMmd1L9QkfEPaeSYpErXVDSGoCsr9CVSSjuj0P73zuFnVxuhZWraKFDMp6iRu',
    movement: 'Textile Expressionism'
  }
];

export const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: 1089,
    code: 'ART-2024-089',
    title: 'Nocturne in Ochre V',
    artistId: 'ART-0014',
    artistName: 'Elena Rostova',
    medium: 'Oil on Linen',
    dimensions: '120 × 160 cm',
    price: 48500,
    yearCreated: 2021,
    status: 'Archived',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4ukDruy-mU59_FDWPSwRjT4KIeCkADwS2HJE4blmxPpFXPsGWcPE7xnPvwfuPpPZrcsm9uSQANJW6NBVRqIJHuYS4WyvesctsVCwTx6FGgM_-quZDkClZ9VNlvZMdTkHld_q2iSVfo1-1bMHzwnML85_TrVUwPC9lT7lb2XXmsbEE2lwE5JSX2BtuTnzhGggyri3npsk6-IP7BYmbeRWmCXxN9OwpEcCxveA5KhfHNIHaESAU-yn'
  },
  {
    id: 1090,
    code: 'ART-2024-090',
    title: 'Equilibrium Series IV',
    artistId: 'ART-0008',
    artistName: 'Marcus Chen',
    medium: 'Patinated Bronze',
    dimensions: '45 × 30 × 30 cm',
    price: 32000,
    yearCreated: 2023,
    status: 'Vaulted',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC23NI_v0C-YiS2vGbx2LHVWbvgZy_Fj9vSsnpVd3E4b33hneRQogVNQ8PkTVt1EGqvr_Tym3UC6J3Bz5Czu77Fdewg6nLAOEFE3kEbSYI4uTQZK7xR0f7j-V5zQPeeIevTyvADPIs6nbL0LrZrSSbvzwPmFS0S0_hs3usSBZLhPH-621yKsAFI2AkSPJe8vpwb-_lA_yKgBS9DW1D2x0CQY3ZfKfh-FwbWf8NubqdrxCEsp62xhMJ1'
  },
  {
    id: 1091,
    code: 'ART-2024-091',
    title: 'Brutalist Geometry No. 12',
    artistId: 'ART-0021',
    artistName: 'Søren Lindqvist',
    medium: 'Gelatin Silver Print',
    dimensions: '90 × 120 cm',
    price: 14200,
    yearCreated: 2019,
    status: 'In Transit',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK2cdJQfEep3IjaYfFDzXXRtuJQZL0StDCZ8ZI2ab5iAZAqH_ZuE4CZqSuorEGWFu2YehrT9g3FO440pHeKDaPNTpSJznBcZZfwHt0YrlyRVpgJW0fIDO39BTbfn2Xc-lC5ZHg3k8-CMA8FPrFNffW_AvDQiwUwZfQRDwFSEgp-7EAXqo5XdYYLGPvaNttRQvIkFmO8z_JLRj9-sKU6icjxhSgzoDezEJ_e50u8TxCfwuAgo1kaK9h'
  },
  {
    id: 1092,
    code: 'ART-2024-092',
    title: 'Tapestry of the Solstice',
    artistId: 'ART-0003',
    artistName: 'Nadia Al-Mansoor',
    medium: 'Handspun Wool',
    dimensions: '180 × 240 cm',
    price: 21500,
    yearCreated: 2022,
    status: 'Archived',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDuUAAG0ZMZ-Fc2Sq1P4YfvK27wvNf0sTvdW2vjzt8R-AJWFfMyzyhlhg3CA6YylPInUf2MLrwMx4lPGwqt_WhX4XSDGdH0RL7Xaj9t0l_rus5gZSB0CNZjVd0ZLCuPjCDX4UUJ6_IpWcinxf7q2UqLObzEPmCgZIG8TTgUz99oCvz0ghRnxwDam-TMmd1L9QkfEPaeSYpErXVDSGoCsr9CVSSjuj0P73zuFnVxuhZWraKFDMp6iRu'
  },
  {
    id: 1082,
    code: 'ART-2023-112',
    title: 'Composition with Yellow, Blue and Ochre',
    artistId: 'ART-0033',
    artistName: 'Piet Mondrian',
    medium: 'Oil on linen',
    dimensions: '80 × 80 cm',
    price: 1450000,
    yearCreated: 1929,
    status: 'Exhibited',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmvRJz8Wj2NPmoYocXjhbK-2is4H0h0srv-v8WBzx6UCNymfvN5umqsBNDxbzXGurL9iKflFA2Qef1v72LpRzP7pUxRYPi1dTzn-YSAb1WtUxHSpIuIAT0hHPfRYQ9Mmpk44NoKoQR0Zei1ZiaJA7viRfsTe0_Ld6jEes-Lh35um7D5Tuilk6e-poo1uQJw5jgXENJuHrf73HLQy2u9FdupkMF7-jDsX7sanC7iElr4DV3c3zcn_Gv'
  },
  {
    id: 1044,
    code: 'ART-2023-044',
    title: 'Nighthawks Study #3',
    artistId: 'ART-0042',
    artistName: 'Edward Hopper',
    medium: 'Oil on canvas',
    dimensions: '75 × 110 cm',
    price: 875000,
    yearCreated: 1941,
    status: 'Exhibited',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD74XYOm6FsKOKjz0pe2oT6YO_aJa98mZItHH1ztblnuI1zg70sLG0-5qSPiVPyPOCt_qd7QNSGHLY1Lw-vARw2Rdwwtit12fv9AfhyaiqDO0VkcR_PeBak0CEdXEmkQaMJphu6RBIcswjIB4rbjHhih9whT3-XnGXpFiYI30gC2ZnpwFxN5H_QYkW7tGinbAr0IL-_NpVqkMT0ii0aDOfA3ZBeGs2CLHQwP0dqX4MB6wW0639if67o'
  },
  {
    id: 1099,
    code: 'ART-2024-001',
    title: 'Study for Broad Canvas VI',
    artistId: 'ART-0050',
    artistName: 'Helen Frankenthaler',
    medium: 'Acrylic on unprimed canvas',
    dimensions: '210 × 260 cm',
    price: 620000,
    yearCreated: 1968,
    status: 'Exhibited',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4ukDruy-mU59_FDWPSwRjT4KIeCkADwS2HJE4blmxPpFXPsGWcPE7xnPvwfuPpPZrcsm9uSQANJW6NBVRqIJHuYS4WyvesctsVCwTx6FGgM_-quZDkClZ9VNlvZMdTkHld_q2iSVfo1-1bMHzwnML85_TrVUwPC9lT7lb2XXmsbEE2lwE5JSX2BtuTnzhGggyri3npsk6-IP7BYmbeRWmCXxN9OwpEcCxveA5KhfHNIHaESAU-yn'
  },
  {
    id: 1015,
    code: 'ART-2022-078',
    title: 'Geometric Monolith 12',
    artistId: 'ART-0061',
    artistName: 'Eduardo Chillida',
    medium: 'Forged iron and granite',
    dimensions: '140 × 90 × 90 cm',
    price: 410000,
    yearCreated: 1974,
    status: 'Exhibited',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC23NI_v0C-YiS2vGbx2LHVWbvgZy_Fj9vSsnpVd3E4b33hneRQogVNQ8PkTVt1EGqvr_Tym3UC6J3Bz5Czu77Fdewg6nLAOEFE3kEbSYI4uTQZK7xR0f7j-V5zQPeeIevTyvADPIs6nbL0LrZrSSbvzwPmFS0S0_hs3usSBZLhPH-621yKsAFI2AkSPJe8vpwb-_lA_yKgBS9DW1D2x0CQY3ZfKfh-FwbWf8NubqdrxCEsp62xhMJ1'
  }
];

export const INITIAL_QUERIES: QueryHistoryItem[] = [
  {
    id: 'CURSOR #182',
    statusCode: '200 OK',
    timestamp: '2m ago',
    sql: 'SELECT a.name, COUNT(w.id), AVG(w.price) FROM artists a JOIN artworks w ON a.id = w.artist_id GROUP BY a.name;',
    executionTime: '3.4ms',
    rowsReturned: 24,
    bufferGets: 42
  },
  {
    id: 'CURSOR #179',
    statusCode: '200 OK',
    timestamp: '11m ago',
    sql: 'SELECT * FROM exhibitions WHERE end_date >= SYSDATE ORDER BY start_date ASC;',
    executionTime: '1.8ms',
    rowsReturned: 6,
    bufferGets: 18
  },
  {
    id: 'CURSOR #175',
    statusCode: '200 OK',
    timestamp: '28m ago',
    sql: "SELECT title, price, status FROM artworks WHERE price > 100000 AND status = 'Exhibited' ORDER BY price DESC;",
    executionTime: '2.1ms',
    rowsReturned: 14,
    bufferGets: 29
  }
];

export const SCHEMA_TABLES: SchemaTable[] = [
  {
    name: 'ARTISTS',
    rowsCount: 24,
    columnsCount: 8,
    description: 'Master curatorial registry of accredited artists, historical provenance, and nationality codes.',
    columns: [
      { name: 'id', type: 'VARCHAR2(16)', isPk: true, nullable: false },
      { name: 'name', type: 'VARCHAR2(120)', nullable: false },
      { name: 'country', type: 'VARCHAR2(60)' },
      { name: 'country_code', type: 'CHAR(3)' },
      { name: 'active_period', type: 'VARCHAR2(60)' },
      { name: 'bio', type: 'CLOB' },
      { name: 'verified_master', type: 'NUMBER(1)' },
      { name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  {
    name: 'ARTWORKS',
    rowsCount: 142,
    columnsCount: 14,
    description: 'Relational catalog of institution-managed museum pieces, valuations, and storage vaults.',
    columns: [
      { name: 'id', type: 'NUMBER', isPk: true, nullable: false },
      { name: 'code', type: 'VARCHAR2(24)', nullable: false },
      { name: 'title', type: 'VARCHAR2(200)', nullable: false },
      { name: 'artist_id', type: 'VARCHAR2(16)', isFk: true, fkTarget: 'ARTISTS(id)', nullable: false },
      { name: 'medium', type: 'VARCHAR2(100)' },
      { name: 'dimensions', type: 'VARCHAR2(60)' },
      { name: 'price', type: 'DECIMAL(12,2)' },
      { name: 'year_created', type: 'NUMBER(4)' },
      { name: 'status', type: "VARCHAR2(20) CHECK (status IN ('Archived','Vaulted','In Transit','Exhibited','Acquired'))" },
      { name: 'image_url', type: 'VARCHAR2(512)' },
      { name: 'curator_id', type: 'NUMBER', isFk: true, fkTarget: 'CURATORS(id)' },
      { name: 'vault_location', type: 'VARCHAR2(60)' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'last_appraisal_date', type: 'DATE' }
    ]
  },
  {
    name: 'EXHIBITIONS',
    rowsCount: 12,
    columnsCount: 6,
    description: 'Scheduled institutional galleries, retrospectives, and touring loans.',
    columns: [
      { name: 'id', type: 'NUMBER', isPk: true, nullable: false },
      { name: 'title', type: 'VARCHAR2(150)', nullable: false },
      { name: 'curator_id', type: 'NUMBER', isFk: true, fkTarget: 'CURATORS(id)', nullable: false },
      { name: 'start_date', type: 'DATE', nullable: false },
      { name: 'end_date', type: 'DATE', nullable: false },
      { name: 'gallery_wing', type: 'VARCHAR2(80)' }
    ]
  },
  {
    name: 'CURATORS',
    rowsCount: 5,
    columnsCount: 5,
    description: 'Authorized department conservators, ledger admins, and acquisition signatories.',
    columns: [
      { name: 'id', type: 'NUMBER', isPk: true, nullable: false },
      { name: 'full_name', type: 'VARCHAR2(100)', nullable: false },
      { name: 'department', type: 'VARCHAR2(80)' },
      { name: 'email', type: 'VARCHAR2(120)', nullable: false },
      { name: 'security_clearance', type: 'VARCHAR2(20)' }
    ]
  }
];

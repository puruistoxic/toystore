// Seed countries, states, and localities from JSON files.
// Place your data files in server/data:
// - data/countries.json
// - data/states.json
// - data/localities.json
//
// Each file should be an array of objects. Example (countries.json):
// [
//   {
//     "code": "IN",
//     "name": "India",
//     "iso2": "IN",
//     "iso3": "IND",
//     "phone_code": "+91",
//     "currency": "INR",
//     "latitude": 20.5937,
//     "longitude": 78.9629,
//     "locale": "en-IN"
//   }
// ]

const fs = require('fs');
const path = require('path');
const { initDatabase, getPool } = require('../db');

function loadJson(relativePath) {
  const fullPath = path.join(__dirname, '..', 'data', relativePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`[Geo Seed] File not found: ${fullPath} - skipping`);
    return [];
  }
  const raw = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(raw);
}

async function seedCountries(pool) {
  const countries = loadJson('countries.json');
  if (!countries.length) return;

  console.log(`[Geo Seed] Seeding ${countries.length} countries...`);

  for (const c of countries) {
    await pool.execute(
      `REPLACE INTO countries (code, name, iso2, iso3, phone_code, currency, latitude, longitude, locale, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.code,
        c.name,
        c.iso2 || null,
        c.iso3 || null,
        c.phone_code || null,
        c.currency || null,
        c.latitude || null,
        c.longitude || null,
        c.locale || null,
        c.is_active !== false
      ]
    );
  }
}

async function seedStates(pool) {
  const states = loadJson('states.json');
  if (!states.length) return;

  console.log(`[Geo Seed] Seeding ${states.length} states...`);

  for (const s of states) {
    await pool.execute(
      `REPLACE INTO states (id, country_code, name, slug, latitude, longitude, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        s.id,
        s.country_code,
        s.name,
        s.slug,
        s.latitude || null,
        s.longitude || null,
        s.is_active !== false
      ]
    );
  }
}

async function seedLocalities(pool) {
  const localities = loadJson('localities.json');
  if (!localities.length) return;

  console.log(`[Geo Seed] Seeding ${localities.length} localities...`);

  for (const l of localities) {
    await pool.execute(
      `REPLACE INTO localities (id, state_id, name, slug, type, postal_code, latitude, longitude, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        l.id,
        l.state_id,
        l.name,
        l.slug,
        l.type || null,
        l.postal_code || null,
        l.latitude || null,
        l.longitude || null,
        l.is_active !== false
      ]
    );
  }
}

async function main() {
  try {
    console.log('[Geo Seed] Initializing database...');
    await initDatabase();
    const pool = getPool();

    await seedCountries(pool);
    await seedStates(pool);
    await seedLocalities(pool);

    console.log('[Geo Seed] Done.');
    process.exit(0);
  } catch (err) {
    console.error('[Geo Seed] Failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}





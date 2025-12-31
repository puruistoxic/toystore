// Seed the states/provinces/regions table from a public dataset
// Usage: node server/scripts/seed-states.js
//
// This script fetches all states from the dr5hn/countries-states-cities-database
// and upserts them into the `states` table for all countries that already exist
// in your `countries` table.

const https = require('https');
const { v4: uuidv4 } = require('uuid');
const { initDatabase, getPool } = require('../db');

// Public dataset of world states/provinces/regions (dr5hn)
// If this URL changes, update the path below.
// See: https://github.com/dr5hn/countries-states-cities-database
const STATES_URL =
  'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/states.json';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const { statusCode } = res;
        let data = '';

        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (statusCode !== 200) {
            console.error('[Seed States] Non-200 response:', statusCode);
            console.error('[Seed States] Body (first 200 chars):', data.slice(0, 200));
            return reject(new Error(`Request failed with status ${statusCode} while fetching ${url}`));
          }
          try {
            const cleaned = data.replace(/^\uFEFF/, '');
            const json = JSON.parse(cleaned);
            resolve(json);
          } catch (err) {
            console.error('[Seed States] Failed to parse JSON. First 200 chars:', data.slice(0, 200));
            reject(err);
          }
        });
      })
      .on('error', (err) => {
        console.error('[Seed States] HTTP error while fetching states:', err.message);
        reject(err);
      });
  });
}

function slugify(value) {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function seedStates() {
  console.log('[Seed States] Starting states/provinces import...');

  await initDatabase();
  const pool = getPool();

  // Get list of country codes we actually care about (already in DB)
  const [countryRows] = await pool.execute('SELECT code FROM countries WHERE is_active = 1');
  const activeCountryCodes = new Set(countryRows.map((r) => r.code));
  console.log(`[Seed States] Found ${activeCountryCodes.size} active countries in DB`);

  const states = await fetchJson(STATES_URL);
  console.log(`[Seed States] Fetched ${states.length} states from dataset`);

  let inserted = 0;
  for (const s of states) {
    const countryCode = s.country_code || null;
    if (!countryCode || !activeCountryCodes.has(countryCode)) {
      continue; // skip states for countries we don't have
    }

    const name = s.name;
    if (!name) continue;

    // Build a stable ID: prefer dataset id if present, otherwise a UUID
    const baseId = s.id != null ? String(s.id) : uuidv4();
    const id = `${countryCode}-${baseId}`;

    const slugBase = s.state_code ? `${countryCode}-${s.state_code}` : name;
    const slug = slugify(slugBase) || slugify(name) || id.toLowerCase();

    const latitude =
      s.latitude !== undefined && s.latitude !== null && s.latitude !== ''
        ? parseFloat(s.latitude)
        : null;
    const longitude =
      s.longitude !== undefined && s.longitude !== null && s.longitude !== ''
        ? parseFloat(s.longitude)
        : null;

    try {
      await pool.execute(
        `REPLACE INTO states (id, country_code, name, slug, latitude, longitude, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, countryCode, name, slug, latitude, longitude, true]
      );
      inserted += 1;
    } catch (err) {
      console.error(
        `[Seed States] Failed to upsert state "${name}" (${countryCode}) [${id}]:`,
        err.message
      );
    }
  }

  console.log(`[Seed States] Upserted ${inserted} states/provinces into database`);
}

seedStates()
  .then(() => {
    console.log('[Seed States] Done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Seed States] Failed:', err);
    process.exit(1);
  });












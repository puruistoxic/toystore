// Seed the countries table with data from the public REST Countries API
// Usage: node server/scripts/seed-countries.js

const https = require('https');
const { initDatabase, getPool } = require('../db');

const REST_COUNTRIES_URL =
  'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,idd,currencies,latlng';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', (err) => reject(err));
  });
}

async function seedCountries() {
  console.log('[Seed Countries] Starting country import from REST Countries API...');

  await initDatabase();
  const pool = getPool();

  const countries = await fetchJson(REST_COUNTRIES_URL);
  console.log(`[Seed Countries] Fetched ${countries.length} countries from API`);

  let inserted = 0;

  for (const c of countries) {
    const code = c.cca2 || null;
    if (!code) {
      continue; // skip entries without a 2-letter code
    }

    const name = (c.name && (c.name.official || c.name.common)) || code;
    const iso2 = c.cca2 || null;
    const iso3 = c.cca3 || null;

    let phone_code = null;
    if (c.idd && c.idd.root) {
      const root = c.idd.root || '';
      const suffix = Array.isArray(c.idd.suffixes) && c.idd.suffixes.length > 0 ? c.idd.suffixes[0] : '';
      phone_code = `${root}${suffix}` || null;
      if (phone_code && phone_code.startsWith('+')) {
        // store without plus sign, consistent with many phone_code lists
        phone_code = phone_code.replace(/^\+/, '');
      }
    }

    let currency = null;
    if (c.currencies && typeof c.currencies === 'object') {
      const codes = Object.keys(c.currencies);
      if (codes.length > 0) {
        currency = codes[0];
      }
    }

    const latitude = Array.isArray(c.latlng) && c.latlng.length >= 2 ? c.latlng[0] : null;
    const longitude = Array.isArray(c.latlng) && c.latlng.length >= 2 ? c.latlng[1] : null;

    const locale = iso2 ? `${iso2.toLowerCase()}-${iso2}` : null;

    try {
      await pool.execute(
        `REPLACE INTO countries
          (code, name, iso2, iso3, phone_code, currency, latitude, longitude, locale, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          name,
          iso2,
          iso3,
          phone_code,
          currency,
          latitude,
          longitude,
          locale,
          true
        ]
      );
      inserted += 1;
    } catch (err) {
      console.error(`[Seed Countries] Failed to upsert country ${code}:`, err.message);
    }
  }

  console.log(`[Seed Countries] Upserted ${inserted} countries into database`);
}

seedCountries()
  .then(() => {
    console.log('[Seed Countries] Done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Seed Countries] Failed:', err);
    process.exit(1);
  });









const express = require('express');
const { getPool } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { logAudit, getEntityName } = require('../middleware/auditLog');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Helper function to convert JSON strings to objects
function parseJSON(value) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

// Helper function to prepare data for database
function prepareDataForDB(data, fields) {
  const result = {};
  fields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      if (Array.isArray(data[field]) || typeof data[field] === 'object') {
        result[field] = JSON.stringify(data[field]);
      } else {
        result[field] = data[field];
      }
    } else {
      // Set to null for undefined, null, or empty string values
      result[field] = null;
    }
  });
  return result;
}

// Helper function to format data from database
function formatDataFromDB(row, jsonFields = []) {
  const result = { ...row };
  jsonFields.forEach(field => {
    if (result[field]) {
      result[field] = parseJSON(result[field]);
    }
  });
  return result;
}

// Helper function to add audit logging to CRUD operations
async function addAuditLog(req, action, entityType, entityId, entityName, oldData = null, newData = null) {
  try {
    let changes = null;
    if (action === 'CREATE' && newData) {
      changes = { created: newData };
    } else if (action === 'UPDATE' && oldData && newData) {
      changes = { before: oldData, after: newData };
    } else if (action === 'DELETE' && oldData) {
      changes = { deleted: oldData };
    }
    await logAudit(req, action, entityType, entityId, entityName, changes);
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('[Audit Log] Failed to log:', error);
  }
}

// ==================== SERVICES ====================
router.get('/services', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM services ORDER BY created_at DESC');
    const services = rows.map(row => formatDataFromDB(row, ['features', 'includes', 'seo_keywords']));
    res.json(services);
  } catch (error) {
    console.error('[Content API] Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services', message: error.message });
  }
});

router.get('/services/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    const service = formatDataFromDB(rows[0], ['features', 'includes', 'seo_keywords']);
    res.json(service);
  } catch (error) {
    console.error('[Content API] Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service', message: error.message });
  }
});

router.post('/services', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = prepareDataForDB(req.body, [
      'id', 'name', 'slug', 'description', 'short_description', 'price', 'duration',
      'category', 'icon_name', 'features', 'includes', 'image',
      'seo_title', 'seo_description', 'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `INSERT INTO services (id, name, slug, description, short_description, price, duration, 
       category, icon_name, features, includes, image, seo_title, seo_description, seo_keywords, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, data.name, data.slug, data.description, data.short_description,
        data.price, data.duration, data.category, data.icon_name,
        data.features, data.includes, data.image,
        data.seo_title, data.seo_description, data.seo_keywords,
        data.is_active !== undefined ? data.is_active : true
      ]
    );

    const entityName = data.name || null;
    await logAudit(req, 'CREATE', 'service', data.id, entityName, { created: data });
    res.json({ success: true, message: 'Service created successfully' });
  } catch (error) {
    console.error('[Content API] Create service error:', error);
    res.status(500).json({ error: 'Failed to create service', message: error.message });
  }
});

router.put('/services/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = prepareDataForDB(req.body, [
      'name', 'slug', 'description', 'short_description', 'price', 'duration',
      'category', 'icon_name', 'features', 'includes', 'image',
      'seo_title', 'seo_description', 'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `UPDATE services SET name = ?, slug = ?, description = ?, short_description = ?, 
       price = ?, duration = ?, category = ?, icon_name = ?, features = ?, includes = ?, 
       image = ?, seo_title = ?, seo_description = ?, seo_keywords = ?, is_active = ?,
       updated_at = NOW() WHERE id = ?`,
      [
        data.name, data.slug, data.description, data.short_description,
        data.price, data.duration, data.category, data.icon_name,
        data.features, data.includes, data.image,
        data.seo_title, data.seo_description, data.seo_keywords,
        data.is_active !== undefined ? data.is_active : true,
        req.params.id
      ]
    );

    res.json({ success: true, message: 'Service updated successfully' });
  } catch (error) {
    console.error('[Content API] Update service error:', error);
    res.status(500).json({ error: 'Failed to update service', message: error.message });
  }
});

router.delete('/services/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const serviceId = req.params.id;
    
    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM services WHERE id = ?', [serviceId]);
    const oldData = oldRows.length > 0 ? formatDataFromDB(oldRows[0], ['features', 'includes', 'seo_keywords']) : null;
    
    await pool.execute('DELETE FROM services WHERE id = ?', [serviceId]);
    
    const entityName = oldData?.name || null;
    await logAudit(req, 'DELETE', 'service', serviceId, entityName, { deleted: oldData });
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('[Content API] Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service', message: error.message });
  }
});

// ==================== PRODUCTS ====================
router.get('/products', async (req, res) => {
  try {
    const pool = getPool();
    const { search, is_active } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' || is_active === true);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ? OR brand LIKE ? OR hsn_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    const products = rows.map(row => formatDataFromDB(row, ['images', 'features', 'specifications', 'seo_keywords']));
    res.json(products);
  } catch (error) {
    console.error('[Content API] Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products', message: error.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = formatDataFromDB(rows[0], ['images', 'features', 'specifications', 'seo_keywords']);
    res.json(product);
  } catch (error) {
    console.error('[Content API] Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product', message: error.message });
  }
});

router.post('/products', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = prepareDataForDB(req.body, [
      'id', 'name', 'slug', 'description', 'short_description', 'price', 'category',
      'brand', 'hsn_code', 'image', 'images', 'features', 'specifications', 'warranty',
      'seo_title', 'seo_description', 'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `INSERT INTO products (id, name, slug, description, short_description, price, category, 
       brand, hsn_code, image, images, features, specifications, warranty, seo_title, seo_description, 
       seo_keywords, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, data.name, data.slug, data.description, data.short_description,
        data.price, data.category, data.brand, data.hsn_code, data.image, data.images,
        data.features, data.specifications, data.warranty,
        data.seo_title, data.seo_description, data.seo_keywords,
        data.is_active !== undefined ? data.is_active : true
      ]
    );

    const entityName = data.name || null;
    await addAuditLog(req, 'CREATE', 'product', data.id, entityName, null, data);
    res.json({ success: true, id: data.id, message: 'Product created successfully' });
  } catch (error) {
    console.error('[Content API] Create product error:', error);
    res.status(500).json({ error: 'Failed to create product', message: error.message });
  }
});

router.put('/products/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const productId = req.params.id;
    
    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
    const oldData = oldRows.length > 0 ? formatDataFromDB(oldRows[0], ['images', 'features', 'specifications', 'seo_keywords']) : null;
    
    const data = prepareDataForDB(req.body, [
      'name', 'slug', 'description', 'short_description', 'price', 'category',
      'brand', 'hsn_code', 'image', 'images', 'features', 'specifications', 'warranty',
      'seo_title', 'seo_description', 'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `UPDATE products SET name = ?, slug = ?, description = ?, short_description = ?, 
       price = ?, category = ?, brand = ?, hsn_code = ?, image = ?, images = ?, features = ?, 
       specifications = ?, warranty = ?, seo_title = ?, seo_description = ?, 
       seo_keywords = ?, is_active = ?, updated_at = NOW() WHERE id = ?`,
      [
        data.name, data.slug, data.description, data.short_description,
        data.price, data.category, data.brand, data.hsn_code, data.image, data.images,
        data.features, data.specifications, data.warranty,
        data.seo_title, data.seo_description, data.seo_keywords,
        data.is_active !== undefined ? data.is_active : true,
        productId
      ]
    );

    const entityName = data.name || null;
    await addAuditLog(req, 'UPDATE', 'product', productId, entityName, oldData, data);
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('[Content API] Update product error:', error);
    res.status(500).json({ error: 'Failed to update product', message: error.message });
  }
});

router.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const productId = req.params.id;
    
    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
    const oldData = oldRows.length > 0 ? formatDataFromDB(oldRows[0], ['images', 'features', 'specifications', 'seo_keywords']) : null;
    
    await pool.execute('DELETE FROM products WHERE id = ?', [productId]);
    
    const entityName = oldData?.name || null;
    await addAuditLog(req, 'DELETE', 'product', productId, entityName, oldData);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[Content API] Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product', message: error.message });
  }
});

// ==================== LOCATIONS ====================
router.get('/locations', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM locations ORDER BY created_at DESC');
    const locations = rows.map(row => formatDataFromDB(row, ['services', 'products', 'landmarks', 'coverage_areas', 'testimonials', 'seo_keywords']));
    res.json(locations);
  } catch (error) {
    console.error('[Content API] Get locations error:', error);
    res.status(500).json({ error: 'Failed to fetch locations', message: error.message });
  }
});

router.get('/locations/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM locations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    const location = formatDataFromDB(rows[0], ['services', 'products', 'landmarks', 'coverage_areas', 'testimonials', 'seo_keywords']);
    res.json(location);
  } catch (error) {
    console.error('[Content API] Get location error:', error);
    res.status(500).json({ error: 'Failed to fetch location', message: error.message });
  }
});

router.post('/locations', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = prepareDataForDB(req.body, [
      'id', 'name', 'slug', 'state', 'country', 'description', 'short_description',
      'services', 'products', 'landmarks', 'coverage_areas', 'image',
      'stats_projects_completed', 'stats_customers_served', 'stats_years_active',
      'testimonials', 'seo_title', 'seo_description', 'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `INSERT INTO locations (id, name, slug, state, country, description, short_description,
       services, products, landmarks, coverage_areas, image, stats_projects_completed,
       stats_customers_served, stats_years_active, testimonials, seo_title, seo_description,
       seo_keywords, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, data.name, data.slug, data.state, data.country || 'India',
        data.description, data.short_description, data.services, data.products,
        data.landmarks, data.coverage_areas, data.image,
        data.stats_projects_completed, data.stats_customers_served, data.stats_years_active,
        data.testimonials, data.seo_title, data.seo_description, data.seo_keywords,
        data.is_active !== undefined ? data.is_active : true
      ]
    );

    res.json({ success: true, message: 'Location created successfully' });
  } catch (error) {
    console.error('[Content API] Create location error:', error);
    res.status(500).json({ error: 'Failed to create location', message: error.message });
  }
});

router.put('/locations/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = prepareDataForDB(req.body, [
      'name', 'slug', 'state', 'country', 'description', 'short_description',
      'services', 'products', 'landmarks', 'coverage_areas', 'image',
      'stats_projects_completed', 'stats_customers_served', 'stats_years_active',
      'testimonials', 'seo_title', 'seo_description', 'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `UPDATE locations SET name = ?, slug = ?, state = ?, country = ?, description = ?,
       short_description = ?, services = ?, products = ?, landmarks = ?, coverage_areas = ?,
       image = ?, stats_projects_completed = ?, stats_customers_served = ?,
       stats_years_active = ?, testimonials = ?, seo_title = ?, seo_description = ?,
       seo_keywords = ?, is_active = ?, updated_at = NOW() WHERE id = ?`,
      [
        data.name, data.slug, data.state, data.country || 'India',
        data.description, data.short_description, data.services, data.products,
        data.landmarks, data.coverage_areas, data.image,
        data.stats_projects_completed, data.stats_customers_served, data.stats_years_active,
        data.testimonials, data.seo_title, data.seo_description, data.seo_keywords,
        data.is_active !== undefined ? data.is_active : true,
        req.params.id
      ]
    );

    res.json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    console.error('[Content API] Update location error:', error);
    res.status(500).json({ error: 'Failed to update location', message: error.message });
  }
});

router.delete('/locations/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    await pool.execute('DELETE FROM locations WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    console.error('[Content API] Delete location error:', error);
    res.status(500).json({ error: 'Failed to delete location', message: error.message });
  }
});

// ==================== BRANDS ====================
router.get('/brands', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM brands ORDER BY created_at DESC');
    const brands = rows.map(row => formatDataFromDB(row, ['products', 'services', 'certifications', 'features', 'seo_keywords']));
    res.json(brands);
  } catch (error) {
    console.error('[Content API] Get brands error:', error);
    res.status(500).json({ error: 'Failed to fetch brands', message: error.message });
  }
});

router.get('/brands/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM brands WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    const brand = formatDataFromDB(rows[0], ['products', 'services', 'certifications', 'features', 'seo_keywords']);
    res.json(brand);
  } catch (error) {
    console.error('[Content API] Get brand error:', error);
    res.status(500).json({ error: 'Failed to fetch brand', message: error.message });
  }
});

router.post('/brands', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    
    // Generate ID if not provided
    const brandId = req.body.id || uuidv4();
    
    // Check for duplicate name
    const [nameCheck] = await pool.execute(
      'SELECT id FROM brands WHERE name = ?',
      [req.body.name]
    );
    if (nameCheck.length > 0) {
      return res.status(400).json({ 
        error: 'Brand name already exists',
        field: 'name'
      });
    }

    // Check for duplicate slug
    const [slugCheck] = await pool.execute(
      'SELECT id FROM brands WHERE slug = ?',
      [req.body.slug]
    );
    if (slugCheck.length > 0) {
      return res.status(400).json({ 
        error: 'Brand slug already exists',
        field: 'slug'
      });
    }

    const data = prepareDataForDB(req.body, [
      'name', 'slug', 'description', 'short_description',
      'logo_url', 'local_logo', 'website', 'products', 'services',
      'partnership_type', 'partnership_since', 'certifications', 'image',
      'features', 'warranty', 'support', 'seo_title', 'seo_description',
      'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `INSERT INTO brands (id, name, slug, description, short_description,
       logo_url, local_logo, website, products, services, partnership_type,
       partnership_since, certifications, image, features, warranty, support,
       seo_title, seo_description, seo_keywords, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        brandId,
        data.name || null,
        data.slug || null,
        data.description || null,
        data.short_description || null,
        data.logo_url || null,
        data.local_logo || null,
        data.website || null,
        data.products || null,
        data.services || null,
        data.partnership_type || null,
        data.partnership_since || null,
        data.certifications || null,
        data.image || null,
        data.features || null,
        data.warranty || null,
        data.support || null,
        data.seo_title || null,
        data.seo_description || null,
        data.seo_keywords || null,
        data.is_active !== undefined ? data.is_active : true
      ]
    );

    const entityName = data.name || null;
    await addAuditLog(req, 'CREATE', 'brand', brandId, entityName, null, data);
    res.json({ success: true, message: 'Brand created successfully' });
  } catch (error) {
    console.error('[Content API] Create brand error:', error);
    
    // Handle MySQL duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('name')) {
        return res.status(400).json({ 
          error: 'Brand name already exists',
          field: 'name'
        });
      }
      if (error.message.includes('slug')) {
        return res.status(400).json({ 
          error: 'Brand slug already exists',
          field: 'slug'
        });
      }
    }
    
    res.status(500).json({ error: 'Failed to create brand', message: error.message });
  }
});

router.put('/brands/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    
    const brandId = req.params.id;
    
    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM brands WHERE id = ?', [brandId]);
    if (oldRows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    const oldData = formatDataFromDB(oldRows[0], ['products', 'services', 'certifications', 'features', 'seo_keywords']);
    const oldSlug = oldData.slug;
    const newSlug = req.body.slug;
    
    // Check for duplicate name (excluding current brand)
    const [nameCheck] = await pool.execute(
      'SELECT id FROM brands WHERE name = ? AND id != ?',
      [req.body.name, req.params.id]
    );
    if (nameCheck.length > 0) {
      return res.status(400).json({ 
        error: 'Brand name already exists',
        field: 'name'
      });
    }

    // Check for duplicate slug (excluding current brand)
    const [slugCheck] = await pool.execute(
      'SELECT id FROM brands WHERE slug = ? AND id != ?',
      [req.body.slug, req.params.id]
    );
    if (slugCheck.length > 0) {
      return res.status(400).json({ 
        error: 'Brand slug already exists',
        field: 'slug'
      });
    }

    const data = prepareDataForDB(req.body, [
      'name', 'slug', 'description', 'short_description',
      'logo_url', 'local_logo', 'website', 'products', 'services',
      'partnership_type', 'partnership_since', 'certifications', 'image',
      'features', 'warranty', 'support', 'seo_title', 'seo_description',
      'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `UPDATE brands SET name = ?, slug = ?, description = ?, short_description = ?,
       logo_url = ?, local_logo = ?, website = ?, products = ?,
       services = ?, partnership_type = ?, partnership_since = ?, certifications = ?,
       image = ?, features = ?, warranty = ?, support = ?, seo_title = ?,
       seo_description = ?, seo_keywords = ?, is_active = ?, updated_at = NOW() WHERE id = ?`,
      [
        data.name || null,
        data.slug || null,
        data.description || null,
        data.short_description || null,
        data.logo_url || null,
        data.local_logo || null,
        data.website || null,
        data.products || null,
        data.services || null,
        data.partnership_type || null,
        data.partnership_since || null,
        data.certifications || null,
        data.image || null,
        data.features || null,
        data.warranty || null,
        data.support || null,
        data.seo_title || null,
        data.seo_description || null,
        data.seo_keywords || null,
        data.is_active !== undefined ? data.is_active : true,
        brandId
      ]
    );

    // Create redirect if slug changed
    if (oldSlug && newSlug && oldSlug !== newSlug) {
      const fromPath = `/brands/${oldSlug}`;
      const toPath = `/brands/${newSlug}`;
      
      // Delete any existing redirect for this from_path
      await pool.execute(
        'DELETE FROM redirects WHERE from_path = ?',
        [fromPath]
      );
      
      // Create new redirect
      await pool.execute(
        `INSERT INTO redirects (from_path, to_path, entity_type, entity_id, status_code)
         VALUES (?, ?, ?, ?, ?)`,
        [fromPath, toPath, 'brand', brandId, 301]
      );
    }

    const entityName = data.name || null;
    await addAuditLog(req, 'UPDATE', 'brand', brandId, entityName, oldData, data);
    res.json({ success: true, message: 'Brand updated successfully' });
  } catch (error) {
    console.error('[Content API] Update brand error:', error);
    
    // Handle MySQL duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('name')) {
        return res.status(400).json({ 
          error: 'Brand name already exists',
          field: 'name'
        });
      }
      if (error.message.includes('slug')) {
        return res.status(400).json({ 
          error: 'Brand slug already exists',
          field: 'slug'
        });
      }
    }
    
    res.status(500).json({ error: 'Failed to update brand', message: error.message });
  }
});

router.delete('/brands/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const brandId = req.params.id;
    
    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM brands WHERE id = ?', [brandId]);
    const oldData = oldRows.length > 0 ? formatDataFromDB(oldRows[0], ['products', 'services', 'certifications', 'features', 'seo_keywords']) : null;
    
    await pool.execute('DELETE FROM brands WHERE id = ?', [brandId]);
    
    const entityName = oldData?.name || null;
    await addAuditLog(req, 'DELETE', 'brand', brandId, entityName, oldData);
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('[Content API] Delete brand error:', error);
    res.status(500).json({ error: 'Failed to delete brand', message: error.message });
  }
});

// ==================== INDUSTRIES ====================
router.get('/industries', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM industries ORDER BY created_at DESC');
    const industries = rows.map(row => formatDataFromDB(row, ['services', 'products', 'use_cases', 'case_studies', 'testimonials', 'seo_keywords']));
    res.json(industries);
  } catch (error) {
    console.error('[Content API] Get industries error:', error);
    res.status(500).json({ error: 'Failed to fetch industries', message: error.message });
  }
});

router.get('/industries/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM industries WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Industry not found' });
    }
    const industry = formatDataFromDB(rows[0], ['services', 'products', 'use_cases', 'case_studies', 'testimonials', 'seo_keywords']);
    res.json(industry);
  } catch (error) {
    console.error('[Content API] Get industry error:', error);
    res.status(500).json({ error: 'Failed to fetch industry', message: error.message });
  }
});

router.post('/industries', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = prepareDataForDB(req.body, [
      'id', 'name', 'slug', 'description', 'short_description', 'icon',
      'services', 'products', 'use_cases', 'case_studies', 'testimonials',
      'image', 'stats_clients_served', 'stats_projects_completed',
      'seo_title', 'seo_description', 'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `INSERT INTO industries (id, name, slug, description, short_description, icon,
       services, products, use_cases, case_studies, testimonials, image,
       stats_clients_served, stats_projects_completed, seo_title, seo_description,
       seo_keywords, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, data.name, data.slug, data.description, data.short_description,
        data.icon, data.services, data.products, data.use_cases, data.case_studies,
        data.testimonials, data.image, data.stats_clients_served,
        data.stats_projects_completed, data.seo_title, data.seo_description,
        data.seo_keywords, data.is_active !== undefined ? data.is_active : true
      ]
    );

    res.json({ success: true, message: 'Industry created successfully' });
  } catch (error) {
    console.error('[Content API] Create industry error:', error);
    res.status(500).json({ error: 'Failed to create industry', message: error.message });
  }
});

router.put('/industries/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = prepareDataForDB(req.body, [
      'name', 'slug', 'description', 'short_description', 'icon',
      'services', 'products', 'use_cases', 'case_studies', 'testimonials',
      'image', 'stats_clients_served', 'stats_projects_completed',
      'seo_title', 'seo_description', 'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `UPDATE industries SET name = ?, slug = ?, description = ?, short_description = ?,
       icon = ?, services = ?, products = ?, use_cases = ?, case_studies = ?,
       testimonials = ?, image = ?, stats_clients_served = ?, stats_projects_completed = ?,
       seo_title = ?, seo_description = ?, seo_keywords = ?, is_active = ?,
       updated_at = NOW() WHERE id = ?`,
      [
        data.name, data.slug, data.description, data.short_description,
        data.icon, data.services, data.products, data.use_cases, data.case_studies,
        data.testimonials, data.image, data.stats_clients_served,
        data.stats_projects_completed, data.seo_title, data.seo_description,
        data.seo_keywords, data.is_active !== undefined ? data.is_active : true,
        req.params.id
      ]
    );

    res.json({ success: true, message: 'Industry updated successfully' });
  } catch (error) {
    console.error('[Content API] Update industry error:', error);
    res.status(500).json({ error: 'Failed to update industry', message: error.message });
  }
});

router.delete('/industries/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    await pool.execute('DELETE FROM industries WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Industry deleted successfully' });
  } catch (error) {
    console.error('[Content API] Delete industry error:', error);
    res.status(500).json({ error: 'Failed to delete industry', message: error.message });
  }
});

// ==================== CASE STUDIES ====================
router.get('/case-studies', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM case_studies ORDER BY created_at DESC');
    const caseStudies = rows.map(row => formatDataFromDB(row, ['services', 'products', 'results', 'images', 'seo_keywords']));
    res.json(caseStudies);
  } catch (error) {
    console.error('[Content API] Get case studies error:', error);
    res.status(500).json({ error: 'Failed to fetch case studies', message: error.message });
  }
});

router.get('/case-studies/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM case_studies WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Case study not found' });
    }
    const caseStudy = formatDataFromDB(rows[0], ['services', 'products', 'results', 'images', 'seo_keywords']);
    res.json(caseStudy);
  } catch (error) {
    console.error('[Content API] Get case study error:', error);
    res.status(500).json({ error: 'Failed to fetch case study', message: error.message });
  }
});

router.post('/case-studies', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = prepareDataForDB(req.body, [
      'id', 'title', 'slug', 'description', 'short_description', 'industry',
      'location', 'services', 'products', 'brand', 'client_name', 'client_type',
      'client_logo', 'challenge', 'solution', 'results', 'images', 'testimonial',
      'featured', 'published_at', 'seo_title', 'seo_description', 'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `INSERT INTO case_studies (id, title, slug, description, short_description, industry,
       location, services, products, brand, client_name, client_type, client_logo,
       challenge, solution, results, images, testimonial, featured, published_at,
       seo_title, seo_description, seo_keywords, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, data.title, data.slug, data.description, data.short_description,
        data.industry, data.location, data.services, data.products, data.brand,
        data.client_name, data.client_type, data.client_logo, data.challenge,
        data.solution, data.results, data.images, data.testimonial,
        data.featured !== undefined ? data.featured : false,
        data.published_at ? new Date(data.published_at) : new Date(),
        data.seo_title, data.seo_description, data.seo_keywords,
        data.is_active !== undefined ? data.is_active : true
      ]
    );

    res.json({ success: true, message: 'Case study created successfully' });
  } catch (error) {
    console.error('[Content API] Create case study error:', error);
    res.status(500).json({ error: 'Failed to create case study', message: error.message });
  }
});

router.put('/case-studies/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = prepareDataForDB(req.body, [
      'title', 'slug', 'description', 'short_description', 'industry',
      'location', 'services', 'products', 'brand', 'client_name', 'client_type',
      'client_logo', 'challenge', 'solution', 'results', 'images', 'testimonial',
      'featured', 'published_at', 'seo_title', 'seo_description', 'seo_keywords', 'is_active'
    ]);

    await pool.execute(
      `UPDATE case_studies SET title = ?, slug = ?, description = ?, short_description = ?,
       industry = ?, location = ?, services = ?, products = ?, brand = ?, client_name = ?,
       client_type = ?, client_logo = ?, challenge = ?, solution = ?, results = ?,
       images = ?, testimonial = ?, featured = ?, published_at = ?, seo_title = ?,
       seo_description = ?, seo_keywords = ?, is_active = ?, updated_at = NOW() WHERE id = ?`,
      [
        data.title, data.slug, data.description, data.short_description,
        data.industry, data.location, data.services, data.products, data.brand,
        data.client_name, data.client_type, data.client_logo, data.challenge,
        data.solution, data.results, data.images, data.testimonial,
        data.featured !== undefined ? data.featured : false,
        data.published_at ? new Date(data.published_at) : new Date(),
        data.seo_title, data.seo_description, data.seo_keywords,
        data.is_active !== undefined ? data.is_active : true,
        req.params.id
      ]
    );

    res.json({ success: true, message: 'Case study updated successfully' });
  } catch (error) {
    console.error('[Content API] Update case study error:', error);
    res.status(500).json({ error: 'Failed to update case study', message: error.message });
  }
});

router.delete('/case-studies/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    await pool.execute('DELETE FROM case_studies WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Case study deleted successfully' });
  } catch (error) {
    console.error('[Content API] Delete case study error:', error);
    res.status(500).json({ error: 'Failed to delete case study', message: error.message });
  }
});

// ==================== TESTIMONIALS ====================
router.get('/testimonials', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('[Content API] Get testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials', message: error.message });
  }
});

router.get('/testimonials/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('[Content API] Get testimonial error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonial', message: error.message });
  }
});

router.post('/testimonials', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = req.body;

    await pool.execute(
      `INSERT INTO testimonials (id, name, role, company, location, industry, service,
       product, rating, review, image, featured, verified, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, data.name, data.role, data.company, data.location, data.industry,
        data.service, data.product, data.rating, data.review, data.image,
        data.featured !== undefined ? data.featured : false,
        data.verified !== undefined ? data.verified : false,
        data.published_at ? new Date(data.published_at) : new Date()
      ]
    );

    res.json({ success: true, message: 'Testimonial created successfully' });
  } catch (error) {
    console.error('[Content API] Create testimonial error:', error);
    res.status(500).json({ error: 'Failed to create testimonial', message: error.message });
  }
});

router.put('/testimonials/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = req.body;

    await pool.execute(
      `UPDATE testimonials SET name = ?, role = ?, company = ?, location = ?,
       industry = ?, service = ?, product = ?, rating = ?, review = ?, image = ?,
       featured = ?, verified = ?, published_at = ?, updated_at = NOW() WHERE id = ?`,
      [
        data.name, data.role, data.company, data.location, data.industry,
        data.service, data.product, data.rating, data.review, data.image,
        data.featured !== undefined ? data.featured : false,
        data.verified !== undefined ? data.verified : false,
        data.published_at ? new Date(data.published_at) : new Date(),
        req.params.id
      ]
    );

    res.json({ success: true, message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error('[Content API] Update testimonial error:', error);
    res.status(500).json({ error: 'Failed to update testimonial', message: error.message });
  }
});

router.delete('/testimonials/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    await pool.execute('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('[Content API] Delete testimonial error:', error);
    res.status(500).json({ error: 'Failed to delete testimonial', message: error.message });
  }
});

// ==================== CATEGORIES ====================
// Supports multi-level product/service categories

router.get('/categories', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY type, name');
    const categories = rows.map(row => formatDataFromDB(row, ['services', 'products', 'brands', 'seo_keywords']));
    res.json(categories);
  } catch (error) {
    console.error('[Content API] Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories', message: error.message });
  }
});

router.get('/categories/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const category = formatDataFromDB(rows[0], ['services', 'products', 'brands', 'seo_keywords']);
    res.json(category);
  } catch (error) {
    console.error('[Content API] Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category', message: error.message });
  }
});

router.post('/categories', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    
    // Generate ID if not provided
    const categoryId = req.body.id || uuidv4();
    
    // Check for duplicate name
    const [nameCheck] = await pool.execute(
      'SELECT id FROM categories WHERE name = ?',
      [req.body.name]
    );
    if (nameCheck.length > 0) {
      return res.status(400).json({ 
        error: 'Category name already exists',
        field: 'name'
      });
    }

    // Check for duplicate slug
    const [slugCheck] = await pool.execute(
      'SELECT id FROM categories WHERE slug = ?',
      [req.body.slug]
    );
    if (slugCheck.length > 0) {
      return res.status(400).json({ 
        error: 'Category slug already exists',
        field: 'slug'
      });
    }

    const data = prepareDataForDB(req.body, [
      'name',
      'slug',
      'type',
      'description',
      'short_description',
      'parent_id',
      'icon',
      'services',
      'products',
      'brands',
      'image',
      'seo_title',
      'seo_description',
      'seo_keywords',
      'is_active'
    ]);

    await pool.execute(
      `INSERT INTO categories (
        id, name, slug, type, description, short_description, parent_id, icon,
        services, products, brands, image, seo_title, seo_description, seo_keywords, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryId,
        data.name || null,
        data.slug || null,
        data.type || 'product',
        data.description || null,
        data.short_description || null,
        data.parent_id || null,
        data.icon || null,
        data.services || null,
        data.products || null,
        data.image || null,
        data.seo_title || null,
        data.seo_description || null,
        data.seo_keywords || null,
        data.is_active !== undefined ? data.is_active : true
      ]
    );

    const entityName = data.name || null;
    await addAuditLog(req, 'CREATE', 'category', categoryId, entityName, null, data);
    res.json({ success: true, message: 'Category created successfully' });
  } catch (error) {
    console.error('[Content API] Create category error:', error);
    
    // Handle MySQL duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('name')) {
        return res.status(400).json({ 
          error: 'Category name already exists',
          field: 'name'
        });
      }
      if (error.message.includes('slug')) {
        return res.status(400).json({ 
          error: 'Category slug already exists',
          field: 'slug'
        });
      }
    }
    
    res.status(500).json({ error: 'Failed to create category', message: error.message });
  }
});

router.put('/categories/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    
    const categoryId = req.params.id;
    
    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [categoryId]);
    if (oldRows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const oldData = formatDataFromDB(oldRows[0], ['services', 'products', 'brands', 'seo_keywords']);
    const oldSlug = oldData.slug;
    const newSlug = req.body.slug;
    
    // Check for duplicate name (excluding current category)
    const [nameCheck] = await pool.execute(
      'SELECT id FROM categories WHERE name = ? AND id != ?',
      [req.body.name, req.params.id]
    );
    if (nameCheck.length > 0) {
      return res.status(400).json({ 
        error: 'Category name already exists',
        field: 'name'
      });
    }

    // Check for duplicate slug (excluding current category)
    const [slugCheck] = await pool.execute(
      'SELECT id FROM categories WHERE slug = ? AND id != ?',
      [req.body.slug, req.params.id]
    );
    if (slugCheck.length > 0) {
      return res.status(400).json({ 
        error: 'Category slug already exists',
        field: 'slug'
      });
    }

    const data = prepareDataForDB(req.body, [
      'name',
      'slug',
      'type',
      'description',
      'short_description',
      'parent_id',
      'icon',
      'services',
      'products',
      'brands',
      'image',
      'seo_title',
      'seo_description',
      'seo_keywords',
      'is_active'
    ]);

    await pool.execute(
      `UPDATE categories
       SET name = ?, slug = ?, type = ?, description = ?, short_description = ?,
           parent_id = ?, icon = ?, services = ?, products = ?, brands = ?, image = ?,
           seo_title = ?, seo_description = ?, seo_keywords = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        data.name || null,
        data.slug || null,
        data.type || 'product',
        data.description || null,
        data.short_description || null,
        data.parent_id || null,
        data.icon || null,
        data.services || null,
        data.products || null,
        data.brands || null,
        data.image || null,
        data.seo_title || null,
        data.seo_description || null,
        data.seo_keywords || null,
        data.is_active !== undefined ? data.is_active : true,
        req.params.id
      ]
    );

    // Create redirect if slug changed
    if (oldSlug && newSlug && oldSlug !== newSlug) {
      const fromPath = `/category/${oldSlug}`;
      const toPath = `/category/${newSlug}`;
      
      // Delete any existing redirect for this from_path
      await pool.execute(
        'DELETE FROM redirects WHERE from_path = ?',
        [fromPath]
      );
      
      // Create new redirect
      await pool.execute(
        `INSERT INTO redirects (from_path, to_path, entity_type, entity_id, status_code)
         VALUES (?, ?, ?, ?, ?)`,
        [fromPath, toPath, 'category', categoryId, 301]
      );
    }

    const newData = data;
    const entityName = data.name || null;
    await addAuditLog(req, 'UPDATE', 'category', categoryId, entityName, oldData, newData);
    res.json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    console.error('[Content API] Update category error:', error);
    
    // Handle MySQL duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('name')) {
        return res.status(400).json({ 
          error: 'Category name already exists',
          field: 'name'
        });
      }
      if (error.message.includes('slug')) {
        return res.status(400).json({ 
          error: 'Category slug already exists',
          field: 'slug'
        });
      }
    }
    
    res.status(500).json({ error: 'Failed to update category', message: error.message });
  }
});

router.delete('/categories/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const categoryId = req.params.id;
    
    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [categoryId]);
    const oldData = oldRows.length > 0 ? formatDataFromDB(oldRows[0], ['services', 'products', 'brands', 'seo_keywords']) : null;
    
    await pool.execute('DELETE FROM categories WHERE id = ?', [categoryId]);
    
    const entityName = oldData?.name || null;
    await addAuditLog(req, 'DELETE', 'category', categoryId, entityName, oldData);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('[Content API] Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category', message: error.message });
  }
});

// ==================== COUNTRIES ====================

router.get('/countries', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM countries ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('[Content API] Get countries error:', error);
    res.status(500).json({ error: 'Failed to fetch countries', message: error.message });
  }
});

router.post('/countries', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = req.body;
    await pool.execute(
      `REPLACE INTO countries (code, name, iso2, iso3, phone_code, currency, latitude, longitude, locale, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.code,
        data.name,
        data.iso2 || null,
        data.iso3 || null,
        data.phone_code || null,
        data.currency || null,
        data.latitude || null,
        data.longitude || null,
        data.locale || null,
        data.is_active !== false
      ]
    );
    res.json({ success: true, message: 'Country saved successfully' });
  } catch (error) {
    console.error('[Content API] Save country error:', error);
    res.status(500).json({ error: 'Failed to save country', message: error.message });
  }
});

router.delete('/countries/:code', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    await pool.execute('DELETE FROM countries WHERE code = ?', [req.params.code]);
    res.json({ success: true, message: 'Country deleted successfully' });
  } catch (error) {
    console.error('[Content API] Delete country error:', error);
    res.status(500).json({ error: 'Failed to delete country', message: error.message });
  }
});

// ==================== STATES ====================

router.get('/states', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM states ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('[Content API] Get states error:', error);
    res.status(500).json({ error: 'Failed to fetch states', message: error.message });
  }
});

router.post('/states', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = req.body;
    await pool.execute(
      `REPLACE INTO states (id, country_code, name, slug, latitude, longitude, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.country_code,
        data.name,
        data.slug,
        data.latitude || null,
        data.longitude || null,
        data.is_active !== false
      ]
    );
    res.json({ success: true, message: 'State saved successfully' });
  } catch (error) {
    console.error('[Content API] Save state error:', error);
    res.status(500).json({ error: 'Failed to save state', message: error.message });
  }
});

router.delete('/states/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    await pool.execute('DELETE FROM states WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'State deleted successfully' });
  } catch (error) {
    console.error('[Content API] Delete state error:', error);
    res.status(500).json({ error: 'Failed to delete state', message: error.message });
  }
});

// ==================== LOCALITIES ====================

router.get('/localities', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM localities ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('[Content API] Get localities error:', error);
    res.status(500).json({ error: 'Failed to fetch localities', message: error.message });
  }
});

router.post('/localities', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = req.body;
    await pool.execute(
      `REPLACE INTO localities (id, state_id, name, slug, type, postal_code, latitude, longitude, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.state_id,
        data.name,
        data.slug,
        data.type || null,
        data.postal_code || null,
        data.latitude || null,
        data.longitude || null,
        data.is_active !== false
      ]
    );
    res.json({ success: true, message: 'Locality saved successfully' });
  } catch (error) {
    console.error('[Content API] Save locality error:', error);
    res.status(500).json({ error: 'Failed to save locality', message: error.message });
  }
});

router.delete('/localities/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    await pool.execute('DELETE FROM localities WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Locality deleted successfully' });
  } catch (error) {
    console.error('[Content API] Delete locality error:', error);
    res.status(500).json({ error: 'Failed to delete locality', message: error.message });
  }
});

// ==================== REDIRECTS ====================
router.get('/redirects/check', async (req, res) => {
  try {
    const pool = getPool();
    const fromPath = req.query.path || req.query.from || '';
    
    if (!fromPath) {
      return res.json({ redirect: false });
    }
    
    // Ensure path starts with /
    const normalizedPath = fromPath.startsWith('/') ? fromPath : '/' + fromPath;
    
    const [rows] = await pool.execute(
      'SELECT to_path, status_code FROM redirects WHERE from_path = ? LIMIT 1',
      [normalizedPath]
    );
    
    if (rows.length > 0) {
      res.json({ 
        redirect: true, 
        to: rows[0].to_path, 
        statusCode: rows[0].status_code 
      });
    } else {
      res.json({ redirect: false });
    }
  } catch (error) {
    console.error('[Content API] Get redirect error:', error);
    res.json({ redirect: false });
  }
});

// ==================== AUDIT LOGS ====================
router.get('/audit-logs', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    const whereConditions = [];
    const params = [];
    
    if (req.query.action) {
      whereConditions.push('action = ?');
      params.push(req.query.action);
    }
    
    if (req.query.entity_type) {
      whereConditions.push('entity_type = ?');
      params.push(req.query.entity_type);
    }
    
    if (req.query.user_id) {
      whereConditions.push('user_id = ?');
      params.push(req.query.user_id);
    }
    
    if (req.query.username) {
      whereConditions.push('username LIKE ?');
      params.push(`%${req.query.username}%`);
    }
    
    if (req.query.entity_id) {
      whereConditions.push('entity_id = ?');
      params.push(req.query.entity_id);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    
    // Get logs - LIMIT and OFFSET must be integers, not placeholders
    const limitInt = parseInt(limit.toString(), 10);
    const offsetInt = parseInt(offset.toString(), 10);
    const [rows] = await pool.execute(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`,
      params
    );
    
    // Parse JSON fields
    const logs = rows.map(row => ({
      ...row,
      changes: row.changes ? JSON.parse(row.changes) : null
    }));
    
    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Content API] Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs', message: error.message });
  }
});

// ==================== COMPANY SETTINGS ====================

router.get('/company-settings', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM company_settings ORDER BY id DESC LIMIT 1');
    if (rows.length === 0) {
      return res.json({
        company_name: 'WAINSO',
        address_line1: '',
        address_line2: '',
        address_line3: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        phone: '',
        phone2: '',
        email: '',
        website: '',
        gstin: '',
        pan: '',
        bank_name: '',
        bank_account_number: '',
        bank_ifsc: '',
        bank_branch: '',
        footer_text: '',
        terms_and_conditions: ''
      });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('[Content API] Get company settings error:', error);
    res.status(500).json({ error: 'Failed to fetch company settings', message: error.message });
  }
});

router.put('/company-settings', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const data = req.body;

    // Check if settings exist
    const [existing] = await pool.execute('SELECT id FROM company_settings ORDER BY id DESC LIMIT 1');

    if (existing.length === 0) {
      // Create new settings
      await pool.execute(
        `INSERT INTO company_settings (
          company_name, logo_url, address_line1, address_line2, address_line3, city, state, postal_code, country,
          phone, phone2, email, website, gstin, pan, bank_name, bank_account_name, bank_account_number, bank_ifsc, bank_branch,
          footer_text, terms_and_conditions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.company_name || 'WAINSO',
          data.logo_url || null,
          data.address_line1 || null,
          data.address_line2 || null,
          data.address_line3 || null,
          data.city || null,
          data.state || null,
          data.postal_code || null,
          data.country || 'India',
          data.phone || null,
          data.phone2 || null,
          data.email || null,
          data.website || null,
          data.gstin || null,
          data.pan || null,
          data.bank_name || null,
          data.bank_account_name || null,
          data.bank_account_number || null,
          data.bank_ifsc || null,
          data.bank_branch || null,
          data.footer_text || null,
          data.terms_and_conditions || null
        ]
      );
    } else {
      // Update existing settings
      await pool.execute(
        `UPDATE company_settings SET
          company_name = ?, logo_url = ?, address_line1 = ?, address_line2 = ?, address_line3 = ?,
          city = ?, state = ?, postal_code = ?, country = ?, phone = ?, phone2 = ?, email = ?,
          website = ?, gstin = ?, pan = ?, bank_name = ?, bank_account_name = ?, bank_account_number = ?, bank_ifsc = ?,
          bank_branch = ?, footer_text = ?, terms_and_conditions = ?
        WHERE id = ?`,
        [
          data.company_name || 'WAINSO',
          data.logo_url || null,
          data.address_line1 || null,
          data.address_line2 || null,
          data.address_line3 || null,
          data.city || null,
          data.state || null,
          data.postal_code || null,
          data.country || 'India',
          data.phone || null,
          data.phone2 || null,
          data.email || null,
          data.website || null,
          data.gstin || null,
          data.pan || null,
          data.bank_name || null,
          data.bank_account_name || null,
          data.bank_account_number || null,
          data.bank_ifsc || null,
          data.bank_branch || null,
          data.footer_text || null,
          data.terms_and_conditions || null,
          existing[0].id
        ]
      );
    }

    await addAuditLog(req, 'UPDATE', 'company_settings', '1', 'Company Settings', null, data);

    res.json({ success: true, message: 'Company settings updated successfully' });
  } catch (error) {
    console.error('[Content API] Update company settings error:', error);
    res.status(500).json({ error: 'Failed to update company settings', message: error.message });
  }
});

module.exports = router;


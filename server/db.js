const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection pool
let pool = null;

// Initialize database connection pool
async function initDatabase() {
  if (pool) {
    return pool;
  }

  // Check if environment variables are loaded
  // Default DB host is 192.168.1.210
  // For deployment, try purushottam.dev as fallback if primary connection fails
  let dbHost = process.env.MYSQL_HOST || '192.168.1.210';
  const dbDatabase = process.env.MYSQL_DATABASE || 'toystoredb';
  const dbUser = process.env.MYSQL_USER || 'dbuser';
  const dbPassword = process.env.MYSQL_PASSWORD || process.env.MYSQL_PASS || process.env.DB_PASSWORD || '';
  const dbPort = parseInt(process.env.MYSQL_PORT || '3306');
  // In production, do not default to a WAN fallback (avoids long ETIMEDOUT and a dead pool on failure).
  const rawFallback = process.env.MYSQL_FALLBACK_HOST;
  let fallbackHost;
  if (rawFallback !== undefined) {
    fallbackHost = rawFallback;
  } else if (process.env.NODE_ENV === 'production') {
    fallbackHost = '';
  } else {
    fallbackHost = 'purushottam.dev';
  }

  console.log('[Database] Initializing database connection...');
  console.log(`[Database] Primary host: ${dbHost}:${dbPort}`);
  console.log(
    `[Database] Fallback host: ${fallbackHost || '(disabled)'}:${dbPort}` +
      (fallbackHost ? ' (if primary fails)' : '')
  );
  console.log(`[Database] Database: ${dbDatabase}, User: ${dbUser}`);
  console.log(`[Database] Using password: ${dbPassword ? 'YES' : 'NO'}`);

  if (!dbPassword) {
    console.warn('[Database] WARNING: MYSQL_PASSWORD is not set!');
    console.warn('[Database] Please create a .env file in the server directory with database credentials.');
    console.warn('[Database] See docs/ENV_SETUP.md for instructions.');
    console.warn('[Database] Connection will attempt without password (may fail if password is required).');
  }

  // Try to create connection pool with primary host
  const poolConfig = {
    host: dbHost,
    database: dbDatabase,
    user: dbUser,
    port: dbPort,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    ssl: false,
    timezone: 'Z' // Use UTC timezone for all database operations
  };
  
  // Only set password if it's provided (MySQL will use password authentication if password is set)
  if (dbPassword) {
    poolConfig.password = dbPassword;
  }
  
  pool = mysql.createPool(poolConfig);

  async function destroyPool() {
    if (!pool) return;
    const p = pool;
    pool = null;
    try {
      await p.end();
    } catch (e) {
      console.warn('[Database] Pool end warning:', e.message);
    }
  }

  // Test connection with primary host
  try {
    console.log(`[Database] 🔌 Attempting connection to PRIMARY host: ${dbHost}:${dbPort}...`);
    const conn = await pool.getConnection();
    await conn.ping();
    const connectionInfo = conn.config?.host || dbHost;
    conn.release();
    console.log(`[Database] ✅ Successfully connected to database at ${dbHost}:${dbPort}/${dbDatabase}`);
    console.log(`[Database] 📍 Connection established to: ${connectionInfo}`);
  } catch (error) {
    console.warn(`[Database] ⚠️  Connection to ${dbHost} failed: ${error.message}`);

    // No point trying fallback without a password if primary rejected auth
    if (!dbPassword) {
      await destroyPool();
      throw new Error(
        `Database connection failed: ${error.message}. MYSQL_PASSWORD is not set in the environment. ` +
          'Add MYSQL_PASSWORD to the .env next to docker-compose.yml (quote values if they contain # or $). ' +
          'Then: docker compose up -d --force-recreate toystore-api'
      );
    }

    if (!fallbackHost) {
      await destroyPool();
      throw new Error(`Database connection failed (primary only): ${error.message}`);
    }

    console.log(`[Database] 🔄 Attempting fallback connection to ${fallbackHost}...`);

    try {
      await destroyPool();
      const fallbackPoolConfig = {
        host: fallbackHost,
        database: dbDatabase,
        user: dbUser,
        port: dbPort,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        ssl: false,
        password: dbPassword
      };

      pool = mysql.createPool(fallbackPoolConfig);

      console.log(`[Database] 🔌 Attempting connection to FALLBACK host: ${fallbackHost}:${dbPort}...`);
      const conn2 = await pool.getConnection();
      await conn2.ping();
      const connectionInfo = conn2.config?.host || fallbackHost;
      conn2.release();
      console.log(`[Database] ✅ Successfully connected to database at ${fallbackHost}:${dbPort}/${dbDatabase} (FALLBACK)`);
      console.log(`[Database] 📍 Connection established to: ${connectionInfo}`);
      dbHost = fallbackHost;
    } catch (fallbackError) {
      console.error(`[Database] ❌ Fallback connection to ${fallbackHost} also failed: ${fallbackError.message}`);
      console.error('[Database] Both primary and fallback database connections failed!');
      await destroyPool();
      throw new Error(
        `Database connection failed. Primary (${dbHost}): ${error.message}, Fallback (${fallbackHost}): ${fallbackError.message}`
      );
    }
  }

  // Initialize tables - wait for it to complete
  await initializeTables();

  return pool;
}

// Initialize database tables
async function initializeTables() {
  try {
    const connection = await pool.getConnection();
    
    // Create verification_codes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        reference VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        item_name VARCHAR(255),
        attempts INT DEFAULT 0,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create enquiries table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        source VARCHAR(100) DEFAULT 'Website Popup Enquiry',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create quote_requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quote_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20) NOT NULL,
        company VARCHAR(255),
        item_name VARCHAR(255) NOT NULL,
        item_type VARCHAR(50),
        category VARCHAR(255),
        budget VARCHAR(100),
        timeline VARCHAR(100),
        location VARCHAR(255),
        industry VARCHAR(255),
        quantity VARCHAR(50),
        notes TEXT,
        message TEXT,
        source VARCHAR(100) DEFAULT 'Website Quote Request Form',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_email (email),
        INDEX idx_phone (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create admin_users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create services table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        short_description TEXT,
        price DECIMAL(10,2),
        duration VARCHAR(50),
        category VARCHAR(100),
        icon_name VARCHAR(100),
        features JSON,
        includes JSON,
        image VARCHAR(500),
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords JSON,
        is_active BOOLEAN DEFAULT TRUE,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_category (category),
        INDEX idx_services_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        short_description TEXT,
        price DECIMAL(10,2),
        price_includes_gst BOOLEAN DEFAULT FALSE,
        category VARCHAR(100),
        brand VARCHAR(100),
        hsn_code VARCHAR(20),
        image VARCHAR(500),
        images JSON,
        video_urls JSON,
        features JSON,
        specifications JSON,
        warranty VARCHAR(255),
        age_group VARCHAR(100),
        occasion JSON,
        gender ENUM('boys', 'girls', 'unisex', 'all'),
        material_type VARCHAR(100),
        educational_value BOOLEAN DEFAULT FALSE,
        minimum_order_quantity INT DEFAULT 1,
        bulk_discount_percentage DECIMAL(5,2) DEFAULT 0,
        stock_quantity INT DEFAULT 0,
        sku VARCHAR(100),
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords JSON,
        is_active BOOLEAN DEFAULT TRUE,
        promote_home_banner BOOLEAN DEFAULT FALSE,
        banner_sort_order INT NOT NULL DEFAULT 0,
        home_banner_slides JSON,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_category (category),
        INDEX idx_brand (brand),
        INDEX idx_hsn_code (hsn_code),
        INDEX idx_age_group (age_group),
        INDEX idx_gender (gender),
        INDEX idx_products_promote_banner (promote_home_banner),
        INDEX idx_products_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Add price_includes_gst column if it doesn't exist (for existing databases)
    try {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN price_includes_gst BOOLEAN DEFAULT FALSE 
        AFTER price
      `);
    } catch (error) {
      // Column might already exist, ignore error silently
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
        // Expected - column already exists, no action needed
      } else {
        console.warn('[Database] Could not add price_includes_gst column:', error.message);
      }
    }

    // Add toy-specific columns if they don't exist (for existing databases)
    const toyColumns = [
      { name: 'age_group', type: 'VARCHAR(100)', after: 'warranty' },
      { name: 'occasion', type: 'JSON', after: 'age_group' },
      { name: 'gender', type: "ENUM('boys', 'girls', 'unisex', 'all')", after: 'occasion' },
      { name: 'material_type', type: 'VARCHAR(100)', after: 'gender' },
      { name: 'educational_value', type: 'BOOLEAN DEFAULT FALSE', after: 'material_type' },
      { name: 'minimum_order_quantity', type: 'INT DEFAULT 1', after: 'educational_value' },
      { name: 'bulk_discount_percentage', type: 'DECIMAL(5,2) DEFAULT 0', after: 'minimum_order_quantity' },
      { name: 'stock_quantity', type: 'INT DEFAULT 0', after: 'bulk_discount_percentage' },
      { name: 'sku', type: 'VARCHAR(100)', after: 'stock_quantity' }
    ];

    for (const col of toyColumns) {
      try {
        await connection.execute(`
          ALTER TABLE products 
          ADD COLUMN ${col.name} ${col.type}
          AFTER ${col.after}
        `);
        console.log(`[Database] Added ${col.name} column to products table`);
      } catch (error) {
        if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
          // Expected - column already exists, no action needed
        } else {
          console.warn(`[Database] Could not add ${col.name} column:`, error.message);
        }
      }
    }

    const productBannerColumns = [
      { name: 'promote_home_banner', type: 'BOOLEAN DEFAULT FALSE', after: 'is_active' },
      { name: 'banner_sort_order', type: 'INT NOT NULL DEFAULT 0', after: 'promote_home_banner' },
    ];
    for (const col of productBannerColumns) {
      try {
        await connection.execute(`
          ALTER TABLE products 
          ADD COLUMN ${col.name} ${col.type}
          AFTER ${col.after}
        `);
        console.log(`[Database] Added ${col.name} column to products table`);
      } catch (error) {
        if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
        } else {
          console.warn(`[Database] Could not add ${col.name} column:`, error.message);
        }
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN video_urls JSON NULL
        AFTER images
      `);
      console.log('[Database] Added video_urls column to products table');
    } catch (error) {
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
      } else {
        console.warn('[Database] Could not add video_urls column:', error.message);
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN home_banner_slides JSON NULL
        AFTER banner_sort_order
      `);
      console.log('[Database] Added home_banner_slides column to products table');
    } catch (error) {
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
      } else {
        console.warn('[Database] Could not add home_banner_slides column:', error.message);
      }
    }

    try {
      await connection.execute(`
        UPDATE products 
        SET home_banner_slides = '["1","2","3","4"]'
        WHERE promote_home_banner = 1 
          AND (home_banner_slides IS NULL OR JSON_LENGTH(home_banner_slides) = 0)
      `);
      console.log('[Database] Backfilled home_banner_slides for existing hero-promoted products');
    } catch (error) {
      console.warn('[Database] home_banner_slides backfill skipped:', error.message);
    }

    // Remove invalid index on JSON column if it exists (MySQL doesn't support direct indexing on JSON)
    try {
      await connection.execute(`DROP INDEX idx_occasion ON products`);
      console.log('[Database] Removed invalid idx_occasion index from products table');
    } catch (error) {
      // Index might not exist, ignore error
      if (error.code !== 'ER_CANT_DROP_FIELD_OR_KEY' && !error.message.includes("doesn't exist")) {
        // Only log if it's not a "doesn't exist" error
      }
    }

    // Create locations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS locations (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        state VARCHAR(100),
        country VARCHAR(100) DEFAULT 'India',
        description TEXT,
        short_description TEXT,
        services JSON,
        products JSON,
        landmarks JSON,
        coverage_areas JSON,
        image VARCHAR(500),
        stats_projects_completed INT,
        stats_customers_served INT,
        stats_years_active INT,
        testimonials JSON,
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords JSON,
        is_active BOOLEAN DEFAULT TRUE,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_state (state),
        INDEX idx_locations_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create brands table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS brands (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        short_description TEXT,
        logo_url VARCHAR(500),
        local_logo VARCHAR(500),
        website VARCHAR(500),
        products JSON,
        services JSON,
        partnership_type ENUM('authorized-dealer', 'partner', 'distributor', 'reseller', 'others'),
        partnership_since VARCHAR(50),
        certifications JSON,
        image VARCHAR(500),
        features JSON,
        warranty VARCHAR(255),
        support VARCHAR(255),
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords JSON,
        is_active BOOLEAN DEFAULT TRUE,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_brands_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create categories table (supports multi-level product/service categories)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        type ENUM('service', 'product', 'both') NOT NULL DEFAULT 'product',
        description TEXT,
        short_description TEXT,
        parent_id VARCHAR(50) NULL,
        icon VARCHAR(100),
        services JSON,
        products JSON,
        brands JSON,
        image VARCHAR(500),
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords JSON,
        is_active BOOLEAN DEFAULT TRUE,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_type (type),
        INDEX idx_parent (parent_id),
        INDEX idx_categories_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Geographic masters: countries, states, localities
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS countries (
        code VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        iso2 VARCHAR(2),
        iso3 VARCHAR(3),
        phone_code VARCHAR(10),
        currency VARCHAR(10),
        latitude DECIMAL(10,6),
        longitude DECIMAL(10,6),
        locale VARCHAR(10),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS states (
        id VARCHAR(50) PRIMARY KEY,
        country_code VARCHAR(10) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        latitude DECIMAL(10,6),
        longitude DECIMAL(10,6),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_country (country_code),
        INDEX idx_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS localities (
        id VARCHAR(50) PRIMARY KEY,
        state_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        type VARCHAR(50),
        postal_code VARCHAR(20),
        latitude DECIMAL(10,6),
        longitude DECIMAL(10,6),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_state (state_id),
        INDEX idx_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create industries table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS industries (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        short_description TEXT,
        icon VARCHAR(100),
        services JSON,
        products JSON,
        use_cases JSON,
        case_studies JSON,
        testimonials JSON,
        image VARCHAR(500),
        stats_clients_served INT,
        stats_projects_completed INT,
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords JSON,
        is_active BOOLEAN DEFAULT TRUE,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_industries_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create case_studies table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS case_studies (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        short_description TEXT,
        industry VARCHAR(50),
        location VARCHAR(50),
        services JSON,
        products JSON,
        brand VARCHAR(50),
        client_name VARCHAR(255),
        client_type VARCHAR(100),
        client_logo VARCHAR(500),
        challenge TEXT,
        solution TEXT,
        results JSON,
        images JSON,
        testimonial VARCHAR(50),
        featured BOOLEAN DEFAULT FALSE,
        published_at TIMESTAMP,
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords JSON,
        is_active BOOLEAN DEFAULT TRUE,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_industry (industry),
        INDEX idx_location (location),
        INDEX idx_featured (featured),
        INDEX idx_case_studies_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create testimonials table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        company VARCHAR(255),
        location VARCHAR(50),
        industry VARCHAR(50),
        service VARCHAR(50),
        product VARCHAR(50),
        rating INT NOT NULL,
        review TEXT NOT NULL,
        image VARCHAR(500),
        featured BOOLEAN DEFAULT FALSE,
        verified BOOLEAN DEFAULT FALSE,
        published_at TIMESTAMP,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_location (location),
        INDEX idx_industry (industry),
        INDEX idx_featured (featured),
        INDEX idx_verified (verified),
        INDEX idx_testimonials_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create redirects table for handling URL changes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS redirects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        from_path VARCHAR(500) NOT NULL,
        to_path VARCHAR(500) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(50) NOT NULL,
        status_code INT DEFAULT 301,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_from_path (from_path),
        INDEX idx_entity (entity_type, entity_id),
        UNIQUE KEY unique_from_path (from_path)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create audit_logs table for tracking all admin actions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(100) NOT NULL,
        action VARCHAR(20) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(50),
        entity_name VARCHAR(255),
        changes JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_action (action),
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_created_at (created_at),
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create clients table for invoicing system
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        company VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100) DEFAULT 'India',
        postal_code VARCHAR(20),
        tax_id VARCHAR(100),
        website VARCHAR(500),
        notes TEXT,
        status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_clients_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create proposals table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS proposals (
        id VARCHAR(50) PRIMARY KEY,
        proposal_number VARCHAR(50) NOT NULL UNIQUE,
        client_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        items JSON NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
        tax_rate DECIMAL(5,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'INR',
        valid_until DATE,
        status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
        proposal_type ENUM('confirmed', 'sharing') DEFAULT 'confirmed',
        payment_terms VARCHAR(255),
        token_amount DECIMAL(10,2) DEFAULT 0,
        warranty_details TEXT,
        work_completion_period VARCHAR(255),
        notes TEXT,
        terms TEXT,
        created_by INT,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_client (client_id),
        INDEX idx_proposal_number (proposal_number),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_proposals_is_deleted (is_deleted),
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create invoices table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        sequence_number INT AUTO_INCREMENT UNIQUE,
        id VARCHAR(50) PRIMARY KEY,
        invoice_number VARCHAR(50) NOT NULL UNIQUE,
        proposal_id VARCHAR(50),
        client_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        items JSON NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
        tax_rate DECIMAL(5,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'INR',
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('draft', 'pending_approval', 'approved', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'disputed', 'on_hold', 'cancelled', 'refunded') DEFAULT 'draft',
        invoice_type ENUM('confirmed', 'sharing') DEFAULT 'confirmed',
        payment_terms VARCHAR(255),
        warranty_details TEXT,
        work_completion_period VARCHAR(255),
        notes TEXT,
        terms TEXT,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        created_by INT,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_client (client_id),
        INDEX idx_invoice_number (invoice_number),
        INDEX idx_sequence_number (sequence_number),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date),
        INDEX idx_created_at (created_at),
        INDEX idx_invoices_is_deleted (is_deleted),
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
        FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Add sequence_number column if it doesn't exist (for existing databases)
    // Note: For existing databases with data, run server/scripts/add-invoice-sequence-number.js
    // This check is just for new installations
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'invoices' 
        AND COLUMN_NAME = 'sequence_number'
      `);
      
      if (columns.length === 0) {
        console.log('[Database] sequence_number column not found. For existing databases, please run: node server/scripts/add-invoice-sequence-number.js');
      }
    } catch (error) {
      console.warn('[Database] Could not check for sequence_number column:', error.message);
    }

    // Add proposal_type, payment_terms, and token_amount columns to proposals table (for existing databases)
    try {
      await connection.execute(`
        ALTER TABLE proposals 
        ADD COLUMN proposal_type ENUM('confirmed', 'sharing') DEFAULT 'confirmed'
      `);
      console.log('[Database] Added proposal_type column to proposals table');
    } catch (error) {
      // Column already exists, ignore error silently
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
        // Expected - column already exists, no action needed
      } else {
        console.warn('[Database] Could not add proposal_type column:', error.message);
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE proposals 
        ADD COLUMN payment_terms VARCHAR(255) DEFAULT NULL
      `);
      console.log('[Database] Added payment_terms column to proposals table');
    } catch (error) {
      // Column already exists, ignore error silently
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
        // Expected - column already exists, no action needed
      } else {
        console.warn('[Database] Could not add payment_terms column:', error.message);
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE proposals 
        ADD COLUMN token_amount DECIMAL(10,2) DEFAULT 0
      `);
      console.log('[Database] Added token_amount column to proposals table');
    } catch (error) {
      // Column already exists, ignore error silently
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
        // Expected - column already exists, no action needed
      } else {
        console.warn('[Database] Could not add token_amount column:', error.message);
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE proposals 
        ADD COLUMN warranty_details TEXT DEFAULT NULL
      `);
      console.log('[Database] Added warranty_details column to proposals table');
    } catch (error) {
      // Column already exists, ignore error silently
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
        // Expected - column already exists, no action needed
      } else {
        console.warn('[Database] Could not add warranty_details column:', error.message);
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE proposals 
        ADD COLUMN work_completion_period VARCHAR(255) DEFAULT NULL
      `);
      console.log('[Database] Added work_completion_period column to proposals table');
    } catch (error) {
      // Column already exists, ignore error silently
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
        // Expected - column already exists, no action needed
      } else {
        console.warn('[Database] Could not add work_completion_period column:', error.message);
      }
    }

    // Add invoice_type column if it doesn't exist (for existing databases)
    try {
      await connection.execute(`
        ALTER TABLE invoices 
        ADD COLUMN invoice_type ENUM('confirmed', 'sharing') DEFAULT 'confirmed'
      `);
      console.log('[Database] Added invoice_type column to invoices table');
    } catch (error) {
      // Column already exists, ignore error silently
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
        // Expected - column already exists, no action needed
      } else {
        console.warn('[Database] Could not add invoice_type column:', error.message);
      }
    }

    // Add warranty_details and work_completion_period columns to invoices table (for existing databases)
    try {
      await connection.execute('ALTER TABLE invoices ADD COLUMN warranty_details TEXT DEFAULT NULL');
      console.log('[Database] Added warranty_details column to invoices table');
    } catch (error) {
      if (error.message && !error.message.includes('Duplicate column name') && error.code !== 'ER_DUP_FIELDNAME') {
        console.error('[Database] Error adding warranty_details column:', error.message);
      }
    }
    
    try {
      await connection.execute('ALTER TABLE invoices ADD COLUMN work_completion_period VARCHAR(255) DEFAULT NULL');
      console.log('[Database] Added work_completion_period column to invoices table');
    } catch (error) {
      if (error.message && !error.message.includes('Duplicate column name') && error.code !== 'ER_DUP_FIELDNAME') {
        console.error('[Database] Error adding work_completion_period column:', error.message);
      }
    }

    // Update invoice status enum to include new statuses (for existing databases)
    try {
      await connection.execute(`
        ALTER TABLE invoices 
        MODIFY COLUMN status ENUM('draft', 'pending_approval', 'approved', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'disputed', 'on_hold', 'cancelled', 'refunded') DEFAULT 'draft'
      `);
      console.log('[Database] Updated invoice status enum');
    } catch (error) {
      // Column might not exist or enum values might already be updated
      if (error.message.includes('Duplicate column name') || error.message.includes('Unknown column') || error.code === 'ER_DUP_FIELDNAME') {
        // Expected - column doesn't exist or enum already updated, no action needed
      } else {
        console.warn('[Database] Could not update status enum:', error.message);
      }
    }

    // Create invoice_payments table for tracking payments
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoice_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method ENUM('cash', 'bank_transfer', 'cheque', 'credit_card', 'debit_card', 'upi', 'other') DEFAULT 'bank_transfer',
        reference_number VARCHAR(100),
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_invoice (invoice_id),
        INDEX idx_payment_date (payment_date),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create invoice_reminders table for payment reminders
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoice_reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id VARCHAR(50) NOT NULL,
        reminder_type ENUM('before_due', 'on_due', 'after_due', 'custom') DEFAULT 'after_due',
        reminder_date DATE NOT NULL,
        days_before_after INT DEFAULT 0,
        email_sent TINYINT(1) DEFAULT 0,
        email_sent_at TIMESTAMP NULL,
        email_subject VARCHAR(255),
        email_body TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_invoice (invoice_id),
        INDEX idx_reminder_date (reminder_date),
        INDEX idx_email_sent (email_sent),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create company_settings table for invoice/proposal header/footer configuration
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL DEFAULT 'Khandelwal Toy Store',
        logo_url VARCHAR(500),
        address_line1 VARCHAR(255),
        address_line2 VARCHAR(255),
        address_line3 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'India',
        phone VARCHAR(20),
        phone2 VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        gstin VARCHAR(50),
        pan VARCHAR(50),
        bank_name VARCHAR(255),
        bank_account_name VARCHAR(255),
        bank_account_number VARCHAR(100),
        bank_ifsc VARCHAR(50),
        bank_branch VARCHAR(255),
        footer_text TEXT,
        terms_and_conditions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Add bank_account_name column if it doesn't exist (for existing databases)
    try {
      await connection.execute(`
        ALTER TABLE company_settings 
        ADD COLUMN bank_account_name VARCHAR(255)
      `);
    } catch (error) {
      // Column already exists, ignore error silently
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
        // Expected - column already exists, no action needed
      } else {
        console.warn('[Database] Could not add bank_account_name column:', error.message);
      }
    }

    // Add enable_enquiry_popup column if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE company_settings 
        ADD COLUMN enable_enquiry_popup BOOLEAN DEFAULT TRUE
      `);
      console.log('[Database] Added enable_enquiry_popup column to company_settings table');
    } catch (error) {
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
        // Expected - column already exists, no action needed
      } else {
        console.warn('[Database] Could not add enable_enquiry_popup column:', error.message);
      }
    }

    // Add whatsapp_number column if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE company_settings 
        ADD COLUMN whatsapp_number VARCHAR(20)
      `);
      console.log('[Database] Added whatsapp_number column to company_settings table');
    } catch (error) {
      if (error.message.includes('Duplicate column name') || error.code === 'ER_DUP_FIELDNAME') {
        // Expected - column already exists, no action needed
      } else {
        console.warn('[Database] Could not add whatsapp_number column:', error.message);
      }
    }

    // Create enquiries table to log all enquiries
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(50),
        product_name VARCHAR(255),
        product_slug VARCHAR(255),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        quantity INT,
        requested_price DECIMAL(10,2),
        custom_message TEXT,
        whatsapp_number VARCHAR(20),
        enquiry_type ENUM('product', 'general') DEFAULT 'product',
        status ENUM('new', 'contacted', 'quoted', 'closed') DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_product_id (product_id),
        INDEX idx_product_slug (product_slug),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('[Database] Created enquiries table');

    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS cart_enquiries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          public_ref VARCHAR(32) NULL UNIQUE,
          items_json JSON NOT NULL,
          customer_name VARCHAR(255),
          customer_email VARCHAR(255),
          customer_phone VARCHAR(20),
          custom_message TEXT,
          whatsapp_number VARCHAR(20),
          status ENUM('new', 'contacted', 'quoted', 'closed') DEFAULT 'new',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('[Database] Ensured cart_enquiries table exists');
    } catch (error) {
      console.warn('[Database] cart_enquiries table:', error.message);
    }

    try {
      await connection.execute(
        'ALTER TABLE cart_enquiries ADD COLUMN public_ref VARCHAR(32) NULL UNIQUE',
      );
      console.log('[Database] Added cart_enquiries.public_ref');
    } catch (error) {
      if (!String(error.message || '').includes('Duplicate column name')) {
        console.warn('[Database] cart_enquiries.public_ref migration:', error.message);
      }
    }

    // Insert default company settings if not exists
    const [existingSettings] = await connection.execute('SELECT id FROM company_settings LIMIT 1');
    if (existingSettings.length === 0) {
      await connection.execute(`
        INSERT INTO company_settings (
          company_name, address_line1, address_line2, address_line3, city, state, postal_code, country,
          phone, phone2, email, website, gstin, footer_text, enable_enquiry_popup, whatsapp_number
        ) VALUES (
          'Khandelwal Toy Store',
          'Shed No-7/8, Sardar Campus',
          'opp River cant App, Mota Varachha',
          '',
          'Surat',
          'Gujarat',
          '394101',
          'India',
          '+91 99114 84404',
          '+91 99258 86973',
          'info@khandelwaltoystore.com',
          'khandelwaltoystore.com',
          '',
          '© 2024 Khandelwal Toy Store. All rights reserved. | Local toy shop',
          FALSE,
          '9911484404'
        )
      `);
    }

    // Create templates table for proposal/invoice templates
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category ENUM('warranty', 'payment', 'notes', 'terms', 'work_completion') NOT NULL,
        content TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_by INT,
        updated_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_templates_is_deleted (is_deleted),
        INDEX idx_templates_is_active (is_active),
        FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create default templates if not exists
    const [existingTemplates] = await connection.execute('SELECT id FROM templates LIMIT 1');
    if (existingTemplates.length === 0) {
      const defaultTemplates = [
        {
          id: 'template-warranty-cctv-comprehensive',
          name: 'CCTV Comprehensive Warranty',
          category: 'warranty',
          content: `<ol>
<li>1 year comprehensive warranty on all CCTV equipment (Cameras, DVR/NVR, Storage Devices)</li>
<li>On-site service and support during warranty period</li>
<li>Warranty covers manufacturing defects and component failures</li>
<li>Warranty does NOT cover:
<ul>
<li>Physical damage due to mishandling</li>
<li>Damage due to power surges or incorrect voltage</li>
<li>Water damage or exposure to extreme conditions</li>
<li>Tampering or unauthorized modifications</li>
</ul>
</li>
<li>Extended warranty available at additional cost</li>
<li>AMC (Annual Maintenance Contract) available post-warranty period</li>
</ol>`
        },
        {
          id: 'template-notes-standard-cctv',
          name: 'Standard CCTV Installation Notes',
          category: 'notes',
          content: `<ol>
<li>Broadband Connection will be provided by Client to make System online</li>
<li>Two Free service visits (one service each month)</li>
<li>Two persons will be provided by client till the work is finished</li>
<li>This Quotation is valid for 15 Days from the Date of Quotation</li>
<li>Products which are not mentioned in above Quotation will be charged separately</li>
<li>Wiring through Batton/PVC/Flexi and Cat 6 Wire will be charged as per Actual Used in site</li>
<li>Site completion cost may vary by 5-10%</li>
</ol>`
        },
        {
          id: 'template-terms-standard',
          name: 'Standard Terms & Conditions',
          category: 'terms',
          content: `<ol>
<li>This quotation is valid for 15 days from the date of issue</li>
<li>Prices are subject to change without prior notice</li>
<li>All payments to be made as per agreed payment terms</li>
<li>Delivery timeline starts after receipt of advance payment</li>
<li>Installation charges are included unless otherwise specified</li>
<li>Client is responsible for providing necessary permissions and access</li>
<li>Any additional work or changes will be charged separately</li>
<li>Company reserves the right to modify terms if required</li>
</ol>`
        },
        {
          id: 'template-payment-token',
          name: 'Token Money',
          category: 'payment',
          content: `<ol>
<li>Token amount to be paid to confirm the order</li>
<li>Balance payment as per agreed terms</li>
</ol>`
        },
        {
          id: 'template-work-completion-standard',
          name: 'Standard Completion Period',
          category: 'work_completion',
          content: `15-30 working days after advance payment`
        }
      ];

      for (const template of defaultTemplates) {
        await connection.execute(
          'INSERT INTO templates (id, name, category, content, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [template.id, template.name, template.category, template.content, true]
        );
      }
      console.log('[Database] Default templates created');
    }

    // Create default admin user if not exists
    const bcrypt = require('bcrypt');
    const [adminUsers] = await connection.execute('SELECT id FROM admin_users WHERE username = ?', ['admin']);
    if (adminUsers.length === 0) {
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      await connection.execute(
        'INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@khandelwaltoystore.com', passwordHash, 'Administrator', 'admin']
      );
      console.log('[Database] Default admin user created: username=admin, password=' + defaultPassword);
    }

    connection.release();
    console.log('[Database] Tables initialized successfully');
  } catch (error) {
    console.error('[Database] Error initializing tables:', error);
    throw error;
  }
}

// Test database connection
async function testConnection() {
  try {
    if (!pool) {
      console.warn('[Database] Connection pool not initialized. Attempting to initialize...');
      await initDatabase();
    }
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('[Database] ✅ Connection test successful');
    return true;
  } catch (error) {
    console.error('[Database] ❌ Connection test failed:', error.message);
    console.error('[Database] Error details:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    return false;
  }
}

// Get database pool
function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

module.exports = {
  initDatabase,
  getPool,
  testConnection
};


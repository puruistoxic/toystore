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
  // Default DB host is the internal database server IP if MYSQL_HOST is not set
  // For deployment, try wainso.com as fallback if primary connection fails
  let dbHost = process.env.MYSQL_HOST || '192.168.1.210';
  const dbDatabase = process.env.MYSQL_DATABASE || 'wainsodb';
  const dbUser = process.env.MYSQL_USER || 'dbuser';
  const dbPassword = process.env.MYSQL_PASSWORD || '';
  const dbPort = parseInt(process.env.MYSQL_PORT || '3306');
  const fallbackHost = 'wainso.com';

  console.log('[Database] Initializing database connection...');
  console.log(`[Database] Primary host: ${dbHost}:${dbPort}`);
  console.log(`[Database] Fallback host: ${fallbackHost}:${dbPort} (if primary fails)`);
  console.log(`[Database] Database: ${dbDatabase}, User: ${dbUser}`);

  if (!dbPassword) {
    console.warn('[Database] WARNING: MYSQL_PASSWORD is not set!');
    console.warn('[Database] Please create a .env file in the server directory with database credentials.');
    console.warn('[Database] See docs/ENV_SETUP.md for instructions.');
  }

  // Try to create connection pool with primary host
  pool = mysql.createPool({
    host: dbHost,
    database: dbDatabase,
    user: dbUser,
    password: dbPassword,
    port: dbPort,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    ssl: false
  });

  // Test connection with primary host
  try {
    console.log(`[Database] Testing connection to ${dbHost}...`);
    const testConnection = await pool.getConnection();
    await testConnection.ping();
    testConnection.release();
    console.log(`[Database] ✅ Successfully connected to database at ${dbHost}:${dbPort}/${dbDatabase}`);
  } catch (error) {
    console.warn(`[Database] ⚠️  Connection to ${dbHost} failed: ${error.message}`);
    console.log(`[Database] 🔄 Attempting fallback connection to ${fallbackHost}...`);
    
    // Try fallback host
    try {
      if (pool) {
        await pool.end(); // Close the previous pool
      }
      pool = mysql.createPool({
        host: fallbackHost,
        database: dbDatabase,
        user: dbUser,
        password: dbPassword,
        port: dbPort,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        ssl: false
      });
      
      const testConnection = await pool.getConnection();
      await testConnection.ping();
      testConnection.release();
      console.log(`[Database] ✅ Successfully connected to database at ${fallbackHost}:${dbPort}/${dbDatabase} (fallback)`);
      dbHost = fallbackHost; // Update for logging
    } catch (fallbackError) {
      console.error(`[Database] ❌ Fallback connection to ${fallbackHost} also failed: ${fallbackError.message}`);
      console.error('[Database] Both primary and fallback database connections failed!');
      throw new Error(`Database connection failed. Primary (${dbHost}): ${error.message}, Fallback (${fallbackHost}): ${fallbackError.message}`);
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
        features JSON,
        specifications JSON,
        warranty VARCHAR(255),
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
        INDEX idx_brand (brand),
        INDEX idx_hsn_code (hsn_code),
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
      // Column might already exist, ignore error
      if (!error.message.includes('Duplicate column name')) {
        console.warn('Warning: Could not add price_includes_gst column:', error.message);
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
        INDEX idx_status (status),
        INDEX idx_due_date (due_date),
        INDEX idx_created_at (created_at),
        INDEX idx_invoices_is_deleted (is_deleted),
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
        FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Add invoice_type column if it doesn't exist (for existing databases)
    try {
      await connection.execute(`
        ALTER TABLE invoices 
        ADD COLUMN invoice_type ENUM('confirmed', 'sharing') DEFAULT 'confirmed'
      `);
    } catch (error) {
      // Column already exists, ignore error
      if (!error.message.includes('Duplicate column name')) {
        console.warn('[Database] Could not add invoice_type column:', error.message);
      }
    }

    // Update invoice status enum to include new statuses (for existing databases)
    try {
      await connection.execute(`
        ALTER TABLE invoices 
        MODIFY COLUMN status ENUM('draft', 'pending_approval', 'approved', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'disputed', 'on_hold', 'cancelled', 'refunded') DEFAULT 'draft'
      `);
    } catch (error) {
      // Column might not exist or enum values might already be updated
      if (!error.message.includes('Duplicate column name') && !error.message.includes('Unknown column')) {
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
        company_name VARCHAR(255) NOT NULL DEFAULT 'WAINSO',
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
      // Column already exists, ignore error
      if (!error.message.includes('Duplicate column name')) {
        console.warn('[Database] Could not add bank_account_name column:', error.message);
      }
    }

    // Insert default company settings if not exists
    const [existingSettings] = await connection.execute('SELECT id FROM company_settings LIMIT 1');
    if (existingSettings.length === 0) {
      await connection.execute(`
        INSERT INTO company_settings (
          company_name, address_line1, address_line2, address_line3, city, state, postal_code, country,
          phone, phone2, email, website, gstin, footer_text
        ) VALUES (
          'WAINSO',
          'Room No-9, 1st Floor, Yadav Complex',
          'Near Block Chawck, Block Chowk',
          'Ramgarh Cantt',
          'Ramgarh',
          'Jharkhand',
          '829122',
          'India',
          '+91 98998 60975',
          '+91 82927 17044',
          'wainsogps@gmail.com',
          'wainso.com',
          '20AACFW6441P1ZY',
          '© 2024 WAINSO. All rights reserved. | Est. 2017 | 8+ Years in Business'
        )
      `);
    }

    // Create default admin user if not exists
    const bcrypt = require('bcrypt');
    const [adminUsers] = await connection.execute('SELECT id FROM admin_users WHERE username = ?', ['admin']);
    if (adminUsers.length === 0) {
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      await connection.execute(
        'INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@wainso.com', passwordHash, 'Administrator', 'admin']
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


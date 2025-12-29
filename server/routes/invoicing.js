const express = require('express');
const { getPool } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { logAudit, getEntityName } = require('../middleware/auditLog');
const { v4: uuidv4 } = require('uuid');
const reminderService = require('../services/emailReminderService');

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

// Helper function to add audit logging
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
    console.error('[Audit Log] Failed to log:', error);
  }
}

// ==================== CLIENTS ====================

router.get('/clients', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { status, search, only_deleted, include_deleted } = req.query;
    let query = 'SELECT * FROM clients WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (only_deleted === 'true') {
      query += ' AND is_deleted = 1';
    } else if (include_deleted !== 'true') {
      query += ' AND is_deleted = 0';
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    const clients = rows.map(row => formatDataFromDB(row, []));
    res.json(clients);
  } catch (error) {
    console.error('[Invoicing API] Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients', message: error.message });
  }
});

router.get('/clients/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const client = formatDataFromDB(rows[0], []);
    res.json(client);
  } catch (error) {
    console.error('[Invoicing API] Get client error:', error);
    res.status(500).json({ error: 'Failed to fetch client', message: error.message });
  }
});

router.post('/clients', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const clientId = req.body.id || uuidv4();
    const data = prepareDataForDB(req.body, [
      'id', 'name', 'email', 'phone', 'company', 'address', 'city', 'state',
      'country', 'postal_code', 'tax_id', 'website', 'notes', 'status'
    ]);
    data.id = clientId;

    await pool.execute(
      `INSERT INTO clients (id, name, email, phone, company, address, city, state, country, postal_code, tax_id, website, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, data.name, data.email, data.phone, data.company, data.address,
        data.city, data.state, data.country || 'India', data.postal_code,
        data.tax_id, data.website, data.notes, data.status || 'active'
      ]
    );

    await addAuditLog(req, 'CREATE', 'client', clientId, data.name, null, data);

    res.json({ success: true, id: clientId, message: 'Client created successfully' });
  } catch (error) {
    console.error('[Invoicing API] Create client error:', error);
    res.status(500).json({ error: 'Failed to create client', message: error.message });
  }
});

router.put('/clients/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const clientId = req.params.id;

    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM clients WHERE id = ?', [clientId]);
    if (oldRows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const oldData = formatDataFromDB(oldRows[0], []);

    const data = prepareDataForDB(req.body, [
      'name', 'email', 'phone', 'company', 'address', 'city', 'state',
      'country', 'postal_code', 'tax_id', 'website', 'notes', 'status'
    ]);

    await pool.execute(
      `UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, address = ?, city = ?, state = ?,
       country = ?, postal_code = ?, tax_id = ?, website = ?, notes = ?, status = ?
       WHERE id = ?`,
      [
        data.name, data.email, data.phone, data.company, data.address,
        data.city, data.state, data.country, data.postal_code,
        data.tax_id, data.website, data.notes, data.status, clientId
      ]
    );

    await addAuditLog(req, 'UPDATE', 'client', clientId, data.name, oldData, data);

    res.json({ success: true, message: 'Client updated successfully' });
  } catch (error) {
    console.error('[Invoicing API] Update client error:', error);
    res.status(500).json({ error: 'Failed to update client', message: error.message });
  }
});

router.delete('/clients/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const clientId = req.params.id;

    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM clients WHERE id = ?', [clientId]);
    if (oldRows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const oldData = formatDataFromDB(oldRows[0], []);

    // Check if client has invoices or proposals
    const [invoices] = await pool.execute('SELECT COUNT(*) as count FROM invoices WHERE client_id = ?', [clientId]);
    const [proposals] = await pool.execute('SELECT COUNT(*) as count FROM proposals WHERE client_id = ?', [clientId]);

    if (invoices[0].count > 0 || proposals[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete client',
        message: 'Client has associated invoices or proposals. Please archive the client instead.'
      });
    }

    await pool.execute(
      'UPDATE clients SET is_deleted = 1, status = ?, deleted_at = NOW() WHERE id = ?',
      ['archived', clientId]
    );

    await addAuditLog(req, 'DELETE', 'client', clientId, oldData.name, oldData, null);

    res.json({ success: true, message: 'Client archived successfully' });
  } catch (error) {
    console.error('[Invoicing API] Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client', message: error.message });
  }
});

// Restore client
router.post('/clients/:id/restore', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const clientId = req.params.id;

    const [rows] = await pool.execute('SELECT * FROM clients WHERE id = ?', [clientId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const client = rows[0];
    if (!client.is_deleted) {
      return res.status(400).json({ error: 'Client is not deleted' });
    }

    await pool.execute(
      'UPDATE clients SET is_deleted = 0, status = ?, deleted_at = NULL WHERE id = ?',
      ['active', clientId]
    );

    await addAuditLog(req, 'RESTORE', 'client', clientId, client.name, client, null);

    res.json({ success: true, message: 'Client restored successfully' });
  } catch (error) {
    console.error('[Invoicing API] Restore client error:', error);
    res.status(500).json({ error: 'Failed to restore client', message: error.message });
  }
});

// ==================== PROPOSALS ====================

// Helper function to get financial year (April 1 to March 31)
function getFinancialYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  
  let startYear, endYear;
  if (month >= 4) {
    // April to December: FY starts in current year
    startYear = year;
    endYear = year + 1;
  } else {
    // January to March: FY started in previous year
    startYear = year - 1;
    endYear = year;
  }
  
  const startYY = startYear.toString().slice(-2);
  const endYY = endYear.toString().slice(-2);
  return `${startYY}-${endYY}`;
}

// Generate proposal number: WGSS/P/25-26/0001
async function generateProposalNumber(pool) {
  const financialYear = getFinancialYear();
  const prefix = `WGSS/P/${financialYear}/`;
  
  const [rows] = await pool.execute(
    'SELECT proposal_number FROM proposals WHERE proposal_number LIKE ? ORDER BY proposal_number DESC LIMIT 1',
    [`${prefix}%`]
  );

  let sequence = 1;
  if (rows.length > 0) {
    const lastNumber = rows[0].proposal_number;
    // Extract sequence from format WGSS/P/YY-YY/####
    const parts = lastNumber.split('/');
    if (parts.length >= 4) {
      const lastSequence = parseInt(parts[3].trim()) || 0;
      sequence = lastSequence + 1;
    }
  }

  return `${prefix}${sequence.toString().padStart(4, '0')}`;
}

router.get('/proposals', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { status, client_id, search, only_deleted, include_deleted } = req.query;
    let query = `
      SELECT p.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.company as client_company,
       c.address as client_address, c.city as client_city, c.state as client_state,
       c.country as client_country, c.postal_code as client_postal_code, c.tax_id as client_tax_id,
       CASE WHEN EXISTS (SELECT 1 FROM invoices i WHERE i.proposal_id = p.id AND i.is_deleted = 0) THEN 1 ELSE 0 END as has_invoice
      FROM proposals p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (only_deleted === 'true') {
      query += ' AND p.is_deleted = 1';
    } else if (include_deleted !== 'true') {
      query += ' AND p.is_deleted = 0';
    }

    if (client_id) {
      query += ' AND p.client_id = ?';
      params.push(client_id);
    }

    if (search) {
      // Smart multi-word search: handles words in any order
      const { buildSmartSearchCondition } = require('../utils/searchHelper');
      const searchFields = ['p.proposal_number', 'p.title', 'c.name'];
      const { condition, params: searchParams } = buildSmartSearchCondition(search, searchFields);
      if (condition) {
        query += ` AND ${condition}`;
        params.push(...searchParams);
      }
    }

    query += ' ORDER BY p.created_at DESC';

    // Debug: Log the actual SQL query being executed
    console.log('[Proposals List] Executing SQL query:', query);
    console.log('[Proposals List] Query params:', params);

    const [rows] = await pool.execute(query, params);
    
    // Debug: Log raw database row before formatting
    if (rows.length > 0) {
      console.log('[Proposals List] Number of rows returned:', rows.length);
      console.log('[Proposals List] Raw DB row sample (first proposal) - ALL KEYS:', Object.keys(rows[0]));
      console.log('[Proposals List] Raw DB row sample (first proposal) - CLIENT DATA:', {
        id: rows[0].id,
        client_id: rows[0].client_id,
        client_name: rows[0].client_name,
        client_address: rows[0].client_address,
        client_city: rows[0].client_city,
        client_state: rows[0].client_state,
        client_postal_code: rows[0].client_postal_code,
        client_country: rows[0].client_country,
        client_phone: rows[0].client_phone,
        client_email: rows[0].client_email,
        client_company: rows[0].client_company,
        client_tax_id: rows[0].client_tax_id
      });
      
      // Also check if client exists in database
      if (rows[0].client_id) {
        const [clientRows] = await pool.execute('SELECT * FROM clients WHERE id = ?', [rows[0].client_id]);
        if (clientRows.length > 0) {
          console.log('[Proposals List] Client data from clients table:', {
            id: clientRows[0].id,
            name: clientRows[0].name,
            address: clientRows[0].address,
            city: clientRows[0].city,
            state: clientRows[0].state,
            postal_code: clientRows[0].postal_code,
            country: clientRows[0].country,
            phone: clientRows[0].phone,
            email: clientRows[0].email
          });
        } else {
          console.log('[Proposals List] WARNING: Client not found in database for client_id:', rows[0].client_id);
        }
      }
    }
    
    const proposals = rows.map(row => formatDataFromDB(row, ['items']));
    
    // Debug: Log after formatting
    if (proposals.length > 0) {
      console.log('[Proposals List] After formatDataFromDB (first proposal):', {
        id: proposals[0].id,
        client_id: proposals[0].client_id,
        client_name: proposals[0].client_name,
        client_address: proposals[0].client_address,
        client_city: proposals[0].client_city,
        client_state: proposals[0].client_state,
        client_postal_code: proposals[0].client_postal_code,
        client_country: proposals[0].client_country,
        client_phone: proposals[0].client_phone,
        client_email: proposals[0].client_email
      });
    }
    
    res.json(proposals);
  } catch (error) {
    console.error('[Invoicing API] Get proposals error:', error);
    res.status(500).json({ error: 'Failed to fetch proposals', message: error.message });
  }
});

router.get('/proposals/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.company as client_company,
       c.address as client_address, c.city as client_city, c.state as client_state,
       c.country as client_country, c.postal_code as client_postal_code, c.tax_id as client_tax_id,
       CASE WHEN EXISTS (SELECT 1 FROM invoices i WHERE i.proposal_id = p.id AND i.is_deleted = 0) THEN 1 ELSE 0 END as has_invoice
       FROM proposals p
       LEFT JOIN clients c ON p.client_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    // Debug: Log raw database row
    console.log('[Proposal Detail] Executing SQL query with client_id:', req.params.id);
    console.log('[Proposal Detail] Raw DB row - ALL KEYS:', Object.keys(rows[0]));
    console.log('[Proposal Detail] Raw DB row - CLIENT DATA:', {
      id: rows[0].id,
      client_id: rows[0].client_id,
      client_name: rows[0].client_name,
      client_address: rows[0].client_address,
      client_city: rows[0].client_city,
      client_state: rows[0].client_state,
      client_postal_code: rows[0].client_postal_code,
      client_country: rows[0].client_country,
      client_phone: rows[0].client_phone,
      client_email: rows[0].client_email,
      client_company: rows[0].client_company,
      client_tax_id: rows[0].client_tax_id
    });
    
    // Also check if client exists in database
    if (rows[0].client_id) {
      const [clientRows] = await pool.execute('SELECT * FROM clients WHERE id = ?', [rows[0].client_id]);
      if (clientRows.length > 0) {
        console.log('[Proposal Detail] Client data from clients table:', {
          id: clientRows[0].id,
          name: clientRows[0].name,
          address: clientRows[0].address,
          city: clientRows[0].city,
          state: clientRows[0].state,
          postal_code: clientRows[0].postal_code,
          country: clientRows[0].country,
          phone: clientRows[0].phone,
          email: clientRows[0].email
        });
      } else {
        console.log('[Proposal Detail] WARNING: Client not found in database for client_id:', rows[0].client_id);
      }
    }
    
    const proposal = formatDataFromDB(rows[0], ['items']);
    
    // Debug: Log after formatting
    console.log('[Proposal Detail] After formatDataFromDB:', {
      id: proposal.id,
      client_id: proposal.client_id,
      client_name: proposal.client_name,
      client_address: proposal.client_address,
      client_city: proposal.client_city,
      client_state: proposal.client_state,
      client_postal_code: proposal.client_postal_code,
      client_country: proposal.client_country,
      client_phone: proposal.client_phone,
      client_email: proposal.client_email
    });
    
    res.json(proposal);
  } catch (error) {
    console.error('[Invoicing API] Get proposal error:', error);
    res.status(500).json({ error: 'Failed to fetch proposal', message: error.message });
  }
});

router.post('/proposals', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const proposalId = req.body.id || uuidv4();
    const proposalNumber = req.body.proposal_number || await generateProposalNumber(pool);
    const proposalType = req.body.proposal_type || 'confirmed';

    // Calculate totals with GST-inclusive price support
    const { calculateInvoiceTotals } = require('../utils/calculateInvoiceTotals');
    const items = req.body.items || [];
    const taxRate = parseFloat(req.body.tax_rate || 0);
    const discount = parseFloat(req.body.discount || 0);
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(items, taxRate, discount, proposalType);

    const data = prepareDataForDB(req.body, [
      'id', 'proposal_number', 'client_id', 'title', 'description', 'items',
      'subtotal', 'tax_rate', 'tax_amount', 'discount', 'total', 'currency',
      'valid_until', 'status', 'proposal_type', 'payment_terms', 'token_amount',
      'warranty_details', 'work_completion_period', 'notes', 'terms'
    ]);

    data.id = proposalId;
    data.proposal_number = proposalNumber;
    data.proposal_type = proposalType;
    data.subtotal = subtotal;
    // For sharing proposals, don't calculate tax
    if (proposalType === 'sharing') {
      data.tax_rate = 0;
      data.tax_amount = 0;
      data.total = subtotal - (data.discount || 0);
    } else {
      data.tax_amount = taxAmount;
      data.total = total;
    }
    data.created_by = req.user.userId || req.user.id;

    await pool.execute(
      `INSERT INTO proposals (id, proposal_number, client_id, title, description, items, subtotal, tax_rate, tax_amount, discount, total, currency, valid_until, status, proposal_type, payment_terms, token_amount, warranty_details, work_completion_period, notes, terms, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, data.proposal_number, data.client_id, data.title, data.description,
        data.items, data.subtotal, data.tax_rate || 0, data.tax_amount, data.discount || 0,
        data.total, data.currency || 'INR', data.valid_until, data.status || 'draft',
        data.proposal_type || 'confirmed', data.payment_terms || null, data.token_amount || 0,
        data.warranty_details || null, data.work_completion_period || null,
        data.notes, data.terms, data.created_by
      ]
    );

    await addAuditLog(req, 'CREATE', 'proposal', proposalId, data.title, null, data);

    res.json({ success: true, id: proposalId, proposal_number: proposalNumber, message: 'Proposal created successfully' });
  } catch (error) {
    console.error('[Invoicing API] Create proposal error:', error);
    res.status(500).json({ error: 'Failed to create proposal', message: error.message });
  }
});

router.put('/proposals/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const proposalId = req.params.id;
    const proposalType = req.body.proposal_type || 'confirmed';

    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM proposals WHERE id = ?', [proposalId]);
    if (oldRows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    const oldData = formatDataFromDB(oldRows[0], ['items']);

    // Calculate totals with GST-inclusive price support
    const { calculateInvoiceTotals } = require('../utils/calculateInvoiceTotals');
    const items = req.body.items || [];
    const taxRate = parseFloat(req.body.tax_rate || 0);
    const discount = parseFloat(req.body.discount || 0);
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(items, taxRate, discount, proposalType);

    const data = prepareDataForDB(req.body, [
      'client_id', 'title', 'description', 'items', 'subtotal', 'tax_rate', 'tax_amount',
      'discount', 'total', 'currency', 'valid_until', 'status', 'proposal_type', 'payment_terms', 'token_amount',
      'warranty_details', 'work_completion_period', 'notes', 'terms'
    ]);

    data.proposal_type = proposalType;
    data.subtotal = subtotal;
    // For sharing proposals, don't calculate tax
    if (proposalType === 'sharing') {
      data.tax_rate = 0;
      data.tax_amount = 0;
      data.total = subtotal - (data.discount || 0);
    } else {
      data.tax_amount = taxAmount;
      data.total = total;
    }

    await pool.execute(
      `UPDATE proposals SET client_id = ?, title = ?, description = ?, items = ?, subtotal = ?, tax_rate = ?,
       tax_amount = ?, discount = ?, total = ?, currency = ?, valid_until = ?, status = ?, proposal_type = ?, payment_terms = ?, token_amount = ?, warranty_details = ?, work_completion_period = ?, notes = ?, terms = ?
       WHERE id = ?`,
      [
        data.client_id, data.title, data.description, data.items, data.subtotal,
        data.tax_rate || 0, data.tax_amount, data.discount || 0, data.total,
        data.currency || 'INR', data.valid_until, data.status, data.proposal_type || 'confirmed',
        data.payment_terms || null, data.token_amount || 0, data.warranty_details || null,
        data.work_completion_period || null, data.notes, data.terms, proposalId
      ]
    );

    await addAuditLog(req, 'UPDATE', 'proposal', proposalId, data.title, oldData, data);

    res.json({ success: true, message: 'Proposal updated successfully' });
  } catch (error) {
    console.error('[Invoicing API] Update proposal error:', error);
    res.status(500).json({ error: 'Failed to update proposal', message: error.message });
  }
});

router.delete('/proposals/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const proposalId = req.params.id;

    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM proposals WHERE id = ?', [proposalId]);
    if (oldRows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    const oldData = formatDataFromDB(oldRows[0], ['items']);

    // Check if proposal is accepted and has an invoice
    if (oldData.status === 'accepted') {
      const [invoiceRows] = await pool.execute(
        'SELECT COUNT(*) as count FROM invoices WHERE proposal_id = ? AND is_deleted = 0',
        [proposalId]
      );
      if (invoiceRows[0].count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete proposal', 
          message: 'This proposal has been converted to an invoice and cannot be deleted. Please delete the associated invoice first.' 
        });
      }
    }

    await pool.execute(
      'UPDATE proposals SET is_deleted = 1, deleted_at = NOW() WHERE id = ?',
      [proposalId]
    );

    await addAuditLog(req, 'DELETE', 'proposal', proposalId, oldData.title, oldData, null);

    res.json({ success: true, message: 'Proposal archived successfully' });
  } catch (error) {
    console.error('[Invoicing API] Delete proposal error:', error);
    res.status(500).json({ error: 'Failed to delete proposal', message: error.message });
  }
});

// Restore proposal
router.post('/proposals/:id/restore', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const proposalId = req.params.id;

    const [rows] = await pool.execute('SELECT * FROM proposals WHERE id = ?', [proposalId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const proposal = rows[0];
    if (!proposal.is_deleted) {
      return res.status(400).json({ error: 'Proposal is not deleted' });
    }

    await pool.execute(
      'UPDATE proposals SET is_deleted = 0, deleted_at = NULL WHERE id = ?',
      [proposalId]
    );

    await addAuditLog(req, 'RESTORE', 'proposal', proposalId, proposal.title, proposal, null);

    res.json({ success: true, message: 'Proposal restored successfully' });
  } catch (error) {
    console.error('[Invoicing API] Restore proposal error:', error);
    res.status(500).json({ error: 'Failed to restore proposal', message: error.message });
  }
});

// ==================== ENTITY HISTORY ====================

// Get history for a specific entity (proposal, invoice, or client)
router.get('/history/:entityType/:entityId', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { entityType, entityId } = req.params;
    
    // Validate entity type
    const validEntityTypes = ['proposal', 'invoice', 'client'];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }
    
    // Validate entity ID
    if (!entityId || entityId.trim() === '') {
      return res.status(400).json({ error: 'Entity ID is required' });
    }
    
    // Get all audit logs for this entity, ordered by date descending
    const [rows] = await pool.execute(
      `SELECT 
        id, user_id, username, action, entity_type, entity_id, entity_name,
        changes, ip_address, user_agent, created_at
       FROM audit_logs 
       WHERE entity_type = ? AND entity_id = ?
       ORDER BY created_at DESC`,
      [entityType, entityId.trim()]
    );
    
    // Parse JSON changes field
    const history = rows.map(row => {
      let changes = null;
      if (row.changes) {
        try {
          changes = typeof row.changes === 'string' ? JSON.parse(row.changes) : row.changes;
        } catch (parseError) {
          console.warn('[Invoicing API] Failed to parse changes JSON for history entry:', row.id, parseError);
          changes = null;
        }
      }
      
      return {
        id: row.id,
        user_id: row.user_id,
        username: row.username,
        action: row.action,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        entity_name: row.entity_name,
        changes: changes,
        ip_address: row.ip_address,
        user_agent: row.user_agent,
        created_at: row.created_at
      };
    });
    
    res.json({ history });
  } catch (error) {
    console.error('[Invoicing API] Get history error:', error);
    console.error('[Invoicing API] Error details:', {
      entityType: req.params.entityType,
      entityId: req.params.entityId,
      errorMessage: error.message,
      errorStack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch history', message: error.message });
  }
});

// ==================== INVOICES ====================

// Generate invoice number
// Confirmed invoices: WGSS/S/25-26/0001
// Sharing invoices (kaccha bills): WGSS/T/25-26/0001
async function generateInvoiceNumber(pool, invoiceType = 'confirmed') {
  const financialYear = getFinancialYear();
  const typeCode = invoiceType === 'sharing' ? 'T' : 'S';
  const prefix = `WGSS/${typeCode}/${financialYear}/`;
  
  const [rows] = await pool.execute(
    'SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? AND invoice_type = ? ORDER BY invoice_number DESC LIMIT 1',
    [`${prefix}%`, invoiceType]
  );

  let sequence = 1;
  if (rows.length > 0) {
    const lastNumber = rows[0].invoice_number;
    // Extract sequence from format WGSS/S/YY-YY/#### or WGSS/T/YY-YY/####
    const parts = lastNumber.split('/');
    if (parts.length >= 4) {
      const lastSequence = parseInt(parts[3].trim()) || 0;
      sequence = lastSequence + 1;
    }
  }

  return `${prefix}${sequence.toString().padStart(4, '0')}`;
}

router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { status, client_id, search, only_deleted, include_deleted } = req.query;
    let query = `
      SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.company as client_company,
       c.address as client_address, c.city as client_city, c.state as client_state,
       c.country as client_country, c.postal_code as client_postal_code, c.tax_id as client_tax_id,
      (SELECT COALESCE(SUM(amount), 0) FROM invoice_payments WHERE invoice_id = i.id AND (is_deleted = 0 OR is_deleted IS NULL)) as paid_amount
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (only_deleted === 'true') {
      query += ' AND i.is_deleted = 1';
    } else if (include_deleted !== 'true') {
      query += ' AND i.is_deleted = 0';
    }

    if (client_id) {
      query += ' AND i.client_id = ?';
      params.push(client_id);
    }

    if (search) {
      // Smart multi-word search: handles words in any order
      const { buildSmartSearchCondition } = require('../utils/searchHelper');
      const searchFields = ['i.invoice_number', 'i.title', 'c.name'];
      const { condition, params: searchParams } = buildSmartSearchCondition(search, searchFields);
      if (condition) {
        query += ` AND ${condition}`;
        params.push(...searchParams);
      }
    }

    query += ' ORDER BY i.created_at DESC';

    const [rows] = await pool.execute(query, params);
    const invoices = rows.map(row => {
      const invoice = formatDataFromDB(row, ['items']);
      // Update status based on paid amount
      if (invoice.status === 'sent' || invoice.status === 'partial') {
        const paid = parseFloat(invoice.paid_amount || 0);
        const total = parseFloat(invoice.total || 0);
        if (paid >= total) {
          invoice.status = 'paid';
        } else if (paid > 0) {
          invoice.status = 'partial';
        }
      }
      return invoice;
    });
    res.json(invoices);
  } catch (error) {
    console.error('[Invoicing API] Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices', message: error.message });
  }
});

router.get('/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.company as client_company,
       c.address as client_address, c.city as client_city, c.state as client_state,
       c.country as client_country, c.postal_code as client_postal_code, c.tax_id as client_tax_id,
       (SELECT COALESCE(SUM(amount), 0) FROM invoice_payments WHERE invoice_id = i.id AND (is_deleted = 0 OR is_deleted IS NULL)) as paid_amount
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const invoice = formatDataFromDB(rows[0], ['items']);
    res.json(invoice);
  } catch (error) {
    console.error('[Invoicing API] Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice', message: error.message });
  }
});

router.post('/invoices', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const invoiceId = req.body.id || uuidv4();
    const invoiceType = req.body.invoice_type || 'confirmed';
    const invoiceNumber = req.body.invoice_number || await generateInvoiceNumber(pool, invoiceType);

    // Calculate totals with GST-inclusive price support
    const { calculateInvoiceTotals } = require('../utils/calculateInvoiceTotals');
    const items = req.body.items || [];
    const taxRate = parseFloat(req.body.tax_rate || 0);
    const discount = parseFloat(req.body.discount || 0);
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(items, taxRate, discount, invoiceType);

    const data = prepareDataForDB(req.body, [
      'id', 'invoice_number', 'proposal_id', 'client_id', 'title', 'description', 'items',
      'subtotal', 'tax_rate', 'tax_amount', 'discount', 'total', 'currency',
      'issue_date', 'due_date', 'status', 'invoice_type', 'payment_terms', 'notes', 'terms'
    ]);

    data.id = invoiceId;
    data.invoice_number = invoiceNumber;
    data.invoice_type = invoiceType;
    data.subtotal = subtotal;
    // For sharing invoices, don't calculate tax
    if (invoiceType === 'sharing') {
      data.tax_rate = 0;
      data.tax_amount = 0;
      data.total = subtotal - (data.discount || 0);
    } else {
      data.tax_amount = taxAmount;
      data.total = total;
    }
    
    // Check if this invoice is created from a proposal - carry forward all details
    let tokenAmount = 0;
    if (data.proposal_id) {
      // Check if proposal has already been converted to an invoice (that is not deleted)
      const [existingInvoiceRows] = await pool.execute(
        'SELECT id, invoice_number, is_deleted FROM invoices WHERE proposal_id = ? AND is_deleted = 0',
        [data.proposal_id]
      );
      if (existingInvoiceRows.length > 0) {
        return res.status(400).json({ 
          error: 'Proposal already converted', 
          message: `This proposal has already been converted to invoice ${existingInvoiceRows[0].invoice_number}. Please delete the existing invoice first if you want to convert again.`
        });
      }
      
      const [proposalRows] = await pool.execute(
        'SELECT * FROM proposals WHERE id = ?',
        [data.proposal_id]
      );
      if (proposalRows.length > 0) {
        const proposal = formatDataFromDB(proposalRows[0], ['items']);
        
        // Carry forward proposal type to invoice type
        if (!data.invoice_type) {
          data.invoice_type = proposal.proposal_type || 'confirmed';
        }
        
        // Carry forward payment terms
        if (!data.payment_terms && proposal.payment_terms) {
          data.payment_terms = proposal.payment_terms;
        }
        
        // Carry forward advance payment/token amount (for both 'token' and custom payment terms)
        if (proposal.token_amount && parseFloat(proposal.token_amount || 0) > 0) {
          tokenAmount = parseFloat(proposal.token_amount);
        }
        
        // Carry forward notes and terms if not already provided
        if (!data.notes && proposal.notes) {
          data.notes = proposal.notes;
        }
        if (!data.terms && proposal.terms) {
          data.terms = proposal.terms;
        }
        
        // Carry forward warranty details and work completion period
        if (!data.warranty_details && proposal.warranty_details) {
          data.warranty_details = proposal.warranty_details;
        }
        if (!data.work_completion_period && proposal.work_completion_period) {
          data.work_completion_period = proposal.work_completion_period;
        }
      }
    }
    
    data.paid_amount = tokenAmount;
    data.created_by = req.user.userId || req.user.id;

    await pool.execute(
      `INSERT INTO invoices (id, invoice_number, proposal_id, client_id, title, description, items, subtotal, tax_rate, tax_amount, discount, total, currency, issue_date, due_date, status, invoice_type, payment_terms, warranty_details, work_completion_period, notes, terms, paid_amount, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, data.invoice_number, data.proposal_id, data.client_id, data.title, data.description,
        data.items, data.subtotal, data.tax_rate || 0, data.tax_amount, data.discount || 0,
        data.total, data.currency || 'INR', data.issue_date, data.due_date, data.status || 'draft',
        data.invoice_type || 'confirmed', data.payment_terms || null, data.warranty_details || null, data.work_completion_period || null,
        data.notes || null, data.terms || null, data.paid_amount || 0, data.created_by
      ]
    );

    // If advance payment exists, create a payment entry
    if (tokenAmount > 0) {
      const userId = req.user?.id || req.user?.user_id || req.user?.userId || null;
      const paymentNotes = data.proposal_id 
        ? 'Advance payment from proposal'
        : 'Advance payment';
      
      await pool.execute(
        `INSERT INTO invoice_payments (invoice_id, amount, payment_date, payment_method, reference_number, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          invoiceId,
          tokenAmount,
          data.issue_date || new Date().toISOString().split('T')[0],
          'bank_transfer',
          'ADVANCE-PAYMENT',
          paymentNotes,
          userId
        ]
      );
      
      // Update invoice status based on advance payment amount
      if (tokenAmount >= data.total) {
        await pool.execute('UPDATE invoices SET status = ? WHERE id = ?', ['paid', invoiceId]);
        data.status = 'paid';
      } else if (tokenAmount > 0) {
        await pool.execute('UPDATE invoices SET status = ? WHERE id = ?', ['partial', invoiceId]);
        data.status = 'partial';
      }
    }

    await addAuditLog(req, 'CREATE', 'invoice', invoiceId, data.title, null, data);

    res.json({ success: true, id: invoiceId, invoice_number: invoiceNumber, message: 'Invoice created successfully' });
  } catch (error) {
    console.error('[Invoicing API] Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice', message: error.message });
  }
});

router.put('/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const invoiceId = req.params.id;

    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    if (oldRows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const oldData = formatDataFromDB(oldRows[0], ['items']);
    const invoiceType = req.body.invoice_type || oldData.invoice_type || 'confirmed';

    // Calculate totals with GST-inclusive price support
    const { calculateInvoiceTotals } = require('../utils/calculateInvoiceTotals');
    const items = req.body.items || [];
    const taxRate = parseFloat(req.body.tax_rate || 0);
    const discount = parseFloat(req.body.discount || 0);
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(items, taxRate, discount, invoiceType);

    const data = prepareDataForDB(req.body, [
      'proposal_id', 'client_id', 'title', 'description', 'items', 'subtotal', 'tax_rate', 'tax_amount',
      'discount', 'total', 'currency', 'issue_date', 'due_date', 'status', 'invoice_type', 'payment_terms', 'notes', 'terms'
    ]);

    data.subtotal = subtotal;
    data.invoice_type = invoiceType;
    data.tax_rate = taxRate;
    data.tax_amount = taxAmount;
    data.total = total;

    await pool.execute(
      `UPDATE invoices SET proposal_id = ?, client_id = ?, title = ?, description = ?, items = ?, subtotal = ?,
       tax_rate = ?, tax_amount = ?, discount = ?, total = ?, currency = ?, issue_date = ?, due_date = ?,
       status = ?, invoice_type = ?, payment_terms = ?, notes = ?, terms = ?
       WHERE id = ?`,
      [
        data.proposal_id, data.client_id, data.title, data.description, data.items, data.subtotal,
        data.tax_rate || 0, data.tax_amount, data.discount || 0, data.total,
        data.currency || 'INR', data.issue_date, data.due_date, data.status,
        data.invoice_type || 'confirmed', data.payment_terms, data.notes, data.terms, invoiceId
      ]
    );

    await addAuditLog(req, 'UPDATE', 'invoice', invoiceId, data.title, oldData, data);

    res.json({ success: true, message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('[Invoicing API] Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice', message: error.message });
  }
});

router.delete('/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const invoiceId = req.params.id;

    // Get old data for audit log
    const [oldRows] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    if (oldRows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const oldData = formatDataFromDB(oldRows[0], ['items']);

    // Soft delete invoice (keep payments for audit/reporting)
    await pool.execute(
      'UPDATE invoices SET is_deleted = 1, deleted_at = NOW() WHERE id = ?',
      [invoiceId]
    );

    await addAuditLog(req, 'DELETE', 'invoice', invoiceId, oldData.title, oldData, null);

    res.json({ success: true, message: 'Invoice archived successfully' });
  } catch (error) {
    console.error('[Invoicing API] Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice', message: error.message });
  }
});

// Restore invoice
router.post('/invoices/:id/restore', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const invoiceId = req.params.id;

    const [rows] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = rows[0];
    if (!invoice.is_deleted) {
      return res.status(400).json({ error: 'Invoice is not deleted' });
    }

    await pool.execute(
      'UPDATE invoices SET is_deleted = 0, deleted_at = NULL WHERE id = ?',
      [invoiceId]
    );

    await addAuditLog(req, 'RESTORE', 'invoice', invoiceId, invoice.title, invoice, null);

    res.json({ success: true, message: 'Invoice restored successfully' });
  } catch (error) {
    console.error('[Invoicing API] Restore invoice error:', error);
    res.status(500).json({ error: 'Failed to restore invoice', message: error.message });
  }
});

// ==================== INVOICE PAYMENTS ====================

router.get('/invoices/:id/payments', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT ip.*, 
       u.username as created_by_username,
       u.full_name as created_by_full_name,
       deleted_user.username as deleted_by_username,
       deleted_user.full_name as deleted_by_full_name
       FROM invoice_payments ip
       LEFT JOIN admin_users u ON ip.created_by = u.id
       LEFT JOIN admin_users deleted_user ON ip.deleted_by = deleted_user.id
       WHERE ip.invoice_id = ? AND (ip.is_deleted = 0 OR ip.is_deleted IS NULL) 
       ORDER BY ip.payment_date DESC, ip.created_at DESC`,
      [req.params.id]
    );
    const payments = rows.map(row => formatDataFromDB(row, []));
    res.json(payments);
  } catch (error) {
    console.error('[Invoicing API] Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments', message: error.message });
  }
});

router.post('/invoices/:id/payments', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const invoiceId = req.params.id;
    const { amount, payment_date, payment_method, reference_number, notes } = req.body;

    // Verify invoice exists
    const [invoices] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    if (invoices.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    // Insert payment
    const userId = req.user?.id || req.user?.user_id || req.user?.userId || null;
    await pool.execute(
      `INSERT INTO invoice_payments (invoice_id, amount, payment_date, payment_method, reference_number, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoiceId, paymentAmount, payment_date, payment_method || 'bank_transfer', reference_number, notes, userId]
    );

    // Update invoice paid amount and status
    const [paymentRows] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as total_paid FROM invoice_payments WHERE invoice_id = ? AND is_deleted = 0',
      [invoiceId]
    );
    const totalPaid = parseFloat(paymentRows[0].total_paid);
    const invoiceTotal = parseFloat(invoices[0].total);

    let newStatus = invoices[0].status;
    if (totalPaid >= invoiceTotal) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      // If there's any payment, set to partial (unless already paid or cancelled)
      if (invoices[0].status !== 'paid' && invoices[0].status !== 'cancelled' && invoices[0].status !== 'refunded') {
        newStatus = 'partial';
      }
    } else if (totalPaid === 0) {
      // If all payments are removed, revert to sent (if it was sent/partial before)
      if (invoices[0].status === 'partial' || invoices[0].status === 'paid') {
        newStatus = 'sent';
      }
    }

    await pool.execute(
      'UPDATE invoices SET paid_amount = ?, status = ? WHERE id = ?',
      [totalPaid, newStatus, invoiceId]
    );

    await addAuditLog(req, 'CREATE', 'payment', invoiceId, `Payment of ${paymentAmount}`, null, req.body);

    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('[Invoicing API] Create payment error:', error);
    res.status(500).json({ error: 'Failed to record payment', message: error.message });
  }
});

router.delete('/invoices/:id/payments/:paymentId', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { id: invoiceId, paymentId } = req.params;
    const userId = req.user?.id || req.user?.user_id || req.user?.userId || null;

    // Get payment details before soft deletion for audit log
    const [paymentRows] = await pool.execute(
      'SELECT * FROM invoice_payments WHERE id = ? AND invoice_id = ?',
      [paymentId, invoiceId]
    );
    
    if (paymentRows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const paymentToDelete = paymentRows[0];

    // Check if already deleted
    if (paymentToDelete.is_deleted) {
      return res.status(400).json({ error: 'Payment has already been deleted' });
    }

    // Soft delete payment (mark as deleted instead of actually deleting)
    // Ensure userId is null (not undefined) if not available
    const deletedBy = userId || null;
    await pool.execute(
      'UPDATE invoice_payments SET is_deleted = 1, deleted_by = ?, deleted_at = NOW() WHERE id = ? AND invoice_id = ?',
      [deletedBy, paymentId, invoiceId]
    );

    // Log payment deletion
    await addAuditLog(req, 'DELETE', 'payment', invoiceId, `Payment of ${paymentToDelete.amount} deleted`, paymentToDelete, { ...paymentToDelete, is_deleted: 1, deleted_by: deletedBy, deleted_at: new Date() });

    // Update invoice paid amount and status (only count non-deleted payments)
    const [totalPaymentRows] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as total_paid FROM invoice_payments WHERE invoice_id = ? AND is_deleted = 0',
      [invoiceId]
    );
    const totalPaid = parseFloat(totalPaymentRows[0].total_paid);

    const [invoices] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    if (invoices.length > 0) {
      const invoiceTotal = parseFloat(invoices[0].total);
      let newStatus = invoices[0].status;
      if (totalPaid >= invoiceTotal) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        // If there's any payment, set to partial (unless already cancelled/refunded)
        if (invoices[0].status !== 'cancelled' && invoices[0].status !== 'refunded') {
          newStatus = 'partial';
        }
      } else if (totalPaid === 0) {
        // If all payments are removed, revert to sent (if it was sent/partial/paid before)
        if (invoices[0].status === 'partial' || invoices[0].status === 'paid') {
          newStatus = 'sent';
        }
      }

      await pool.execute(
        'UPDATE invoices SET paid_amount = ?, status = ? WHERE id = ?',
        [totalPaid, newStatus, invoiceId]
      );
    }

    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('[Invoicing API] Delete payment error:', error);
    res.status(500).json({ error: 'Failed to delete payment', message: error.message });
  }
});

// ==================== DASHBOARD STATISTICS ====================

// Get dashboard statistics
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { period = '30' } = req.query; // days
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Invoice statistics
    const [invoiceStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_invoices,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial_count,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count,
        SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END) as pending_approval_count,
        SUM(CASE WHEN status = 'disputed' THEN 1 ELSE 0 END) as disputed_count,
        SUM(total) as total_revenue,
        SUM(paid_amount) as total_paid,
        SUM(total - paid_amount) as total_outstanding
      FROM invoices
      WHERE is_deleted = 0
        AND created_at >= ?
    `, [startDate.toISOString().split('T')[0]]);

    // Sales trend (last 12 months)
    const [salesTrend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as invoice_count,
        SUM(total) as revenue,
        SUM(paid_amount) as paid
      FROM invoices
      WHERE is_deleted = 0
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Recent invoices
    const [recentInvoices] = await pool.execute(`
      SELECT 
        i.id,
        i.invoice_number,
        i.title,
        i.total,
        i.status,
        i.due_date,
        i.created_at,
        c.name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.is_deleted = 0
      ORDER BY i.created_at DESC
      LIMIT 5
    `);

    // Overdue invoices
    const [overdueInvoices] = await pool.execute(`
      SELECT 
        i.id,
        i.invoice_number,
        i.title,
        i.total,
        i.paid_amount,
        i.due_date,
        DATEDIFF(NOW(), i.due_date) as days_overdue,
        c.name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.is_deleted = 0
        AND i.status IN ('sent', 'partial', 'overdue')
        AND i.due_date < CURDATE()
        AND (i.total - COALESCE(i.paid_amount, 0)) > 0
      ORDER BY i.due_date ASC
      LIMIT 10
    `);

    // Client statistics
    const [clientStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_clients,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_clients
      FROM clients
      WHERE is_deleted = 0
    `);

    // Proposal statistics
    const [proposalStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_proposals,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_count
      FROM proposals
      WHERE is_deleted = 0
        AND created_at >= ?
    `, [startDate.toISOString().split('T')[0]]);

    res.json({
      invoices: invoiceStats[0] || {},
      sales_trend: salesTrend,
      recent_invoices: recentInvoices.map(row => formatDataFromDB(row, [])),
      overdue_invoices: overdueInvoices.map(row => formatDataFromDB(row, [])),
      clients: clientStats[0] || {},
      proposals: proposalStats[0] || {},
      period_days: periodDays
    });
  } catch (error) {
    console.error('[Invoicing API] Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics', message: error.message });
  }
});

// ==================== INVOICE REMINDERS ====================

// Get reminders for an invoice
router.get('/invoices/:id/reminders', authenticateToken, async (req, res) => {
  try {
    const reminders = await reminderService.getInvoiceReminders(req.params.id);
    res.json(reminders);
  } catch (error) {
    console.error('[Invoicing API] Get reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders', message: error.message });
  }
});

// Create a reminder
router.post('/invoices/:id/reminders', authenticateToken, async (req, res) => {
  try {
    const { reminder_type, reminder_date, days_before_after } = req.body;
    
    if (!reminder_type || !reminder_date) {
      return res.status(400).json({ error: 'reminder_type and reminder_date are required' });
    }
    
    const result = await reminderService.createReminder(
      req.params.id,
      reminder_type,
      reminder_date,
      days_before_after || 0,
      req.user.userId || req.user.id
    );
    
    res.json(result);
  } catch (error) {
    console.error('[Invoicing API] Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder', message: error.message });
  }
});

// Send reminder email immediately
router.post('/invoices/:id/reminders/:reminderId/send', authenticateToken, async (req, res) => {
  try {
    const result = await reminderService.sendReminderEmail(req.params.id, req.params.reminderId);
    res.json(result);
  } catch (error) {
    console.error('[Invoicing API] Send reminder error:', error);
    res.status(500).json({ error: 'Failed to send reminder', message: error.message });
  }
});

// Send reminder email (without reminder record)
router.post('/invoices/:id/send-reminder', authenticateToken, async (req, res) => {
  try {
    const result = await reminderService.sendReminderEmail(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('[Invoicing API] Send reminder error:', error);
    res.status(500).json({ error: 'Failed to send reminder', message: error.message });
  }
});

// Delete a reminder
router.delete('/invoices/:id/reminders/:reminderId', authenticateToken, async (req, res) => {
  try {
    const result = await reminderService.deleteReminder(req.params.reminderId);
    res.json(result);
  } catch (error) {
    console.error('[Invoicing API] Delete reminder error:', error);
    res.status(500).json({ error: 'Failed to delete reminder', message: error.message });
  }
});

module.exports = router;

const { getPool } = require('../db');

/**
 * Audit Log Middleware
 * Logs all CRUD operations for audit trail
 */
async function logAudit(req, action, entityType, entityId, entityName = null, changes = null) {
  try {
    const pool = getPool();
    const user = req.user; // Set by authenticateToken middleware
    
    if (!user || !user.userId) {
      // Skip logging if no user (shouldn't happen with protected routes)
      return;
    }

    // Get IP address
    const ipAddress = req.ip || 
                     req.connection?.remoteAddress || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 
                     'unknown';
    
    // Get user agent
    const userAgent = req.headers['user-agent'] || null;

    await pool.execute(
      `INSERT INTO audit_logs 
       (user_id, username, action, entity_type, entity_id, entity_name, changes, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.userId,
        user.username || 'unknown',
        action, // CREATE, UPDATE, DELETE
        entityType, // 'category', 'brand', 'product', etc.
        entityId || null,
        entityName || null,
        changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('[Audit Log] Failed to log action:', error);
  }
}

/**
 * Middleware to extract entity name from request body
 */
function getEntityName(req, entityType) {
  const body = req.body;
  
  // Common field names for entity names
  if (body.name) return body.name;
  if (body.title) return body.title;
  if (body.username) return body.username;
  
  return null;
}

/**
 * Helper to create audit log wrapper for routes
 */
function createAuditLogger(action, entityType) {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json to log after successful response
    res.json = function(data) {
      // Only log if successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300 && data.success !== false) {
        const entityId = req.params.id || req.body.id || null;
        const entityName = getEntityName(req, entityType);
        
        // For UPDATE, try to get old values for comparison
        let changes = null;
        if (action === 'UPDATE' && req.oldData) {
          changes = {
            before: req.oldData,
            after: req.body
          };
        } else if (action === 'CREATE') {
          changes = {
            created: req.body
          };
        } else if (action === 'DELETE') {
          changes = {
            deleted: req.oldData || { id: entityId }
          };
        }
        
        // Log asynchronously (don't wait)
        logAudit(req, action, entityType, entityId, entityName, changes).catch(err => {
          console.error('[Audit Log] Error:', err);
        });
      }
      
      // Call original json method
      return originalJson(data);
    };
    
    next();
  };
}

module.exports = {
  logAudit,
  createAuditLogger,
  getEntityName
};




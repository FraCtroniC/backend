const { AuditLog, User, Role } = require('../models');

let cachedAdminId = null;

async function getFallbackUserId() {
  if (cachedAdminId) return cachedAdminId;
  try {
    let admin = await User.findOne({
      where: { username: 'fabian' }
    });
    if (!admin) {
      admin = await User.findOne({
        include: [{
          model: Role,
          where: { name_role: 'Admin' }
        }]
      });
    }
    if (admin) {
      cachedAdminId = admin.id_user;
      return cachedAdminId;
    }
  } catch (err) {
    console.error('Failed to get fallback admin ID for AuditLog:', err);
  }
  return null;
}

async function logActivity(req, { action, tableAffected, recordId, newValue, oldValue = null }) {
  try {
    let id_user = req?.auth?.sub;
    if (!id_user) {
      id_user = await getFallbackUserId();
    }
    
    if (!id_user) {
      console.warn(`Cannot write AuditLog for table ${tableAffected}: no user ID found.`);
      return null;
    }

    const log = await AuditLog.create({
      id_user,
      action,
      table_affected: tableAffected,
      record_id: String(recordId),
      old_value: oldValue ? (typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)) : null,
      new_value: newValue ? (typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)) : null
    });
    return log;
  } catch (err) {
    console.error('Error writing AuditLog:', err);
    return null;
  }
}

module.exports = { logActivity };

/**
 * Middleware to check if the authenticated user has one of the allowed roles.
 * Must be used AFTER authMiddleware so that req.user is available.
 *
 * Usage: router.get('/admin-only', authMiddleware, authorizeRoles('admin', 'admin_restrito'), handler);
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ msg: "Acesso negado. Permissão insuficiente." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Acesso negado. Permissão insuficiente." });
    }

    next();
  };
}

module.exports = authorizeRoles;

const AuditLog = require('../models/AuditLog');

const auditMiddleware = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    // Só registra ações de escrita (POST, PUT, PATCH, DELETE) de admin_restrito
    const isWriteAction = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const isAdminRestrito = req.user && req.user.role === 'admin_restrito';

    if (isWriteAction && isAdminRestrito && res.statusCode < 400) {
      const action = `${req.method} ${req.originalUrl}`;
      AuditLog.create({
        userId: req.user.id,
        action,
        details: {
          body: req.body,
          params: req.params
        }
      }).then(log => {
        // Emitir notificação em tempo real para admins
        const io = req.app.get('io');
        if (io) {
          io.emit('adminLog', {
            _id: log._id,
            action,
            userName: req.user.nome || 'Admin Restrito',
            userId: req.user.id,
            details: { body: req.body },
            timestamp: log.timestamp
          });
        }
      }).catch(err => console.error('Erro ao salvar audit log:', err));
    }

    return originalJson(data);
  };

  next();
};

module.exports = auditMiddleware;

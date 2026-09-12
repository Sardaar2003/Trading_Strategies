const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const {
  getSystemLogs,
  getAllUsers,
  updateUserRole,
  getSystemStats,
  deleteUser
} = require('../controllers/developerController');

// All developer routes require authentication AND 'developer' role via RBAC middleware
router.use(isAuthenticated);
router.use(authorize('developer'));

router.get('/logs', getSystemLogs);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/stats', getSystemStats);

module.exports = router;

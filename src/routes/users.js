const router = require('express').Router();
const { getCurrent, getHistory, resolveDeepLink } = require('../controllers/userController');

// ✅ PUT SPECIFIC ROUTE FIRST
router.get('/questions/:questionId', resolveDeepLink);

// ✅ THEN GENERIC ROUTES
router.get('/:userId/current', getCurrent);
router.get('/:userId/history', getHistory);

module.exports = router;
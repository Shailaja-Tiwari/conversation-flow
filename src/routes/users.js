const router = require('express').Router();
const { getCurrent, getHistory, resolveDeepLink } = require('../controllers/userController');

router.get('/questions/:questionId', resolveDeepLink);
router.get('/:userId/current', getCurrent);
router.get('/:userId/history', getHistory);

module.exports = router;
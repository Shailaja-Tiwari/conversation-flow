const router = require('express').Router();
const { goBackHandler } = require('../controllers/goBackController');

router.post('/', goBackHandler);

module.exports = router;
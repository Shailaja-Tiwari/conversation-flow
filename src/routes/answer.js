const router = require('express').Router();
const { answer } = require('../controllers/answerController');

router.post('/', answer);

module.exports = router;
const router = require('express').Router();
const { startModule } = require('../controllers/moduleController');

router.post('/:moduleId/start', startModule);

module.exports = router;
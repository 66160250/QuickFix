const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/', employeeController.getDashboard);
router.get('/dashboard', employeeController.getDashboard);
router.post('/update-status', employeeController.updateStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// หน้าแรก: แดชบอร์ดสรุปรายได้ + ระบบชำระเงิน
router.get('/dashboard', adminController.getDashboard);

// หน้าจัดการคิว/สถานะ + มอบหมายพนักงาน
router.get('/manage', adminController.getManageQueue);

// Action Process
router.post('/update-status', adminController.updateStatus);
router.post('/admin/update-status', adminController.updateStatus);
router.post('/process-payment', adminController.processPayment);

module.exports = router;
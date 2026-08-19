const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

// 1. หน้าแรก / หน้าจองคิว (เมื่อเข้า /user หรือ /user/booking)
router.get('/', indexController.getBookingPage);
router.get('/booking', indexController.getBookingPage); // << เพิ่มบรรทัดนี้เพื่อรองรับ GET /user/booking
router.post('/booking', indexController.postBooking);   // POST /user/booking

// 2. หน้าสรุปการนัดหมายเสร็จสิ้น (GET /user/booking-success/:id)
router.get('/booking-success/:id', indexController.getBookingSuccess);

// 3. หน้าสถานะการดำเนินการ (GET /user/status)
router.get('/status', indexController.getStatusPage);

// 4. หน้าประวัติบริการ (GET /user/history)
router.get('/history', indexController.getHistoryPage);

// 5. หน้าเกี่ยวกับเรา (GET /user/about)
router.get('/about', indexController.getAboutPage);

module.exports = router;
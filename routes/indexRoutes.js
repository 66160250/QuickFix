const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

// 1. หน้าแรก / หน้าจองคิว
router.get('/', indexController.getBookingPage);
router.get('/user', indexController.getBookingPage);
router.post('/booking', indexController.postBooking);
router.post('/user/booking', indexController.postBooking);

// 2. หน้าสรุปการนัดหมายเสร็จสิ้น (ดักไว้ทั้งแบบมีและไม่มี /user)
router.get('/booking-success/:id', indexController.getBookingSuccess);
router.get('/user/booking-success/:id', indexController.getBookingSuccess);

// 3. หน้าสถานะการดำเนินการ (Status)
router.get('/status', indexController.getStatusPage);
router.get('/user/status', indexController.getStatusPage);

// 4. หน้าประวัติบริการ (History)
router.get('/history', indexController.getHistoryPage);
router.get('/user/history', indexController.getHistoryPage);

// 5. หน้าเกี่ยวกับเรา (About Us)
router.get('/about', indexController.getAboutPage);
router.get('/user/about', indexController.getAboutPage);

module.exports = router;
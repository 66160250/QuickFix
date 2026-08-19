const db = require('../config/db');

// 1. ดึงข้อมูลตารางงาน
exports.getDashboard = async (req, res) => {
    try {
        const currentUser = req.session ? req.session.user : null;

        if (!currentUser) {
            return res.redirect('/auth/login');
        }

        const currentTab = req.query.tab || 'all';

        // ดึงรายการงานทั้งหมด
        const [allBookings] = await db.query(
            'SELECT * FROM bookings ORDER BY id DESC'
        );

        // ดึงเฉพาะงานของช่างคนที่ Login (เช็กจาก ID หรือ ชื่อ/Username)
        const staffId = currentUser.id || 0;
        const staffName = currentUser.full_name || currentUser.username || '';

        const [bookings] = await db.query(
            'SELECT * FROM bookings WHERE assigned_staff_id = ? OR (assigned_staff_name = ? AND assigned_staff_name != \'\') ORDER BY id DESC',
            [user.id, user.full_name]
        );

        const bookings = (currentTab === 'my') ? myBookings : allBookings;

        res.render('employee/dashboard', {
            user: currentUser,
            bookings: bookings,
            allBookings: allBookings,
            myBookings: myBookings,
            currentTab: currentTab
        });
    } catch (err) {
        console.error('Employee Dashboard Error:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลตารางงาน');
    }
};

// 2. อัปเดตสถานะงานจากฝั่ง Staff (แก้ไขให้รองรับทั้ง booking_id และ bookingId)
exports.updateStatus = async (req, res) => {
    // ดึงค่า ID โดยรองรับทั้ง booking_id (snake_case) และ bookingId (camelCase)
    const bookingId = req.body.booking_id || req.body.bookingId;
    const status = req.body.status;

    try {
        if (!bookingId) {
            console.error('❌ ไม่พบ ID ของคิวงานใน req.body');
            return res.status(400).send('ไม่พบ ID งานที่ต้องการอัปเดต');
        }

        await db.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, bookingId]
        );

        // รีไดเรกต์กลับไปหน้าเดิมที่กด (คงหน้าแท็บปัจจุบันไว้)
        const backUrl = req.get('Referrer') || '/employee/dashboard';
        res.redirect(backUrl);
    } catch (err) {
        console.error('Employee Update Status Error:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
};
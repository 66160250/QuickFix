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

        // กำหนดข้อมูลช่างที่ Login
        const staffId = currentUser.id || 0;
        const staffName = currentUser.full_name || currentUser.username || '';

        // ดึงเฉพาะงานของช่างคนที่ Login (แก้ใช้ staffId, staffName และเปลี่ยนชื่อตัวแปรเป็น myBookings)
        const [myBookings] = await db.query(
            'SELECT * FROM bookings WHERE assigned_staff_id = ? OR (assigned_staff_name = ? AND assigned_staff_name != \'\') ORDER BY id DESC',
            [staffId, staffName]
        );

        // เลือกชุดข้อมูลที่จะนำไปแสดงผลตาม Tab
        const displayBookings = (currentTab === 'my') ? myBookings : allBookings;

        res.render('employee/dashboard', {
            user: currentUser,
            bookings: displayBookings,
            allBookings: allBookings,
            myBookings: myBookings,
            currentTab: currentTab
        });
    } catch (err) {
        console.error('Employee Dashboard Error:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลตารางงาน');
    }
};

// 2. อัปเดตสถานะงานจากฝั่ง Staff (รองรับทั้ง booking_id และ bookingId)
exports.updateStatus = async (req, res) => {
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

        // รีไดเรกต์กลับไปหน้าเดิมที่กด
        const backUrl = req.get('Referrer') || '/employee/dashboard';
        res.redirect(backUrl);
    } catch (err) {
        console.error('Employee Update Status Error:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
};
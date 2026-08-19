const db = require('../config/db');

// 1. สร้างคิวการจองใหม่ (POST /api/booking)
exports.createBooking = async (req, res) => {
    try {
        const {
            customer_name,
            customer_phone,
            car_type,
            car_brand,
            car_model,
            license_plate,
            province,
            service_id
        } = req.body;

        // ดึงข้อมูลบริการจาก Database
        const [serviceRows] = await db.query('SELECT * FROM services WHERE id = ?', [service_id]);
        if (serviceRows.length === 0) {
            return res.status(400).send('ไม่พบรายการบริการที่เลือก');
        }
        const service = serviceRows[0];

        // รันเลขคิวอัตโนมัติประจำวัน (เช่น Q-001, Q-002)
        const today = new Date().toISOString().split('T')[0];
        const [countRows] = await db.query('SELECT COUNT(*) as total FROM bookings WHERE booking_date = ?', [today]);
        const queueNum = String(countRows[0].total + 1).padStart(3, '0');
        const booking_code = `Q-${queueNum}`;

        // บันทึกลงตาราง bookings
        const [result] = await db.query(
            `INSERT INTO bookings 
            (booking_code, customer_name, customer_phone, car_type, car_brand, car_model, license_plate, province, service_id, service_program, status, booking_date, start_time, end_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', CURRENT_DATE(), CURRENT_TIME(), ADDTIME(CURRENT_TIME(), '01:00:00'))`,
            [booking_code, customer_name, customer_phone, car_type, car_brand, car_model, license_plate, province, service_id, service.service_name]
        );

        // บันทึก Log แรกสำหรับหน้าประวัติ
        await db.query(
            `INSERT INTO history_logs (booking_id, title, description) VALUES (?, ?, ?)`,
            [result.insertId, 'แจ้งเตือนการเข้ารับบริการ', `ระบบได้รับการจองคิว ${booking_code} เรียบร้อยแล้ว`]
        );

        // Redirect ไปหน้าแสดงสถานะคิว
        res.redirect(`/status?code=${booking_code}`);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
};

// 2. ดึงข้อมูลสถานะคิวเรียลไทม์ (GET /status)
exports.getBookingStatus = async (req, res) => {
    try {
        const bookingCode = req.query.code;

        let booking = null;
        if (bookingCode) {
            // ดึงตามรหัสคิวระบุเฉพาะ
            const [rows] = await db.query(
                `SELECT b.*, u.full_name as staff_name 
                 FROM bookings b 
                 LEFT JOIN users u ON b.assigned_staff_id = u.id 
                 WHERE b.booking_code = ?`, 
                [bookingCode]
            );
            booking = rows[0] || null;
        } else {
            // หากไม่มีการระบุรหัส ให้ดึงคิวล่าสุดมาโชว์ พร้อม JOIN เอาชื่อพนักงานด้วย!
            const [latestRows] = await db.query(
                `SELECT b.*, u.full_name as staff_name 
                 FROM bookings b 
                 LEFT JOIN users u ON b.assigned_staff_id = u.id 
                 ORDER BY b.id DESC LIMIT 1`
            );
            booking = latestRows[0] || null;
        }

        res.render('user/status', { 
            page: 'status', 
            booking: booking 
        });
    } catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลสถานะ');
    }
};

// 3. ดึงประวัติการรับบริการ (GET /history)
exports.getBookingHistory = async (req, res) => {
    try {
        const [logs] = await db.query(
            `SELECT h.*, b.booking_code, b.car_brand, b.car_model, b.license_plate, b.service_program 
             FROM history_logs h
             JOIN bookings b ON h.booking_id = b.id
             ORDER BY h.created_at DESC`
        );

        res.render('user/history', { 
            page: 'history', 
            logs: logs 
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงประวัติ');
    }
};
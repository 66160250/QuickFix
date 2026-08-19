const db = require('../config/db');

// 1. หน้าแรก (Dashboard) - แสดงการ์ดสรุปรายได้ + ตารางคิดเงิน/ชำระเงิน
exports.getDashboard = async (req, res) => {
    try {
        const [bookings] = await db.query('SELECT * FROM bookings ORDER BY id DESC');
        
        // คำนวณจำนวนคิว
        const total = bookings.length;
        const pending = bookings.filter(b => (b.status || '').trim().toLowerCase() === 'pending').length;
        const inProgress = bookings.filter(b => ['in-progress', 'inspecting'].includes((b.status || '').trim().toLowerCase())).length;
        const completed = bookings.filter(b => (b.status || '').trim().toLowerCase() === 'completed').length;

        // คำนวณสรุปรายได้ (คิดเฉพาะรายการที่ชำระเงินแล้ว 'paid')
        let totalRevenue = 0;
        let totalExpense = 0;
        let totalNetIncome = 0;

        bookings.forEach(b => {
            if (b.payment_status === 'paid') {
                totalRevenue += Number(b.total_price || 0);
                totalExpense += Number(b.expense || 0);
                totalNetIncome += Number(b.net_income || 0);
            }
        });

        res.render('admin/dashboard', {
            bookings,
            page: 'dashboard',
            stats: { total, pending, inProgress, completed, totalRevenue, totalExpense, totalNetIncome }
        });
    } catch (err) {
        console.error('Admin Dashboard Error:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการโหลดข้อมูลแดชบอร์ด');
    }
};

// 2. หน้าจัดการคิว/สถานะ - ตารางคิว มอบหมายพนักงาน และเปลี่ยนสถานะ
exports.getManageQueue = async (req, res) => {
    try {
        const [bookings] = await db.query('SELECT * FROM bookings ORDER BY id DESC');
        // ดึงรายชื่อพนักงานจากตาราง users
        const [staffs] = await db.query("SELECT * FROM users WHERE role = 'employee' OR role = 'staff'");

        res.render('admin/manage', {
            bookings,
            staffs,
            page: 'manage'
        });
    } catch (err) {
        console.error('Admin Manage Queue Error:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการโหลดหน้าจัดการคิว');
    }
};

// 3. อัปเดตสถานะงาน + พนักงานที่รับผิดชอบ
exports.updateStatus = async (req, res) => {
    try {
        const { booking_id, status, assigned_staff } = req.body;
        
        let staffId = null;
        let staffName = '';

        if (assigned_staff && assigned_staff !== '') {
            const [staffRows] = await db.query('SELECT id, full_name, username FROM users WHERE id = ?', [assigned_staff]);
            if (staffRows.length > 0) {
                staffId = staffRows[0].id;
                staffName = staffRows[0].full_name || staffRows[0].username;
            }
        }

        await db.query(
            'UPDATE bookings SET status = ?, assigned_staff_id = ?, assigned_staff_name = ? WHERE id = ?',
            [status, staffId, staffName, booking_id]
        );

        res.redirect('/admin/manage');
    } catch (err) {
        console.error('❌ Update Status Error:', err);
        res.status(500).send('ไม่สามารถเปลี่ยนสถานะได้: ' + err.message);
    }
};

// 4. บันทึกการชำระเงิน
exports.processPayment = async (req, res) => {
    try {
        // รองรับทั้ง bookingId, booking_id และ booking_code
        const targetId = req.body.bookingId || req.body.booking_id || req.body.booking_code;
        
        // รับและแปลงค่าตัวเลข (ป้องกัน NaN)
        const totalPrice = Number(req.body.total_price || req.body.totalPrice || 0);
        const expense = Number(req.body.expense || 0);
        const netIncome = Number(req.body.net_income || req.body.netIncome || (totalPrice - expense));

        if (!targetId) {
            console.error('❌ ไม่พบ ID หรือ Booking Code ใน req.body');
            return res.status(400).send('ไม่พบข้อมูลรายการที่ต้องการชำระเงิน');
        }

        // อัปเดตข้อมูลโดยเช็กทั้ง id และ booking_code
        const sql = `
            UPDATE bookings 
            SET 
                total_price = ?, 
                expense = ?, 
                net_income = ?, 
                payment_status = 'paid',
                status = 'completed'
            WHERE id = ? OR booking_code = ?
        `;

        const [result] = await db.query(sql, [
            totalPrice, 
            expense, 
            netIncome, 
            targetId, 
            targetId
        ]);

        console.log(`✅ ชำระเงินสำเร็จ (อัปเดตไป ${result.affectedRows} แถว)`);

        // รีไดเรกต์กลับหน้าเดิม
        const backUrl = req.get('Referrer') || '/admin/dashboard';
        res.redirect(backUrl);

    } catch (err) {
        console.error('❌ Process Payment Error:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการบันทึกชำระเงิน: ' + err.message);
    }
};
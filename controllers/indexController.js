const db = require('../config/db');

// 1. หน้าแบบฟอร์มการนัดหมาย
exports.getBookingPage = async (req, res) => {
    try {
        const user = req.session ? (req.session.user || { id: null, full_name: '', phone: '' }) : { id: null, full_name: '', phone: '' };
        res.render('user/booking', { 
            page: 'home',
            user: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('เกิดข้อผิดพลาดในการโหลดหน้าจอง');
    }
};

// 2. บันทึกการนัดหมาย
exports.postBooking = async (req, res) => {
    try {
        const {
            booking_code,
            service_id,
            customer_name,
            customer_phone,
            car_brand,
            car_model,
            license_plate,
            province,
            service_program,
            time_slot,
            booking_date
        } = req.body;

        // แก้ไข SQL โดยเพิ่ม phone_number เข้าไปในคอลัมน์และ VALUES
        const sql = `
            INSERT INTO bookings (
                booking_code, service_id, customer_name, customer_phone, phone_number,
                car_brand, car_model, license_plate, province, 
                service_program, time_slot, booking_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        await db.query(sql, [
            booking_code,
            service_id,
            customer_name,
            customer_phone,
            customer_phone, // ส่ง customer_phone เข้า phone_number ด้วย
            car_brand,
            car_model,
            license_plate,
            province,
            service_program,
            time_slot,
            booking_date
        ]);

        res.redirect('/user/booking-success');
    } catch (err) {
        console.error('--- BOOKING ERROR LOG ---', err);
        res.status(500).send('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    }
};

// 3. หน้าสรุปการนัดหมายเสร็จสิ้น
exports.getBookingSuccess = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
        
        if (rows.length === 0) {
            return res.redirect('/');
        }

        res.render('user/booking-success', { 
            booking: rows[0],
            page: 'home' 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
};

// 4. หน้าแสดงสถานะปัจจุบัน (Status) - ดึงคิวล่าสุดที่กำลังรับบริการอยู่
exports.getStatusPage = async (req, res) => {
    try {
        // ดึงรายการที่ยังไม่จบงาน (ยังไม่เสร็จสิ้น และ ยังไม่ยกเลิก)
        const [bookings] = await db.query(
            "SELECT * FROM bookings WHERE status NOT IN ('completed', 'cancelled') ORDER BY id DESC LIMIT 1"
        );

        res.render('user/status', {
            booking: bookings[0] || null,
            page: 'status'
        });
    } catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).send('Database Error');
    }
};

// 5. หน้าแสดงประวัติการรับบริการย้อนหลัง (History) - ดึงรายการทั้งหมด
exports.getHistoryPage = async (req, res) => {
    try {
        // ดึงรายการจองทั้งหมดเรียงจากใหม่ไปเก่า
        const [rows] = await db.query('SELECT * FROM bookings ORDER BY id DESC');

        res.render('user/history', {
            page: 'history',
            bookings: rows
        });
    } catch (err) {
        console.error('--- FETCH HISTORY ERROR ---', err);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลประวัติ: ' + err.message);
    }
};

// 6. หน้าเกี่ยวกับเรา (About Us)
exports.getAboutPage = (req, res) => {
    res.render('user/about', {
        page: 'about',
        shopInfo: {
            name: "Quick Fix Car Care & Service",
            description: "ศูนย์บริการล้างรถ ดูแลรักษารถยนต์ และตรวจเช็กซ่อมบำรุงแบบครบวงจร ด้วยอุปกรณ์มาตรฐานระดับพรีเมียม และทีมงานผู้เชี่ยวชาญ",
            openHours: "เปิดบริการทุกวัน 08:30 - 18:00 น.",
            address: "123/45 ถนนสุขุมวิท อ.เมือง จ.ชลบุรี 20000",
            phone: "064-137-2757",
            line: "@quickfixcarcare",
            services: [
                { name: "ล้างอัดฉีด (30 นาที)", desc: "ล้างทำความสะอาดภายนอก อัดฉีดซุ้มล้อ และลงแว็กซ์เงายาง" },
                { name: "ล้าง ดูดฝุ่น ทำความสะอาดภายใน (2 ชม.)", desc: "ล้างภายนอก ดูดฝุ่น สตรีมฆ่าเชื้อ และทำความสะอาดเบาะ/คอนโซล" },
                { name: "ขัดเคลือบเงา / แว็กซ์ทั่วไป (3 ชม.)", desc: "ขัดคราบไคล ลบรอยขนแมวบางๆ และเคลือบแว็กซ์ป้องกันสีรถ" },
                { name: "เปลี่ยนถ่ายน้ำมันเครื่อง (45 นาที)", desc: "เปลี่ยนถ่ายน้ำมันเครื่อง พร้อมเปลี่ยนกรองน้ำมันเครื่องและตรวจเช็กสภาพทั่วไป 30 รายการ" },
                { name: "ตรวจเช็กและเปลี่ยนถ่ายน้ำมันเบรก (40 นาที)", desc: "ตรวจสอบประสิทธิภาพน้ำมันเบรก ไล่ลมเบรก และเปลี่ยนถ่ายน้ำมันเบรกใหม่เต็มระบบ" },
                { name: "เปลี่ยนผ้าเบรก / จานเบรก (1.5 ชม.)", desc: "ถอดเปลี่ยนผ้าเบรกหน้า-หลัง เจียรจานเบรก และทำความสะอาดระบบเบรก" },
                { name: "เปลี่ยนแบตเตอรี่รถยนต์ (30 นาที)", desc: "ตรวจเช็กค่า CCA บริการเปลี่ยนแบตเตอรี่ใหม่พร้อมสำรองไฟระบบอิเล็กทรอนิกส์" },
                { name: "ตั้งศูนย์ - ถ่วงล้อ / สลับยาง (1 ชม.)", desc: "ตั้งศูนย์ด้วยระบบเลเซอร์ ถ่วงล้อ 4 ล้อ และสลับยางเพื่อยืดอายุการใช้งาน" }
            ]
        }
    });
};
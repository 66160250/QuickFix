const db = require('../config/db');

// หน้าเลือก/เข้าสู่ระบบหลัก
exports.getLoginPage = (req, res) => {
    res.render('auth/login', { error: null });
};

// หน้าสมัครสมาชิกฝั่ง User
exports.getRegisterPage = (req, res) => {
    res.render('auth/register', { error: null });
};

// POST เข้าสู่ระบบ (เช็กบทบาทอัตโนมัติ)
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
        if (rows.length === 0 || rows[0].password !== password) {
            return res.render('auth/login', { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const user = rows[0];
        req.session.user = user;

        // Redirect ตามบทบาท (Role)
        if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else if (user.role === 'staff' || user.role === 'employee') { // รองรับทั้ง staff และ employee
            res.redirect('/employee/dashboard');
        } else {
            res.redirect('/user'); // ฝั่ง User ทั่วไป
        }
    } catch (err) {
        console.error(err);
        res.render('auth/login', { error: 'เกิดข้อผิดพลาดในระบบ' });
    }
};

// POST สมัครสมาชิกฝั่ง User
exports.postRegister = async (req, res) => {
    const { username, email, phone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render('auth/register', { error: 'รหัสผ่านไม่ตรงกัน' });
    }

    try {
        // 1. เช็กข้อมูลซ้ำล่วงหน้าผ่าน Query
        const [existing] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.render('auth/register', { error: 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว' });
        }

        // 2. ถ้าไม่ซ้ำค่อยทำการบันทึกข้อมูล
        await db.query(
            'INSERT INTO users (username, email, phone, password, full_name, role) VALUES (?, ?, ?, ?, ?, \'user\')',
            [username, email, phone, password, username]
        );

        res.redirect('/login');
    } catch (err) {
        // ปริ้นต์ Error จริงออกมาดูใน Logs ของ Render
        console.error('Register Error Details:', err);
        res.render('auth/register', { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล (' + err.message + ')' });
    }
};

// Logout
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};
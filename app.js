const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
    secret: 'quickfix_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Static files & View Engine
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const indexRoutes = require('./routes/indexRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

app.use('/', authRoutes); // รวมระบบ Auth ไว้ที่ Root
app.use('/user', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/employee', employeeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
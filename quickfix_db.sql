-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 17, 2026 at 05:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quickfix_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `booking_code` varchar(20) NOT NULL,
  `service_id` int(11) DEFAULT 1,
  `customer_name` varchar(100) NOT NULL,
  `customer_phone` varchar(15) DEFAULT NULL,
  `phone_number` varchar(15) NOT NULL,
  `car_brand` varchar(50) NOT NULL,
  `car_model` varchar(50) NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `province` varchar(100) DEFAULT NULL,
  `service_program` varchar(100) NOT NULL,
  `time_slot` varchar(50) DEFAULT NULL,
  `booking_date` date DEFAULT NULL,
  `assigned_staff_id` int(11) DEFAULT NULL,
  `assigned_staff_name` varchar(100) DEFAULT NULL,
  `status` enum('pending','in-progress','inspecting','completed','cancelled') DEFAULT 'pending',
  `total_price` decimal(10,2) DEFAULT 0.00,
  `expense` decimal(10,2) DEFAULT 0.00,
  `net_income` decimal(10,2) DEFAULT 0.00,
  `payment_status` enum('unpaid','paid') DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_code`, `service_id`, `customer_name`, `customer_phone`, `phone_number`, `car_brand`, `car_model`, `license_plate`, `province`, `service_program`, `time_slot`, `booking_date`, `assigned_staff_id`, `assigned_staff_name`, `status`, `total_price`, `expense`, `net_income`, `payment_status`, `created_at`) VALUES
(1, 'Q-307', 1, 'นลธวัช', '0641372757', '', 'Toyota', 'yaris', 'กข1234', 'ชลบุรี', 'ล้างอัดฉีด', '13.00-13.30', '2026-08-17', 2, 'นายกอไก่ ขอไข่', 'completed', 300.00, 100.00, 200.00, 'paid', '2026-08-17 13:59:17'),
(2, 'Q-676', 1, 'VV', '12345', '', 'Toyota', 'yaris', 'กข1234', 'ชลบุรี', 'ล้าง ดูดฝุ่น ทำความสะอาดภายใน', '14.00-14.30', '2026-08-17', 4, 'นายเอบี ซีดี', 'completed', 300.00, 100.00, 200.00, 'paid', '2026-08-17 14:04:22'),
(3, 'Q-933', 1, 'NN', '0228889999', '', 'Toyota', 'yaris', 'กข1234', 'ชลบุรี', 'ระบบปรับอากาศ', '15.00-15.30', '2026-08-18', 4, 'นายเอบี ซีดี', 'completed', 300.00, 100.00, 200.00, 'paid', '2026-08-17 14:41:37'),
(4, 'Q-155', 1, 'View', '0942465334', '', 'Toyota', 'yaris', 'กข1234', 'ชลบุรี', 'ขัดเคลือบเงา/แว็กซ์ทั่วไป', '15.00-15.30', '2026-08-17', 2, 'นายกอไก่ ขอไข่', 'completed', 550.00, 150.00, 400.00, 'paid', '2026-08-17 14:51:48');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `expense_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','staff','user') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `phone`, `password`, `full_name`, `role`, `created_at`) VALUES
(1, 'admin01', 'admin@quickfix.com', NULL, '123456', 'ผู้ดูแลระบบ', 'admin', '2026-08-17 13:40:05'),
(2, 'staff01', 'staff01@quickfix.com', NULL, '123456', 'นายกอไก่ ขอไข่', 'staff', '2026-08-17 13:40:05'),
(3, 'นลธวัช', '66160250@go.buu.ac.th', '0641372757', 'non095315', 'นลธวัช', 'user', '2026-08-17 13:50:33'),
(4, 'staff02', 'staff02@quickfix.com', NULL, '123456', 'นายเอบี ซีดี', 'staff', '2026-08-17 13:58:43'),
(5, 'View', 'view@gmail.com', '0942465334', 'view1234', 'View', 'user', '2026-08-17 14:50:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_code` (`booking_code`),
  ADD KEY `assigned_staff_id` (`assigned_staff_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`assigned_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

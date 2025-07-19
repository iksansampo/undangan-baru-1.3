<?php
// File: backend/core/initialize.php
// Deskripsi: File inisialisasi utama dengan penanganan sesi yang aman.

// Hanya mulai sesi jika belum ada yang aktif.
// Ini akan menghilangkan semua error "Ignoring session_start()".
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Atur header CORS dengan benar.
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle pre-flight request (OPTIONS) dari browser.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Fungsi helper untuk mengirim response JSON.
function json_response($code, $data) {
    http_response_code($code);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode($data);
    exit();
}
?>

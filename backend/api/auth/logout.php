<?php
// File: backend/api/auth/logout.php
// Deskripsi: Menghancurkan sesi login pengguna.

include_once __DIR__ . '/../../core/initialize.php';

// Hapus semua variabel sesi
$_SESSION = array();

// Hancurkan cookie sesi jika ada
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Hancurkan sesi
session_destroy();

json_response(200, ['message' => 'Logout berhasil.']);
?>

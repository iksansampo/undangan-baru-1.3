<?php
// File: backend/api/invitations/delete_media.php
// Deskripsi: Endpoint untuk menghapus file media (gambar, musik, video) dari server.

include_once __DIR__ . '/../../core/initialize.php';

// Periksa sesi login untuk keamanan
if (!isset($_SESSION['user_id'])) {
    json_response(401, ['message' => 'Akses ditolak. Anda harus login.']);
}

$data = json_decode(file_get_contents("php://input"));

// Validasi input
if (!isset($data->fileName) || !isset($data->type)) {
    json_response(400, ['message' => 'Nama file dan tipe dibutuhkan.']);
}

$fileName = basename($data->fileName); // basename() untuk keamanan
$type = $data->type;
$upload_base_dir = __DIR__ . '/../../uploads/';

// Tentukan sub-folder yang valid untuk mencegah penghapusan file di luar direktori uploads
$allowed_types = ['cover', 'couple', 'gallery', 'music'];
if (!in_array($type, $allowed_types)) {
    json_response(400, ['message' => 'Tipe file tidak valid.']);
}

$target_file = $upload_base_dir . $type . '/' . $fileName;

// Periksa apakah file ada, lalu hapus
if (file_exists($target_file)) {
    if (unlink($target_file)) {
        json_response(200, ['message' => 'File berhasil dihapus.']);
    } else {
        json_response(500, ['message' => 'Gagal menghapus file di server.']);
    }
} else {
    // Jika file tidak ada, anggap saja sudah berhasil dihapus
    json_response(200, ['message' => 'File tidak ditemukan, dianggap sudah terhapus.']);
}
?>

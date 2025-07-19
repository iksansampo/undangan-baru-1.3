<?php
// File: backend/api/invitations/delete.php (Versi Perbaikan & Debug)

// Tampilkan semua error PHP untuk debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Sertakan file inisialisasi yang sudah benar
include_once __DIR__ . '/../../core/initialize.php';

// Periksa sesi login
if (!isset($_SESSION['user_id'])) {
    json_response(401, ['message' => 'Akses ditolak. Sesi tidak ditemukan.']);
}

// Periksa apakah metode request adalah DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_response(405, ['message' => 'Metode tidak diizinkan. Seharusnya menggunakan metode DELETE.']);
}

// Sertakan file database
include_once __DIR__ . '/../../config/database.php';

// Buat koneksi
$database = new Database();
$db = $database->getConnection();

if(!$db){
    json_response(500, ["message" => "Koneksi database gagal."]);
}

// Ambil ID dari query string URL (contoh: ...delete.php?id=4)
$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    json_response(400, ['message' => 'ID Undangan yang akan dihapus tidak diterima oleh server.']);
}

try {
    // Query untuk menghapus dari tabel undangan.
    // ON DELETE CASCADE di database akan mengurus penghapusan data di tabel anak.
    $query = "DELETE FROM undangan WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    // Eksekusi query
    if ($stmt->execute()) {
        // Cek apakah ada baris yang benar-benar terhapus
        if ($stmt->rowCount() > 0) {
            json_response(200, ['message' => 'Undangan berhasil dihapus.']);
        } else {
            json_response(404, ['message' => 'Undangan dengan ID ' . htmlspecialchars($id) . ' tidak ditemukan untuk dihapus.']);
        }
    } else {
        json_response(500, ['message' => 'Eksekusi query hapus gagal.']);
    }
} catch (PDOException $e) {
    // Tangkap error spesifik dari database, misalnya foreign key constraint
    json_response(500, ['message' => 'Database error saat menghapus: ' . $e->getMessage()]);
}
?>

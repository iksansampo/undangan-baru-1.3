<?php
// File: backend/api/guests/delete.php
// Deskripsi: Menghapus tamu berdasarkan ID-nya.

include_once '../../core/initialize.php';
include_once '../../config/database.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    json_response(400, ['message' => 'ID Tamu dibutuhkan.']);
}

$guest_id = $data->id;

$database = new Database();
$db = $database->getConnection();

try {
    $query = "DELETE FROM tamu WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $guest_id);

    if ($stmt->execute()) {
        json_response(200, ['message' => 'Tamu berhasil dihapus.']);
    } else {
        json_response(500, ['message' => 'Gagal menghapus tamu.']);
    }
} catch (Exception $e) {
    json_response(500, ['message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
?>

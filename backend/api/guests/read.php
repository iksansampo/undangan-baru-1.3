<?php
// File: backend/api/guests/read.php
// Deskripsi: Mengambil semua tamu untuk undangan tertentu.

include_once '../../core/initialize.php';
include_once '../../config/database.php';

// Pastikan ID undangan ada di URL
if (!isset($_GET['invitation_id'])) {
    json_response(400, ['message' => 'ID Undangan dibutuhkan.']);
}

$invitation_id = $_GET['invitation_id'];

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT id, nama_tamu FROM tamu WHERE undangan_id = :invitation_id ORDER BY nama_tamu ASC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':invitation_id', $invitation_id);
    $stmt->execute();

    $guests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response(200, $guests);

} catch (Exception $e) {
    json_response(500, ['message' => 'Gagal mengambil data tamu: ' . $e->getMessage()]);
}
?>

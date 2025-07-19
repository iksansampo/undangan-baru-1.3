<?php
// File: backend/api/rsvp/read.php
// Deskripsi: Mengambil data kehadiran dan ucapan untuk undangan tertentu.

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
    $query = "SELECT nama_tamu, kehadiran, ucapan, waktu FROM rsvp WHERE undangan_id = :invitation_id ORDER BY waktu DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':invitation_id', $invitation_id);
    $stmt->execute();

    $rsvps = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response(200, $rsvps);

} catch (Exception $e) {
    json_response(500, ['message' => 'Gagal mengambil data RSVP: ' . $e->getMessage()]);
}
?>

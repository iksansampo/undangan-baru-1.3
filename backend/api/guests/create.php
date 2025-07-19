<?php
// File: backend/api/guests/create.php
// Deskripsi: Menambah satu atau banyak tamu sekaligus.

include_once '../../core/initialize.php';
include_once '../../config/database.php';

$data = json_decode(file_get_contents("php://input"));

// Validasi data
if (!isset($data->invitation_id) || !isset($data->guests) || !is_array($data->guests)) {
    json_response(400, ['message' => 'Data tidak valid.']);
}

$invitation_id = $data->invitation_id;
$guests = $data->guests;

$database = new Database();
$db = $database->getConnection();

// Siapkan query untuk diulang
$query = "INSERT INTO tamu (undangan_id, nama_tamu) VALUES (:invitation_id, :nama_tamu)";
$stmt = $db->prepare($query);

$db->beginTransaction();
try {
    foreach ($guests as $guest_name) {
        if (!empty(trim($guest_name))) {
            $stmt->execute([
                ':invitation_id' => $invitation_id,
                ':nama_tamu' => htmlspecialchars(strip_tags($guest_name))
            ]);
        }
    }
    $db->commit();
    json_response(201, ['message' => 'Tamu berhasil ditambahkan.']);
} catch (Exception $e) {
    $db->rollBack();
    json_response(500, ['message' => 'Gagal menambahkan tamu: ' . $e->getMessage()]);
}
?>

<?php
// File: backend/api/rsvp/create.php
// Deskripsi: Endpoint untuk menyimpan data RSVP dari tamu.

include_once '../../core/initialize.php';
include_once '../../config/database.php';

// Inisialisasi koneksi
$database = new Database();
$db = $database->getConnection();

// Ambil data dari body request
$data = json_decode(file_get_contents("php://input"));

// Validasi data
if (
    !isset($data->undangan_id) ||
    !isset($data->nama_tamu) ||
    !isset($data->kehadiran) ||
    !isset($data->ucapan)
) {
    json_response(400, ['message' => 'Data tidak lengkap. Mohon isi semua field.']);
}

// Query untuk memasukkan data
$query = "INSERT INTO rsvp (undangan_id, nama_tamu, kehadiran, ucapan) 
          VALUES (:undangan_id, :nama_tamu, :kehadiran, :ucapan)";

$stmt = $db->prepare($query);

// Bersihkan data
$undangan_id = htmlspecialchars(strip_tags($data->undangan_id));
$nama_tamu = htmlspecialchars(strip_tags($data->nama_tamu));
$kehadiran = htmlspecialchars(strip_tags($data->kehadiran));
$ucapan = htmlspecialchars(strip_tags($data->ucapan));

// Bind data ke statement
$stmt->bindParam(':undangan_id', $undangan_id);
$stmt->bindParam(':nama_tamu', $nama_tamu);
$stmt->bindParam(':kehadiran', $kehadiran);
$stmt->bindParam(':ucapan', $ucapan);

// Eksekusi query
try {
    if ($stmt->execute()) {
        json_response(201, ['message' => 'Terima kasih atas ucapan dan konfirmasinya!']);
    } else {
        json_response(503, ['message' => 'Gagal menyimpan ucapan.']);
    }
} catch (Exception $e) {
    json_response(500, ["message" => "Terjadi kesalahan: " . $e->getMessage()]);
}
?>

<?php
// File: backend/api/invitations/read_single.php
// Deskripsi: Endpoint untuk mengambil SEMUA detail dari satu undangan.

include_once '../../core/initialize.php';
include_once '../../config/database.php';

$id = isset($_GET['id']) ? $_GET['id'] : die(json_encode(array('message' => 'ID Undangan tidak ditemukan.')));

$database = new Database();
$db = $database->getConnection();

$undangan_data = [];

try {
    // 1. Ambil data utama dari tabel 'undangan'
    $query_undangan = "SELECT * FROM undangan WHERE id = :id LIMIT 1";
    $stmt_undangan = $db->prepare($query_undangan);
    $stmt_undangan->bindParam(':id', $id);
    $stmt_undangan->execute();
    $undangan = $stmt_undangan->fetch(PDO::FETCH_ASSOC);
    if (!$undangan) {
        json_response(404, ['message' => 'Undangan tidak ditemukan.']);
    }
    $undangan_data['undangan'] = $undangan;

    // 2. Ambil data mempelai
    $query_mempelai = "SELECT * FROM mempelai WHERE undangan_id = :id LIMIT 1";
    $stmt_mempelai = $db->prepare($query_mempelai);
    $stmt_mempelai->bindParam(':id', $id);
    $stmt_mempelai->execute();
    $undangan_data['mempelai'] = $stmt_mempelai->fetch(PDO::FETCH_ASSOC);

    // 3. Ambil data acara (bisa lebih dari satu)
    $query_acara = "SELECT * FROM acara WHERE undangan_id = :id ORDER BY tanggal, waktu";
    $stmt_acara = $db->prepare($query_acara);
    $stmt_acara->bindParam(':id', $id);
    $stmt_acara->execute();
    $undangan_data['acara'] = $stmt_acara->fetchAll(PDO::FETCH_ASSOC);

    // ====================================================================
    // BAGIAN YANG DIPERBAIKI ADA DI SINI
    // ====================================================================

    // 4. Ambil data amplop (bisa lebih dari satu)
    $query_amplop = "SELECT * FROM amplop WHERE undangan_id = :id";
    $stmt_amplop = $db->prepare($query_amplop);
    $stmt_amplop->bindParam(':id', $id);
    $stmt_amplop->execute();
    $undangan_data['amplop'] = $stmt_amplop->fetchAll(PDO::FETCH_ASSOC);

    // 5. Ambil data galeri media
    $query_media = "SELECT url_file FROM media WHERE undangan_id = :id";
    $stmt_media = $db->prepare($query_media);
    $stmt_media->bindParam(':id', $id);
    $stmt_media->execute();
    $undangan_data['media'] = $stmt_media->fetchAll(PDO::FETCH_COLUMN);

    // 6. Ambil data cerita
    $query_cerita = "SELECT isi_cerita FROM cerita WHERE undangan_id = :id LIMIT 1";
    $stmt_cerita = $db->prepare($query_cerita);
    $stmt_cerita->bindParam(':id', $id);
    $stmt_cerita->execute();
    $cerita = $stmt_cerita->fetch(PDO::FETCH_ASSOC);
    $undangan_data['cerita'] = $cerita ? $cerita['isi_cerita'] : '';
    
    // 7. Ambil data RSVP yang sudah ada
    $query_rsvp = "SELECT nama_tamu, kehadiran, ucapan, waktu FROM rsvp WHERE undangan_id = :id ORDER BY waktu DESC";
    $stmt_rsvp = $db->prepare($query_rsvp);
    $stmt_rsvp->bindParam(':id', $id);
    $stmt_rsvp->execute();
    $undangan_data['rsvp'] = $stmt_rsvp->fetchAll(PDO::FETCH_ASSOC);

    // ====================================================================

    // Kirim response lengkap
    json_response(200, $undangan_data);

} catch (Exception $e) {
    json_response(500, ["message" => "Terjadi kesalahan saat mengambil data: " . $e->getMessage()]);
}
?>

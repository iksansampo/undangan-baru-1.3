<?php
// File: backend/api/invitations/create.php
// Deskripsi: Memastikan semua data, termasuk cerita, amplop, dan galeri, disimpan dengan benar.

// Mulai sesi DI BARIS PALING ATAS untuk membaca data login.
session_start();

include_once '../../core/initialize.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!isset($_SESSION['user_id'])) {
    json_response(401, ["message" => "Akses ditolak. Sesi Anda telah berakhir, silakan login kembali."]);
}
$user_id = $_SESSION['user_id'];

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->judul) || !isset($data->mempelai) || !isset($data->acara)) {
    json_response(400, ["message" => "Data utama tidak lengkap."]);
}

$db->beginTransaction();

try {
    // --- 1. Simpan ke tabel `undangan` ---
    $query_undangan = "INSERT INTO undangan (user_id, judul, template_tema, musik_latar, cover_slideshow) VALUES (:user_id, :judul, :template_tema, :musik_latar, :cover_slideshow)";
    $stmt_undangan = $db->prepare($query_undangan);
    $cover_slideshow_json = json_encode($data->cover_slideshow ?? []);
    $stmt_undangan->execute([
        ':user_id' => $user_id,
        ':judul' => $data->judul,
        ':template_tema' => $data->template_tema,
        ':musik_latar' => $data->musik_latar ?? null,
        ':cover_slideshow' => $cover_slideshow_json
    ]);
    $undangan_id = $db->lastInsertId();

    // --- 2. Simpan ke tabel `mempelai` ---
    $mempelai = $data->mempelai;
    $query_mempelai = "INSERT INTO mempelai (undangan_id, nama_pria, panggilan_pria, ayah_pria, ibu_pria, foto_pria, nama_wanita, panggilan_wanita, ayah_wanita, ibu_wanita, foto_wanita) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt_mempelai = $db->prepare($query_mempelai);
    $stmt_mempelai->execute([$undangan_id, $mempelai->nama_pria, $mempelai->panggilan_pria, $mempelai->ayah_pria, $mempelai->ibu_pria, $mempelai->foto_pria, $mempelai->nama_wanita, $mempelai->panggilan_wanita, $mempelai->ayah_wanita, $mempelai->ibu_wanita, $mempelai->foto_wanita]);

    // --- 3. Simpan ke tabel `acara` ---
    $query_acara = "INSERT INTO acara (undangan_id, jenis_acara, tanggal, waktu, nama_tempat, link_gmaps) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt_acara = $db->prepare($query_acara);
    foreach ($data->acara as $item) {
        if (!empty($item->jenis_acara)) {
            $stmt_acara->execute([$undangan_id, $item->jenis_acara, $item->tanggal, $item->waktu, $item->nama_tempat, $item->link_gmaps]);
        }
    }

    // --- 4. Simpan ke tabel `amplop` (DIPASTIKAN BERJALAN) ---
    if (isset($data->amplop) && !empty($data->amplop)) {
        $query_amplop = "INSERT INTO amplop (undangan_id, tipe_hadiah, nomor_rekening, atas_nama) VALUES (?, ?, ?, ?)";
        $stmt_amplop = $db->prepare($query_amplop);
        foreach ($data->amplop as $item) {
            if (!empty($item->tipe_hadiah)) {
                $stmt_amplop->execute([$undangan_id, $item->tipe_hadiah, $item->nomor_rekening, $item->atas_nama]);
            }
        }
    }

    // --- 5. Simpan ke tabel `media` (Galeri) (DIPASTIKAN BERJALAN) ---
    if (isset($data->media) && !empty($data->media)) {
        $query_media = "INSERT INTO media (undangan_id, url_file) VALUES (?, ?)";
        $stmt_media = $db->prepare($query_media);
        foreach ($data->media as $url) {
            $stmt_media->execute([$undangan_id, $url]);
        }
    }

    // --- 6. Simpan ke tabel `cerita` (DIPASTIKAN BERJALAN) ---
    if (isset($data->cerita) && !empty($data->cerita)) {
        $query_cerita = "INSERT INTO cerita (undangan_id, isi_cerita) VALUES (?, ?)";
        $stmt_cerita = $db->prepare($query_cerita);
        $stmt_cerita->execute([$undangan_id, $data->cerita]);
    }

    $db->commit();
    json_response(201, ["message" => "Undangan berhasil dibuat.", "id" => $undangan_id]);

} catch (Exception $e) {
    $db->rollBack();
    json_response(500, ["message" => "Gagal membuat undangan: " . $e->getMessage()]);
}
?>

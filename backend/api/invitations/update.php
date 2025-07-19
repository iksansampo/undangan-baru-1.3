<?php
// File: backend/api/invitations/update.php
// Deskripsi: Endpoint untuk memperbarui data undangan yang sudah ada.

include_once '../../core/initialize.php';
include_once '../../config/database.php';


$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

// Validasi data dasar
if (!isset($data->id) || !isset($data->judul) || !isset($data->mempelai)) {
    json_response(400, ["message" => "Data update tidak lengkap (ID atau Judul kosong)."]);
}

$undangan_id = $data->id;

// Mulai transaksi
$db->beginTransaction();

try {
    // --- 1. Update tabel `undangan` ---
    $query_undangan = "UPDATE undangan SET judul = :judul, template_tema = :template_tema, musik_latar = :musik_latar, cover_slideshow = :cover_slideshow WHERE id = :id";
    $stmt_undangan = $db->prepare($query_undangan);
    $cover_slideshow_json = json_encode($data->cover_slideshow ?? []);
    $stmt_undangan->execute([
        ':judul' => $data->judul,
        ':template_tema' => $data->template_tema,
        ':musik_latar' => $data->musik_latar ?? null,
        ':cover_slideshow' => $cover_slideshow_json,
        ':id' => $undangan_id
    ]);

    // --- 2. Update tabel `mempelai` ---
    $mempelai = $data->mempelai;
    $query_mempelai = "UPDATE mempelai SET nama_pria = :nama_pria, panggilan_pria = :panggilan_pria, ayah_pria = :ayah_pria, ibu_pria = :ibu_pria, foto_pria = :foto_pria, nama_wanita = :nama_wanita, panggilan_wanita = :panggilan_wanita, ayah_wanita = :ayah_wanita, ibu_wanita = :ibu_wanita, foto_wanita = :foto_wanita WHERE undangan_id = :undangan_id";
    $stmt_mempelai = $db->prepare($query_mempelai);
    $stmt_mempelai->execute([
        ':nama_pria' => $mempelai->nama_pria, ':panggilan_pria' => $mempelai->panggilan_pria, ':ayah_pria' => $mempelai->ayah_pria, ':ibu_pria' => $mempelai->ibu_pria, ':foto_pria' => $mempelai->foto_pria,
        ':nama_wanita' => $mempelai->nama_wanita, ':panggilan_wanita' => $mempelai->panggilan_wanita, ':ayah_wanita' => $mempelai->ayah_wanita, ':ibu_wanita' => $mempelai->ibu_wanita, ':foto_wanita' => $mempelai->foto_wanita,
        ':undangan_id' => $undangan_id
    ]);

    // --- 3. Hapus data lama yang terkait (Acara, Amplop, Media) lalu masukkan yang baru ---
    // Ini cara paling sederhana untuk menangani update pada item yang jumlahnya dinamis.
    $db->prepare("DELETE FROM acara WHERE undangan_id = ?")->execute([$undangan_id]);
    $db->prepare("DELETE FROM amplop WHERE undangan_id = ?")->execute([$undangan_id]);
    $db->prepare("DELETE FROM media WHERE undangan_id = ?")->execute([$undangan_id]);
    $db->prepare("DELETE FROM cerita WHERE undangan_id = ?")->execute([$undangan_id]);

    // --- 4. Masukkan kembali data yang sudah diupdate ---
    // (Kode ini sama seperti di create.php)
    
    // Acara
    $query_acara = "INSERT INTO acara (undangan_id, jenis_acara, tanggal, waktu, nama_tempat, link_gmaps) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt_acara = $db->prepare($query_acara);
    foreach ($data->acara as $item) {
        if (!empty($item->jenis_acara)) {
            $stmt_acara->execute([$undangan_id, $item->jenis_acara, $item->tanggal, $item->waktu, $item->nama_tempat, $item->link_gmaps]);
        }
    }

    // Amplop
    if (isset($data->amplop)) {
        $query_amplop = "INSERT INTO amplop (undangan_id, tipe_hadiah, nomor_rekening, atas_nama) VALUES (?, ?, ?, ?)";
        $stmt_amplop = $db->prepare($query_amplop);
        foreach ($data->amplop as $item) {
            if (!empty($item->tipe_hadiah)) {
                $stmt_amplop->execute([$undangan_id, $item->tipe_hadiah, $item->nomor_rekening, $item->atas_nama]);
            }
        }
    }
    
    // Media (Galeri)
    if (isset($data->media)) {
        $query_media = "INSERT INTO media (undangan_id, url_file) VALUES (?, ?)";
        $stmt_media = $db->prepare($query_media);
        foreach ($data->media as $url) {
            $stmt_media->execute([$undangan_id, $url]);
        }
    }

    // Cerita
    if (isset($data->cerita) && !empty($data->cerita)) {
        $query_cerita = "INSERT INTO cerita (undangan_id, isi_cerita) VALUES (?, ?)";
        $stmt_cerita = $db->prepare($query_cerita);
        $stmt_cerita->execute([$undangan_id, $data->cerita]);
    }

    // Jika semua berhasil, commit transaksi
    $db->commit();
    json_response(200, ["message" => "Undangan berhasil diperbarui."]);

} catch (Exception $e) {
    // Jika ada error, batalkan semua perubahan
    $db->rollBack();
    json_response(500, ["message" => "Gagal memperbarui undangan: " . $e->getMessage()]);
}
?>

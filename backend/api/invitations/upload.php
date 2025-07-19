<?php
// File: backend/api/invitations/upload.php
// Deskripsi: Menangani upload file (foto, musik).

include_once '../../core/initialize.php';

if (empty($_FILES['file'])) {
    json_response(400, ['message' => 'Tidak ada file yang diunggah.']);
}

$file = $_FILES['file'];
$upload_dir = '../../uploads/';
$file_type = $_POST['type'] ?? 'gallery'; // Tipe: cover, couple, gallery, music

// Tentukan sub-folder berdasarkan tipe
$target_dir = $upload_dir . $file_type . '/';
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

// Buat nama file yang unik
$file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$new_file_name = uniqid($file_type . '_', true) . '.' . $file_extension;
$target_file = $target_dir . $new_file_name;

// Pindahkan file
if (move_uploaded_file($file['tmp_name'], $target_file)) {
    json_response(200, [
        'message' => 'File berhasil diunggah.',
        'filePath' => $new_file_name // Kirim kembali nama file saja
    ]);
} else {
    json_response(500, ['message' => 'Gagal memindahkan file.']);
}
?>

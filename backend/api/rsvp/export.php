<?php
// File: backend/api/rsvp/export.php
// Deskripsi: Menghasilkan file ekspor dalam format CSV atau TXT.

// Menggunakan __DIR__ untuk path yang lebih andal
include_once __DIR__ . '/../../core/initialize.php';
include_once __DIR__ . '/../../config/database.php';

if (!isset($_GET['invitation_id'])) {
    die('ID Undangan dibutuhkan.');
}

$invitation_id = $_GET['invitation_id'];
// Ambil format dari URL, default-nya 'csv' jika tidak ada
$format = $_GET['format'] ?? 'csv'; 

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT nama_tamu, kehadiran, ucapan, waktu FROM rsvp WHERE undangan_id = :invitation_id ORDER BY waktu DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':invitation_id', $invitation_id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $filename = "rsvp_undangan_" . $invitation_id . "_" . date('Ymd') . "." . $format;
        
        // Atur header untuk download file
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        
        // Buat file pointer yang terhubung ke output
        $output = fopen('php://output', 'w');

        // Logika baru berdasarkan format
        switch ($format) {
            case 'txt':
                header('Content-Type: text/plain; charset=utf-8');
                // Tulis header
                fwrite($output, "Daftar RSVP untuk Undangan ID: " . $invitation_id . "\n");
                fwrite($output, "==================================================\n\n");
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    fwrite($output, "Nama    : " . $row['nama_tamu'] . "\n");
                    fwrite($output, "Hadir   : " . $row['kehadiran'] . "\n");
                    fwrite($output, "Ucapan  : " . str_replace(["\r", "\n"], ' ', $row['ucapan']) . "\n"); // Ganti baris baru di ucapan
                    fwrite($output, "Waktu   : " . $row['waktu'] . "\n");
                    fwrite($output, "--------------------------------------------------\n");
                }
                break;

            case 'csv':
            default: // Default ke CSV jika format tidak dikenali
                header('Content-Type: text/csv; charset=utf-8');
                // Tulis header kolom
                fputcsv($output, array('Nama Tamu', 'Kehadiran', 'Ucapan', 'Waktu'));
                // Tulis data baris per baris
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    fputcsv($output, $row);
                }
                break;
        }
        
        fclose($output);
        exit();
    } else {
        // Beri tahu pengguna jika tidak ada data
        header('Content-Type: text/plain; charset=utf-8');
        echo "Tidak ada data RSVP untuk diekspor pada undangan ini.";
    }

} catch (Exception $e) {
    header('Content-Type: text/plain; charset=utf-8');
    die('Gagal mengekspor data: ' . $e->getMessage());
}
?>

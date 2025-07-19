<?php
// File: backend/api/invitations/read_all.php (Versi Produksi/Bersih)

// Hapus semua kode debug 'ini_set' dan 'error_reporting'

// Sertakan file inisialisasi yang sudah benar
include_once __DIR__ . '/../../core/initialize.php';

// Periksa sesi login
if (!isset($_SESSION['user_id'])) {
    json_response(401, ['message' => 'Akses ditolak. Sesi tidak ditemukan.']);
}

// Sertakan file database
include_once __DIR__ . '/../../config/database.php';

// Buat koneksi
$database = new Database();
$db = $database->getConnection();

if(!$db){
    json_response(500, ["message" => "Koneksi database gagal."]);
}

// Query untuk mengambil data
$query = "SELECT 
            u.id, 
            u.judul, 
            m.panggilan_pria, 
            m.panggilan_wanita
          FROM 
            undangan AS u
          LEFT JOIN 
            mempelai AS m ON u.id = m.undangan_id
          ORDER BY 
            u.id DESC";

try {
    $stmt = $db->prepare($query);
    $stmt->execute();

    $invitations_arr = array();
    $invitations_arr["data"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $panggilan_pria = $row['panggilan_pria'] ?? 'Mempelai Pria';
        $panggilan_wanita = $row['panggilan_wanita'] ?? 'Mempelai Wanita';

        $invitation_item = array(
            "id" => $row['id'],
            "judul" => $row['judul'],
            "mempelai" => $panggilan_pria . " & " . $panggilan_wanita,
        );
        array_push($invitations_arr["data"], $invitation_item);
    }
    json_response(200, $invitations_arr);

} catch (Exception $e) {
    json_response(500, ["message" => "Database query error: " . $e->getMessage()]);
}
?>

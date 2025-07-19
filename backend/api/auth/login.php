<?php
// File: backend/api/auth/login.php
// Deskripsi: Endpoint login yang lebih kuat dengan penanganan sesi.

// Mulai sesi di baris paling atas, ini sangat penting.


// Sertakan file-file inti
include_once '../../core/initialize.php'; // Mengatur header CORS
include_once '../../config/database.php';

// Ambil data JSON yang dikirim dari React
$data = json_decode(file_get_contents("php://input"));

// Validasi input dasar
if (!isset($data->username) || !isset($data->password)) {
    json_response(400, ["message" => "Username dan password harus diisi."]);
}

// Buat koneksi database
$database = new Database();
$db = $database->getConnection();

$username = $data->username;
$password = $data->password;

try {
    // Cari user berdasarkan username
    $query = "SELECT id, username, password FROM users WHERE username = :username LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        // User ditemukan
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $id = $row['id'];
        $hashed_password = $row['password'];

        // Verifikasi password yang diinput dengan hash di database
        if (password_verify($password, $hashed_password)) {
            // Jika password cocok, buat sesi
            $_SESSION['user_id'] = $id;
            $_SESSION['username'] = $username;
            
            // Kirim respons sukses
            json_response(200, [
                "message" => "Login berhasil.",
                "user" => ["id" => $id, "username" => $username]
            ]);
        } else {
            // Jika password tidak cocok
            json_response(401, ["message" => "Password yang Anda masukkan salah."]);
        }
    } else {
        // Jika user tidak ditemukan
        json_response(404, ["message" => "Username tidak ditemukan."]);
    }
} catch (PDOException $e) {
    // Jika ada error database
    json_response(500, ["message" => "Database error: " . $e->getMessage()]);
}
?>

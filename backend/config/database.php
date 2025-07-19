<?php
// File: backend/config/database.php
// Deskripsi: File konfigurasi untuk koneksi ke database.

class Database {
    // Properti koneksi
    private $host = "localhost";
    private $db_name = "undangan_db";
    private $username = "root"; // Ganti dengan username database Anda
    private $password = "";     // Ganti dengan password database Anda
    public $conn;

    // Method untuk mendapatkan koneksi
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>

<?php
// File: backend/password_generator.php
// Deskripsi: Alat untuk membuat hash password yang valid untuk server Anda.

// Masukkan password yang Anda inginkan di sini
$password_yang_diinginkan = 'admin123';

// PHP akan membuat hash yang aman untuk password tersebut
$hash = password_hash($password_yang_diinginkan, PASSWORD_DEFAULT);

// Tampilkan hasilnya dalam format yang mudah dibaca dan disalin
echo "<h1>Password Hash Generator</h1>";
echo "<p>Gunakan hash di bawah ini untuk user 'admin' di database Anda.</p>";
echo "<hr>";
echo "<p><b>Password Asli:</b> " . htmlspecialchars($password_yang_diinginkan) . "</p>";
echo "<p><b>Hash yang Dihasilkan (Salin ini):</b></p>";
echo "<textarea rows='3' cols='80' readonly>" . htmlspecialchars($hash) . "</textarea>";

?>

import axios from 'axios';

// File: frontend-admin/src/api.js
// Deskripsi: Konfigurasi Axios terpusat untuk semua permintaan ke backend.

const api = axios.create({
  // Tentukan URL dasar untuk semua endpoint API Anda.
  baseURL: 'http://localhost/undangan_digital_platform/backend/api',
  
  // Pastikan cookie sesi dikirim pada setiap permintaan.
  // Ini adalah kunci untuk menjaga status login.
  withCredentials: true,
});

export default api;

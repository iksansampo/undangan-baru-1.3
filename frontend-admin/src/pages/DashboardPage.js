import React, { useState, useEffect } from 'react';
import { Container, Button, Table, Spinner, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Impor semua komponen modal yang dibutuhkan
import InvitationForm from '../components/InvitationForm';
import GuestListModal from '../components/GuestListModal';
import RsvpModal from '../components/RsvpModal';

const DashboardPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // State tunggal untuk mengontrol modal mana yang aktif: 'FORM', 'GUEST', 'RSVP', atau null
    const [activeModal, setActiveModal] = useState(null); 
    
    // State tunggal untuk menyimpan data undangan yang sedang diolah (untuk diedit atau ditampilkan di modal)
    const [selectedInvitationData, setSelectedInvitationData] = useState(null);

    // Fungsi untuk mengambil daftar undangan dari server
    const fetchInvitations = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/invitations/read_all.php');
            setInvitations(response.data.data || []);
        } catch (err) {
            setError('Gagal memuat data undangan. Sesi mungkin telah berakhir, coba login ulang.');
        } finally {
            setLoading(false);
        }
    };
    
    // Panggil fetchInvitations saat komponen pertama kali dimuat
    useEffect(() => {
        fetchInvitations();
    }, []);

    // Fungsi untuk logout
    const handleLogout = async () => {
        try {
            await api.post('/auth/logout.php');
            navigate('/');
        } catch (err) {
            alert('Gagal logout.');
        }
    };

    // Fungsi untuk menutup SEMUA modal dan mereset data
    const handleCloseModals = () => {
        setActiveModal(null);
        setSelectedInvitationData(null);
    };

    // Fungsi untuk menampilkan Form (baik untuk Buat Baru atau Edit)
    const handleShowForm = async (invitationSummary = null) => {
        if (invitationSummary && invitationSummary.id) { // Mode EDIT
            try {
                // Ambil data lengkap dari server SEBELUM menampilkan modal
                const response = await api.get(`/invitations/read_single.php?id=${invitationSummary.id}`);
                setSelectedInvitationData(response.data); // Simpan data lengkap
                setActiveModal('FORM'); // BARU tampilkan modal
            } catch (err) {
                alert('Gagal mengambil detail undangan untuk diedit.');
            }
        } else { // Mode BUAT BARU
            setSelectedInvitationData(null); // Pastikan data kosong
            setActiveModal('FORM'); // Langsung tampilkan modal
        }
    };

    // Fungsi untuk menampilkan Modal Tamu
    const handleShowGuestModal = (invitationSummary) => {
        setSelectedInvitationData(invitationSummary);
        setActiveModal('GUEST');
    };

    // Fungsi untuk menampilkan Modal RSVP
    const handleShowRsvpModal = (invitationSummary) => {
        setSelectedInvitationData(invitationSummary);
        setActiveModal('RSVP');
    };

    // Fungsi untuk menyimpan data dari form (Create atau Update)
    const handleSaveInvitation = async (formData) => {
        try {
            const endpoint = formData.id ? '/invitations/update.php' : '/invitations/create.php';
            const response = await api.post(endpoint, formData);
            alert(response.data.message);
            handleCloseModals();
            fetchInvitations(); // Muat ulang daftar setelah menyimpan
        } catch (err) {
            alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan.');
        }
    };
    
    // Fungsi untuk menghapus undangan
    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus undangan ini dan semua datanya?')) {
            try {
                await api.delete(`/invitations/delete.php?id=${id}`);
                fetchInvitations();
            } catch (err) {
                alert('Gagal menghapus.');
            }
        }
    };

    return (
        <>
            <header className="dashboard-header">
                <h3>Dashboard Admin</h3>
                <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
            </header>

            <Container className="py-4">
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>Manajemen Undangan</Card.Title>
                        <Button variant="primary" onClick={() => handleShowForm()}>+ Buat Undangan Baru</Button>
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Header as="h5">Daftar Undangan Tersimpan</Card.Header>
                    <Card.Body>
                        {loading && <div className="text-center my-5"><Spinner animation="border" /></div>}
                        {error && <Alert variant="danger">{error}</Alert>}
                        {!loading && !error && (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Judul</th>
                                        <th>Mempelai</th>
                                        <th style={{width: '350px'}}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invitations.length > 0 ? (
                                        invitations.map(inv => (
                                            <tr key={inv.id}>
                                                <td>{inv.id}</td>
                                                <td>{inv.judul || '(Tanpa Judul)'}</td>
                                                <td>{inv.mempelai}</td>
                                                <td>
                                                    <Button variant="info" size="sm" className="me-2" onClick={() => handleShowGuestModal(inv)}>Tamu</Button>
                                                    <Button variant="success" size="sm" className="me-2" onClick={() => handleShowRsvpModal(inv)}>RSVP</Button>
                                                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowForm(inv)}>Edit</Button>
                                                    <Button onClick={() => handleDelete(inv.id)} variant="danger" size="sm">Hapus</Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : ( 
                                        <tr>
                                            <td colSpan="4" className="text-center">Belum ada undangan yang dibuat.</td>
                                        </tr> 
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Render semua modal di sini, mereka akan tampil/sembunyi berdasarkan state 'activeModal' */}
            <InvitationForm 
                show={activeModal === 'FORM'}
                onHide={handleCloseModals}
                onSave={handleSaveInvitation}
                invitationData={selectedInvitationData}
            />
            <GuestListModal 
                show={activeModal === 'GUEST'}
                onHide={handleCloseModals}
                invitation={selectedInvitationData}
            />
            <RsvpModal
                show={activeModal === 'RSVP'}
                onHide={handleCloseModals}
                invitation={selectedInvitationData}
            />
        </>
    );
};

export default DashboardPage;

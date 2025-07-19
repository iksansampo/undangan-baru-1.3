import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Table, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import api from '../api';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const GuestListModal = ({ show, onHide, invitation }) => {
    const [guests, setGuests] = useState([]);
    const [newGuestName, setNewGuestName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // State baru untuk fitur centang
    const [selectedGuests, setSelectedGuests] = useState(new Set());

    const fetchGuests = async () => {
        if (!invitation?.id) return;
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/guests/read.php?invitation_id=${invitation.id}`);
            setGuests(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Gagal memuat daftar tamu.');
            setGuests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchGuests();
            setSelectedGuests(new Set()); // Reset pilihan setiap kali modal dibuka
        }
    }, [show, invitation]);

    // ======================================================
    // SEMUA FUNGSI LAMA YANG DIKEMBALIKAN
    // ======================================================

    // FITUR 1: Tambah nama tamu manual
    const handleAddGuest = async (e) => {
        e.preventDefault();
        if (!newGuestName.trim() || !invitation?.id) return;
        await uploadGuestNames([newGuestName], 'manual');
        setNewGuestName('');
    };

    // FITUR 4: Hapus daftar tamu
    const handleDeleteGuest = async (guestId) => {
        if (window.confirm('Yakin ingin menghapus tamu ini?')) {
            try {
                await api.post('/guests/delete.php', { id: guestId });
                fetchGuests();
            } catch (err) {
                alert('Gagal menghapus tamu.');
            }
        }
    };

    // FITUR 3: Salin link tamu (1 tamu undangan)
    const handleCopyLink = (guestName) => {
        const baseUrl = window.location.origin.replace(':3000', '');
        const url = `${baseUrl}/undangan_digital_platform/public-site/undangan.html?id=${invitation.id}&to=${encodeURIComponent(guestName)}`;
        navigator.clipboard.writeText(url).then(() => {
            alert(`Link untuk ${guestName} berhasil disalin!`);
        });
    };

    // FITUR 2: Import tamu dari file
    const handleFileImport = (e) => {
        const file = e.target.files[0];
        if (!file || !invitation?.id) return;

        const reader = new FileReader();

        if (file.name.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const names = results.data.map(row => row.Nama || row.Name).filter(Boolean);
                    if (names.length > 0) {
                        uploadGuestNames(names, 'impor');
                    } else {
                        alert('Tidak ada nama valid. Pastikan ada kolom "Nama" atau "Name".');
                    }
                }
            });
        } else if (file.name.endsWith('.txt')) {
            reader.onload = (event) => {
                const text = event.target.result;
                const names = text.split(/\r?\n/).map(name => name.trim()).filter(Boolean);
                if (names.length > 0) {
                    uploadGuestNames(names, 'impor');
                } else {
                    alert('File TXT kosong atau tidak berisi nama yang valid.');
                }
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx')) {
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    const names = json.map(row => row.Nama || row.Name).filter(Boolean);
                    if (names.length > 0) {
                        uploadGuestNames(names, 'impor');
                    } else {
                        alert('Tidak ada nama valid. Pastikan ada kolom "Nama" atau "Name" di file Excel Anda.');
                    }
                } catch (err) {
                    alert("Gagal membaca file Excel. Pastikan formatnya benar.");
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Format file tidak didukung. Silakan gunakan .csv, .txt, atau .xlsx');
        }
        e.target.value = null;
    };

    // Fungsi helper untuk mengirim nama ke backend
    const uploadGuestNames = async (names, type = 'impor') => {
        try {
            await api.post('/guests/create.php', {
                invitation_id: invitation.id,
                guests: names
            });
            if (type === 'impor') {
                alert(`${names.length} tamu berhasil diimpor.`);
            }
            fetchGuests();
        } catch (err) {
            alert(`Gagal ${type === 'impor' ? 'mengimpor' : 'menambah'} tamu.`);
        }
    };

    // ======================================================
    // FUNGSI-FUNGSI BARU UNTUK FITUR CENTANG
    // ======================================================
    const handleSelectGuest = (guestId) => {
        const newSelection = new Set(selectedGuests);
        if (newSelection.has(guestId)) {
            newSelection.delete(guestId);
        } else {
            newSelection.add(guestId);
        }
        setSelectedGuests(newSelection);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allGuestIds = new Set(guests.map(g => g.id));
            setSelectedGuests(allGuestIds);
        } else {
            setSelectedGuests(new Set());
        }
    };

    const handleCopySelectedLinks = () => {
        if (selectedGuests.size === 0) {
            alert('Silakan pilih tamu terlebih dahulu.');
            return;
        }
        const baseUrl = window.location.origin.replace(':3000', '');
        const textToCopy = guests
            .filter(guest => selectedGuests.has(guest.id))
            .map(guest => {
                const url = `${baseUrl}/undangan_digital_platform/public-site/undangan.html?id=${invitation.id}&to=${encodeURIComponent(guest.nama_tamu)}`;
                return `${guest.nama_tamu}\n${url}`;
            })
            .join('\n\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert(`${selectedGuests.size} link tamu berhasil disalin.`);
        });
    };

    if (!show) {
        return null;
    }

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Daftar Tamu untuk: {invitation?.judul || 'Undangan'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
                    {/* FITUR 1: Form tambah manual */}
                    <Form onSubmit={handleAddGuest} className="d-flex">
                        <InputGroup>
                            <Form.Control type="text" placeholder="Nama Tamu Baru" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} />
                            <Button variant="primary" type="submit">Tambah</Button>
                        </InputGroup>
                    </Form>
                    <div className="d-flex gap-2">
                        {/* Tombol Salin Banyak */}
                        <Button 
                            variant="info" 
                            onClick={handleCopySelectedLinks}
                            disabled={selectedGuests.size === 0}
                        >
                            Salin Link Terpilih ({selectedGuests.size})
                        </Button>
                        {/* FITUR 2: Tombol impor file */}
                        <input type="file" accept=".csv,.txt,.xlsx" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} />
                        <Button variant="outline-success" onClick={() => fileInputRef.current.click()}>Impor File</Button>
                    </div>
                </div>

                {loading && <div className="text-center"><Spinner animation="border" /></div>}
                {error && <Alert variant="danger">{error}</Alert>}
                {!loading && !error && (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }} className="text-center">
                                    <Form.Check 
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={guests.length > 0 && selectedGuests.size === guests.length}
                                        title="Pilih Semua"
                                    />
                                </th>
                                <th>Nama Tamu</th>
                                <th style={{ width: '200px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guests.length > 0 ? guests.map(guest => (
                                <tr key={guest.id}>
                                    <td className="text-center">
                                        <Form.Check 
                                            type="checkbox"
                                            checked={selectedGuests.has(guest.id)}
                                            onChange={() => handleSelectGuest(guest.id)}
                                        />
                                    </td>
                                    <td>{guest.nama_tamu}</td>
                                    <td>
                                        {/* FITUR 3 & 4: Tombol Salin 1 Link dan Hapus */}
                                        <Button variant="secondary" size="sm" className="me-2" onClick={() => handleCopyLink(guest.nama_tamu)}>Salin 1 Link</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteGuest(guest.id)}>Hapus</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" className="text-center">Belum ada tamu yang ditambahkan.</td></tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default GuestListModal;

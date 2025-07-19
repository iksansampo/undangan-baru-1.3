import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Spinner, Alert, Card, Form } from 'react-bootstrap';
import api from '../api';

const RsvpModal = ({ show, onHide, invitation }) => {
    const [rsvps, setRsvps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // State untuk menyimpan format ekspor yang dipilih
    const [exportFormat, setExportFormat] = useState('csv');

    const fetchRsvps = async () => {
        if (!invitation?.id) return;
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/rsvp/read.php?invitation_id=${invitation.id}`);
            setRsvps(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Gagal memuat data RSVP.');
            setRsvps([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchRsvps();
        }
    }, [show, invitation]);

    // Fungsi ekspor sekarang menggunakan state format
    const handleExport = () => {
        if (!invitation?.id) return;
        window.open(`${api.defaults.baseURL}/rsvp/export.php?invitation_id=${invitation.id}&format=${exportFormat}`, '_blank');
    };

    const validRsvps = Array.isArray(rsvps) ? rsvps : [];
    const summary = validRsvps.reduce((acc, rsvp) => {
        if (rsvp && typeof rsvp.kehadiran === 'string') {
            if (rsvp.kehadiran.toLowerCase() === 'hadir') {
                acc.hadir += 1;
            } else {
                acc.tidakHadir += 1;
            }
        }
        return acc;
    }, { hadir: 0, tidakHadir: 0 });

    if (!show) {
        return null;
    }

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Daftar Kehadiran & Ucapan</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5 className="mb-3">Untuk: {invitation?.judul}</h5>
                
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <div className="d-flex gap-3">
                        <Card bg="success" text="white" style={{ width: '10rem' }} className="text-center">
                            <Card.Body><Card.Title>{summary.hadir}</Card.Title><Card.Text>Hadir</Card.Text></Card.Body>
                        </Card>
                         <Card bg="danger" text="white" style={{ width: '10rem' }} className="text-center">
                            <Card.Body><Card.Title>{summary.tidakHadir}</Card.Title><Card.Text>Tidak Hadir</Card.Text></Card.Body>
                        </Card>
                         <Card bg="info" text="white" style={{ width: '10rem' }} className="text-center">
                            <Card.Body><Card.Title>{validRsvps.length}</Card.Title><Card.Text>Total Ucapan</Card.Text></Card.Body>
                        </Card>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Form.Select 
                            size="sm" 
                            style={{width: '120px'}}
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                        >
                            <option value="csv">Format CSV</option>
                            <option value="txt">Format TXT</option>
                        </Form.Select>
                        <Button variant="outline-success" onClick={handleExport}>Ekspor Data</Button>
                    </div>
                </div>

                {loading && <div className="text-center"><Spinner animation="border" /></div>}
                {error && <Alert variant="danger">{error}</Alert>}
                {!loading && !error && (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr><th>Nama Tamu</th><th>Kehadiran</th><th>Ucapan</th><th>Waktu</th></tr>
                        </thead>
                        <tbody>
                            {validRsvps.length > 0 ? validRsvps.map((rsvp, index) => (
                                <tr key={index}>
                                    <td>{rsvp.nama_tamu}</td>
                                    <td><span className={`badge ${rsvp.kehadiran?.toLowerCase() === 'hadir' ? 'bg-success' : 'bg-danger'}`}>{rsvp.kehadiran}</span></td>
                                    <td>{rsvp.ucapan}</td>
                                    <td>{new Date(rsvp.waktu).toLocaleString('id-ID')}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center">Belum ada data RSVP.</td></tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default RsvpModal;

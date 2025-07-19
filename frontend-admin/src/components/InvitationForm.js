import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert, Image, CloseButton } from 'react-bootstrap';
import api from '../api';

const UPLOAD_URL = 'http://localhost/undangan_digital_platform/backend/uploads/';

const InvitationForm = ({ show, onHide, onSave, invitationData }) => {
    // State awal yang mendefinisikan struktur data lengkap dari sebuah undangan
    const initialFormState = {
        judul: '',
        template_tema: 'classic_elegant.css',
        mempelai: {
            nama_pria: '', panggilan_pria: '', ayah_pria: '', ibu_pria: '', foto_pria: '',
            nama_wanita: '', panggilan_wanita: '', ayah_wanita: '', ibu_wanita: '', foto_wanita: ''
        },
        acara: [{ jenis_acara: 'Akad Nikah', tanggal: '', waktu: '', nama_tempat: '', link_gmaps: '' }],
        amplop: [{ tipe_hadiah: 'BCA', nomor_rekening: '', atas_nama: '' }],
        cerita: '',
        media: [], // Untuk galeri
        cover_slideshow: [], // Untuk cover
        musik_latar: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Mengisi form saat mode edit atau mereset form saat mode buat baru
    useEffect(() => {
        try {
            if (invitationData) { // Mode Edit
                const acaraData = (invitationData.acara || []).map(item => ({...item, tanggal: item.tanggal === '0000-00-00' ? '' : item.tanggal }));
                setFormData({
                    id: invitationData.undangan?.id,
                    judul: invitationData.undangan?.judul || '',
                    template_tema: invitationData.undangan?.template_tema || 'classic_elegant.css',
                    mempelai: invitationData.mempelai || initialFormState.mempelai,
                    acara: acaraData.length ? acaraData : initialFormState.acara,
                    amplop: invitationData.amplop?.length ? invitationData.amplop : initialFormState.amplop,
                    cerita: invitationData.cerita || '',
                    media: invitationData.media || [],
                    cover_slideshow: invitationData.undangan?.cover_slideshow ? JSON.parse(invitationData.undangan.cover_slideshow) : [],
                    musik_latar: invitationData.undangan?.musik_latar || ''
                });
            } else { // Mode Buat Baru
                setFormData(initialFormState);
            }
        } catch (error) {
            console.error("Error saat mengatur form data:", error);
            setFormData(initialFormState);
        }
    }, [invitationData, show]);

    // Menangani perubahan pada semua jenis input
    const handleChange = (e, section, index, field) => {
        const { name, value } = e.target;
        if (section) {
            const newSectionData = [...formData[section]];
            newSectionData[index][field] = value;
            setFormData({ ...formData, [section]: newSectionData });
        } else if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({ ...formData, [parent]: { ...formData[parent], [child]: value } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    // Menambah item dinamis (Acara, Amplop)
    const addItem = (section, item) => {
        setFormData({ ...formData, [section]: [...formData[section], item] });
    };

    // Menghapus item dinamis
    const removeItem = (section, index) => {
        const newItems = formData[section].filter((_, i) => i !== index);
        setFormData({ ...formData, [section]: newItems });
    };

    // Menangani upload file
    const handleFileChange = async (e, type, field = null) => {
        const files = e.target.files;
        if (!files.length) return;
        setUploading(true);
        setUploadError('');
        for (const file of files) {
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('type', type);
            try {
                const response = await api.post('/invitations/upload.php', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const filePath = response.data.filePath;
                if (type === 'gallery') {
                    setFormData(prev => ({ ...prev, media: [...prev.media, filePath] }));
                } else if (type === 'cover') {
                    setFormData(prev => ({ ...prev, cover_slideshow: [...prev.cover_slideshow, filePath] }));
                } else if (type === 'couple' && field) {
                    const [parent, child] = field.split('.');
                    setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: filePath } }));
                } else if (type === 'music' && field) {
                    setFormData(prev => ({ ...prev, [field]: filePath }));
                }
            } catch (error) {
                console.error('Gagal mengunggah file:', error);
                setUploadError(`Gagal mengunggah ${file.name}.`);
                break;
            }
        }
        setUploading(false);
    };

    // Fungsi baru untuk menghapus media
    const handleDeleteMedia = async (fileName, type, index = null, field = null) => {
        if (!window.confirm(`Yakin ingin menghapus file ini: ${fileName}?`)) return;
        try {
            await api.post('/invitations/delete_media.php', { fileName, type });
            if (type === 'cover') {
                setFormData(prev => ({ ...prev, cover_slideshow: prev.cover_slideshow.filter((item, i) => i !== index) }));
            } else if (type === 'gallery') {
                 setFormData(prev => ({ ...prev, media: prev.media.filter((item, i) => i !== index) }));
            } else if (type === 'music' && field) {
                setFormData(prev => ({ ...prev, [field]: '' }));
            }
            alert('File berhasil dihapus.');
        } catch (err) {
            alert('Gagal menghapus file.');
            console.error(err);
        }
    };

    // Saat form disubmit
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    
    // Helper untuk menampilkan URL gambar dengan fallback
    const getImageUrl = (type, fileName) => {
        if (!fileName) return "https://placehold.co/100x100/EAEAEA/333?text=No+Image";
        return `${UPLOAD_URL}${type}/${fileName}`;
    };
    
    if (!show) {
        return null; 
    }

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{invitationData ? `Edit Undangan (ID: ${invitationData.undangan?.id})` : 'Buat Undangan Baru'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <Form onSubmit={handleSubmit}>
                    
                    {/* --- BAGIAN PENGATURAN UTAMA (YANG HILANG) --- */}
                    <fieldset className="border p-3 mb-3">
                        <legend className="w-auto px-2 fs-5">Pengaturan Utama</legend>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>Judul Undangan</Form.Label>
                            <Col sm={9}><Form.Control type="text" name="judul" placeholder="Contoh: The Wedding of Budi & Citra" value={formData.judul} onChange={handleChange} required /></Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>Pilih Tema</Form.Label>
                            <Col sm={9}><Form.Select name="template_tema" value={formData.template_tema} onChange={handleChange}><option value="classic_elegant.css">Classic Elegant</option></Form.Select></Col>
                        </Form.Group>
                    </fieldset>

                    {/* --- FOTO SAMPUL (COVER) --- */}
                    <fieldset className="border p-3 mb-3">
                        <legend className="w-auto px-2 fs-5">Foto Sampul (Cover)</legend>
                        <Form.Group><Form.Label>Upload Foto untuk Cover</Form.Label><Form.Control type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} /></Form.Group>
                        <div className="mt-2 d-flex flex-wrap gap-2">
                            {formData.cover_slideshow.map((img, i) => (
                                <div key={i} className="position-relative"><Image src={getImageUrl('cover', img)} thumbnail width="100" /><CloseButton className="position-absolute top-0 end-0 bg-light rounded-circle" style={{ transform: 'translate(30%, -30%)' }} onClick={() => handleDeleteMedia(img, 'cover', i)} /></div>
                            ))}
                        </div>
                    </fieldset>
                    
                    {/* --- INFORMASI MEMPELAI --- */}
                    <fieldset className="border p-3 mb-3">
                        <legend className="w-auto px-2 fs-5">Informasi Mempelai</legend>
                        <Row>
                            <Col md={6} className="border-end pe-3">
                                <h5 className="mb-3 text-center">Mempelai Pria</h5>
                                <Image src={getImageUrl('couple', formData.mempelai.foto_pria)} roundedCircle width="100" height="100" className="d-block mx-auto mb-3 object-fit-cover" />
                                <Form.Control className="mb-2" placeholder="Nama Lengkap Pria" name="mempelai.nama_pria" value={formData.mempelai.nama_pria} onChange={handleChange} />
                                <Form.Control className="mb-2" placeholder="Nama Panggilan Pria" name="mempelai.panggilan_pria" value={formData.mempelai.panggilan_pria} onChange={handleChange} />
                                <Form.Control className="mb-2" placeholder="Nama Ayah" name="mempelai.ayah_pria" value={formData.mempelai.ayah_pria} onChange={handleChange} />
                                <Form.Control className="mb-2" placeholder="Nama Ibu" name="mempelai.ibu_pria" value={formData.mempelai.ibu_pria} onChange={handleChange} />
                                <Form.Label>Ganti Foto Pria</Form.Label><Form.Control type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'couple', 'mempelai.foto_pria')} />
                            </Col>
                            <Col md={6} className="ps-3">
                                <h5 className="mb-3 text-center">Mempelai Wanita</h5>
                                <Image src={getImageUrl('couple', formData.mempelai.foto_wanita)} roundedCircle width="100" height="100" className="d-block mx-auto mb-3 object-fit-cover" />
                                <Form.Control className="mb-2" placeholder="Nama Lengkap Wanita" name="mempelai.nama_wanita" value={formData.mempelai.nama_wanita} onChange={handleChange} />
                                <Form.Control className="mb-2" placeholder="Nama Panggilan Wanita" name="mempelai.panggilan_wanita" value={formData.mempelai.panggilan_wanita} onChange={handleChange} />
                                <Form.Control className="mb-2" placeholder="Nama Ayah" name="mempelai.ayah_wanita" value={formData.mempelai.ayah_wanita} onChange={handleChange} />
                                <Form.Control className="mb-2" placeholder="Nama Ibu" name="mempelai.ibu_wanita" value={formData.mempelai.ibu_wanita} onChange={handleChange} />
                                <Form.Label>Ganti Foto Wanita</Form.Label><Form.Control type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'couple', 'mempelai.foto_wanita')} />
                            </Col>
                        </Row>
                    </fieldset>

                    {/* --- DETAIL ACARA --- */}
                    <fieldset className="border p-3 mb-3">
                        <legend className="w-auto px-2 fs-5">Detail Acara</legend>
                        {formData.acara.map((item, index) => (
                            <div key={index} className="dynamic-field-group bg-light p-3 border rounded mb-3">
                                <h6 className="mb-3">Acara ke-{index + 1}</h6>
                                <Form.Control className="mb-2" placeholder="Jenis Acara (cth: Akad Nikah)" value={item.jenis_acara} onChange={(e) => handleChange(e, 'acara', index, 'jenis_acara')} />
                                <Form.Control className="mb-2" type="date" value={item.tanggal} onChange={(e) => handleChange(e, 'acara', index, 'tanggal')} />
                                <Form.Control className="mb-2" type="time" value={item.waktu} onChange={(e) => handleChange(e, 'acara', index, 'waktu')} />
                                <Form.Control className="mb-2" placeholder="Nama Tempat & Alamat" value={item.nama_tempat} onChange={(e) => handleChange(e, 'acara', index, 'nama_tempat')} />
                                <Form.Control className="mb-2" placeholder="Link Google Maps (opsional)" value={item.link_gmaps} onChange={(e) => handleChange(e, 'acara', index, 'link_gmaps')} />
                                {formData.acara.length > 1 && <Button variant="danger" size="sm" className="btn-remove-item" onClick={() => removeItem('acara', index)}>Hapus Acara Ini</Button>}
                            </div>
                        ))}
                        <Button variant="outline-primary" onClick={() => addItem('acara', { jenis_acara: 'Resepsi', tanggal: '', waktu: '', nama_tempat: '', link_gmaps: '' })}>+ Tambah Acara</Button>
                    </fieldset>
                    
                    {/* --- MUSIK LATAR --- */}
                    <fieldset className="border p-3 mb-3">
                        <legend className="w-auto px-2 fs-5">Musik Latar</legend>
                        <Form.Group>
                            <Form.Label>Upload Musik (MP3, WAV)</Form.Label>
                            <Form.Control type="file" accept=".mp3,.wav" onChange={(e) => handleFileChange(e, 'music', 'musik_latar')} />
                            {formData.musik_latar && (
                                <div className="mt-2 d-flex align-items-center gap-2"><p className="mb-0 text-muted">File: {formData.musik_latar}</p><Button variant="outline-danger" size="sm" onClick={() => handleDeleteMedia(formData.musik_latar, 'music', null, 'musik_latar')}>Hapus Musik</Button></div>
                            )}
                        </Form.Group>
                    </fieldset>

                    {/* --- AMPLOP DIGITAL --- */}
                    <fieldset className="border p-3 mb-3">
                        <legend className="w-auto px-2 fs-5">Amplop Digital</legend>
                        {formData.amplop.map((item, index) => (
                            <div key={index} className="dynamic-field-group bg-light p-3 border rounded mb-3">
                                <h6 className="mb-3">Hadiah ke-{index + 1}</h6>
                                <Form.Control className="mb-2" placeholder="Tipe Hadiah (cth: BCA, GoPay)" value={item.tipe_hadiah} onChange={(e) => handleChange(e, 'amplop', index, 'tipe_hadiah')} />
                                <Form.Control className="mb-2" placeholder="Nomor Rekening / No. HP" value={item.nomor_rekening} onChange={(e) => handleChange(e, 'amplop', index, 'nomor_rekening')} />
                                <Form.Control className="mb-2" placeholder="Atas Nama" value={item.atas_nama} onChange={(e) => handleChange(e, 'amplop', index, 'atas_nama')} />
                                {formData.amplop.length > 1 && <Button variant="danger" size="sm" className="btn-remove-item" onClick={() => removeItem('amplop', index)}>Hapus Hadiah Ini</Button>}
                            </div>
                        ))}
                        <Button variant="outline-primary" onClick={() => addItem('amplop', { tipe_hadiah: '', nomor_rekening: '', atas_nama: '' })}>+ Tambah Hadiah</Button>
                    </fieldset>

                    {/* --- GALERI FOTO & VIDEO --- */}
                    <fieldset className="border p-3 mb-3">
                        <legend className="w-auto px-2 fs-5">Galeri Foto & Video</legend>
                        <Form.Group>
                            <Form.Label>Upload Media untuk Galeri</Form.Label>
                            <Form.Control type="file" multiple accept="image/*,video/mp4,video/webm" onChange={(e) => handleFileChange(e, 'gallery')} />
                        </Form.Group>
                         <div className="mt-2 d-flex flex-wrap gap-2">
                            {formData.media.map((file, i) => (
                                <div key={i} className="position-relative">
                                    {file.endsWith('.mp4') || file.endsWith('.webm') ? (
                                        <video src={getImageUrl('gallery', file)} width="100" className="img-thumbnail" />
                                    ) : (
                                        <Image src={getImageUrl('gallery', file)} thumbnail width="100" />
                                    )}
                                    <CloseButton className="position-absolute top-0 end-0 bg-light rounded-circle" style={{ transform: 'translate(30%, -30%)' }} onClick={() => handleDeleteMedia(file, 'gallery', i)} />
                                </div>
                            ))}
                        </div>
                    </fieldset>

                    {/* --- KONTEN TAMBAHAN --- */}
                    <fieldset className="border p-3 mb-3">
                        <legend className="w-auto px-2 fs-5">Konten Tambahan</legend>
                        <Form.Group><Form.Label>Cerita Cinta</Form.Label><Form.Control as="textarea" rows={5} placeholder="Tuliskan cerita cinta Anda di sini..." name="cerita" value={formData.cerita} onChange={handleChange} /></Form.Group>
                    </fieldset>

                    {uploading && <div className="text-center my-3"><Spinner animation="border" /> <p>Mengunggah file...</p></div>}
                    {uploadError && <Alert variant="danger">{uploadError}</Alert>}

                    <Button variant="primary" type="submit" className="w-100 mt-3" disabled={uploading}>
                        {uploading ? 'Menunggu file diunggah...' : (invitationData ? 'Perbarui Undangan' : 'Simpan Undangan')}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default InvitationForm;

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost/undangan_digital_platform/backend/api';
    const UPLOAD_BASE_URL = 'http://localhost/undangan_digital_platform/backend/uploads';

    // Variabel global untuk interval agar bisa dihentikan
    let countdownInterval;

    const coverScreen = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    const openButton = document.getElementById('open-invitation-btn');
    const audioControl = document.getElementById('audio-control');
    const backgroundMusic = document.getElementById('background-music');
    const themeStyle = document.getElementById('theme-style');

    const getUrlParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return { id: urlParams.get('id'), to: urlParams.get('to') || 'Tamu Undangan' };
    };

    const fetchInvitationData = async (id) => {
        if (!id) {
            document.body.innerHTML = '<h1>Error: ID Undangan tidak valid.</h1>';
            return null;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/invitations/read_single.php?id=${id}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Gagal mengambil data undangan:', error);
            document.body.innerHTML = `<h1>Error: Tidak dapat memuat data undangan.</h1>`;
            return null;
        }
    };

    // Fungsi baru untuk logika countdown
    const startCountdown = (targetDate) => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        const countdownTimerEl = document.getElementById('countdown-timer');
        const countdownFinishedEl = document.getElementById('countdown-finished');
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                if(countdownTimerEl) countdownTimerEl.style.display = 'none';
                if(countdownFinishedEl) countdownFinishedEl.style.display = 'block';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if(daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if(hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if(minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if(secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        };

        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    };

    const populatePage = (data) => {
        if (!data || !data.mempelai) return;
        const { undangan, mempelai, acara, cerita, media, amplop, rsvp } = data;

        document.title = `Undangan Pernikahan ${mempelai.panggilan_pria} & ${mempelai.panggilan_wanita}`;
        themeStyle.href = `assets/themes/${undangan.template_tema}`;
        if (undangan.musik_latar) {
            backgroundMusic.src = `${UPLOAD_BASE_URL}/music/${undangan.musik_latar}`;
            audioControl.style.display = 'flex';
        }
        
        document.getElementById('cover-couple-names').textContent = `${mempelai.panggilan_pria} & ${mempelai.panggilan_wanita}`;
        document.getElementById('guest-name').textContent = getUrlParams().to;

        const heroSection = document.getElementById('hero');
        if (undangan.cover_slideshow) {
             const coverImages = JSON.parse(undangan.cover_slideshow);
             if(coverImages.length > 0) {
                 heroSection.style.backgroundImage = `url(${UPLOAD_BASE_URL}/cover/${coverImages[0]})`;
             }
        }
        document.getElementById('hero-couple-names').textContent = `${mempelai.panggilan_pria} & ${mempelai.panggilan_wanita}`;
        if(acara && acara.length > 0) {
            const mainEventDate = new Date(acara[0].tanggal);
            document.getElementById('hero-date').textContent = mainEventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        document.getElementById('couple-details').innerHTML = `
            <div class="couple-person"><img src="${UPLOAD_BASE_URL}/couple/${mempelai.foto_pria}" alt="Foto ${mempelai.nama_pria}"><h3>${mempelai.nama_pria}</h3><p>Putra dari Bapak ${mempelai.ayah_pria} & Ibu ${mempelai.ibu_pria}</p></div>
            <div class="couple-person"><img src="${UPLOAD_BASE_URL}/couple/${mempelai.foto_wanita}" alt="Foto ${mempelai.nama_wanita}"><h3>${mempelai.nama_wanita}</h3><p>Putri dari Bapak ${mempelai.ayah_wanita} & Ibu ${mempelai.ibu_wanita}</p></div>`;

        document.getElementById('event-details').innerHTML = acara.map(item => `
            <div class="event-card"><h3>${item.jenis_acara}</h3><p>${new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><p>Pukul ${item.waktu} WIB</p><p>${item.nama_tempat}</p>${item.link_gmaps ? `<a href="${item.link_gmaps}" target="_blank" class="btn-primary" style="margin-top: 15px;">Lihat Peta</a>` : ''}</div>`
        ).join('');

        const storyContent = document.getElementById('story-content');
        if (cerita && storyContent) storyContent.textContent = cerita;

        const galleryGrid = document.getElementById('gallery-grid');
        if (media && Array.isArray(media) && galleryGrid) {
            galleryGrid.innerHTML = media.map(fileUrl => {
                const fullUrl = `${UPLOAD_BASE_URL}/gallery/${fileUrl}`;
                const isVideo = fileUrl.endsWith('.mp4') || fileUrl.endsWith('.webm');
                if (isVideo) {
                    return `<div class="gallery-item"><video controls preload="metadata" class="gallery-video"><source src="${fullUrl}" type="video/mp4"></video></div>`;
                } else {
                    return `<div class="gallery-item"><img src="${fullUrl}" alt="Foto Galeri" class="gallery-image"></div>`;
                }
            }).join('');
        }

        const giftContainer = document.getElementById('gift-details');
        if (amplop && Array.isArray(amplop) && giftContainer) {
            giftContainer.innerHTML = amplop.map(item => `
                <div class="gift-card"><h4>${item.tipe_hadiah}</h4><p>${item.nomor_rekening}</p><p>a.n. ${item.atas_nama}</p><button class="btn-primary btn-copy" data-clipboard="${item.nomor_rekening}">Salin Nomor</button></div>`
            ).join('');
        }

        const rsvpList = document.getElementById('rsvp-list');
        if (rsvp && Array.isArray(rsvp) && rsvpList) {
            if (rsvp.length > 0) {
                rsvpList.innerHTML = '<h3>Ucapan & Doa</h3>' + rsvp.map(item => `
                    <div class="rsvp-item">
                        <p class="name">${item.nama_tamu} <span class="status ${item.kehadiran?.toLowerCase() === 'hadir' ? 'hadir' : 'tidak-hadir'}">${item.kehadiran}</span></p>
                        <p class="message">"${item.ucapan}"</p>
                        <p class="time" style="font-size: 0.8em; color: #888;">${new Date(item.waktu).toLocaleString('id-ID')}</p>
                    </div>`).join('');
            } else {
                rsvpList.innerHTML = '<h3>Ucapan & Doa</h3><p>Jadilah yang pertama memberikan ucapan.</p>';
            }
        }
        
        if (acara && acara.length > 0) {
            const mainEvent = acara[0];
            const targetDateTimeString = `${mainEvent.tanggal}T${mainEvent.waktu}`;
            const targetDate = new Date(targetDateTimeString).getTime();
            if (!isNaN(targetDate)) {
                startCountdown(targetDate);
            } else {
                console.error("Format tanggal atau waktu acara tidak valid:", targetDateTimeString);
                const countdownSection = document.getElementById('countdown-section');
                if(countdownSection) countdownSection.style.display = 'none';
            }
        } else {
            const countdownSection = document.getElementById('countdown-section');
            if(countdownSection) countdownSection.style.display = 'none';
        }
    };

    const addEventListeners = () => {
        openButton.addEventListener('click', () => {
            coverScreen.style.opacity = '0';
            coverScreen.style.transform = 'translateY(-100%)';
            setTimeout(() => coverScreen.style.display = 'none', 1000);
            mainContent.style.display = 'block';
            document.body.style.overflowY = 'auto';
            if (backgroundMusic.src) {
                backgroundMusic.play().catch(e => console.error("Audio play failed:", e));
                audioControl.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        });
        audioControl.addEventListener('click', () => {
            if (backgroundMusic.paused) {
                backgroundMusic.play();
                audioControl.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                backgroundMusic.pause();
                audioControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        });
        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-copy')) {
                const textToCopy = e.target.dataset.clipboard;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    e.target.textContent = 'Berhasil Disalin!';
                    setTimeout(() => e.target.textContent = 'Salin Nomor', 2000);
                });
            }
        });
        const rsvpForm = document.getElementById('rsvp-form');
        if(rsvpForm) {
            rsvpForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const params = getUrlParams();
                const payload = {
                    undangan_id: params.id,
                    nama_tamu: document.getElementById('rsvp-name').value,
                    kehadiran: document.getElementById('rsvp-status').value,
                    ucapan: document.getElementById('rsvp-message').value
                };
                try {
                    const response = await fetch(`${API_BASE_URL}/rsvp/create.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const result = await response.json();
                    alert(result.message);
                    if (response.ok) {
                        e.target.reset();
                        const newData = await fetchInvitationData(params.id);
                        populatePage(newData);
                    }
                } catch (error) {
                    alert('Terjadi kesalahan. Silakan coba lagi.');
                }
            });
        }
    };

    const init = async () => {
        const params = getUrlParams();
        document.body.style.overflowY = 'hidden';
        const data = await fetchInvitationData(params.id);
        populatePage(data);
        addEventListeners();
    };

    init();
});

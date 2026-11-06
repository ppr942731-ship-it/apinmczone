// ==========================================
// ARPIMC ZONE — SCRIPT.JS LENGKAP
// ==========================================

// ---------- VARIABEL GLOBAL ----------
let allSkins = [];
let allAddons = [];
let allGames = [];
let infoData = {};
let currentSkinFilter = 'semua';
let currentAddonFilter = 'semua';
let currentGameFilter = 'semua';
let currentData = null;

// ---------- SAAT HALAMAN DIMUAT ----------
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    initNavigation();
    initSidebar();
    initThemes();
    handleUrlSlug();
});

// ---------- MUAT SEMUA DATA ----------
async function loadAllData() {
    try {
        // Muat Skin biasa
        const resSkins = await fetch('skins.json');
        allSkins = await resSkins.json();
        
        // Muat Emote
        try {
            const resEmote = await fetch('emote.json');
            const emoteData = await resEmote.json();
            emoteData.forEach(item => {
                item.kategori = 'emote';
                allSkins.push(item);
            });
        } catch (e) { console.log('emote.json tidak ditemukan, dilewati'); }

        // Muat Skin Couple
        try {
            const resCouple = await fetch('couple.json');
            const coupleData = await resCouple.json();
            coupleData.forEach(item => {
                item.kategori = 'couple';
                allSkins.push(item);
            });
        } catch (e) { console.log('couple.json tidak ditemukan, dilewati'); }

        // Muat Skin JJ
        try {
            const resJJ = await fetch('skinjj.json');
            const jjData = await resJJ.json();
            jjData.forEach(item => {
                item.kategori = 'jj';
                allSkins.push(item);
            });
        } catch (e) { console.log('skinjj.json tidak ditemukan, dilewati'); }

        document.getElementById('skinCount').textContent = allSkins.length;
        renderSkins();
    } catch (e) {
        console.error('Gagal memuat skins.json', e);
    }

    try {
        const resAddons = await fetch('addons.json');
        allAddons = await resAddons.json();
        renderAddons();
    } catch (e) {
        console.error('Gagal memuat addons.json', e);
    }

    try {
        const resGames = await fetch('games.json');
        allGames = await resGames.json();
        renderGames();
    } catch (e) {
        console.error('Gagal memuat games.json', e);
    }

    try {
        const resInfo = await fetch('data.json');
        infoData = await resInfo.json();
        renderInfo();
    } catch (e) {
        console.error('Gagal memuat data.json', e);
    }
}

// ---------- NAVIGASI BAWAH ----------
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPage = item.getAttribute('data-page');
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(targetPage).classList.add('active');
            
            closeSidebar();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// ---------- SIDEBAR & TEMA ----------
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');

    menuToggle.addEventListener('click', openSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
}

function openSidebar() {
    document.getElementById('sidebar').classList.add('active');
    document.getElementById('sidebarOverlay').classList.add('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

function initThemes() {
    const savedTheme = localStorage.getItem('armc-theme') || 'default';
    document.body.setAttribute('data-theme', savedTheme);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === savedTheme);
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('armc-theme', theme);
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// ---------- RENDER SKIN ----------
function renderSkins() {
    const grid = document.getElementById('skinGrid');
    let filtered = allSkins;

    if (currentSkinFilter !== 'semua') {
        filtered = allSkins.filter(s => 
            (s.kategori === currentSkinFilter) || 
            (s.tipe === currentSkinFilter)
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state">Belum ada item</div>';
        return;
    }

    grid.innerHTML = filtered.map((skin, idx) => {
        const uniqueId = skin.slug || `${skin.kategori || skin.tipe}-id=${skin.id || idx}`;
        return `
        <div class="card">
            <img src="${skin.gambar || skin.img || ''}" alt="${skin.nama}" class="card-image" loading="lazy">
            <div class="card-body">
                <h3 class="card-title">${skin.nama}</h3>
                <div class="card-buttons">
                    <button class="card-btn preview" data-id="${idx}" data-type="skin">Preview</button>
                    <button class="card-btn download" data-id="${idx}" data-type="skin-download">Unduh</button>
                </div>
            </div>
        </div>`;
    }).join('');

    // Pasang event listener
    grid.querySelectorAll('.card-btn.preview').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-id'));
            openPreviewModal(allSkins[idx], 'skin');
        });
    });

    grid.querySelectorAll('.card-btn.download').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-id'));
            handleDownload(allSkins[idx], 'skin');
        });
    });

    // Filter tab
    document.querySelectorAll('#skinFilters .filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#skinFilters .filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentSkinFilter = tab.getAttribute('data-filter');
            renderSkins();
        });
    });
}

// ---------- RENDER ADDON ----------
function renderAddons() {
    const grid = document.getElementById('addonGrid');
    let filtered = allAddons;

    if (currentAddonFilter !== 'semua') {
        filtered = allAddons.filter(a => a.kategori === currentAddonFilter);
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state">Belum ada item</div>';
        return;
    }

    grid.innerHTML = filtered.map((addon, idx) => `
    <div class="card">
        <img src="${addon.gambar || addon.img || ''}" alt="${addon.nama}" class="card-image" loading="lazy">
        <div class="card-body">
            <h3 class="card-title">${addon.nama}</h3>
            <div class="card-buttons">
                <button class="card-btn preview" data-id="${idx}" data-type="addon">Preview</button>
                <a href="${addon.file || addon.download || '#'}" target="_blank" class="card-btn download">Unduh</a>
            </div>
        </div>
    </div>`).join('');

    grid.querySelectorAll('.card-btn.preview').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-id'));
            openPreviewModal(allAddons[idx], 'addon');
        });
    });

    document.querySelectorAll('#addonFilters .filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#addonFilters .filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentAddonFilter = tab.getAttribute('data-filter');
            renderAddons();
        });
    });
}

// ---------- RENDER GAME ----------
function renderGames() {
    const grid = document.getElementById('gameGrid');
    let filtered = allGames;

    if (currentGameFilter !== 'semua') {
        filtered = allGames.filter(g => g.tipe === currentGameFilter);
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state">Belum ada item</div>';
        return;
    }

    grid.innerHTML = filtered.map(game => `
    <div class="game-card">
        <h3 class="game-title">${game.nama}</h3>
        <p class="game-desc">${game.deskripsi || ''}</p>
        <a href="${game.link || '#'}" target="_blank" class="game-btn">Mainkan →</a>
    </div>`).join('');

    document.querySelectorAll('#gameFilters .filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#gameFilters .filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentGameFilter = tab.getAttribute('data-filter');
            renderGames();
        });
    });
}

// ---------- RENDER INFO — ACCORDION ----------
function renderInfo() {
    if (!infoData.deskripsi) return;
    
    document.getElementById('infoDesc').textContent = infoData.deskripsi;
    const container = document.getElementById('infoContent');

    let html = '';

    // Saluran
    if (infoData.saluran && infoData.saluran.length > 0) {
        html += `
        <div class="accordion-item">
            <button class="accordion-header">
                <span>📡 Saluran</span>
                <span class="accordion-icon">▼</span>
            </button>
            <div class="accordion-content">
                <div class="accordion-inner">
                    ${infoData.saluran.map(s => `
                    <div class="info-item">
                        <div class="info-name">${s.nama}</div>
                        <a href="${s.link}" target="_blank" class="info-link">Kunjungi Saluran →</a>
                    </div>`).join('')}
                </div>
            </div>
        </div>`;
    }

    // Grup
    if (infoData.grup && infoData.grup.length > 0) {
        html += `
        <div class="accordion-item">
            <button class="accordion-header">
                <span>👥 Komunitas / Grup</span>
                <span class="accordion-icon">▼</span>
            </button>
            <div class="accordion-content">
                <div class="accordion-inner">
                    ${infoData.grup.map(g => `
                    <div class="info-item">
                        <div class="info-name">${g.nama}</div>
                        <a href="${g.link}" target="_blank" class="info-link">Gabung ke Grup →</a>
                    </div>`).join('')}
                </div>
            </div>
        </div>`;
    }

    // Sosmed
    if (infoData.sosmed && infoData.sosmed.length > 0) {
        html += `
        <div class="accordion-item">
            <button class="accordion-header">
                <span>📱 Sosial Media</span>
                <span class="accordion-icon">▼</span>
            </button>
            <div class="accordion-content">
                <div class="accordion-inner">
                    ${infoData.sosmed.map(s => `
                    <div class="info-item">
                        <div class="info-name">${s.nama}</div>
                        <a href="${s.link}" target="_blank" class="info-link">Kunjungi →</a>
                    </div>`).join('')}
                </div>
            </div>
        </div>`;
    }

    // Dukungan
    if (infoData.dukungan) {
        html += `
        <div class="accordion-item">
            <button class="accordion-header">
                <span>💜 Dukungan</span>
                <span class="accordion-icon">▼</span>
            </button>
            <div class="accordion-content">
                <div class="accordion-inner">
                    <p class="support-desc">${infoData.dukungan.deskripsi || ''}</p>
                    <a href="${infoData.dukungan.link}" target="_blank" class="info-link">Dukung Kami →</a>
                </div>
            </div>
        </div>`;
    }

    container.innerHTML = html;

    // Buka-tutup accordion
    container.querySelectorAll('.accordion-header').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentElement.classList.toggle('open');
        });
    });
}

// ---------- MODAL PREVIEW ----------
function openPreviewModal(data, tipe) {
    currentData = { ...data, tipe };
    
    document.getElementById('modalTitle').textContent = data.nama;
    document.getElementById('modalImage').src = data.gambar || data.img || '';
    document.getElementById('modalDesc').textContent = data.deskripsi || '';
    
    let metaText = '';
    if (data.tanggal) metaText += `📅 ${data.tanggal}`;
    if (data.kategori) metaText += `  •  ${data.kategori}`;
    document.getElementById('modalMeta').textContent = metaText;

    // Link bagikan
    const slug = data.slug || `${tipe}-id=${data.id || ''}`;
    const pageUrl = window.location.origin + window.location.pathname + '?' + slug;

    // Salin link
    document.getElementById('modalCopyLink').onclick = () => {
        navigator.clipboard.writeText(pageUrl).then(() => showToast('Tautan disalin! ✅'));
    };

    // Bagikan WA
    document.getElementById('modalShareWA').onclick = () => {
        const text = `${data.nama}%0A%0ALihat di ArpiMC Zone:%0A${encodeURIComponent(pageUrl)}`;
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    // Link dukungan
    const supportLink = infoData.dukungan?.link || '#';
    document.getElementById('modalSupport').href = supportLink;

    // Tampilkan/sembunyikan tombol unduh utama
    const downloadArea = document.getElementById('modalDownloadArea');
    const topDownload = document.getElementById('modalTopDownload');
    
    if (tipe === 'addon') {
        topDownload.style.display = 'inline-block';
        topDownload.onclick = () => window.open(data.file || data.download || '#', '_blank');
        downloadArea.style.display = 'none';
    } else {
        topDownload.style.display = 'none';
        downloadArea.style.display = 'block';
        document.getElementById('modalMainDownload').onclick = () => handle
// lanjutan...
handleDownload(data, tipe);
    };

    document.getElementById('previewModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePreviewModal() {
    document.getElementById('previewModal').classList.remove('active');
    document.body.style.overflow = '';
    currentData = null;
}

// ---------- FUNGSI UNDUH: SKIN, COUPLE, SKIN JJ ----------
function handleDownload(item, tipe) {
    const kategori = item.kategori || '';
    
    if (kategori === 'couple') {
        // Tampilkan pilihan Couple
        document.getElementById('coupleModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        document.getElementById('dlCowok').onclick = () => {
            if (item.unduh_cowok) window.open(item.unduh_cowok, '_blank');
            closeCoupleModal();
            showToast('Mulai mengunduh Cowok...');
        };
        document.getElementById('dlCewek').onclick = () => {
            if (item.unduh_cewek) window.open(item.unduh_cewek, '_blank');
            closeCoupleModal();
            showToast('Mulai mengunduh Cewek...');
        };
        return;
    }
    
    if (kategori === 'jj') {
        // Tampilkan pilihan Skin JJ
        document.getElementById('jjModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        document.getElementById('dlJJSkin').onclick = () => {
            if (item.file_skin || item.skin) window.open(item.file_skin || item.skin, '_blank');
            closeJJModal();
            showToast('Mengunduh Skin...');
        };
        document.getElementById('dlJJImg').onclick = () => {
            if (item.gambar) window.open(item.gambar, '_blank');
            closeJJModal();
            showToast('Mengunduh Gambar...');
        };
        document.getElementById('dlJJAll').onclick = () => {
            if (item.zip_semua || item.zip) window.open(item.zip_semua || item.zip, '_blank');
            closeJJModal();
            showToast('Mengunduh Semua Gambar...');
        };
        return;
    }
    
    // Unduh biasa
    const link = item.file || item.download || item.link || '#';
    window.open(link, '_blank');
    showToast('Mulai mengunduh...');
}

function closeCoupleModal() {
    document.getElementById('coupleModal').classList.remove('active');
    document.body.style.overflow = '';
}

function closeJJModal() {
    document.getElementById('jjModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ---------- BUKA DETAIL DARI URL / SLUG ----------
function handleUrlSlug() {
    const params = new URLSearchParams(window.location.search);
    
    for (const [key, value] of params.entries()) {
        if (key.includes('-id=')) continue;
        
        // Cari di Skin
        const foundSkin = allSkins.find(s => 
            s.slug === key || String(s.id) === value
        );
        if (foundSkin) {
            setTimeout(() => openPreviewModal(foundSkin, 'skin'), 300);
            return;
        }
        
        // Cari di Addon
        const foundAddon = allAddons.find(a => 
            a.slug === key || String(a.id) === value
        );
        if (foundAddon) {
            setTimeout(() => openPreviewModal(foundAddon, 'addon'), 300);
            return;
        }
    }
}

// ---------- KEMBALI KE BERANDA ----------
function goHome() {
    window.location.href = window.location.pathname;
}

// ---------- NOTIFIKASI TOAST ----------
function showToast(pesan) {
    const toast = document.getElementById('toast');
    toast.textContent = pesan;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---------- TUTUP MODAL KETIK KLIK LUAR ----------
document.getElementById('previewModal').addEventListener('click', (e) => {
    if (e.target.id === 'previewModal') closePreviewModal();
});
document.getElementById('coupleModal').addEventListener('click', (e) => {
    if (e.target.id === 'coupleModal') closeCoupleModal();
});
document.getElementById('jjModal').addEventListener('click', (e) => {
    if (e.target.id === 'jjModal') closeJJModal();
});

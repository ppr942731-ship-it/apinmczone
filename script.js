// ==========================================
// ARPIMC ZONE — SCRIPT.JS BAGIAN 1
// ==========================================

let allSkins = [];
let allAddons = [];
let allGames = [];
let infoData = {};
let currentSkinFilter = 'semua';
let currentAddonFilter = 'semua';
let currentGameFilter = 'semua';
let currentData = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    initNavigation();
    initSidebar();
    initThemes();
    initCosloTheme();
    handleUrlSlug();
});

// ---------- MUAT SEMUA DATA ----------
async function loadAllData() {
    try {
        const resSkins = await fetch('skins.json');
        allSkins = await resSkins.json();
        
        try {
            const resEmote = await fetch('emote.json');
            const emoteData = await resEmote.json();
            emoteData.forEach((item, idx) => {
                item.kategori = 'emote';
                if (!item.id) item.id = idx + 1;
                allSkins.push(item);
            });
        } catch (e) { console.log('emote.json dilewati'); }

        try {
            const resCouple = await fetch('couple.json');
            const coupleData = await resCouple.json();
            coupleData.forEach((item, idx) => {
                item.kategori = 'couple';
                if (!item.id) item.id = idx + 1;
                allSkins.push(item);
            });
        } catch (e) { console.log('couple.json dilewati'); }

        try {
            const resJJ = await fetch('skinjj.json');
            const jjData = await resJJ.json();
            jjData.forEach((item, idx) => {
                item.kategori = 'jj';
                if (!item.id) item.id = idx + 1;
                allSkins.push(item);
            });
        } catch (e) { console.log('skinjj.json dilewati'); }

        document.getElementById('skinCount').textContent = allSkins.length;
        renderSkins();
    } catch (e) {
        console.error('Gagal memuat skins.json', e);
    }

    try {
        const resAddons = await fetch('addons.json');
        allAddons = await resAddons.json();
        renderAddons();
    } catch (e) { console.error('Addons gagal', e); }

    try {
        const resGames = await fetch('games.json');
        allGames = await resGames.json();
        renderGames();
    } catch (e) { console.error('Games gagal', e); }

    try {
        const resInfo = await fetch('data.json');
        infoData = await resInfo.json();
        renderInfo();
    } catch (e) { console.error('Info gagal', e); }
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
            window.scrollTo({ top: 0 });
        });
    });
}

// ---------- SIDEBAR & TEMA ----------
function initSidebar() {
    document.getElementById('menuToggle').onclick = openSidebar;
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.onclick = closeSidebar;
    const closeBtn = document.getElementById('closeSidebar');
    if (closeBtn) closeBtn.onclick = closeSidebar;
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function initThemes() {
    const savedTheme = localStorage.getItem('armc-theme') || 'default';
    document.body.setAttribute('data-theme', savedTheme);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === savedTheme);
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            if (theme === 'coslo') {
                openCosloModal();
                return;
            }
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('armc-theme', theme);
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localStorage.removeItem('cosloBg');
            document.body.style.backgroundImage = '';
        });
    });
}

// ---------- TEMA COSLO — LATAR KUSTOM ----------
function initCosloTheme() {
    const savedBg = localStorage.getItem('cosloBg');
    if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
    }
    
    const fileInput = document.getElementById('cosloImageInput');
    if (fileInput) {
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const bgUrl = event.target.result;
                    localStorage.setItem('cosloBg', bgUrl);
                    document.body.style.backgroundImage = `url(${bgUrl})`;
                    closeCosloModal();
                    showToast('Latar berhasil diatur! ✅');
                };
                reader.readAsDataURL(file);
            }
        };
    }
}

function openCosloModal() {
    document.getElementById('cosloModal').style.display = 'flex';
}

function closeCosloModal() {
    document.getElementById('cosloModal').style.display = 'none';
    document.getElementById('cosloImageInput').value = '';
}

function resetCoslo() {
    localStorage.removeItem('cosloBg');
    document.body.style.backgroundImage = '';
    closeCosloModal();
    showToast('Latar dihapus!');
}

// ---------- RENDER SKIN ----------
function renderSkins() {
    const grid = document.getElementById('skinGrid');
    if (!grid) return;
    
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
        const displayName = skin.tag || skin.nama || 'Tanpa Nama';
        const imgSrc = skin.gambar || skin.img || '';
        const realIndex = allSkins.indexOf(skin);
        return `
        <div class="card">
            <img src="${imgSrc}" alt="${displayName}" class="card-image" loading="lazy">
            <div class="card-body">
                <h3 class="card-title">${displayName}</h3>
                <div class="card-buttons">
                    <button class="card-btn preview" data-realidx="${realIndex}">Preview</button>
                    <button class="card-btn download" data-realidx="${realIndex}">Unduh</button>
                </div>
            </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.card-btn.preview').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-realidx'));
            openFullPreview(allSkins[idx], 'skin');
        });
    });
    grid.querySelectorAll('.card-btn.download').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-realidx'));
            handleDownload(allSkins[idx]);
        });
    });

    document.querySelectorAll('#skinFilters .filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#skinFilters .filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentSkinFilter = tab.getAttribute('data-filter');
            renderSkins();
        });
    });
}
// ---------- RENDER ADDON — LANDSCAPE ----------
function renderAddons() {
    const grid = document.getElementById('addonGrid');
    if (!grid) return;
    
    let filtered = allAddons;
    if (currentAddonFilter !== 'semua') {
        filtered = allAddons.filter(a => a.kategori === currentAddonFilter);
    }
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state">Belum ada item</div>';
        return;
    }
    grid.innerHTML = filtered.map((addon, idx) => {
        const displayName = addon.tag || addon.nama || 'Tanpa Nama';
        const imgSrc = addon.gambar || addon.img || '';
        const realIndex = allAddons.indexOf(addon);
        return `
        <div class="addon-card">
            <img src="${imgSrc}" alt="${displayName}" class="addon-card-img" loading="lazy">
            <div class="addon-card-body">
                <h3 class="addon-card-title">${displayName}</h3>
                <div class="addon-card-buttons">
                    <button class="addon-card-btn preview" data-realidx="${realIndex}">Preview</button>
                    <a href="${addon.file || addon.download || '#'}" target="_blank" class="addon-card-btn download">Unduh</a>
                </div>
            </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.addon-card-btn.preview').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-realidx'));
            openFullPreview(allAddons[idx], 'addon');
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

// ---------- RENDER GAME — BUKA DI IFRAME BUKAN TAB BARU ----------
function renderGames() {
    const grid = document.getElementById('gameGrid');
    if (!grid) return;
    
    let filtered = allGames;
    if (currentGameFilter !== 'semua') {
        filtered = allGames.filter(g => g.tipe === currentGameFilter);
    }
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state">Belum ada item</div>';
        return;
    }
    grid.innerHTML = filtered.map((game, idx) => {
        const displayName = game.nama || game.tag || 'Tanpa Nama';
        const realIndex = allGames.indexOf(game);
        return `
        <div class="game-card">
            <h3 class="game-title">${displayName}</h3>
            <p class="game-desc">${game.deskripsi || ''}</p>
            <button class="game-btn" data-realidx="${realIndex}">Mainkan →</button>
        </div>`;
    }).join('');

    grid.querySelectorAll('.game-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-realidx'));
            openFullPreview(allGames[idx], 'game');
        });
    });

    document.querySelectorAll('#gameFilters .filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#gameFilters .filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentGameFilter = tab.getAttribute('data-filter');
            renderGames();
        });
    });
}

// ---------- RENDER INFO — DARI data.json ----------
function renderInfo() {
    if (!infoData || !infoData.deskripsi) {
        console.log('Info data belum tersedia');
        return;
    }
    
    const infoDesc = document.getElementById('infoDesc');
    if (infoDesc) infoDesc.textContent = infoData.deskripsi;
    
    const container = document.getElementById('infoContent');
    if (!container) return;
    
    let html = '';
    
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
                        <a href="${s.link}" target="_blank" class="info-link">Kunjungi →</a>
                    </div>`).join('')}
                </div>
            </div>
        </div>`;
    }
    
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
                        <a href="${g.link}" target="_blank" class="info-link">Gabung →</a>
                    </div>`).join('')}
                </div>
            </div>
        </div>`;
    }
    
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
    
    container.querySelectorAll('.accordion-header').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentElement.classList.toggle('open');
        });
    });
}

// ---------- BUKA PREVIEW PENUH — IFRAME ----------
function openFullPreview(data, tipe) {
    currentData = { ...data, tipe };
    const displayName = data.tag || data.nama || 'Tanpa Nama';
    const pageUrl = window.location.origin + window.location.pathname + '?' + (data.kategori || tipe) + '-id=' + (data.id || '');
    
    // Update judul & URL
    document.getElementById('fullPreviewTitle').textContent = displayName;
    history.pushState({}, '', pageUrl);
    
    // Set iframe src
    const iframe = document.getElementById('previewIframe');
    const downloadLink = document.getElementById('fullDownload');
    
    if (tipe === 'game') {
        iframe.src = data.link || data.url || '';
        downloadLink.style.display = 'none';
    } else {
        iframe.src = data.gambar || data.img || '';
        downloadLink.href = data.file || data.download || '#';
        downloadLink.style.display = 'inline-flex';
    }
    
    // Tampilkan halaman preview
    document.getElementById('fullPreviewPage').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Salin Link
    document.getElementById('fullCopyLink').onclick = () => {
        navigator.clipboard.writeText(pageUrl).then(() => showToast('Tautan disalin! ✅'));
    };
    
    // Bagikan WA
    document.getElementById('fullShareWA').onclick = () => {
        const text = `${displayName}%0A%0ALihat di ArpiMC Zone:%0A${encodeURIComponent(pageUrl)}`;
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };
}

function closeFullPreview() {
    document.getElementById('fullPreviewPage').style.display = 'none';
    document.body.style.overflow = '';
    history.pushState({}, '', window.location.pathname);
    currentData = null;
}

// ---------- FUNGSI UNDUH: Skin, Couple, Skin JJ ----------
function handleDownload(item) {
    const kategori = item.kategori || '';
    
    if (kategori === 'couple') {
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
            showToast('Mengunduh Semua...');
        };
        return;
    }
    
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

// ---------- BUKA LANGSUNG DARI URL ----------
function handleUrlSlug() {
    const params = new URLSearchParams(window.location.search);
    if (params.size === 0) return;
    
    const query = window.location.search.slice(1);
    const match = query.match(/^([\w]+)-id=(\d+)$/);
    if (!match) return;
    
    const targetKategori = match[1];
    const targetId = parseInt(match[2]);
    
    const checkData = setInterval(() => {
        let foundItem = null;
        let foundType = 'skin';
        
        foundItem = allSkins.find(s => 
            String(s.kategori) === targetKategori && s.id === targetId
        );
        
        if (!foundItem) {
            foundItem = allAddons.find(a => 
                String(a.kategori) === targetKategori && a.id === targetId
            );
            foundType = 'addon';
        }
        
        if (!foundItem) {
            foundItem = allGames.find(g => 
                String(g.kategori) === targetKategori && g.id === targetId
            );
            foundType = 'game';
        }
        
        if (foundItem) {
            clearInterval(checkData);
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            if (foundType === 'skin') {
                document.querySelector('[data-page="skinPage"]').classList.add('active');
                document.getElementById('skinPage').classList.add('active');
            } else if (foundType === 'addon') {
                document.querySelector('[data-page="addonPage"]').classList.add('active');
                document.getElementById('addonPage').classList.add('active');
            } else if (foundType === 'game') {
                document.querySelector('[data-page="gamePage"]').classList.add('active');
                document.getElementById('gamePage').classList.add('active');
            }
            setTimeout(() => openFullPreview(foundItem, foundType), 100);
        }
    }, 100);
    
    setTimeout(() => clearInterval(checkData), 10000);
}

// ---------- NOTIFIKASI TOAST ----------
function showToast(pesan) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = pesan;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---------- TOMBOL KEMBALI BROWSER ----------
window.addEventListener('popstate', () => {
    closeFullPreview();
});

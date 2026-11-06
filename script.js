// ==========================================
// ARPIMC ZONE — SCRIPT.JS VERSI LENGKAP
// BAGIAN 1: INISIALISASI, NAVIGASI, COSLO
// ==========================================

let allSkins = [];
let allAddons = [];
let allGames = [];
let currentSkinSubpage = 'semua';
let currentAddonSubpage = 'semua';
let currentGameSubpage = 'semua';
let currentPreviewData = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSidebar();
    initCoslo();
    loadData();
    handleUrlSlug();
});

// ---------- NAVIGASI BAWAH ----------
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetPage = link.getAttribute('data-page');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(targetPage).classList.add('active');
            
            closePreviewPage();
            window.scrollTo(0, 0);
        });
    });
}

// ---------- SIDEBAR & TEMA ----------
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const themeButtons = document.querySelectorAll('.theme-option');
    
    function toggleSidebar(open) {
        if (open) {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
        } else {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }
    }
    
    menuToggle.addEventListener('click', () => toggleSidebar(true));
    closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    sidebarOverlay.addEventListener('click', () => toggleSidebar(false));
    
    // Muat tema tersimpan
    const savedTheme = localStorage.getItem('arpimc_theme') || 'default';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeButtons(savedTheme);
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('arpimc_theme', theme);
            updateThemeButtons(theme);
            toggleSidebar(false);
            
            if (theme === 'coslo') {
                loadCosloSettings();
            } else {
                disableCoslo();
            }
        });
    });
}

function updateThemeButtons(activeTheme) {
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === activeTheme) {
            btn.classList.add('active');
        }
    });
}

// ---------- COSLO — Pengaturan Latar & Efek ----------
function initCoslo() {
    const cosloFile = document.getElementById('cosloFile');
    const cosloContrast = document.getElementById('cosloContrast');
    const cosloBlur = document.getElementById('cosloBlur');
    const cosloBright = document.getElementById('cosloBright');
    
    cosloFile.addEventListener('change', handleCosloFileSelect);
    cosloContrast.addEventListener('input', updateCosloPreview);
    cosloBlur.addEventListener('input', updateCosloPreview);
    cosloBright.addEventListener('input', updateCosloPreview);
    
    // Update nilai tampilan slider
    cosloContrast.addEventListener('input', () => {
        document.getElementById('contrastVal').textContent = cosloContrast.value;
    });
    cosloBlur.addEventListener('input', () => {
        document.getElementById('blurVal').textContent = cosloBlur.value;
    });
    cosloBright.addEventListener('input', () => {
        document.getElementById('brightVal').textContent = cosloBright.value;
    });
}

let cosloImageData = null;

function handleCosloFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        cosloImageData = event.target.result;
        const previewImg = document.getElementById('cosloPreviewImg');
        const previewWrap = document.getElementById('cosloPreviewWrap');
        previewImg.src = cosloImageData;
        previewWrap.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function updateCosloPreview() {
    const contrast = document.getElementById('cosloContrast').value;
    const blur = document.getElementById('cosloBlur').value;
    const bright = document.getElementById('cosloBright').value;
    
    let filterStr = `contrast(${contrast}%) brightness(${bright}%)`;
    if (parseInt(blur) > 0) {
        filterStr += ` blur(${blur}px)`;
    }
    
    document.body.style.filter = filterStr;
}

function saveCosloSetting() {
    if (!cosloImageData) {
        showToast('Pilih gambar dulu ya!');
        return;
    }
    
    const contrast = document.getElementById('cosloContrast').value;
    const blur = document.getElementById('cosloBlur').value;
    const bright = document.getElementById('cosloBright').value;
    
    localStorage.setItem('coslo_bg', cosloImageData);
    localStorage.setItem('coslo_contrast', contrast);
    localStorage.setItem('coslo_blur', blur);
    localStorage.setItem('coslo_bright', bright);
    
    applyCosloBackground(cosloImageData, contrast, blur, bright);
    closeCosloModal();
    showToast('Pengaturan Coslo tersimpan! ✅');
}

function loadCosloSettings() {
    const bg = localStorage.getItem('coslo_bg');
    const contrast = localStorage.getItem('coslo_contrast') || '100';
    const blur = localStorage.getItem('coslo_blur') || '0';
    const bright = localStorage.getItem('coslo_bright') || '100';
    
    if (bg) {
        applyCosloBackground(bg, contrast, blur, bright);
    }
    
    document.getElementById('cosloContrast').value = contrast;
    document.getElementById('cosloBlur').value = blur;
    document.getElementById('cosloBright').value = bright;
    document.getElementById('contrastVal').textContent = contrast;
    document.getElementById('blurVal').textContent = blur;
    document.getElementById('brightVal').textContent = bright;
}

function applyCosloBackground(imgData, contrast, blur, bright) {
    document.body.classList.add('coslo-active');
    document.body.style.backgroundImage = `url(${imgData})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    
    let filterStr = `contrast(${contrast}%) brightness(${bright}%)`;
    if (parseInt(blur) > 0) {
        filterStr += ` blur(${blur}px)`;
    }
    document.body.style.filter = filterStr;
}

function disableCoslo() {
    document.body.classList.remove('coslo-active');
    document.body.style.backgroundImage = '';
    document.body.style.filter = '';
}

function closeCosloModal() {
    document.getElementById('cosloModal').style.display = 'none';
}

function resetCoslo() {
    localStorage.removeItem('coslo_bg');
    localStorage.removeItem('coslo_contrast');
    localStorage.removeItem('coslo_blur');
    localStorage.removeItem('coslo_bright');
    disableCoslo();
    
    document.getElementById('cosloPreviewWrap').style.display = 'none';
    document.getElementById('cosloFile').value = '';
    document.getElementById('cosloContrast').value = 100;
    document.getElementById('cosloBlur').value = 0;
    document.getElementById('cosloBright').value = 100;
    document.getElementById('contrastVal').textContent = '100';
    document.getElementById('blurVal').textContent = '0';
    document.getElementById('brightVal').textContent = '100';
    cosloImageData = null;
    
    showToast('Coslo direset! ✅');
}

function openCosloModal() {
    document.getElementById('cosloModal').style.display = 'flex';
    loadCosloSettings();
}

// ==========================================
// ########## BATAS — BAGIAN 1 SELESAI ##########
// ==========================================
// ==========================================
// ARPIMC ZONE — SCRIPT.JS VERSI LENGKAP
// BAGIAN 2: MUAT DATA, RENDER, PREVIEW, SLUG
// ==========================================

// ---------- MUAT DATA DARI FILE JSON ----------
async function loadData() {
    try {
        const [skinsRes, addonsRes, gamesRes, infoRes] = await Promise.all([
            fetch('skins.json'),
            fetch('addons.json'),
            fetch('games.json'),
            fetch('data.json')
        ]);

        allSkins = await skinsRes.json();
        allAddons = await addonsRes.json();
        allGames = await gamesRes.json();
        const infoData = await infoRes.json();

        document.getElementById('skinCount').textContent = allSkins.length;
        renderSkins();
        renderAddons();
        renderGames();
        renderInfo(infoData);
        setupFilters();
        
    } catch (err) {
        console.error('Gagal memuat data:', err);
        showToast('Gagal memuat data, cek koneksi kamu');
    }
}

// ---------- SETUP FILTER ----------
function setupFilters() {
    // Filter Skin
    document.getElementById('skinFilters').addEventListener('click', e => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('#skinFilters .tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentSkinSubpage = e.target.getAttribute('data-filter');
            renderSkins();
        }
    });

    // Filter Addon
    document.getElementById('addonFilters').addEventListener('click', e => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('#addonFilters .tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentAddonSubpage = e.target.getAttribute('data-filter');
            renderAddons();
        }
    });

    // Filter Game
    document.getElementById('gameFilters').addEventListener('click', e => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('#gameFilters .tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentGameSubpage = e.target.getAttribute('data-filter');
            renderGames();
        }
    });
}

// ---------- RENDER SKIN ----------
function renderSkins() {
    const grid = document.getElementById('skinGrid');
    let filtered = allSkins;

    if (currentSkinSubpage !== 'semua') {
        filtered = allSkins.filter(s => s.jenis === currentSkinSubpage);
    }

    if (!filtered.length) {
        grid.innerHTML = '<div class="empty-state"><p>Belum ada skin di kategori ini</p></div>';
        return;
    }

    grid.innerHTML = filtered.map(skin => `
        <div class="card">
            <img src="${skin.img}" alt="${skin.nama}" class="card-img" loading="lazy">
            <div class="card-body">
                <h3 class="card-title">${skin.nama}</h3>
                <div class="card-buttons">
                    <button class="card-btn preview" onclick="openSkinPreview('${skin.img}', '${skin.nama}', '${skin.deskripsi || ''}', '${skin.id}', '${skin.slug || ''}')">Preview</button>
                    <a href="${skin.file}" target="_blank" class="card-btn download">Unduh</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ---------- RENDER ADDON ----------
function renderAddons() {
    const list = document.getElementById('addonGrid');
    let filtered = allAddons;

    if (currentAddonSubpage !== 'semua') {
        filtered = allAddons.filter(a => a.kategori === currentAddonSubpage);
    }

    if (!filtered.length) {
        list.innerHTML = '<div class="empty-state"><p>Belum ada addon di kategori ini</p></div>';
        return;
    }

    list.innerHTML = filtered.map(addon => `
        <div class="addon-card">
            <img src="${addon.img}" alt="${addon.nama}" class="addon-img" loading="lazy">
            <div class="addon-body">
                <div>
                    <h3 class="addon-title">${addon.nama}</h3>
                    <p class="addon-desc">${addon.deskripsi || ''}</p>
                </div>
                <div class="addon-buttons">
                    <button class="addon-btn preview" onclick="openAddonPreview('${addon.img}', '${addon.nama}', '${addon.deskripsi || ''}', '${addon.id}', '${addon.slug || ''}')">Preview</button>
                    <a href="${addon.file}" target="_blank" class="addon-btn download">Unduh</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ---------- RENDER GAME ----------
function renderGames() {
    const grid = document.getElementById('gameGrid');
    let filtered = allGames;

    if (currentGameSubpage !== 'semua') {
        filtered = allGames.filter(g => g.tipe === currentGameSubpage);
    }

    if (!filtered.length) {
        grid.innerHTML = '<div class="empty-state"><p>Belum ada game di kategori ini</p></div>';
        return;
    }

    grid.innerHTML = filtered.map(game => `
        <div class="card">
            <div class="card-body" style="aspect-ratio: 4/3; display: flex; flex-direction: column; justify-content: center; text-align: center; padding: 20px; background: var(--secondary);">
                <h3 class="card-title" style="font-size: 16px; margin-bottom: 8px;">${game.nama}</h3>
                <p style="font-size: 12px; color: var(--text-light);">${game.deskripsi || ''}</p>
            </div>
            <div class="card-body">
                <button class="card-btn download" style="width: 100%;" onclick="openGamePreview('${game.link}', '${game.nama}', '${game.id}', '${game.slug || ''}')">▶ Mainkan</button>
            </div>
        </div>
    `).join('');
}

// ---------- RENDER INFO ----------
function renderInfo(data) {
    document.getElementById('infoDesc').textContent = data.deskripsi || '';
    const container = document.getElementById('infoContent');
    
    let html = '';
    data.sections.forEach(sec => {
        html += `
            <div class="accordion-item">
                <button class="accordion-header" onclick="toggleAccordion(this)">
                    <span>${sec.judul}</span>
                    <span class="accordion-icon">▼</span>
                </button>
                <div class="accordion-content">
                    <div class="accordion-inner">
                        ${sec.item.map(item => `
                            <div class="info-item">
                                <span class="info-name">${item.nama}</span>
                                <a href="${item.link}" target="_blank" class="info-link">Buka →</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function toggleAccordion(btn) {
    const item = btn.parentElement;
    item.classList.toggle('open');
}

// ---------- HALAMAN PREVIEW — SKIN ----------
function openSkinPreview(img, nama, desc, id, slug) {
    currentPreviewData = { type: 'skin', img, nama, desc, id, slug };
    showPreviewPage('skin', img, nama, desc, id, slug);
}

// ---------- HALAMAN PREVIEW — ADDON ----------
function openAddonPreview(img, nama, desc, id, slug) {
    currentPreviewData = { type: 'addon', img, nama, desc, id, slug };
    showPreviewPage('addon', img, nama, desc, id, slug);
}

// ---------- HALAMAN PREVIEW — GAME ----------
function openGamePreview(link, nama, id, slug) {
    currentPreviewData = { type: 'game', link, nama, id, slug };
    showPreviewPage('game', link, nama, '', id, slug);
}

// ---------- TAMPILKAN HALAMAN PREVIEW ----------
function showPreviewPage(tipe, media, nama, desc, id, slug) {
    const previewPage = document.getElementById('previewPage');
    const previewTopTitle = document.getElementById('previewPageTitle');
    const previewMedia = document.getElementById('previewMedia');
    const previewImg = document.getElementById('previewMainImg');
    const previewFrame = document.getElementById('previewGameFrame');
    const previewInfoBlock = document.getElementById('previewInfoBlock');
    const previewName = document.getElementById('previewName');
    const previewDescText = document.getElementById('previewDescText');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const shareWABtn = document.getElementById('shareWABtn');
    const dlBtn = document.getElementById('dlBtn');

    // Reset semua tampilan
    previewMedia.style.display = 'none';
    previewFrame.style.display = 'none';
    previewInfoBlock.style.display = 'none';
    dlBtn.style.display = 'none';

    previewTopTitle.textContent = nama;

    if (tipe === 'game') {
        previewFrame.style.display = 'block';
        previewFrame.src = media;
        previewInfoBlock.style.display = 'block';
        previewName.textContent = nama;
        previewDescText.textContent = desc || '';
    } else {
        previewMedia.style.display = 'block';
        previewImg.src = media;
        previewImg.alt = nama;
        previewInfoBlock.style.display = 'block';
        previewName.textContent = nama;
        previewDescText.textContent = desc || '';
    }

    // Buat link share
    let shareUrl = window.location.origin;
    if (tipe === 'skin') shareUrl += `?${slug || `cowok-id=${id}`}`;
    else if (tipe === 'addon') shareUrl += `?${slug || `addon-id=${id}`}`;
    else if (tipe === 'game') shareUrl += `?${slug || `game-id=${id}`}`;

    // Salin Link
    copyLinkBtn.onclick = () => {
        navigator.clipboard.writeText(shareUrl);
        showToast('Link disalin! ✅');
    };

    // Share WhatsApp
    shareWABtn.onclick = () => {
        const text = encodeURIComponent(`${nama}\n${shareUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    // Unduh
    if (currentPreviewData && currentPreviewData.file) {
        dlBtn.href = currentPreviewData.file;
        dlBtn.style.display = 'flex';
    }

    previewPage.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    history.pushState({ preview: true }, '', shareUrl);
}

// ---------- TUTUP PREVIEW ----------
function closePreviewPage() {
    document.getElementById('previewPage').style.display = 'none';
    document.body.style.overflow = '';
    currentPreviewData = null;
    history.back();
}

// Tutup preview saat tombol back browser
window.addEventListener('popstate', () => {
    if (document.getElementById('previewPage').style.display === 'flex') {
        document.getElementById('previewPage').style.display = 'none';
        document.body.style.overflow = '';
        currentPreviewData = null;
    }
});

// ---------- BUKA LANGSUNG DARI URL SLUG ----------
function handleUrlSlug() {
    const params = new URLSearchParams(window.location.search);
    
    for (const [key, value] of params.entries()) {
        // Format: ?cowok-id=1
        const match = key.match(/^(.+)-id$/);
        if (match) {
            const jenis = match[1];
            const id = parseInt(value);
            
            // Cari di Skin
            const skin = allSkins.find(s => String(s.id) === String(id));
            if (skin) {
                setTimeout(() => {
                    openSkinPreview(skin.img, skin.nama, skin.deskripsi || '', skin.id, `${jenis}-id=${id}`);
                }, 300);
                return;
            }
            
            // Cari di Addon
            const addon = allAddons.find(a => String(a.id) === String(id));
            if (addon) {
                setTimeout(() => {
                    openAddonPreview(addon.img, addon.nama, addon.deskripsi || '', addon.id, `${jenis}-id=${id}`);
                }, 300);
                return;
            }
            
            // Cari di Game
            const game = allGames.find(g => String(g.id) === String(id));
            if (game) {
                setTimeout(() => {
                    openGamePreview(game.link, game.nama, game.id, `${jenis}-id=${id}`);
                }, 300);
                return;
            }
        }
    }
}

// ---------- MODAL PILIHAN UNDUH SKIN COUPLE ----------
function closeCoupleModal() {
    document.getElementById('coupleModal').style.display = 'none';
}
function closeJJModal() {
    document.getElementById('jjModal').style.display = 'none';
}

// ---------- KE BERANDA ----------
function goHome() {
    document.querySelector('.nav-link[data-page="skinPage"]').click();
}

// ---------- NOTIFIKASI TOAST ----------
function showToast(msg) {
    const box = document.getElementById('toastBox');
    box.textContent = msg;
    box.classList.add('show');
    setTimeout(() => box.classList.remove('show'), 2500);
}

// ==========================================
// ########## AKHIR FILE ##########
// ==========================================

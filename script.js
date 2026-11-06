// =============================================
// ARPIMC ZONE — script.js
// =============================================

let skinsData = [];
let addonsData = [];
let gamesData = [];
let siteData = {};

// === INISIALISASI ===
document.addEventListener('DOMContentLoaded', () => {
  loadSiteData();
  loadSkins();
  loadAddons();
  loadGames();
  setupNavigation();
  setupSidebar();
  setupThemePanel();
  setupCosloBackground();
  handleDirectLinks();
});

// === DATA SITUS (info, sosmed, dll) ===
async function loadSiteData() {
  try {
    const res = await fetch('data.json');
    siteData = await res.json();
    renderInfoPage();
  } catch (err) {
    console.error('Gagal memuat data situs:', err);
  }
}

function renderInfoPage() {
  const descEl = document.getElementById('infoDesc');
  const linksEl = document.getElementById('infoLinks');
  
  if (siteData.website?.deskripsi) {
    descEl.textContent = siteData.website.deskripsi;
  }
  
  let html = '';
  
  // Saluran
  if (siteData.saluran?.daftar && siteData.saluran.daftar.length > 0) {
    html += `<div class="info-card"><h3>📢 ${siteData.saluran.judul || 'Saluran'}</h3><p>${siteData.saluran.deskripsi || ''}</p><div class="info-grid">`;
    siteData.saluran.daftar.forEach(item => {
      html += `<a href="${item.link}" target="_blank" class="info-grid-btn">${item.nama}</a>`;
    });
    html += `</div></div>`;
  }
  
  // Sosmed
  if (siteData.sosmed?.daftar && siteData.sosmed.daftar.length > 0) {
    html += `<div class="info-card"><h3>📱 ${siteData.sosmed.judul || 'Sosial Media'}</h3><p>${siteData.sosmed.deskripsi || ''}</p><div class="info-grid">`;
    siteData.sosmed.daftar.forEach(item => {
      html += `<a href="${item.link}" target="_blank" class="info-grid-btn">${item.nama}</a>`;
    });
    html += `</div></div>`;
  }
  
  // Grup
  if (siteData.grup?.daftar && siteData.grup.daftar.length > 0) {
    html += `<div class="info-card"><h3>👥 ${siteData.grup.judul || 'Grup'}</h3><p>${siteData.grup.deskripsi || ''}</p><div class="info-grid">`;
    siteData.grup.daftar.forEach(item => {
      html += `<a href="${item.link}" target="_blank" class="info-grid-btn">${item.nama}</a>`;
    });
    html += `</div></div>`;
  }
  
  // Dukungan
  if (siteData.dukungan) {
    html += `
      <div class="info-card">
        <h3>💜 ${siteData.dukungan.judul || 'Dukung Kami'}</h3>
        <p>${siteData.dukungan.deskripsi || ''}</p>
        <a href="${siteData.dukungan.tautan}" target="_blank" class="info-btn">Dukung Kami →</a>
      </div>`;
  }
  
  linksEl.innerHTML = html || '<p class="loading-text">Informasi belum tersedia</p>';
}

// === SIDEBAR BAHASA ===
function setupSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('closeSidebar');
  
  toggle.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    sidebar.classList.remove('hidden');
  });
  
  const closeSidebar = () => {
    overlay.classList.add('hidden');
    sidebar.classList.add('hidden');
  };
  
  overlay.addEventListener('click', closeSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  
  // Pilihan bahasa
  const langOptions = document.querySelectorAll('.lang-option');
  langOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      langOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const lang = opt.getAttribute('data-lang');
      localStorage.setItem('arpimc-lang', lang);
      // Nanti bisa tambah logika terjemahan di sini
      closeSidebar();
      alert(`Bahasa diubah ke: ${lang === 'id' ? 'Indonesia' : 'English'}`);
    });
  });
  
  // Muat bahasa yang tersimpan
  const savedLang = localStorage.getItem('arpimc-lang') || 'id';
  langOptions.forEach(opt => {
    opt.classList.toggle('active', opt.getAttribute('data-lang') === savedLang);
  });
}

// === NAVIGASI BAWAH ===
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.page-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPage = item.getAttribute('data-page');
      navigateToPage(targetPage);
    });
  });
}

function navigateToPage(pageName) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${pageName}"]`).classList.add('active');
  
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`page-${pageName}`).classList.add('active');
  
  // Tutup modal jika terbuka
  tutupSkinModal();
  tutupAddonModal();
  tutupGameModal();
  
  // Ubah judul halaman
  const pageTitles = {
    home: 'ArpiMC Zone',
    skin: 'Koleksi Skin — ArpiMC Zone',
    addon: 'Koleksi Addon — ArpiMC Zone',
    game: 'Mini Game & Alat — ArpiMC Zone',
    info: 'Tentang Kami — ArpiMC Zone'
  };
  document.title = pageTitles[pageName] || 'ArpiMC Zone';
}

// === BACA PARAMETER DARI URL ===
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  let result = { type: null, category: null, id: null, name: null };
  
  for (const [key, value] of params.entries()) {
    const match = key.match(/^([a-z0-9-]+)-id$/);
    if (match) {
      result.category = match[1];
      result.id = parseInt(value);
      
      if (['tic-tac-toe', 'minecraft-quiz-mob', 'minecraft-quiz-item'].includes(result.category)) {
        result.type = 'game';
        result.name = result.category;
      } else if (['mutants', '3d-skin', 'bsl-shaders', 'ui-ancxly-v7'].includes(result.category)) {
        result.type = 'addon';
        result.name = result.category;
      } else {
        result.type = 'skin';
        result.name = result.category;
      }
      break;
    }
  }
  
  return result;
}

// === BUKA LANGSUNG DARI LINK ===
function handleDirectLinks() {
  const params = getUrlParams();
  if (!params.id) return;
  
  if (params.type === 'skin') {
    navigateToPage('skin');
    setTimeout(() => bukaPreviewSkin(params.id), 200);
  } else if (params.type === 'addon') {
    navigateToPage('addon');
    setTimeout(() => bukaPreviewAddon(params.id), 200);
  } else if (params.type === 'game') {
    navigateToPage('game');
    setTimeout(() => bukaGameByName(params.name), 200);
  }
}

// === TEMA ===
function setupThemePanel() {
  const themeBtn = document.getElementById('themeToggle');
  const panel = document.getElementById('themePanel');
  const closeBtn = document.querySelector('.close-panel');
  const choices = document.querySelectorAll('.theme-choice');
  const cosloSettings = document.getElementById('cosloSettings');
  
  // Muat tema tersimpan
  const savedTheme = localStorage.getItem('arpimc-theme') || 'default';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateActiveThemeButton(savedTheme);
  toggleCosloBodyClass(savedTheme);
  
  themeBtn.addEventListener('click', () => {
    panel.classList.remove('hidden');
  });
  
  const closePanelFn = () => {
    panel.classList.add('hidden');
    cosloSettings.classList.add('hidden');
  };
  
  closeBtn.addEventListener('click', closePanelFn);
  panel.addEventListener('click', (e) => {
    if (e.target === panel) closePanelFn();
  });
  
  choices.forEach(choice => {
    choice.addEventListener('click', () => {
      const theme = choice.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('arpimc-theme', theme);
      updateActiveThemeButton(theme);
      toggleCosloBodyClass(theme);
      
      // Tampilkan pengaturan Coslo
      if (theme === 'coslo') {
        cosloSettings.classList.remove('hidden');
      } else {
        cosloSettings.classList.add('hidden');
      }
      
      panel.classList.add('hidden');
    });
  });
}

function updateActiveThemeButton(themeName) {
  document.querySelectorAll('.theme-choice').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
  });
}

function toggleCosloBodyClass(themeName) {
  document.body.classList.toggle('coslo-active', themeName === 'coslo');
}

// === TEMA COSLO — Upload Gambar/Video Lokal ===
function setupCosloBackground() {
  const uploadInput = document.getElementById('cosloUpload');
  const previewWrap = document.getElementById('cosloPreviewWrap');
  const previewArea = document.getElementById('cosloPreview');
  const blurSlider = document.getElementById('cosloBlur');
  const contrastSlider = document.getElementById('cosloContrast');
  const resetBtn = document.getElementById('resetCoslo');
  
  // Muat latar tersimpan
  const savedBg = localStorage.getItem('coslo-bg');
  const savedBlur = localStorage.getItem('coslo-blur');
  const savedContrast = localStorage.getItem('coslo-contrast');
  
  if (savedBg) {
    applyCosloBackground(savedBg, savedBlur || 0, savedContrast || 100);
    showCosloPreview(savedBg, savedBlur, savedContrast);
  }
  if (savedBlur) blurSlider.value = savedBlur;
  if (savedContrast) contrastSlider.value = savedContrast;
  
  // Upload file
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      localStorage.setItem('coslo-bg', dataUrl);
      applyCosloBackground(dataUrl, blurSlider.value, contrastSlider.value);
      showCosloPreview(dataUrl, blurSlider.value, contrastSlider.value);
    };
    reader.readAsDataURL(file);
  });
  
  // Slider efek
  const updateEffects = () => {
    const bg = localStorage.getItem('coslo-bg');
    if (!bg) return;
    localStorage.setItem('coslo-blur', blurSlider.value);
    localStorage.setItem('coslo-contrast', contrastSlider.value);
    applyCosloBackground(bg, blurSlider.value, contrastSlider.value);
  };
  
  blurSlider.addEventListener('input', updateEffects);
  contrastSlider.addEventListener('input', updateEffects);
  
  // Reset
  resetBtn.addEventListener('click', () => {
    localStorage.removeItem('coslo-bg');
    localStorage.removeItem('coslo-blur');
    localStorage.removeItem('coslo-contrast');
    document.body.style.backgroundImage = '';
    previewWrap.classList.add('hidden');
    previewArea.innerHTML = '';
    blurSlider.value = 0;
    contrastSlider.value = 100;
  });
}

function applyCosloBackground(dataUrl, blurPx, contrastPct) {
  document.body.style.backgroundImage = `url(${dataUrl})`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';
  document.body.style.filter = `blur(${blurPx}px) contrast(${contrastPct}%)`;
  document.body.style.transform = 'scale(1.02)'; // Hilangkan garis tepi akibat blur
}

function showCosloPreview(dataUrl, blurPx, contrastPct) {
  const previewWrap = document.getElementById('cosloPreviewWrap');
  const previewArea = document.getElementById('cosloPreview');
  
  previewWrap.classList.remove('hidden');
  previewArea.innerHTML = '';
  
  const isVideo = dataUrl.startsWith('data:video');
  const el = isVideo ? document.createElement('video') : document.createElement('img');
  
  el.src = dataUrl;
  if (isVideo) el.muted = true;
  if (isVideo) el.loop = true;
  if (isVideo) el.playsInline = true;
  
  previewArea.appendChild(el);
}

function tutupThemePanel() {
  document.getElementById('themePanel').classList.add('hidden');
}

// === MUAT DATA SKIN ===
async function loadSkins() {
  try {
    const res = await fetch('skins.json');
    skinsData = await res.json();
    document.getElementById('totalSkins').textContent = skinsData.length;
    renderSkins('all');
    setupSkinFilters();
  } catch (err) {
    console.error('Gagal memuat skin:', err);
    document.getElementById('skinsGrid').innerHTML = 
      '<p class="loading-text">❌ Gagal memuat data skin</p>';
  }
}

function setupSkinFilters() {
  const tabs = document.querySelectorAll('#page-skin .filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderSkins(tab.getAttribute('data-filter'));
    });
  });
}

function renderSkins(category) {
  const container = document.getElementById('skinsGrid');
  let filtered = category === 'all' ? skinsData : skinsData.filter(s => s.kategori === category);
  
  if (filtered.length === 0) {
    container.innerHTML = '<p class="loading-text">Belum ada skin di kategori ini</p>';
    return;
  }
  
  container.innerHTML = filtered.map(skin => `
    <div class="skin-card">
      <div class="card-img-wrap" onclick="bukaPreviewSkin(${skin.id})">
        <img src="${skin.gambar}" alt="${skin.tag}" loading="lazy">
      </div>
      <div class="card-body">
        <p class="card-name">${skin.tag}</p>
        <div class="card-buttons">
          <button class="card-btn preview" onclick="bukaPreviewSkin(${skin.id})">Preview</button>
          <a href="${skin.link_download}" target="_blank" class="card-btn download">Unduh</a>
        </div>
      </div>
    </div>
  `).join('');
}

// === PREVIEW SKIN ===
function bukaPreviewSkin(id) {
  const skin = skinsData.find(s => s.id === id);
  if (!skin) return;
  
  const modal = document.getElementById('skinModal');
  const baseUrl = window.location.origin + window.location.pathname;
  const shareSlug = `${skin.kategori}-id=${skin.id}`;
  const shareUrl = `${baseUrl}?${shareSlug}`;
  
  updateMetaShare(skin.gambar, skin.tag, shareUrl);
  
  document.getElementById('skinModalTitle').textContent = skin.tag;
  document.getElementById('skinModalImage').src = skin.gambar;
  document.getElementById('skinModalInfo').innerHTML = `
    ${skin.deskripsi || 'Credit: Pemilik asli'}<br>
    📅 ${skin.tanggal_upload || 'Tanggal tidak diketahui'}
  `;
  document.getElementById('skinModalDownloadTop').href = skin.link_download;
  document.getElementById('skinModalDownload').href = skin.link_download;
  
  document.getElementById('skinModalCopy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(`${skin.tag}\n${shareUrl}`);
      alert('✅ Link disalin!');
    } catch { alert('❌ Gagal menyalin'); }
  };
  
  document.getElementById('skinModalShareWA').onclick = () => {
    const text = encodeURIComponent(`${skin.tag}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  
  history.replaceState({ skinId: id }, '', `?${shareSlug}`);
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function tutupSkinModal() {
  const modal = document.getElementById('skinModal');
  if (!modal.classList.contains('hidden')) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    history.replaceState({}, '', window.location.pathname);
  }
}

// === MUAT DATA ADDON ===
async function loadAddons() {
  try {
    const res = await fetch('addons.json');
    addonsData = await res.json();
    renderAddons('all');
    setupAddonFilters();
  } catch (err) {
    console.error('Gagal memuat addon:', err);
    document.getElementById('addonsGrid').innerHTML =
      '<p class="loading-text">❌ Gagal memuat data addon</p>';
  }
}

function setupAddonFilters() {
  const tabs = document.querySelectorAll('#page-addon .filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderAddons(tab.getAttribute('data-filter'));
    });
  });
}

function renderAddons(category) {
  const container = document.getElementById('addonsGrid');
  let filtered = category === 'all' ? addonsData : addonsData.filter(a => a.kategori === category);
  
  if (filtered.length === 0) {
    container.innerHTML = '<p class="loading-text">Belum ada addon di kategori ini</p>';
    return;
  }
  
  container.innerHTML = filtered.map(addon => `
    <div class="addon-card">
      <div class="card-img-wrap" onclick="bukaPreviewAddon(${addon.id})">
        <img src="${addon.gambar}" alt="${addon.nama}" loading="lazy">
      </div>
      <div class="card-body">
        <p class="card-name">${addon.nama}</p>
        <div class="card-buttons">
          <button class="card-btn preview" onclick="bukaPreviewAddon(${addon.id})">Preview</button>
          <a href="${addon.link_download}" target="_blank" class="card-btn download">Unduh</a>
        </div>
      </div>
    </div>
  `).join('');
}

// === PREVIEW ADDON ===
function bukaPreviewAddon(id) {
  const addon = addonsData.find(a => a.id === id);
  if (!addon) return;
  
  const modal = document.getElementById('addonModal');
  const baseUrl = window.location.origin + window.location.pathname;
  const shareSlug = `${addon.nama.toLowerCase().replace(/\s+/g, '-')}-id=${addon.id}`;
  const shareUrl = `${baseUrl}?${shareSlug}`;
  
  updateMetaShare(addon.gambar, addon.nama, shareUrl);
  
  document.getElementById('addonModalTitle').textContent = addon.nama;
  document.getElementById('addonModalImage').src = addon.gambar;
  document.getElementById('addonModalInfo').innerHTML = `
    ${addon.deskripsi || ''}<br>
    📦 Versi: ${addon.versi || 'Semua versi'} | 📂 ${addon.ukuran || '-'}<br>
    📅 ${addon.tanggal_upload || 'Tanggal tidak diketahui'}
  `;
  document.getElementById('addonModalDownloadTop').href = addon.link_download;
  document.getElementById('addonModalDownload').href = addon.link_download;
  
  document.getElementById('addonModalCopy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(`${addon.nama}\n${shareUrl}`);
      alert('✅ Link disalin!');
    } catch { alert('❌ Gagal menyalin'); }
  };
  
  document.getElementById('addonModalShareWA').onclick = () => {
    const text = encodeURIComponent(`${addon.nama}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  
  history.replaceState({ addonId: id }, '', `?${shareSlug}`);
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function tutupAddonModal() {
  const modal = document.getElementById('addonModal');
  if (!modal.classList.contains('hidden')) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    history.replaceState({}, '', window.location.pathname);
  }
}

// === MUAT DATA GAME ===
async function loadGames() {
  try {
    const res = await fetch('games.json');
    gamesData = await res.json();
    renderGames('all');
    setupGameFilters();
  } catch (err) {
    console.error('Gagal memuat game:', err);
    document.getElementById('gamesGrid').innerHTML =
      '<p class="loading-text">❌ Gagal memuat data game</p>';
  }
}

function setupGameFilters() {
  const tabs = document.querySelectorAll('#page-game .filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderGames(tab.getAttribute('data-filter'));
    });
  });
}

function renderGames(category) {
  const container = document.getElementById('gamesGrid');
  let filtered = category === 'all' ? gamesData : gamesData.filter(g => g.tipe === category);
  
  if (filtered.length === 0) {
    container.innerHTML = '<p class="loading-text">Belum ada konten di kategori ini</p>';
    return;
  }
  
  container.innerHTML = filtered.map(game => `
    <div class="game-card">
      <h3 class="game-name">${game.nama}</h3>
      <p class="game-desc">${game.deskripsi}</p>
      <button class="card-btn download" onclick="bukaGame(${game.id})">Buka →</button>
    </div>
  `).join('');
}

// === BUKA GAME DENGAN IFRAME ===
function bukaGame(id) {
  const game = gamesData.find(g => g.id === id);
  if (!game) return;
  
  const modal = document.getElementById('gameModal');
  document.getElementById('gameModalTitle').textContent = game.nama;
  document.getElementById('gameIframe').src = game.link;
  document.getElementById('gameModalNewTab').href = game.link;
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function bukaGameByName(nameSlug) {
  const game = gamesData.find(g => 
    g.nama.toLowerCase().replace(/\s+/g, '-') === nameSlug
  );
  if (game) bukaGame(game.id);
}

function tutupGameModal() {
  const modal = document.getElementById('gameModal');
  if (!modal.classList.contains('hidden')) {
    modal.classList.add('hidden');
    document.getElementById('gameIframe').src = '';
    document.body.style.overflow = '';
    history.replaceState({}, '', window.location.pathname);
  }
}

// === UPDATE META SHARING ===
function updateMetaShare(imageUrl, title, pageUrl) {
  let metaImg = document.querySelector('meta[property="og:image"]');
  let metaTitle = document.querySelector('meta[property="og:title"]');
  let metaUrl = document.querySelector('meta[property="og:url"]');
  
  if (!metaImg) {
    metaImg = document.createElement('meta');
    metaImg.setAttribute('property', 'og:image');
    document.head.appendChild(metaImg);
  }
  if (!metaTitle) {
    metaTitle = document.createElement('meta');
    metaTitle.setAttribute('property', 'og:title');
    document.head.appendChild(metaTitle);
  }
  if (!metaUrl) {
    metaUrl = document.createElement('meta');
    metaUrl.setAttribute('property', 'og:url');
    document.head.appendChild(metaUrl);
  }
  
  metaImg.content = imageUrl;
  metaTitle.content = title + ' — ArpiMC Zone';
  metaUrl.content = pageUrl;
}

// === TUTUP MODAL DENGAN TOMBOL ESCAPE ===
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    tutupSkinModal();
    tutupAddonModal();
    tutupGameModal();
    tutupThemePanel();
  }
});

// === KLIK TOMBOL KEMBALI DI MODAL ===
document.querySelector('#skinModal .back-btn')?.addEventListener('click', tutupSkinModal);
document.querySelector('#addonModal .back-btn')?.addEventListener('click', tutupAddonModal);
document.querySelector('#gameModal .back-btn')?.addEventListener('click', tutupGameModal);

console.log('%c🚀 ArpiMC Zone siap digunakan!', 'color: #3b82f6; font-weight: bold; font-size: 14px;');

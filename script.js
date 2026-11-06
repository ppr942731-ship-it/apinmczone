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
  setupThemePanel();
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
  
  if (siteData.deskripsi) {
    descEl.textContent = siteData.deskripsi;
  }
  
  let html = '';
  
  if (siteData.sosmed && siteData.sosmed.length > 0) {
    html += `<div class="info-card"><h3>📱 Sosial Media</h3><div class="info-grid">`;
    siteData.sosmed.forEach(item => {
      html += `<a href="${item.link}" target="_blank" class="info-grid-btn">${item.nama}</a>`;
    });
    html += `</div></div>`;
  }
  
  if (siteData.saluran) {
    html += `
      <div class="info-card">
        <h3>📢 Saluran</h3>
        <p>${siteData.saluran.deskripsi || ''}</p>
        <a href="${siteData.saluran.link}" target="_blank" class="info-btn">Kunjungi Saluran →</a>
      </div>`;
  }
  
  if (siteData.grup) {
    html += `
      <div class="info-card">
        <h3>👥 Komunitas / Grup</h3>
        <p>${siteData.grup.deskripsi || ''}</p>
        <a href="${siteData.grup.link}" target="_blank" class="info-btn">Gabung ke Grup →</a>
      </div>`;
  }
  
  if (siteData.dukungan) {
    html += `
      <div class="info-card">
        <h3>💜 Dukungan</h3>
        <p>${siteData.dukungan.deskripsi || ''}</p>
        <a href="${siteData.dukungan.link}" target="_blank" class="info-btn">${siteData.dukungan.teks || 'Dukung Kami →'}</a>
      </div>`;
  }
  
  linksEl.innerHTML = html || '<p class="loading-text">Informasi belum tersedia</p>';
}

// === NAVIGASI BAWAH ===
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.page-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPage = item.getAttribute('data-page');
      
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      sections.forEach(sec => sec.classList.remove('active'));
      document.getElementById(`page-${targetPage}`).classList.add('active');
    });
  });
}

// === BACA PARAMETER DARI URL ===
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  let result = { type: null, category: null, id: null, name: null };
  
  for (const [key, value] of params.entries()) {
    if (key.includes('-id=')) continue;
    
    const match = key.match(/^([a-z-]+)-id$/);
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
    switchPage('skin');
    setTimeout(() => bukaPreviewSkin(params.id), 200);
  } else if (params.type === 'addon') {
    switchPage('addon');
    setTimeout(() => bukaPreviewAddon(params.id), 200);
  } else if (params.type === 'game') {
    switchPage('game');
    setTimeout(() => bukaGameByName(params.name), 200);
  }
}

function switchPage(pageName) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${pageName}"]`).classList.add('active');
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`page-${pageName}`).classList.add('active');
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
  document.getElementById('skinModal').classList.add('hidden');
  document.body.style.overflow = '';
  history.replaceState({}, '', window.location.pathname);
  resetMetaShare();
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
      '<p class="loading-text">Memuat addon...</p>';
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
        <img src="${addon.gambar}" alt="${addon.nama || addon.tag}" loading="lazy">
      </div>
      <div class="card-body">
        <p class="card-name">${addon.nama || addon.tag}</p>
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
  const namaSlug = (addon.nama || addon.tag).toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
  const shareSlug = `${namaSlug}-id=${addon.id}`;
  const shareUrl = `${baseUrl}?${shareSlug}`;
  
  updateMetaShare(addon.gambar, addon.nama || addon.tag, shareUrl);
  
  document.getElementById('addonModalTitle').textContent = addon.nama || addon.tag;
  document.getElementById('addonModalImage').src = addon.gambar;
  document.getElementById('addonModalInfo').innerHTML = `
    ${addon.deskripsi || ''}<br>
    📂 Kategori: ${addon.kategori}
  `;
  document.getElementById('addonModalDownloadTop').href = addon.link_download;
  document.getElementById('addonModalDownload').href = addon.link_download;
  
  document.getElementById('addonModalCopy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(`${addon.nama || addon.tag}\n${shareUrl}`);
      alert('✅ Link disalin!');
    } catch { alert('❌ Gagal menyalin'); }
  };
  
  document.getElementById('addonModalShareWA').onclick = () => {
    const text = encodeURIComponent(`${addon.nama || addon.tag}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  
  history.replaceState({ addonId: id }, '', `?${shareSlug}`);
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function tutupAddonModal() {
  document.getElementById('addonModal').classList.add('hidden');
  document.body.style.overflow = '';
  history.replaceState({}, '', window.location.pathname);
  resetMetaShare();
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
      '<p class="loading-text">Memuat daftar...</p>';
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
  let filtered = category === 'all' ? gamesData : gamesData.filter(g => g.jenis === category);
  
  if (filtered.length === 0) {
    container.innerHTML = '<p class="loading-text">Belum ada item</p>';
    return;
  }
  
  container.innerHTML = filtered.map(game => `
    <div class="game-card">
      <h4 class="game-name">${game.nama}</h4>
      <p class="game-desc">${game.deskripsi || ''}</p>
      <button class="card-btn download" onclick="bukaGame(${game.id})">Mainkan →</button>
    </div>
  `).join('');
}

// === BUKA GAME ===
function bukaGame(id) {
  const game = gamesData.find(g => g.id === id);
  if (!game) return;
  
  const modal = document.getElementById('gameModal');
  const baseUrl = window.location.origin + window.location.pathname;
  const namaSlug = game.nama.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const shareSlug = `${namaSlug}-id=${game.id}`;
  const shareUrl = `${baseUrl}?${shareSlug}`;
  
  document.getElementById('gameModalTitle').textContent = game.nama;
  document.getElementById('gameIframe').src = game.link;
  document.getElementById('gameModalNewTab').href = game.link;
  
  history.replaceState({ gameId: id }, '', `?${shareSlug}`);
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function bukaGameByName(nameSlug) {
  const game = gamesData.find(g => 
    g.nama.toLowerCase().replace(/[^a-z0-9]/g, '-') === nameSlug
  );
  if (game) bukaGame(game.id);
}

function tutupGameModal() {
  document.getElementById('gameModal').classList.add('hidden');
  document.getElementById('gameIframe').src = '';
  document.body.style.overflow = '';
  history.replaceState({}, '', window.location.pathname);
}

// === META SHARE HELPERS ===
function updateMetaShare(imageUrl, title, url) {
  const getMeta = (prop) => document.querySelector(`meta[property="${prop}"]`);
  if (getMeta('og:image')) getMeta('og:image').content = imageUrl;
  if (getMeta('og:title')) getMeta('og:title').content = title;
  if (getMeta('og:url')) getMeta('og:url').content = url;
}

function resetMetaShare() {
  const getMeta = (prop) => document.querySelector(`meta[property="${prop}"]`);
  if (getMeta('og:image')) getMeta('og:image').content = 'https://files.catbox.moe/7vkqqk.jpg';
  if (getMeta('og:title')) getMeta('og:title').content = 'ArpiMC Zone';
  if (getMeta('og:url')) getMeta('og:url').content = window.location.origin;
}

// === TEMA ===
function setupThemePanel() {
  const themeBtn = document.getElementById('themeToggle');
  const panel = document.getElementById('themePanel');
  const choices = document.querySelectorAll('.theme-choice');
  
  const savedTheme = localStorage.getItem('arpimc-theme') || 'default';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  themeBtn.addEventListener('click', () => panel.classList.remove('hidden'));
  panel.addEventListener('click', (e) => { if (e.target === panel) panel.classList.add('hidden');
  });
  
  choices.forEach(choice => {
    choice.addEventListener('click', () => {
      const theme = choice.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('arpimc-theme', theme);
      panel.classList.add('hidden');
    });
  });
}

function tutupThemePanel() {
  document.getElementById('themePanel').classList.add('hidden');
}

// === TUTUP MODAL DENGAN TOMBOL ESC ===
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    tutupSkinModal();
    tutupAddonModal();
    tutupGameModal();
    tutupThemePanel();
  }
});

// === KEMBALI KE HALAMAN UTAMA SAAT KLIK LOGO/NAMA ===
window.addEventListener('popstate', () => {
  tutupSkinModal();
  tutupAddonModal();
  tutupGameModal();
});

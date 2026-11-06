// =============================================
// ApinMC Zone — script.js
// =============================================

let currentPage = 'home';
let skinsData = [];
let addonsData = [];
let gamesData = [];
let siteData = {};

// === INISIALISASI ===
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initSidebar();
  initThemes();
  initCosloUpload();
  initLanguage();
  loadAllData();
});

// === ROUTING ===
function initRouter() {
  const navigateTo = (page) => {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });
    
    currentPage = page;
    window.history.replaceState({}, '', `/${page === 'home' ? '' : page}`);
  };

  const getPath = () => {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    if (path === '' || path === 'home') return 'home';
    if (['skin','addon','game','info'].includes(path)) return path;
    return 'home';
  };

  navigateTo(getPath());

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.nav);
    });
  });

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.page);
    });
  });

  // Tangani rute game /game/nama-game
  const path = window.location.pathname;
  if (path.startsWith('/game/')) {
    const gameSlug = path.replace('/game/', '');
    navigateTo('game');
    setTimeout(() => bukaGameBySlug(gameSlug), 300);
  }
}

// === SIDEBAR ===
function initSidebar() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const closeBtn = document.getElementById('closeSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.getElementById('sidebar');

  const openSidebar = () => {
    overlay.classList.remove('hidden');
    sidebar.classList.remove('hidden');
  };

  const closeSidebar = () => {
    overlay.classList.add('hidden');
    sidebar.classList.add('hidden');
  };

  toggleBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);
}

// === PILIHAN TEMA ===
function initThemes() {
  const savedTheme = localStorage.getItem('apinmc-theme') || 'default';
  setTheme(savedTheme);

  document.querySelectorAll('.theme-choice').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === savedTheme);
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.theme);
      document.querySelectorAll('.theme-choice').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('apinmc-theme', theme);
  
  const cosloSettings = document.getElementById('cosloSettings');
  if (theme === 'coslo') {
    cosloSettings.classList.remove('hidden');
    const savedBg = localStorage.getItem('apinmc-coslo-bg');
    const savedType = localStorage.getItem('apinmc-coslo-type');
    if (savedBg) applyCosloBackground(savedBg, savedType);
  } else {
    cosloSettings.classList.add('hidden');
    removeCosloBackground();
  }
}

// === UPLOAD LATAR COSLO ===
function initCosloUpload() {
  const uploadInput = document.getElementById('cosloUpload');
  const previewWrap = document.getElementById('cosloPreviewWrap');
  const previewArea = document.getElementById('cosloPreview');
  const resetBtn = document.getElementById('resetCoslo');

  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const fileType = file.type.startsWith('video') ? 'video' : 'image';
      
      previewWrap.classList.remove('hidden');
      previewArea.innerHTML = fileType === 'video'
        ? `<video src="${dataUrl}" muted loop autoplay playsinline style="width:100%;height:100%;object-fit:cover;"></video>`
        : `<img src="${dataUrl}" alt="Preview" style="width:100%;height:100%;object-fit:cover;">`;
      
      localStorage.setItem('apinmc-coslo-bg', dataUrl);
      localStorage.setItem('apinmc-coslo-type', fileType);
      
      if (localStorage.getItem('apinmc-theme') === 'coslo') {
        applyCosloBackground(dataUrl, fileType);
      }
    };
    reader.readAsDataURL(file);
  });

  resetBtn.addEventListener('click', () => {
    localStorage.removeItem('apinmc-coslo-bg');
    localStorage.removeItem('apinmc-coslo-type');
    previewWrap.classList.add('hidden');
    previewArea.innerHTML = '';
    uploadInput.value = '';
    removeCosloBackground();
  });
}

function applyCosloBackground(dataUrl, type) {
  const layer = document.getElementById('coslo-bg-layer');
  if (type === 'video') {
    layer.innerHTML = `<video src="${dataUrl}" muted loop autoplay playsinline style="width:100%;height:100%;object-fit:cover;"></video>`;
  } else {
    layer.innerHTML = `<div style="width:100%;height:100%;background:url('${dataUrl}') center/cover no-repeat;"></div>`;
  }
  document.body.classList.add('coslo-active');
}

function removeCosloBackground() {
  document.getElementById('coslo-bg-layer').innerHTML = '';
  document.body.classList.remove('coslo-active');
}

// === BAHASA ===
function initLanguage() {
  const savedLang = localStorage.getItem('apinmc-lang') || 'id';
  setLanguage(savedLang);

  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === savedLang);
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      document.querySelectorAll('.lang-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function setLanguage(lang) {
  localStorage.setItem('apinmc-lang', lang);
  // Nanti bisa ditambahkan terjemahan lengkap di sini
  console.log('Bahasa diubah ke:', lang);
}

// === MUAT SEMUA DATA ===
async function loadAllData() {
  try {
    const [skinsRes, addonsRes, gamesRes, dataRes] = await Promise.all([
      fetch('skins.json'),
      fetch('addons.json'),
      fetch('games.json'),
      fetch('data.json')
    ]);

    skinsData = await skinsRes.json();
    addonsData = await addonsRes.json();
    gamesData = await gamesRes.json();
    siteData = await dataRes.json();

    document.getElementById('totalSkins').textContent = skinsData.length || 0;
    
    renderSkins('all');
    initSkinFilters();
    
    renderAddons('all');
    initAddonFilters();
    
    renderGames('all');
    initGameFilters();
    
    renderInfo();
    
    checkDirectPreviewLink();
    
  } catch (err) {
    console.error('Gagal memuat data:', err);
  }
}
 // === NAVIGASI LANGSUNG DARI LINK ===
function checkDirectPreviewLink() {
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of params) {
    if (key.endsWith('-id')) {
      const type = key.replace('-id', '');
      const id = parseInt(value);
      
      if (['cowok','cewek','pvp','template','pack','emote','google','couple','lain'].includes(type)) {
        setTimeout(() => bukaPreviewSkin(id), 200);
      } else {
        setTimeout(() => bukaPreviewAddon(id), 200);
      }
      break;
    }
  }
}

// === FUNGSI SKIN ===
function renderSkins(category) {
  const grid = document.getElementById('skinsGrid');
  let filtered = category === 'all' ? skinsData : skinsData.filter(s => s.kategori === category);
  
  if (!filtered.length) {
    grid.innerHTML = '<p class="loading-text">Belum ada skin di kategori ini</p>';
    return;
  }
  
  grid.innerHTML = filtered.map(skin => `
    <div class="skin-card">
      <div class="card-img-wrap" onclick="bukaPreviewSkin(${skin.id})">
        <img src="${skin.gambar}" alt="${skin.nama}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-name">${skin.nama}</h3>
        <div class="card-buttons">
          <button class="card-btn preview" onclick="bukaPreviewSkin(${skin.id})">Preview</button>
          <a href="${skin.link_download}" target="_blank" class="card-btn download">Unduh</a>
        </div>
      </div>
    </div>
  `).join('');
}

function initSkinFilters() {
  document.querySelectorAll('#page-skin .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#page-skin .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderSkins(tab.dataset.filter);
    });
  });
}

function bukaPreviewSkin(id) {
  const skin = skinsData.find(s => s.id === id);
  if (!skin) return;
  
  const modal = document.getElementById('skinModal');
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?${skin.kategori}-id=${skin.id}`;
  
  document.getElementById('skinModalTitle').textContent = skin.nama;
  document.getElementById('skinModalImage').src = skin.gambar;
  document.getElementById('skinModalInfo').innerHTML = `
    ${skin.kredit ? `👑 Credit: ${skin.kredit}` : ''}
    ${skin.tanggal ? `<br>📅 ${skin.tanggal}` : ''}
  `;
  document.getElementById('skinModalDownloadTop').href = skin.link_download;
  document.getElementById('skinModalDownload').href = skin.link_download;
  
  // Salin Link — hanya URL
  document.getElementById('skinModalCopy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('✅ Link disalin!');
    } catch { alert('❌ Gagal menyalin'); }
  };
  
  // Share WA — format baru
  document.getElementById('skinModalShareWA').onclick = () => {
    const text = encodeURIComponent(`skin apinmc zone 😜

👑 credit: ${skin.kredit || ''}
📥 Download: ${skin.link_download}
💌 Support: https://apinmc.zone.id`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  history.replaceState({}, '', shareUrl);
}

function tutupSkinModal() {
  const modal = document.getElementById('skinModal');
  if (!modal.classList.contains('hidden')) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    history.replaceState({}, '', window.location.pathname);
  }
}

// === FUNGSI ADDON ===
function renderAddons(category) {
  const grid = document.getElementById('addonsGrid');
  let filtered = category === 'all' ? addonsData : addonsData.filter(a => a.kategori === category);
  
  if (!filtered.length) {
    grid.innerHTML = '<p class="loading-text">Belum ada addon di kategori ini</p>';
    return;
  }
  
  grid.innerHTML = filtered.map(addon => `
    <div class="addon-card">
      <div class="card-img-wrap" onclick="bukaPreviewAddon(${addon.id})">
        <img src="${addon.gambar}" alt="${addon.nama}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-name">${addon.nama}</h3>
        <div class="card-buttons">
          <button class="card-btn preview" onclick="bukaPreviewAddon(${addon.id})">Preview</button>
          <a href="${addon.link_download}" target="_blank" class="card-btn download">Unduh</a>
        </div>
      </div>
    </div>
  `).join('');
}

function initAddonFilters() {
  document.querySelectorAll('#page-addon .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#page-addon .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderAddons(tab.dataset.filter);
    });
  });
}

function bukaPreviewAddon(id) {
  const addon = addonsData.find(a => a.id === id);
  if (!addon) return;
  
  const modal = document.getElementById('addonModal');
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?${addon.nama.toLowerCase().replace(/\s+/g, '-')}-id=${addon.id}`;
  
  document.getElementById('addonModalTitle').textContent = addon.nama;
  document.getElementById('addonModalImage').src = addon.gambar;
  document.getElementById('addonModalInfo').innerHTML = `
    ${addon.deskripsi || ''}
    ${addon.versi ? `<br>🏷 Versi: ${addon.versi}` : ''}
    ${addon.ukuran ? ` | 📦 ${addon.ukuran}` : ''}
    ${addon.tanggal ? `<br>📅 ${addon.tanggal}` : ''}
  `;
  document.getElementById('addonModalDownloadTop').href = addon.link_download;
  document.getElementById('addonModalDownload').href = addon.link_download;
  
  // Salin Link — hanya URL
  document.getElementById('addonModalCopy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('✅ Link disalin!');
    } catch { alert('❌ Gagal menyalin'); }
  };
  
  // Share WA — format baru
  document.getElementById('addonModalShareWA').onclick = () => {
    const text = encodeURIComponent(`addon apinmc zone 😜

🏷 nama: ${addon.nama}
ℹ Deskripsi: ${addon.deskripsi || ''}
📥 Download: ${addon.link_download}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  history.replaceState({}, '', shareUrl);
}

function tutupAddonModal() {
  const modal = document.getElementById('addonModal');
  if (!modal.classList.contains('hidden')) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    history.replaceState({}, '', window.location.pathname);
  }
}

// === FUNGSI GAME ===
function renderGames(category) {
  const grid = document.getElementById('gamesGrid');
  let filtered = category === 'all' ? gamesData : gamesData.filter(g => g.tipe === category);
  
  if (!filtered.length) {
    grid.innerHTML = '<p class="loading-text">Belum ada konten di kategori ini</p>';
    return;
  }
  
  grid.innerHTML = filtered.map(game => `
    <div class="game-card">
      <h3 class="game-name">${game.nama}</h3>
      <p class="game-desc">${game.deskripsi}</p>
      <button class="card-btn download" onclick="bukaGame(${game.id})">Buka →</button>
    </div>
  `).join('');
}

function initGameFilters() {
  document.querySelectorAll('#page-game .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#page-game .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderGames(tab.dataset.filter);
    });
  });
}

function bukaGame(id) {
  const game = gamesData.find(g => g.id === id);
  if (!game) return;
  
  const modal = document.getElementById('gameModal');
  document.getElementById('gameModalTitle').textContent = game.nama;
  document.getElementById('gameIframe').src = game.link;
  document.getElementById('gameModalNewTab').href = game.link;
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
  const slug = game.nama.toLowerCase().replace(/\s+/g, '-');
  history.replaceState({}, '', `/game/${slug}`);
}

function bukaGameBySlug(slug) {
  const game = gamesData.find(g => 
    g.nama.toLowerCase().replace(/\s+/g, '-') === slug
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

// === HALAMAN INFO ===
function renderInfo() {
  if (siteData.tentang) {
    document.getElementById('infoDesc').textContent = siteData.tentang;
  }
  
  let html = '';
  
  if (siteData.saluran && siteData.saluran.length) {
    html += `
      <div class="info-card">
        <h3>📢 Ikuti Saluran Kami</h3>
        <p>Dapatkan update terbaru dan konten eksklusif langsung dari sumbernya</p>
        <div class="info-grid">
          ${siteData.saluran.map(s => `<a href="${s.link}" target="_blank" class="info-grid-btn">${s.nama}</a>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (siteData.sosmed && siteData.sosmed.length) {
    html += `
      <div class="info-card">
        <h3>📱 Ikuti di Sosmed</h3>
        <p>Kunjungi dan beri dukungan</p>
        <div class="info-grid">
          ${siteData.sosmed.map(s => `<a href="${s.link}" target="_blank" class="info-grid-btn">${s.nama}</a>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (siteData.grup && siteData.grup.length) {
    html += `
      <div class="info-card">
        <h3>👥 Bergabung di Grup</h3>
        <p>Bertemu teman-teman lain yang sama minatnya</p>
        <div class="info-grid">
          ${siteData.grup.map(g => `<a href="${g.link}" target="_blank" class="info-grid-btn">${g.nama}</a>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (siteData.dukungan) {
    html += `
      <div class="info-card">
        <h3>💜 Dukung Kami</h3>
        <p>Karya gratis terus ada dengan dukungan kamu</p>
        <a href="${siteData.dukungan}" target="_blank" class="info-btn">Dukung Kami →</a>
      </div>
    `;
  }
  
  document.getElementById('infoLinks').innerHTML = html || '<p class="loading-text">Data belum tersedia</p>';
}

// === TUTUP MODAL DENGAN TOMBOL KEMBALI / ESCAPE ===
document.querySelector('#skinModal .back-btn')?.addEventListener('click', tutupSkinModal);
document.querySelector('#addonModal .back-btn')?.addEventListener('click', tutupAddonModal);
document.querySelector('#gameModal .back-btn')?.addEventListener('click', tutupGameModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    tutupSkinModal();
    tutupAddonModal();
    tutupGameModal();
  }
});

console.log('%c🚀 ApinMC Zone siap digunakan!', 'color: #3b82f6; font-weight: bold; font-size: 14px;');

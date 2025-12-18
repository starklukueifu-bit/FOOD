/**
 * Food Decider App
 * Core Logic: Mode Switching, Card Stack, Shortlist
 */

const CONSTANTS = {
    MODES: {
        CATEGORY: 'category',
        RESTAURANT: 'restaurant'
    },
    CATEGORIES: {
        BREAKFAST: 'breakfast',
        LUNCH: 'lunch',
        DINNER: 'dinner',
        LATENIGHT: 'latenight'
    }
};

// State
let state = {
    mode: CONSTANTS.MODES.CATEGORY,
    currentCategory: CONSTANTS.CATEGORIES.LUNCH,
    apiKey: localStorage.getItem('google_places_api_key') || '',
    searchLimit: parseInt(localStorage.getItem('search_limit')) || 6,
    // 新增：靈感模式限制，預設 6
    inspirationLimit: parseInt(localStorage.getItem('inspiration_limit')) || 6,
    shortlist: [],
    cardQueue: [],
    swiping: false
};

// DOM Elements
const elements = {
    modeToggle: document.getElementById('mode-toggle'),
    modeThumb: document.querySelector('.toggle-thumb'),
    modeLabels: {
        cat: document.getElementById('mode-category'),
        res: document.getElementById('mode-restaurant')
    },
    categoryNav: document.getElementById('category-nav'),
    searchContainer: document.getElementById('search-bar-container'),
    cardStack: document.getElementById('card-stack'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettings: document.getElementById('close-settings'),
    saveSettings: document.getElementById('save-settings'),
    apiKeyInput: document.getElementById('api-key-input'),
    limitInput: document.getElementById('limit-input'),
    shortlistBar: document.getElementById('shortlist-bar'),
    shortlistToggle: document.getElementById('shortlist-toggle'),
    shortlistCount: document.getElementById('shortlist-count'),
    shortlistItems: document.getElementById('shortlist-items'),
    decideBtn: document.getElementById('decide-btn'),
    inspirationLimitInput: document.getElementById('inspiration-limit-input'),
    // Controls
    rejectBtn: document.getElementById('reject-btn'),
    acceptBtn: document.getElementById('accept-btn'),
    searchBtn: document.getElementById('search-btn')
};

// Data (Mock for Categories)
const CATEGORY_DATA = {
    breakfast: [
        { id: 'b1', name: '蛋餅', icon: 'fa-egg' },
        { id: 'b2', name: '鐵板麵', icon: 'fa-bacon' },
        { id: 'b3', name: '飯糰', icon: 'fa-rice' },
        { id: 'b4', name: '麥當勞', icon: 'fa-burger' },
        { id: 'b5', name: '燒餅油條', icon: 'fa-bread-slice' },
        { id: 'b6', name: '漢堡', icon: 'fa-burger' },
        { id: 'b7', name: '吐司', icon: 'fa-bread-slice' },
        { id: 'b8', name: '蔥抓餅', icon: 'fa-cookie-bite' },
        { id: 'b9', name: '小籠包', icon: 'fa-dumpling' },
        { id: 'b10', name: '蘿蔔糕', icon: 'fa-square' },
        { id: 'b11', name: '米粉湯', icon: 'fa-bowl-rice' },
        { id: 'b12', name: '三明治', icon: 'fa-sandwich' },
        { id: 'b13', name: '厚片吐司', icon: 'fa-bread-slice' },
        { id: 'b14', name: '廣東粥', icon: 'fa-bowl-food' },
        { id: 'b15', name: '生菜沙拉', icon: 'fa-leaf' },
        { id: 'b16', name: '貝果', icon: 'fa-ring' },
        { id: 'b17', name: '鬆餅', icon: 'fa-stroopwafel' },
        { id: 'b18', name: '鹹粥', icon: 'fa-bowl-rice' },
        { id: 'b19', name: '水煎包', icon: 'fa-circle' },
        { id: 'b20', name: '燕麥杯', icon: 'fa-glass-water' }
    ],
    lunch: [
        { id: 'l1', name: '牛肉麵', icon: 'fa-bowl-food' },
        { id: 'l2', name: '便當', icon: 'fa-box-archive' },
        { id: 'l3', name: '水餃', icon: 'fa-dumpling' },
        { id: 'l4', name: '義大利麵', icon: 'fa-utensils' },
        { id: 'l5', name: '咖哩飯', icon: 'fa-bowl-rice' },
        { id: 'l6', name: '拉麵', icon: 'fa-bowl-food' },
        { id: 'l7', name: '滷肉飯', icon: 'fa-bowl-rice' },
        { id: 'l8', name: '自助餐', icon: 'fa-plate-wheat' },
        { id: 'l9', name: '漢堡王', icon: 'fa-burger' },
        { id: 'l10', name: '壽司', icon: 'fa-fish' },
        { id: 'l11', name: '涼麵', icon: 'fa-bacon' },
        { id: 'l12', name: '鍋貼', icon: 'fa-dumpling' },
        { id: 'l13', name: '素食', icon: 'fa-leaf' },
        { id: 'l14', name: '速食', icon: 'fa-burger' },
        { id: 'l15', name: '海南雞飯', icon: 'fa-drumstick-bite' },
        { id: 'l16', name: '丼飯', icon: 'fa-bowl-rice' },
        { id: 'l17', name: '炒麵/炒飯', icon: 'fa-fire' },
        { id: 'l18', name: '越式河粉', icon: 'fa-bowl-food' },
        { id: 'l19', name: '輕食餐盒', icon: 'fa-leaf' },
        { id: 'l20', name: '麻醬麵', icon: 'fa-bowl-food' }
    ],
    dinner: [
        { id: 'd1', name: '火鍋', icon: 'fa-fire-burner' },
        { id: 'd2', name: '燒肉', icon: 'fa-fire' },
        { id: 'd3', name: '壽司', icon: 'fa-fish' },
        { id: 'd4', name: '韓式料理', icon: 'fa-pepper-hot' },
        { id: 'd5', name: '牛排', icon: 'fa-drumstick-bite' },
        { id: 'd6', name: '泰式料理', icon: 'fa-bowl-rice' },
        { id: 'd7', name: '居酒屋', icon: 'fa-beer-mug-empty' },
        { id: 'd8', name: '披薩', icon: 'fa-pizza-slice' },
        { id: 'd9', name: '鐵板燒', icon: 'fa-fire' },
        { id: 'd10', name: '熱炒', icon: 'fa-fire-burner' },
        { id: 'd11', name: '麻辣鍋', icon: 'fa-pepper-hot' },
        { id: 'd12', name: '羊肉爐', icon: 'fa-fire' },
        { id: 'd13', name: '薑母鴨', icon: 'fa-bowl-food' },
        { id: 'd14', name: '港式飲茶', icon: 'fa-shrimp' },
        { id: 'd15', name: '酸菜魚', icon: 'fa-fish' },
        { id: 'd16', name: '石鍋拌飯', icon: 'fa-bowl-rice' },
        { id: 'd17', name: '串燒組合', icon: 'fa-fire' },
        { id: 'd18', name: '烤鴨三吃', icon: 'fa-drumstick-bite' },
        { id: 'd19', name: '新加坡料理', icon: 'fa-plate-wheat' },
        { id: 'd20', name: '美式排餐', icon: 'fa-utensils' }
    ],
    latenight: [
        { id: 'n1', name: '鹹酥雞', icon: 'fa-thumbs-up' },
        { id: 'n2', name: '永和豆漿', icon: 'fa-mug-hot' },
        { id: 'n3', name: '泡麵', icon: 'fa-bowl-food' },
        { id: 'n4', name: '串燒', icon: 'fa-fire' },
        { id: 'n5', name: '滷味', icon: 'fa-drumstick-bite' },
        { id: 'n6', name: '清粥小菜', icon: 'fa-bowl-rice' },
        { id: 'n7', name: '麥當勞', icon: 'fa-burger' },
        { id: 'n8', name: '雞排', icon: 'fa-drumstick-bite' },
        { id: 'n9', name: '甜不辣', icon: 'fa-bowl-food' },
        { id: 'n10', name: '關東煮', icon: 'fa-mug-hot' },
        { id: 'n11', name: '東山鴨頭', icon: 'fa-drumstick-bite' },
        { id: 'n12', name: '炭烤吐司', icon: 'fa-bread-slice' },
        { id: 'n13', name: '涼麵', icon: 'fa-bacon' },
        { id: 'n14', name: '臭豆腐', icon: 'fa-square' },
        { id: 'n15', name: '蚵仔麵線', icon: 'fa-bowl-food' },
        { id: 'n16', name: '章魚燒', icon: 'fa-circle' },
        { id: 'n17', name: '藥燉排骨', icon: 'fa-bowl-food' },
        { id: 'n18', name: '胡椒餅', icon: 'fa-cookie-bite' },
        { id: 'n19', name: '燒仙草/豆花', icon: 'fa-bowl-rice' },
        { id: 'n20', name: '炸銀絲卷', icon: 'fa-bread-slice' }
    ]
};

// Initialization
function init() {
    setupEventListeners();
    loadCategory(state.currentCategory);
    updateShortlistUI();

    // 加載儲存的設定到 UI
    if (state.apiKey) elements.apiKeyInput.value = state.apiKey;
    elements.limitInput.value = state.searchLimit;
    // 新增：讀取靈感限制到 input
    if (elements.inspirationLimitInput) {
        elements.inspirationLimitInput.value = state.inspirationLimit;
    }
}

// Event Listeners
function setupEventListeners() {
    // Mode Switch
    elements.modeToggle.addEventListener('click', toggleMode);

    // Settings
    elements.settingsBtn.addEventListener('click', () => toggleModal(elements.settingsModal, true));
    elements.closeSettings.addEventListener('click', () => toggleModal(elements.settingsModal, false));
    elements.saveSettings.addEventListener('click', saveSettings);

    // Category Nav
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            // Add to clicked
            e.target.classList.add('active');
            // Load content
            loadCategory(e.target.dataset.cat);
        });
    });

    // Shortlist
    elements.shortlistToggle.addEventListener('click', () => {
        elements.shortlistBar.classList.toggle('open');
        elements.shortlistBar.classList.toggle('closed');
    });

    // Card Controls
    elements.rejectBtn.addEventListener('click', () => swipeCard('left'));
    elements.acceptBtn.addEventListener('click', () => swipeCard('right'));

    // Search Listener
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', executeGoogleSearch);
    }
}

// Core Logic: Mode Toggle
function toggleMode() {
    if (state.mode === CONSTANTS.MODES.CATEGORY) {
        state.mode = CONSTANTS.MODES.RESTAURANT;
        elements.modeThumb.style.transform = 'translateX(20px)';
        elements.modeLabels.cat.classList.remove('active');
        elements.modeLabels.res.classList.add('active');

        // Do not hide categoryNav anymore
        elements.searchContainer.classList.remove('hidden');

        // Check API Key
        if (!state.apiKey) {
            alert('探索模式需要設定 Google API Key 才能完整運作。目前將使用模擬資料。');
        }
    } else {
        state.mode = CONSTANTS.MODES.CATEGORY;
        elements.modeThumb.style.transform = 'translateX(1px)';
        elements.modeLabels.res.classList.remove('active');
        elements.modeLabels.cat.classList.add('active');

        elements.categoryNav.style.display = 'flex';
        elements.searchContainer.classList.add('hidden');

        loadCategory(state.currentCategory);
    }
}

// Logic: Load Category
function loadCategory(category) {
    if (state.mode === CONSTANTS.MODES.RESTAURANT) {
        const catName = document.querySelector(`.cat-btn[data-cat="${category}"]`).innerText;
        document.getElementById('keyword-input').value = catName;
        executeGoogleSearch();
    } else {
        state.currentCategory = category;

        // --- 修改部分：從 20 項資料中隨機抽取 N 項 ---
        const allItems = [...CATEGORY_DATA[category]];

        // 使用 Fisher-Yates 洗牌演算法
        for (let i = allItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
        }

        // 根據設定的 inspirationLimit 取出前 N 項
        state.cardQueue = allItems.slice(0, state.inspirationLimit);
        // ------------------------------------------

        renderStack();
    }
}

// Logic: Render Card Stack
function renderStack() {
    elements.cardStack.innerHTML = '';

    state.cardQueue.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-content">
                ${item.photoUrl
                ? `<div class="card-photo" style="background-image: url('${item.photoUrl}')"></div>`
                : `<i class="fa-solid ${item.icon || 'fa-utensils'} card-icon-large"></i>`
            }
                <h3 class="card-title">${item.name}</h3>
                <p class="card-desc">點擊「O」或右滑加入候選</p>
                ${item.rating ? `<p class="card-rating">⭐ ${item.rating} (${item.user_ratings_total || 0})</p>` : ''}
            </div>
        `;

        // Reverse order so first item is on top (last child)
        elements.cardStack.prepend(card);
    });

    initSwipeGestures();
}

// Logic: Swipe Gestures (Pointer Events)
function initSwipeGestures() {
    const cards = document.querySelectorAll('.card');
    if (cards.length === 0) return;

    // Only attach to the top card
    const topCard = Promise.resolve(elements.cardStack.lastElementChild).then(card => {
        if (!card) return;

        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        const handleStart = (e) => {
            isDragging = true;
            startX = e.clientX || e.touches[0].clientX;
            card.style.transition = 'none'; // Remove transition for direct 1:1 movement
        };

        const handleMove = (e) => {
            if (!isDragging) return;

            currentX = (e.clientX || e.touches[0].clientX) - startX;
            const rotate = currentX * 0.1; // Slight rotation
            const opacity = Math.max(0, 1 - Math.abs(currentX) / 400); // Fade out near edge

            card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
        };

        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            const threshold = 100; // Pixel threshold to trigger swipe

            if (currentX > threshold) {
                swipeCard('right');
            } else if (currentX < -threshold) {
                swipeCard('left');
            } else {
                // Reset
                card.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                card.style.transform = 'translateX(0) rotate(0)';
            }
        };

        // Mouse events
        card.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);

        // Touch events
        card.addEventListener('touchstart', handleStart);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleEnd);
    });
}

// Logic: Swipe Animation & Action
function swipeCard(direction) {
    if (state.swiping || state.cardQueue.length === 0) return;
    state.swiping = true;

    const cardEl = elements.cardStack.lastElementChild;
    const currentItem = state.cardQueue[0];

    if (!cardEl) return;

    // Animate off screen
    const xMove = direction === 'right' ? window.innerWidth : -window.innerWidth;
    const rotate = direction === 'right' ? 30 : -30;

    cardEl.style.transition = 'transform 0.4s ease-out, opacity 0.3s';
    cardEl.style.transform = `translateX(${xMove}px) rotate(${rotate}deg)`;
    cardEl.style.opacity = '0';

    setTimeout(() => {
        cardEl.remove();
        state.cardQueue.shift(); // Remove from queue

        if (direction === 'right') {
            addToShortlist(currentItem);
        }

        state.swiping = false;

        // Re-init gestures for the new top card
        initSwipeGestures();

        // If empty
        if (state.cardQueue.length === 0) {
            if (state.shortlist.length > 0) {
                elements.shortlistBar.classList.remove('closed');
                elements.shortlistBar.classList.add('open');
            } else {
                alert("沒牌了！將重新載入...");
                loadCategory(state.currentCategory);
            }
        }
    }, 300);
}

// Logic: Shortlist
function addToShortlist(item) {
    // Check dupe
    if (state.shortlist.some(i => i.id === item.id)) return;

    state.shortlist.push(item);
    updateShortlistUI();
}

function updateShortlistUI() {
    elements.shortlistCount.textContent = state.shortlist.length;
    elements.decideBtn.disabled = state.shortlist.length === 0;

    elements.shortlistItems.innerHTML = state.shortlist.slice().reverse().map(item => `
        <li class="shortlist-item">
            <span>
                <i class="fa-solid ${item.icon || 'fa-utensils'}"></i> 
                ${item.name}
            </span>
            <button class="remove-item-btn" data-id="${item.id}">
                <i class="fa-solid fa-trash"></i>
            </button>
        </li>
    `).join('');

    // Add event listeners to dynamic buttons
    elements.shortlistItems.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            state.shortlist = state.shortlist.filter(i => i.id !== id);
            updateShortlistUI();
        });
    });
}

// Final Decision
elements.decideBtn.addEventListener('click', makeDecision);

function makeDecision() {
    if (state.shortlist.length === 0) return;
    const winnerIndex = Math.floor(Math.random() * state.shortlist.length);
    const winner = state.shortlist[winnerIndex];
    showResult(winner);
}

function showResult(item) {
    const modal = document.getElementById('result-modal');
    const resultCard = document.getElementById('result-card');

    resultCard.innerHTML = `
        <i class="fa-solid ${item.icon || 'fa-utensils'} card-icon-large" style="font-size: 6rem; display:block; margin: 0 auto 20px;"></i>
        <h2 style="font-size: 2.5rem; margin-bottom: 10px;">${item.name}</h2>
        <p style="color: var(--text-muted);">今天的好選擇！</p>
    `;

    toggleModal(modal, true);

    document.getElementById('retry-btn').onclick = () => {
        toggleModal(modal, false);
        makeDecision();
    };

    document.getElementById('go-btn').onclick = () => {
        const query = item.name + (state.mode === CONSTANTS.MODES.RESTAURANT ? '' : ' 餐廳');
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
    };

    createConfetti();
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'absolute';
        conf.style.width = '10px';
        conf.style.height = '10px';
        conf.style.background = ['#f472b6', '#38bdf8', '#a78bfa', '#facc15'][Math.floor(Math.random() * 4)];
        conf.style.left = Math.random() * 100 + '%';
        conf.style.top = '-10px';
        conf.style.borderRadius = '50%';
        conf.style.animation = `fall ${Math.random() * 2 + 1}s linear`;
        container.appendChild(conf);
    }
}

// Add keyframes for confetti in JS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes fall {
    to { transform: translateY(100vh) rotate(720deg); }
}
`;
document.head.appendChild(styleSheet);

// Google Maps Integration
let googleService = null;
let mapInstance = null;

function checkAndLoadGoogleAPI() {
    if (!state.apiKey) {
        elements.cardStack.innerHTML = `
            <div class="card placeholder-card" style="z-index:100; opacity:1">
                <div class="card-content">
                    <i class="fa-solid fa-key card-icon-large"></i>
                    <h3>請設定 API Key</h3>
                    <p class="card-desc">點擊右上角齒輪輸入您的 Google Places API Key 以啟用真實店家搜尋。</p>
                </div>
            </div>
        `;
        return;
    }

    if (window.google && window.google.maps) {
        if (!googleService) initPlacesService();
    } else {
        loadGoogleScript();
    }
}

function loadGoogleScript() {
    if (document.getElementById('google-maps-script')) return;

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${state.apiKey}&libraries=places&callback=initPlacesService`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
        alert('Google Maps API 載入失敗。\n請確認 API Key 是否正確，以及是否已啟用 "Maps JavaScript API" 和 "Places API"。');
    };
    document.head.appendChild(script);
}

window.initPlacesService = function () {
    const dummyDiv = document.createElement('div');
    mapInstance = new google.maps.Map(dummyDiv, { center: { lat: 25.033, lng: 121.565 }, zoom: 15 });
    googleService = new google.maps.places.PlacesService(mapInstance);
    console.log('Google Places Service Initialized');
};

function executeGoogleSearch() {
    if (!googleService) {
        checkAndLoadGoogleAPI();
        if (!state.apiKey) return;
        if (!googleService) return;
    }

    let keyword = document.getElementById('keyword-input').value.trim();
    const location = document.getElementById('location-input').value.trim();

    if (!keyword) {
        keyword = '美食';
    }

    elements.cardStack.innerHTML = `
        <div class="card placeholder-card" style="z-index:99; opacity:1">
            <div class="card-content">
                <i class="fa-solid fa-compass fa-spin card-icon-large"></i>
                <h3>搜尋附近${keyword === '美食' ? '美食' : keyword}...</h3>
            </div>
        </div>
    `;

    const request = {
        query: location === '附近' || !location ? keyword : `${location} ${keyword}`,
        fields: ['name', 'geometry', 'photos', 'rating', 'user_ratings_total', 'place_id']
    };

    googleService.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            state.cardQueue = results.slice(0, state.searchLimit).map(place => ({
                id: place.place_id,
                name: place.name,
                icon: 'fa-location-dot', // Default override
                rating: place.rating,
                photoUrl: place.photos && place.photos.length > 0 ? place.photos[0].getUrl({ maxWidth: 400 }) : null
            }));

            renderStack();
        } else {
            alert('搜尋失敗或無結果：' + status);
            elements.cardStack.innerHTML = '';
        }
    });
}

// Settings
function toggleModal(modal, show) {
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function saveSettings() {
    const key = elements.apiKeyInput.value.trim();
    const limit = parseInt(elements.limitInput.value) || 6;
    const insLimit = parseInt(elements.inspirationLimitInput.value) || 6;

    state.searchLimit = limit;
    localStorage.setItem('search_limit', limit);

    if (key) {
        localStorage.setItem('google_places_api_key', key);
        state.apiKey = key;
        alert('設定已儲存！網頁將重新整理以套用新設定。');
        location.reload();
    } else {
        localStorage.removeItem('google_places_api_key');
        state.apiKey = '';
        alert('API Key 已清除 (數量限制已儲存)。');
        toggleModal(elements.settingsModal, false);
    }
}

// Global exposure for inline events
window.removeFromShortlist = (id) => {
    state.shortlist = state.shortlist.filter(i => i.id !== id);
    updateShortlistUI();
};

// Start
init();

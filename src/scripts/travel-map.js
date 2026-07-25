import L from 'leaflet';

// =============================================================================
// 数据 —— 在这里编辑你的旅行记录
// 结构: 驻地(bases) → 旅行地(trips)，均可选 slug 指向博客
// =============================================================================
const bases = [
    {
        period: "2002 — 2017", summary: "童年与中学时代",
        city: "庆阳", province: "甘肃",
        color: "#e88d2e", slug: "",
        trips: [
            { city:"西安", province:"陕西", dates:"2010夏", year:2010, slug:"" },
            { city:"银川", province:"宁夏", dates:"2012秋", year:2012, slug:"" },
            { city:"西安", province:"陕西", dates:"2014冬", year:2014, slug:"" }
        ]
    },{
        period: "2017.9 — 2020.6", summary: "高中时代",
        city: "兰州", province: "甘肃",
        color: "#4d9e7b", slug: "",
        trips: [
            { city:"成都", province:"四川", dates:"2017夏", year:2017, slug:"" },
            { city:"庆阳", province:"甘肃", dates:"2018.1", year:2018, slug:"", note:"寒假回家" },
            { city:"庆阳", province:"甘肃", dates:"2018.7", year:2018, slug:"", note:"暑假回家" },
            { city:"庆阳", province:"甘肃", dates:"2019.1", year:2019, slug:"", note:"寒假回家" },
            { city:"庆阳", province:"甘肃", dates:"2019.7", year:2019, slug:"", note:"暑假回家" },
            { city:"庆阳", province:"甘肃", dates:"2020.1", year:2020, slug:"", note:"寒假回家" }
        ]
    },{
        period: "2020.9 — 2026", summary: "本科与研究生时代",
        city: "南京", province: "江苏",
        color: "#5b8cc9", slug: "",
        trips: [
            { city:"庆阳", province:"甘肃", dates:"2021.1", year:2021, slug:"", note:"寒假回家" },
            { city:"庆阳", province:"甘肃", dates:"2021.7", year:2021, slug:"", note:"暑假回家" },
            { city:"庆阳", province:"甘肃", dates:"2022.1", year:2022, slug:"", note:"寒假回家" },
            { city:"庆阳", province:"甘肃", dates:"2022.7", year:2022, slug:"", note:"暑假回家" },
            { city:"庆阳", province:"甘肃", dates:"2023.1", year:2023, slug:"", note:"寒假回家" },
            { city:"滁州", province:"安徽", dates:"2023春", year:2023, slug:"" },
            { city:"杭州", province:"浙江", dates:"2023.6–9", year:2023, slug:"", baseLike:true, subtrips:[] },
            { city:"庆阳", province:"甘肃", dates:"2023.7", year:2023, slug:"", note:"暑假回家" },
            { city:"青岛", province:"山东", dates:"2023秋", year:2023, slug:"" },
            { city:"淄博", province:"山东", dates:"2023秋", year:2023, slug:"" },
            { city:"泰安", province:"山东", dates:"2023秋", year:2023, slug:"" },
            { city:"北京", province:"北京", dates:"2023秋", year:2023, slug:"" },
            { city:"庆阳", province:"甘肃", dates:"2024.1", year:2024, slug:"", note:"寒假回家" },
            { city:"黄山", province:"安徽", dates:"2024春", year:2024, slug:"" },
            { city:"西双版纳", province:"云南", dates:"2024夏", year:2024, slug:"" },
            { city:"大理", province:"云南", dates:"2024夏", year:2024, slug:"" },
            { city:"丽江", province:"云南", dates:"2024夏", year:2024, slug:"" },
            { city:"昆明", province:"云南", dates:"2024夏", year:2024, slug:"" },
            { city:"无锡", province:"江苏", dates:"2024夏", year:2024, slug:"" },
            { city:"镇江", province:"江苏", dates:"2024夏", year:2024, slug:"" },
            { city:"庆阳", province:"甘肃", dates:"2025.1", year:2025, slug:"", note:"寒假回家" },
            { city:"扬州", province:"江苏", dates:"2025.5", year:2025, slug:"" },
            { city:"深圳", province:"广东", dates:"2025.6–9", year:2025, slug:"", baseLike:true, subtrips:[
                { city:"香港", province:"香港", dates:"2025.8", year:2025, slug:"" },
                { city:"广州", province:"广东", dates:"2025.8", year:2025, slug:"" },
                { city:"珠海", province:"广东", dates:"2025.8", year:2025, slug:"" },
                { city:"澳门", province:"澳门", dates:"2025.8", year:2025, slug:"" }
            ]},
            { city:"苏州", province:"江苏", dates:"2025冬", year:2025, slug:"", note:"与女友同行" },
            { city:"上海", province:"上海", dates:"2025冬", year:2025, slug:"", note:"与女友同行" },
            { city:"庆阳", province:"甘肃", dates:"2025.12", year:2025, slug:"" },
            { city:"北京", province:"北京", dates:"2025.12–2026.5", year:2025, slug:"", baseLike:true, subtrips:[
                { city:"大同", province:"山西", dates:"2026.1", year:2026, slug:"" },
                { city:"珠海", province:"广东", dates:"2026.3", year:2026, slug:"" },
                { city:"香港", province:"香港", dates:"2026.3", year:2026, slug:"" },
                { city:"哈尔滨", province:"黑龙江", dates:"2026.5", year:2026, slug:"" },
                { city:"长春", province:"吉林", dates:"2026.5", year:2026, slug:"" },
                { city:"沈阳", province:"辽宁", dates:"2026.5", year:2026, slug:"" }
            ]},
            { city:"庆阳", province:"甘肃", dates:"2026.5–6", year:2026, slug:"" },
            { city:"西安", province:"陕西", dates:"2026.6", year:2026, slug:"" },
            { city:"广州", province:"广东", dates:"2026.6", year:2026, slug:"" },
            { city:"珠海", province:"广东", dates:"2026.6", year:2026, slug:"" },
            { city:"惠州", province:"广东", dates:"2026.6", year:2026, slug:"" },
            { city:"南昌", province:"江西", dates:"2026.6", year:2026, slug:"" },
            { city:"九江", province:"江西", dates:"2026.6", year:2026, slug:"" }
        ]
    }
];

// =============================================================================
// State
// =============================================================================
let map, cityLayer, provinceLayer, worldLayer;
let markerEntries = [];
let markerByKey = new Map();
const cityCoord = new Map();
const ui = { selBase: null, selTrip: null, noSync: false };
let currentView = 'china';
let highlightMode = 'city';
const GEO_CITY = '/geojson/china-cities.json';
const GEO_PROVINCE = '/geojson/china.json';
const GEO_WORLD = '/geojson/world.json';

// =============================================================================
// Helpers
// =============================================================================
const hexRGBA = (h,a) => `rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${a})`;

function normCity(n) {
    return (n||'')
        .replace(/市|自治州|地区|盟|特别行政区/g,'')
        .replace(/傣族|白族|藏族|回族|壮族|维吾尔|蒙古族|朝鲜族|土家族|苗族|彝族|侗族|瑶族|布依族|哈尼族/g,'')
        .trim();
}
function buildCoordLookup(geo) {
    geo.features.forEach(f => {
        const c = f.properties.center; if (!c) return;
        const name = normCity(f.properties.name); if (!name) return;
        if (!cityCoord.has(name)) cityCoord.set(name, { lat: c[1], lng: c[0] });
    });
}
function getCoords(city) {
    const key = normCity(city);
    const c = cityCoord.get(key);
    if (!c) throw new Error(`未找到城市坐标: ${city} (${key})`);
    return c;
}
function injectCoords() {
    bases.forEach(b => {
        try { Object.assign(b, getCoords(b.city)); } catch(e) { console.warn(e.message); }
        b.trips.forEach(t => {
            try { Object.assign(t, getCoords(t.city)); } catch(e) { console.warn(e.message); }
            if (t.subtrips) t.subtrips.forEach(st => {
                try { Object.assign(st, getCoords(st.city)); } catch(e) { console.warn(e.message); }
            });
        });
    });
}
function visitedCityNames() {
    const s = new Set();
    bases.forEach(b => { s.add(b.city); b.trips.forEach(t => { s.add(t.city); if(t.subtrips) t.subtrips.forEach(st=>s.add(st.city)); }); });
    return s;
}
function isVisitedCity(name) { return visitedCityNames().has(normCity(name)); }

function normProv(n) {
    return (n||'')
        .replace(/省|市|自治区|特别行政区/g,'')
        .replace(/傣族|白族|藏族|回族|壮族|维吾尔|蒙古族|朝鲜族|土家族|苗族|彝族|侗族|瑶族|布依族|哈尼族/g,'')
        .trim();
}
function visitedProvinceNames() {
    const s = new Set();
    bases.forEach(b => { s.add(normProv(b.province)); b.trips.forEach(t => { s.add(normProv(t.province)); if(t.subtrips) t.subtrips.forEach(st=>s.add(normProv(st.province))); }); });
    return s;
}
function isVisitedProvince(name) { return visitedProvinceNames().has(normProv(name)); }

function mkKey(lat,lng) { return `${lat}|${lng}`; }

// =============================================================================
// World country detection
// =============================================================================
function isVisitedCountry(f) {
    const names = [
        f.properties.name, f.properties.NAME,
        f.properties.admin, f.properties.name_long
    ].filter(Boolean);
    const visited = new Set(['China','中国',"People's Republic of China"]);
    if (names.some(n => visited.has(n))) return true;
    // Hong Kong & Macau are separate features in world GeoJSON but are part of China
    const visitedSAR = new Set(['Hong Kong','Hong Kong S.A.R.','Macau','Macau S.A.R.','澳门','香港']);
    return names.some(n => visitedSAR.has(n));
}

// =============================================================================
// Map init
// =============================================================================
async function init() {
    const saved = JSON.parse(sessionStorage.getItem('mv')||'null');
    map = L.map('map', {
        center: saved ? [saved.lat, saved.lng] : [34,108],
        zoom: saved ? saved.zoom : 5,
        zoomControl: true, attributionControl: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OSM', maxZoom: 18
    }).addTo(map);

    try {
        await loadWorld();
        await loadCityLayer();
        await loadProvinceLayer();
        injectCoords();
        applyHighlightMode();
        addMarkers();
        renderTL();
        stats();
        document.getElementById('map').classList.add('on');
    } catch(e) {
        console.error(e);
        document.getElementById('map').innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#c44;">地图加载失败</div>';
    } finally {
        document.getElementById('loaderCover').classList.add('off');
    }
}
window.addEventListener('beforeunload', () => {
    if (!map) return;
    const c = map.getCenter();
    sessionStorage.setItem('mv', JSON.stringify({lat:c.lat, lng:c.lng, zoom:map.getZoom()}));
});

// =============================================================================
// China GeoJSON
// =============================================================================
function styleCity(f) {
    const n = f.properties.name;
    if (isVisitedCity(n)) {
        return {
            fillColor: 'transparent', fillOpacity: 0,
            color: '#e8912e', weight: 2, opacity: 0.9,
            className: 'pv', interactive: true
        };
    }
    // Unvisited: dark veil — visited cities shine through as clear "holes"
    return {
        fillColor: '#1e242c', fillOpacity: 0.48,
        color: '#3a3f47', weight: 0.3, opacity: 0.5,
        interactive: false
    };
}
function onCity(f,layer) {
    const n = f.properties.name;
    if (isVisitedCity(n)) {
        const nc = normCity(n);
        const visits = [];
        bases.forEach(b => {
            if (normCity(b.city)===nc) visits.push({ period:b.period, note:b.note, type:'驻地', color:b.color });
            b.trips.forEach(t => {
                if (normCity(t.city)===nc) visits.push({ period:t.dates||b.period, note:t.note, type: t.baseLike?'实习':'旅行', color:b.color });
                if (t.subtrips) { t.subtrips.forEach(st => {
                    if (normCity(st.city)===nc) visits.push({ period:t.dates, note:st.note, type:'短途', color:b.color });
                });}
            });
        });
        let h = `<span class="pu-city">${n.replace(/市|自治州|地区|盟|特别行政区|傣族|白族|藏族|回族|壮族|维吾尔|蒙古族自治州/g,'')}</span>`;
        const useCols = visits.length > 6;
        if (visits.length > 3) h += `<div class="pu-list${useCols?' cols':''}" style="margin-top:3px;">`;
        visits.forEach(v => {
            const item = `<div class="pu-meta" style="margin-top:2px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${v.color};margin-right:4px;vertical-align:middle;"></span>${v.type} · ${v.period}</div>`;
            if (visits.length > 3) {
                h += `<div class="pu-item">${item}</div>`;
            } else {
                h += item;
            }
        });
        if (visits.length > 3) h += '</div>';
        layer.bindPopup(h);
        layer.on({
            mouseover(e){
                e.target.setStyle({ color:'#f59e0b', weight:3.5, opacity:1 });
                if(!L.Browser.ie)e.target.bringToFront();
            },
            mouseout(e){
                if(cityLayer)cityLayer.resetStyle(e.target);
            }
        });
    }
}
async function loadCityLayer() {
    const r = await fetch(GEO_CITY); if(!r.ok) throw new Error('City geo');
    const d = await r.json();
    buildCoordLookup(d);
    if(cityLayer) map.removeLayer(cityLayer);
    cityLayer = L.geoJSON(d, { style:styleCity, onEachFeature:onCity, pane:'overlayPane' }).addTo(map);
}

// =============================================================================
// Province GeoJSON (loaded alongside city layer, toggled by highlight mode)
// =============================================================================
function styleProvince(f) {
    const n = f.properties.name;
    if (n==='十段线'||n==='南海诸岛') {
        return { fillColor:'transparent',fillOpacity:0, color:'#555',weight:0.5,dashArray:'3 5',interactive:false };
    }
    if (isVisitedProvince(n)) {
        return { fillColor:'transparent',fillOpacity:0, color:'#e8912e',weight:2,opacity:0.9, className:'pv',interactive:true };
    }
    return { fillColor:'#1e242c',fillOpacity:0.48, color:'#3a3f47',weight:0.5,interactive:false };
}
function onProvince(f,layer) {
    const n = f.properties.name;
    if (n==='十段线'||n==='南海诸岛') return;
    if (isVisitedProvince(n)) {
        const np = normProv(n);
        const cs = new Set();
        bases.forEach(b => {
            if (normProv(b.province)===np) cs.add(b.city);
            b.trips.forEach(t => {
                if (normProv(t.province)===np) cs.add(t.city);
                if (t.subtrips) t.subtrips.forEach(st => { if (normProv(st.province)===np) cs.add(st.city); });
            });
        });
        let h = `<span class="pu-city">${n}</span>`;
        if (cs.size) { h += `<div style="margin-top:3px;font-size:0.74rem;color:#6b6356;">`; cs.forEach(c => { h += `📍 ${c}<br>`; }); h += `</div>`; }
        layer.bindPopup(h);
        layer.on({
            mouseover(e){
                e.target.setStyle({ color:'#f59e0b',weight:3.5,opacity:1 });
                if(!L.Browser.ie)e.target.bringToFront();
            },
            mouseout(e){
                if(provinceLayer)provinceLayer.resetStyle(e.target);
            }
        });
    }
}
async function loadProvinceLayer() {
    const r = await fetch(GEO_PROVINCE); if(!r.ok) throw new Error('Province geo');
    const d = await r.json();
    buildCoordLookup(d);
    if(provinceLayer) map.removeLayer(provinceLayer);
    provinceLayer = L.geoJSON(d, { style:styleProvince, onEachFeature:onProvince, pane:'overlayPane' }).addTo(map);
    map.removeLayer(provinceLayer); // Hidden by default (city mode)
}

// =============================================================================
// World GeoJSON
// =============================================================================
function styleWorld(f) {
    if (isVisitedCountry(f)) {
        return { fillColor:'transparent', fillOpacity:0, color:'#e8912e', weight:1.8, opacity:0.9, className:'pv', interactive:true };
    }
    return { fillColor:'#1e242c', fillOpacity:0.48, color:'#3a3f47', weight:0.3, interactive:false };
}
function onWorld(f, layer) {
    if (isVisitedCountry(f)) {
        const name = f.properties.name || f.properties.NAME || f.properties.admin || '';
        layer.bindPopup(`<span class="pu-city">${name}</span>`);
        layer.on({
            mouseover(e) {
                e.target.setStyle({ color:'#f59e0b', weight:3, opacity:1 });
                if (!L.Browser.ie) e.target.bringToFront();
            },
            mouseout(e) { e.target.setStyle(styleWorld(f)); }
        });
    }
}
async function loadWorld() {
    const r = await fetch(GEO_WORLD); if(!r.ok) throw new Error('World geo');
    const d = await r.json();
    if(worldLayer) map.removeLayer(worldLayer);
    worldLayer = L.geoJSON(d, { style:styleWorld, onEachFeature:onWorld, pane:'overlayPane' }).addTo(map);
}

// =============================================================================
// View toggle
// =============================================================================
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.map-ctrl-btn[data-view]').forEach(b => {
        b.classList.toggle('active', b.dataset.view === view);
    });
    if (view === 'china') {
        map.flyTo([34, 108], 5, { duration: 0.8 });
    } else {
        map.flyTo([20, 0], 2, { duration: 0.8 });
    }
    updateLayerStyles();
}

function updateLayerStyles() {
    if (cityLayer) {
        cityLayer.eachLayer(l => { if (l.feature && l.setStyle) l.setStyle(styleCity(l.feature)); });
    }
    if (provinceLayer) {
        provinceLayer.eachLayer(l => { if (l.feature && l.setStyle) l.setStyle(styleProvince(l.feature)); });
    }
    if (worldLayer) {
        worldLayer.eachLayer(l => { if (l.feature && l.setStyle) l.setStyle(styleWorld(l.feature)); });
    }
}

// =============================================================================
// Highlight mode toggle (city vs province)
// =============================================================================
function applyHighlightMode() {
    // Remove all China-specific layers, then add the active one
    if (cityLayer) map.removeLayer(cityLayer);
    if (provinceLayer) map.removeLayer(provinceLayer);
    if (highlightMode === 'city') {
        if (cityLayer) map.addLayer(cityLayer);
    } else if (highlightMode === 'province') {
        if (provinceLayer) map.addLayer(provinceLayer);
    }
    // 'country' mode: neither city nor province layer — world layer alone
    // shows country-level fog-of-war
}

function switchHighlight(mode) {
    highlightMode = mode;
    document.querySelectorAll('.map-ctrl-btn[data-mode]').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === mode);
    });
    applyHighlightMode();
}

// =============================================================================
// Back to overview
// =============================================================================
function goBack() {
    clearSel();
    map.closePopup();
    if (currentView === 'world') {
        map.flyTo([20, 0], 2, { duration: 0.8 });
    } else {
        map.flyTo([34, 108], 5, { duration: 0.8 });
    }
}

function showBack(on) {
    document.getElementById('backWrap').classList.toggle('on', on);
}

// =============================================================================
// Markers
// =============================================================================
function blogLinkHTML(slug) {
    if (!slug) return '';
    return `<a href="/writing/${slug}/" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:2px;font-size:0.72rem;color:#b0a590;text-decoration:none;margin-top:2px;" onclick="event.stopPropagation()">游记 <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg></a>`;
}

function addMarkers() {
    markerEntries.forEach(m => map.removeLayer(m.marker));
    markerEntries = []; markerByKey = new Map();
    const lm = new Map();

    bases.forEach((b,bi) => {
        const k = mkKey(b.lat,b.lng);
        if(!lm.has(k)) lm.set(k, { contexts:[], bestColor:b.color, bestBi:bi });
        lm.get(k).contexts.push({ type:'base',bi, data:b, period:b.period });
    });
    bases.forEach((b,bi) => {
        b.trips.forEach((t,ti) => {
            const k = mkKey(t.lat,t.lng);
            if(!lm.has(k)) lm.set(k, { contexts:[], bestColor:b.color, bestBi:bi });
            const e = lm.get(k);
            e.contexts.push({ type: t.baseLike?'sublike':'trip', bi, ti, data:t, period:t.dates||b.period });
            const prevYear = Math.max(0,...e.contexts.slice(0,-1).map(c=>c.data.year||0));
            if ((t.year||0) > prevYear) { e.bestColor = b.color; e.bestBi = bi; }
            if (t.subtrips) {
                t.subtrips.forEach((st,si) => {
                    const sk = mkKey(st.lat,st.lng);
                    if(!lm.has(sk)) lm.set(sk, { contexts:[], bestColor:b.color, bestBi:bi });
                    const se = lm.get(sk);
                    se.contexts.push({ type:'subtrip', bi, ti, si, data:st, period:`${t.dates} (${b.city})` });
                    const spY = Math.max(0,...se.contexts.slice(0,-1).map(c=>c.data.year||0));
                    if ((st.year||0) > spY) { se.bestColor = b.color; se.bestBi = bi; }
                });
            }
        });
    });

    lm.forEach((entry, key) => {
        const [lat,lng] = key.split('|').map(Number);
        const isB = entry.contexts.some(c=>c.type==='base');
        const isSB = !isB && entry.contexts.some(c=>c.type==='sublike');
        const c = entry.bestColor;
        const marker = L.marker([lat,lng], {
            icon: isB ? baseIcon(c) : (isSB ? sublikeIcon(c) : tripIcon(c)),
            riseOnHover: true
        });
        const nctx = entry.contexts.length;
        const useCols = nctx > 6;
        let h = `<div class="pu-list${useCols ? ' cols' : ''}">`;
        entry.contexts.forEach((ctx,ci) => {
            if (ci>0) h += '<hr class="pu-sep">';
            const d = ctx.data;
            const tag = ctx.type==='base' ? `<span class="pu-tag" style="background:${c}">驻地</span>` : (ctx.type==='sublike' ? `<span class="pu-tag" style="background:${c}">实习</span>` : '');
            h += `<div class="pu-item"><div class="pu-city">${d.city}${tag}</div>`;
            h += `<div class="pu-meta">${d.province} · ${ctx.period}</div>`;
            if (d.note) h += `<div class="pu-note">${d.note}</div>`;
            if (d.slug) h += blogLinkHTML(d.slug);
            h += `</div>`;
        });
        h += '</div>';
        marker.bindPopup(h);
        marker.addTo(map);
        const cm = { marker, key, lat, lng, color:c, isBase:isB, contexts:entry.contexts };
        markerEntries.push(cm);
        markerByKey.set(key, cm);
        marker._cm = cm;
    });
}

function baseIcon(color) {
    return L.divIcon({
        className:'', iconSize:[16,16], iconAnchor:[8,8], popupAnchor:[0,-10],
        html:`<div style="width:16px;height:16px;background:${color};transform:rotate(45deg);border:2.5px solid white;border-radius:3px;box-shadow:0 0 0 3px ${hexRGBA(color,0.2)},0 2px 5px rgba(0,0,0,0.2);"></div>`
    });
}
function tripIcon(color) {
    return L.divIcon({
        className:'', iconSize:[11,11], iconAnchor:[5.5,5.5], popupAnchor:[0,-8],
        html:`<div style="width:11px;height:11px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 0 0 3px ${hexRGBA(color,0.18)},0 1px 4px rgba(0,0,0,0.18);"></div>`
    });
}
function sublikeIcon(color) {
    return L.divIcon({
        className:'', iconSize:[13,13], iconAnchor:[6.5,6.5], popupAnchor:[0,-9],
        html:`<div style="width:13px;height:13px;background:transparent;transform:rotate(45deg);border:2.5px solid ${color};border-radius:3px;box-shadow:0 0 0 3px ${hexRGBA(color,0.15)},0 1px 4px rgba(0,0,0,0.15);"></div>`
    });
}

function hiMarker(key, on) {
    const cm = markerByKey.get(key); if(!cm) return;
    if (on) { cm.marker.setZIndexOffset(1000); }
    else { cm.marker.setZIndexOffset(0); }
}
function resetMarkers() { markerByKey.forEach((_,k) => hiMarker(k,false)); }

// =============================================================================
// Fly
// =============================================================================
function fly(lat,lng,z,cb) {
    map.flyTo([lat,lng], z||11, {duration:0.9});
    map.once('moveend', () => { if(cb) cb(); });
}

// =============================================================================
// Timeline
// =============================================================================
function blink(slug) {
    if(!slug) return '';
    return `<a href="/writing/${slug}/" target="_blank" rel="noopener" class="blink" onclick="event.stopPropagation()" title="游记">游记<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg></a>`;
}

const tgSVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>`;

function toggleTrips(id) {
    const el = document.getElementById(id); if(!el) return;
    const wasCollapsed = el.classList.contains('collapsed');
    if (wasCollapsed) {
        // Expand: read full height first, then animate from 0
        el.classList.remove('collapsed');
        const sh = el.scrollHeight;
        el.style.maxHeight = '0px';
        el.offsetHeight; // force reflow
        el.style.maxHeight = sh + 'px';
        el.addEventListener('transitionend', function onEnd() {
            el.style.maxHeight = '';
            el.removeEventListener('transitionend', onEnd);
        }, { once: true });
    } else {
        // Collapse: lock current height, then release to 0
        el.style.maxHeight = el.scrollHeight + 'px';
        el.offsetHeight; // force reflow
        el.classList.add('collapsed');
        requestAnimationFrame(() => { el.style.maxHeight = ''; });
    }
    const tg = document.querySelector(`.tl-toggle[data-target="${id}"]`);
    if(tg) tg.classList.toggle('flipped', !wasCollapsed);
}
function expandTrips(id) {
    const el = document.getElementById(id); if(!el) return;
    if (!el.classList.contains('collapsed')) return;
    el.classList.remove('collapsed');
    const sh = el.scrollHeight;
    el.style.maxHeight = '0px';
    el.offsetHeight; // force reflow
    el.style.maxHeight = sh + 'px';
    el.addEventListener('transitionend', function onEnd() {
        el.style.maxHeight = '';
        el.removeEventListener('transitionend', onEnd);
    }, { once: true });
    const tg = document.querySelector(`.tl-toggle[data-target="${id}"]`);
    if(tg) tg.classList.remove('flipped');
}

function renderTL() {
    const ctr = document.getElementById('timeline'); ctr.innerHTML = '';
    bases.forEach((b,bi) => {
        // Base card
        const be = document.createElement('div');
        be.className = 'tl-base'; be.id = `b-${bi}`;
        be.style.setProperty('--dot', b.color);
        be.innerHTML = `<div class="tl-dot" style="background:${b.color};box-shadow:0 0 0 2px ${b.color},0 1px 4px rgba(0,0,0,0.15);"></div>
            <span class="tl-toggle flipped" data-target="tps-${bi}" title="展开">${tgSVG}</span>
            <div class="tl-period" style="color:${b.color}">${b.period}</div>
            <div style="display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;">
                <span class="tl-city">${b.city}</span><span class="tl-prov">${b.province}</span>${blink(b.slug)}
            </div>
            ${b.note?`<div class="tl-note">${b.note}</div>`:''}`;
        be.addEventListener('click', () => selBase(bi));
        be.addEventListener('mouseenter', () => pulse(b.lat,b.lng,true));
        be.addEventListener('mouseleave', () => pulse(b.lat,b.lng,false));
        be.querySelector('.tl-toggle').addEventListener('click', e => { e.stopPropagation(); toggleTrips(`tps-${bi}`); });

        // Trips
        const tl = document.createElement('div'); tl.className = 'tl-trips collapsed'; tl.id = `tps-${bi}`;
        [...b.trips].sort((a,b)=> (a.year||0)-(b.year||0)).forEach(t => {
            const oi = b.trips.indexOf(t);
            if (t.baseLike) {
                // Sub-base card (hollow diamond)
                const sub = document.createElement('div');
                sub.className = 'tl-base-sub'; sub.id = `b-${bi}-sub-${oi}`;
                sub.style.setProperty('--dot', b.color);
                const hasSub = t.subtrips && t.subtrips.length;
                sub.innerHTML = `<div class="tl-dot-sub"></div>
                    ${hasSub ? `<span class="tl-toggle flipped" data-target="tps-sub-${bi}-${oi}" title="展开" style="top:0.6rem;right:0.4rem;">${tgSVG}</span>` : ''}
                    <div class="tl-period" style="color:${b.color};font-size:0.68rem;">${t.dates||''}</div>
                    <div style="display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;">
                        <span class="tl-city" style="font-size:0.88rem;">${t.city}</span><span class="tl-prov">${t.province}</span>${blink(t.slug)}
                    </div>`;
                sub.addEventListener('click', e => { e.stopPropagation(); selTrip(bi,oi); });
                sub.addEventListener('mouseenter', () => pulse(t.lat,t.lng,true));
                sub.addEventListener('mouseleave', () => pulse(t.lat,t.lng,false));
                if (hasSub) sub.querySelector('.tl-toggle').addEventListener('click', e => { e.stopPropagation(); toggleTrips(`tps-sub-${bi}-${oi}`); });
                tl.appendChild(sub);

                // Sub-base's own trips
                if (t.subtrips && t.subtrips.length) {
                    const stl = document.createElement('div'); stl.className = 'tl-trips collapsed'; stl.id = `tps-sub-${bi}-${oi}`;
                    stl.style.marginLeft = '0.5rem';
                    t.subtrips.forEach((st, si) => {
                        const ste = document.createElement('div');
                        ste.className = 'tl-trip'; ste.id = `t-${bi}-${oi}-sub-${si}`;
                        ste.style.setProperty('--dot', b.color);
                        ste.innerHTML = `<div class="tl-trip-dot" style="background:${b.color};box-shadow:0 0 0 1.5px ${b.color},0 1px 3px rgba(0,0,0,0.12);"></div>
                            <div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;">
                                <span class="tl-trip-year">${st.dates||st.year||''}</span>
                                <span class="tl-trip-city">${st.city}</span><span class="tl-trip-prov">${st.province}</span>${blink(st.slug)}
                            </div>
                            ${st.note?`<div class="tl-trip-note">${st.note}</div>`:''}`;
                        ste.addEventListener('click', e => { e.stopPropagation(); selSubTrip(bi,oi,si); });
                        ste.addEventListener('mouseenter', () => pulse(st.lat,st.lng,true));
                        ste.addEventListener('mouseleave', () => pulse(st.lat,st.lng,false));
                        stl.appendChild(ste);
                    });
                    tl.appendChild(stl);
                }
            } else {
                const te = document.createElement('div');
                te.className = 'tl-trip'; te.id = `t-${bi}-${oi}`;
                te.style.setProperty('--dot', b.color);
                te.innerHTML = `<div class="tl-trip-dot" style="background:${b.color};box-shadow:0 0 0 1.5px ${b.color},0 1px 3px rgba(0,0,0,0.12);"></div>
                    <div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;">
                        <span class="tl-trip-year">${t.dates||t.year||''}</span>
                        <span class="tl-trip-city">${t.city}</span><span class="tl-trip-prov">${t.province}</span>${blink(t.slug)}
                    </div>
                    ${t.note?`<div class="tl-trip-note">${t.note}</div>`:''}`;
                te.addEventListener('click', e => { e.stopPropagation(); selTrip(bi,oi); });
                te.addEventListener('mouseenter', () => pulse(t.lat,t.lng,true));
                te.addEventListener('mouseleave', () => pulse(t.lat,t.lng,false));
                tl.appendChild(te);
            }
        });
        ctr.appendChild(be);
        ctr.appendChild(tl);
    });
}

function pulse(lat,lng,on) {
    const cm = markerByKey.get(mkKey(lat,lng)); if(!cm||!cm.marker._icon) return;
    cm.marker._icon.style.transition = 'transform 0.15s ease';
    cm.marker._icon.style.transform = on ? 'scale(1.4)' : '';
}

// =============================================================================
// Selection
// =============================================================================
function clearSel() {
    document.querySelectorAll('.tl-base.sel,.tl-base-sub.sel,.tl-trip.sel').forEach(e=>e.classList.remove('sel'));
    ui.selBase = null; ui.selTrip = null;
    resetMarkers();
    showBack(false);
}
function selBase(bi) {
    clearSel();
    const b = bases[bi];
    expandTrips(`tps-${bi}`);
    const be = document.getElementById(`b-${bi}`);
    if(be){ be.classList.add('sel'); be.scrollIntoView({behavior:'smooth',block:'nearest'}); }
    ui.selBase = bi;
    hiMarker(mkKey(b.lat,b.lng), true);
    ui.noSync = true;
    showBack(true);
    fly(b.lat,b.lng,9, () => {
        const cm = markerByKey.get(mkKey(b.lat,b.lng)); if(cm) cm.marker.openPopup();
        setTimeout(()=>{ui.noSync=false;},200);
    });
}
function selTrip(bi,ti) {
    clearSel();
    const b = bases[bi]; const t = b.trips[ti];
    expandTrips(`tps-${bi}`);
    const be = document.getElementById(`b-${bi}`);
    if(be) be.classList.add('sel');
    if (t.baseLike) {
        const sub = document.getElementById(`b-${bi}-sub-${ti}`);
        if(sub){ sub.classList.add('sel'); sub.scrollIntoView({behavior:'smooth',block:'nearest'}); }
        ui.selTrip = `${bi}-${ti}`;
    } else {
        const te = document.getElementById(`t-${bi}-${ti}`);
        if(te){ te.classList.add('sel'); te.scrollIntoView({behavior:'smooth',block:'nearest'}); }
        ui.selTrip = `${bi}-${ti}`;
    }
    ui.selBase = bi;
    hiMarker(mkKey(t.lat,t.lng), true);
    ui.noSync = true;
    showBack(true);
    fly(t.lat,t.lng,11, () => {
        const cm = markerByKey.get(mkKey(t.lat,t.lng)); if(cm) cm.marker.openPopup();
        setTimeout(()=>{ui.noSync=false;},200);
    });
}
function selSubTrip(bi,ti,si) {
    clearSel();
    const b = bases[bi]; const t = b.trips[ti]; const st = t.subtrips[si];
    expandTrips(`tps-${bi}`);
    expandTrips(`tps-sub-${bi}-${ti}`);
    const be = document.getElementById(`b-${bi}`);
    const sub = document.getElementById(`b-${bi}-sub-${ti}`);
    const ste = document.getElementById(`t-${bi}-${ti}-sub-${si}`);
    if(be) be.classList.add('sel');
    if(sub) sub.classList.add('sel');
    if(ste){ ste.classList.add('sel'); ste.scrollIntoView({behavior:'smooth',block:'nearest'}); }
    ui.selBase = bi; ui.selTrip = `${bi}-${ti}-sub-${si}`;
    hiMarker(mkKey(st.lat,st.lng), true);
    ui.noSync = true;
    showBack(true);
    fly(st.lat,st.lng,12, () => {
        const cm = markerByKey.get(mkKey(st.lat,st.lng)); if(cm) cm.marker.openPopup();
        setTimeout(()=>{ui.noSync=false;},200);
    });
}
function syncFromMap(cm) {
    if (ui.noSync) return;
    clearSel();
    const ctx = cm.contexts[0]; if(!ctx) return;
    if (ctx.type==='base') {
        expandTrips(`tps-${ctx.bi}`);
        const el = document.getElementById(`b-${ctx.bi}`);
        if(el){ el.classList.add('sel'); el.scrollIntoView({behavior:'smooth',block:'nearest'}); }
        ui.selBase = ctx.bi;
        hiMarker(mkKey(ctx.data.lat,ctx.data.lng), true);
        showBack(true);
    } else if (ctx.type==='sublike') {
        expandTrips(`tps-${ctx.bi}`);
        const be = document.getElementById(`b-${ctx.bi}`);
        const sub = document.getElementById(`b-${ctx.bi}-sub-${ctx.ti}`);
        if(be) be.classList.add('sel');
        if(sub){ sub.classList.add('sel'); sub.scrollIntoView({behavior:'smooth',block:'nearest'}); }
        ui.selBase = ctx.bi; ui.selTrip = `${ctx.bi}-${ctx.ti}`;
        hiMarker(mkKey(ctx.data.lat,ctx.data.lng), true);
        showBack(true);
    } else if (ctx.type==='subtrip') {
        expandTrips(`tps-${ctx.bi}`);
        expandTrips(`tps-sub-${ctx.bi}-${ctx.ti}`);
        const be = document.getElementById(`b-${ctx.bi}`);
        const sub = document.getElementById(`b-${ctx.bi}-sub-${ctx.ti}`);
        const ste = document.getElementById(`t-${ctx.bi}-${ctx.ti}-sub-${ctx.si}`);
        if(be) be.classList.add('sel');
        if(sub) sub.classList.add('sel');
        if(ste){ ste.classList.add('sel'); ste.scrollIntoView({behavior:'smooth',block:'nearest'}); }
        ui.selBase = ctx.bi; ui.selTrip = `${ctx.bi}-${ctx.ti}-sub-${ctx.si}`;
        hiMarker(mkKey(ctx.data.lat,ctx.data.lng), true);
        showBack(true);
    } else {
        expandTrips(`tps-${ctx.bi}`);
        const be = document.getElementById(`b-${ctx.bi}`);
        const te = document.getElementById(`t-${ctx.bi}-${ctx.ti}`);
        if(be) be.classList.add('sel');
        if(te){ te.classList.add('sel'); te.scrollIntoView({behavior:'smooth',block:'nearest'}); }
        ui.selBase = ctx.bi; ui.selTrip = `${ctx.bi}-${ctx.ti}`;
        hiMarker(mkKey(ctx.data.lat,ctx.data.lng), true);
        showBack(true);
    }
}

// =============================================================================
// Stats
// =============================================================================
function stats() {
    const trips = bases.flatMap(b=>b.trips);
    const subBases = trips.filter(t=>t.baseLike);
    const subtrips = trips.filter(t=>t.subtrips).flatMap(t=>t.subtrips);
    const all = trips.concat(subtrips);
    const locs = bases.map(b=>({c:b.city,p:b.province})).concat(all.map(t=>({c:t.city,p:t.province})));
    const uc = new Set(locs.map(l=>`${l.c}|${l.p}`));
    const pv = new Set();
    bases.forEach(b => { pv.add(b.province); b.trips.forEach(t => { pv.add(t.province); if(t.subtrips) t.subtrips.forEach(st=>pv.add(st.province)); }); });
    const totalBases = bases.length + subBases.length;
    const totalProvinces = 34;
    const pct = Math.round(pv.size / totalProvinces * 100);
    document.getElementById('statsSummary').textContent = `${totalBases} 个驻地 · ${uc.size} 座城市 · ${pv.size}/${totalProvinces} 个省级行政区`;
    document.querySelector('#statsBar .stats-row').innerHTML = `<span>驻地 <strong>${totalBases}</strong></span><span>城市 <strong>${uc.size}</strong></span><span>省份 <strong>${pv.size}/${totalProvinces}</strong></span>`;
    document.getElementById('provBar').style.width = pct + '%';
    // Legend
    document.getElementById('legend').innerHTML = bases.map(b =>
        `<div class="legend-item"><div class="legend-swatch" style="background:${b.color}"></div>${b.city} · ${b.summary}</div>`
    ).join('');
}

// =============================================================================
// Events
// =============================================================================
document.getElementById('btnBack').addEventListener('click', ()=>{ window.location.href='/writing/'; });

document.querySelectorAll('.map-ctrl-btn[data-view]').forEach(b => {
    b.addEventListener('click', () => switchView(b.dataset.view));
});
document.querySelectorAll('.map-ctrl-btn[data-mode]').forEach(b => {
    b.addEventListener('click', () => switchHighlight(b.dataset.mode));
});

document.getElementById('btnGlobal').addEventListener('click', goBack);

document.getElementById('btnBackTop').addEventListener('click', ()=>{
    document.querySelector('.sidebar-scroll').scrollTo({top:0, behavior:'smooth'});
});

const btnMob = document.getElementById('btnMob');
const sideCol = document.getElementById('sidebarCol');
btnMob.addEventListener('click', ()=>{
    sideCol.classList.toggle('open');
    btnMob.innerHTML = sideCol.classList.contains('open')
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>`;
});

document.addEventListener('DOMContentLoaded', async ()=>{
    await init();
    map.on('popupopen', e => {
        const m = e.popup._source; if(m&&m._cm&&!ui.noSync) syncFromMap(m._cm);
    });
    map.on('click', e => {
        const t = e.originalEvent.target;
        if (t.classList.contains('leaflet-tile') || t.closest('.leaflet-tile-pane')) { clearSel(); map.closePopup(); }
    });
});


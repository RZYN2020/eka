import L from 'leaflet';
import { bases } from '../data/travel.js';
import { readMapView, writeMapView } from '../lib/map-storage.js';
import { createJourneyController } from '../lib/travel-map-journey.js';
import {
    assertTravelTree,
    compareTravelDates,
    formatTravelDate,
    sortByTravelDate
} from '../lib/travel-time.js';
const blogTitles = {
    qinhuai: '秦淮',
    yangzhou: '扬州游记',
    lushan: '庐山游记'
};

// =============================================================================
// State
// =============================================================================
let map, cityLayer, provinceLayer, worldLayer;
let provinceLayerRequest, worldLayerRequest;
let markerEntries = [];
let markerByKey = new Map();
const cityCoord = new Map();
const ui = { selBase: null, selTrip: null, noSync: false };
let currentView = 'china';
let highlightMode = 'city';
let resizeFrame = 0;
const GEO_CITY = '/geojson/china-cities.json';
const GEO_PROVINCE = '/geojson/china.json';
const GEO_WORLD = '/geojson/world.json';

// =============================================================================
// Helpers
// =============================================================================
const hexRGBA = (h,a) => `rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${a})`;
const tone = (name, fallback) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

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
function getCoords(place) {
    if (place.coordinates) return place.coordinates;
    const key = normCity(place.city);
    const c = cityCoord.get(key);
    if (!c) throw new Error(`未找到城市坐标: ${place.city} (${key})`);
    return c;
}
function childrenOf(place) {
    return place.children || [];
}
function walkPlaces(places, visit) {
    places.forEach(place => {
        visit(place);
        walkPlaces(childrenOf(place), visit);
    });
}
function injectCoords() {
    const missing = [];
    walkPlaces(bases, place => {
        try { Object.assign(place, getCoords(place)); }
        catch(e) { missing.push(e.message); }
    });
    if (missing.length) throw new Error([...new Set(missing)].join('\n'));
}
function visitedCityNames() {
    const s = new Set();
    walkPlaces(bases, place => s.add(normCity(place.city)));
    return s;
}

function normProv(n) {
    return (n||'')
        .replace(/省|市|自治区|特别行政区/g,'')
        .replace(/傣族|白族|藏族|回族|壮族|维吾尔|蒙古族|朝鲜族|土家族|苗族|彝族|侗族|瑶族|布依族|哈尼族/g,'')
        .trim();
}
function visitedProvinceNames() {
    const s = new Set();
    walkPlaces(bases, place => s.add(normProv(place.province)));
    return s;
}
const visitedCities = visitedCityNames();
const visitedProvinces = visitedProvinceNames();
function isVisitedCity(name) { return visitedCities.has(normCity(name)); }
function isVisitedProvince(name) { return visitedProvinces.has(normProv(name)); }

function mkKey(lat,lng) { return `${lat}|${lng}`; }

const journeyController = createJourneyController({
    getMap: () => map,
    getCoords,
    clearSelection: clearSel,
    ensureChinaView: () => {
        if (currentView !== 'china') switchView('china');
    },
    tone
});
const journey = journeyController.state;
const startJourney = () => journeyController.start();
const stopJourney = () => journeyController.stop();
const advanceJourney = () => journeyController.advance();
const seekJourneyIndex = index => journeyController.seek(index);
const toggleJourneyPlayback = () => journeyController.togglePlayback();
const seekAdjacentJourney = direction => journeyController.seekAdjacent(direction);
const seekJourneyBoundary = edge => journeyController.seekBoundary(edge);
const seekJourneyFromPointer = event => journeyController.seekFromPointer(event);

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
    const saved = readMapView();
    map = L.map('map', {
        center: saved ? [saved.lat, saved.lng] : [34,108],
        zoom: saved ? saved.zoom : 5,
        zoomControl: true,
        attributionControl: true
    });
    const mapElement = document.getElementById('map');
    const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    });
    resizeObserver.observe(mapElement);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OSM', maxZoom: 18
    }).addTo(map);

    try {
        await loadCityLayer();
        assertTravelTree(bases);
        injectCoords();
        map.invalidateSize({ pan: false });
        applyHighlightMode();
        addMarkers();
        renderTL();
        stats();
        document.getElementById('btnJourney').disabled = false;
        document.getElementById('map').classList.add('on');
        return true;
    } catch(e) {
        console.error(e);
        document.getElementById('map').innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#c44;">地图加载失败</div>';
        return false;
    } finally {
        document.getElementById('loaderCover').classList.add('off');
    }
}
window.addEventListener('beforeunload', () => {
    if (!map) return;
    const c = map.getCenter();
    writeMapView(undefined, {lat:c.lat, lng:c.lng, zoom:map.getZoom()});
});

// =============================================================================
// China GeoJSON
// =============================================================================
function styleCity(f) {
    const visited = isVisitedCity(f.properties.name);
    return {
        fillColor: visited ? tone('--map-visited-fill', '#68788a') : 'transparent',
        fillOpacity: visited ? 0.18 : 0,
        color: visited ? tone('--map-visited-line', '#536170') : tone('--map-boundary', '#aaa7a0'),
        weight: visited ? 1.2 : 0.45,
        opacity: visited ? 0.9 : 0.55,
        className: visited ? 'pv' : '',
        interactive: visited
    };
}
function onCity(f,layer) {
    const n = f.properties.name;
    if (isVisitedCity(n)) {
        const nc = normCity(n);
        const visits = [];
        bases.forEach(b => {
            if (normCity(b.city)===nc) visits.push({ period:formatTravelDate(b), note:b.note, type:'驻地', color:b.color });
            walkPlaces(childrenOf(b), place => {
                if (normCity(place.city)===nc) {
                    visits.push({
                        period: formatTravelDate(place),
                        note: place.note,
                        type: place.kind === 'stay' ? '驻留' : '旅行',
                        color: b.color
                    });
                }
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
        return { fillColor:'transparent', fillOpacity:0, color:tone('--map-boundary', '#aaa7a0'), weight:0.4, dashArray:'3 5', interactive:false };
    }
    const visited = isVisitedProvince(n);
    return {
        fillColor: visited ? tone('--map-visited-fill', '#68788a') : 'transparent',
        fillOpacity: visited ? 0.16 : 0,
        color: visited ? tone('--map-visited-line', '#536170') : tone('--map-boundary', '#aaa7a0'),
        weight: visited ? 1.2 : 0.5,
        opacity: visited ? 0.9 : 0.55,
        interactive: visited
    };
}
function onProvince(f,layer) {
    const n = f.properties.name;
    if (n==='十段线'||n==='南海诸岛') return;
    if (isVisitedProvince(n)) {
        const np = normProv(n);
        const cs = new Set();
        bases.forEach(b => {
            if (normProv(b.province)===np) cs.add(b.city);
            walkPlaces(childrenOf(b), place => {
                if (normProv(place.province)===np) cs.add(place.city);
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
    provinceLayer = L.geoJSON(d, { style:styleProvince, onEachFeature:onProvince, pane:'overlayPane' }).addTo(map);
    map.removeLayer(provinceLayer); // Hidden by default (city mode)
}

async function ensureProvinceLayer() {
    if (provinceLayer) return provinceLayer;
    provinceLayerRequest ??= loadProvinceLayer().catch(error => {
        provinceLayerRequest = undefined;
        throw error;
    });
    await provinceLayerRequest;
    return provinceLayer;
}

// =============================================================================
// World GeoJSON
// =============================================================================
function styleWorld(f) {
    const visited = isVisitedCountry(f);
    return {
        fillColor: visited ? tone('--map-visited-fill', '#68788a') : 'transparent',
        fillOpacity: visited ? 0.16 : 0,
        color: visited ? tone('--map-visited-line', '#536170') : tone('--map-boundary', '#aaa7a0'),
        weight: visited ? 1.1 : 0.4,
        opacity: visited ? 0.9 : 0.5,
        interactive: visited
    };
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
    worldLayer = L.geoJSON(d, { style:styleWorld, onEachFeature:onWorld, pane:'overlayPane' }).addTo(map);
    map.removeLayer(worldLayer);
}

async function ensureWorldLayer() {
    if (worldLayer) return worldLayer;
    worldLayerRequest ??= loadWorld().catch(error => {
        worldLayerRequest = undefined;
        throw error;
    });
    await worldLayerRequest;
    return worldLayer;
}

// =============================================================================
// View toggle
// =============================================================================
function setLayerControlsBusy(busy) {
    document.querySelectorAll('.map-ctrl-btn[data-view], .map-ctrl-btn[data-mode]').forEach(button => {
        button.disabled = busy;
    });
    document.getElementById('map').setAttribute('aria-busy', String(busy));
    document.getElementById('loaderCover').classList.toggle('off', !busy);
}

async function switchView(view) {
    if (view === currentView) return;
    setLayerControlsBusy(true);
    try {
        if (view === 'world') await ensureWorldLayer();
        else if (highlightMode === 'province') await ensureProvinceLayer();
    } catch (error) {
        console.error(error);
        return;
    } finally {
        setLayerControlsBusy(false);
    }

    currentView = view;
    if (view === 'world') highlightMode = 'country';
    else if (highlightMode === 'country') highlightMode = 'city';
    document.querySelectorAll('.map-ctrl-btn[data-view]').forEach(b => {
        const active = b.dataset.view === view;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.map-ctrl-btn[data-mode]').forEach(b => {
        const active = b.dataset.mode === highlightMode;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('modeControls').hidden = view === 'world';
    map.flyTo(view === 'china' ? [34, 108] : [20, 0], view === 'china' ? 5 : 2, { duration: 0.7 });
    applyHighlightMode();
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
    if (worldLayer) map.removeLayer(worldLayer);
    if (highlightMode === 'city') {
        if (cityLayer) map.addLayer(cityLayer);
    } else if (highlightMode === 'province') {
        if (provinceLayer) map.addLayer(provinceLayer);
    } else if (highlightMode === 'country') {
        if (worldLayer) map.addLayer(worldLayer);
    }
}

async function switchHighlight(mode) {
    if (mode === highlightMode) return;
    setLayerControlsBusy(true);
    try {
        if (mode === 'province') await ensureProvinceLayer();
    } catch (error) {
        console.error(error);
        return;
    } finally {
        setLayerControlsBusy(false);
    }

    highlightMode = mode;
    document.querySelectorAll('.map-ctrl-btn[data-mode]').forEach(b => {
        const active = b.dataset.mode === mode;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
    });
    applyHighlightMode();
}

// =============================================================================
// Back to overview
// =============================================================================
function goBack() {
    stopJourney();
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
    return `<a href="/writing/${slug}/" target="_blank" rel="noopener" class="blink" onclick="event.stopPropagation()">${blogTitles[slug] ?? '相关文章'} <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg></a>`;
}

function addMarkers() {
    markerEntries.forEach(m => map.removeLayer(m.marker));
    markerEntries = []; markerByKey = new Map();
    const lm = new Map();

    bases.forEach((b,bi) => {
        const k = mkKey(b.lat,b.lng);
        if(!lm.has(k)) lm.set(k, { contexts:[], bestColor:b.color, bestBi:bi });
        lm.get(k).contexts.push({ type:'phase',bi, data:b, period:formatTravelDate(b) });
    });
    bases.forEach((b,bi) => {
        childrenOf(b).forEach((t,ti) => {
            const k = mkKey(t.lat,t.lng);
            if(!lm.has(k)) lm.set(k, { contexts:[], bestColor:b.color, bestBi:bi });
            const e = lm.get(k);
            const previousLatest = e.contexts.reduce((latest, context) =>
                !latest || compareTravelDates(context.data, latest.data) > 0 ? context : latest, null);
            e.contexts.push({ type:t.kind, bi, ti, data:t, period:formatTravelDate(t) });
            if (!previousLatest || compareTravelDates(t, previousLatest.data) > 0) {
                e.bestColor = b.color; e.bestBi = bi;
            }
            if (childrenOf(t).length) {
                childrenOf(t).forEach((st,si) => {
                    const sk = mkKey(st.lat,st.lng);
                    if(!lm.has(sk)) lm.set(sk, { contexts:[], bestColor:b.color, bestBi:bi });
                    const se = lm.get(sk);
                    const subPreviousLatest = se.contexts.reduce((latest, context) =>
                        !latest || compareTravelDates(context.data, latest.data) > 0 ? context : latest, null);
                    se.contexts.push({ type:'nested-visit', bi, ti, si, data:st, period:`${formatTravelDate(st)} (${t.city})` });
                    if (!subPreviousLatest || compareTravelDates(st, subPreviousLatest.data) > 0) {
                        se.bestColor = b.color; se.bestBi = bi;
                    }
                });
            }
        });
    });

    lm.forEach((entry, key) => {
        const [lat,lng] = key.split('|').map(Number);
        const isB = entry.contexts.some(c=>c.type==='phase');
        const isSB = !isB && entry.contexts.some(c=>c.type==='stay');
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
            const tag = ctx.type==='phase' ? `<span class="pu-tag" style="background:${c}">驻地</span>` : (ctx.type==='stay' ? `<span class="pu-tag" style="background:${c}">驻留</span>` : '');
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
    return `<a href="/writing/${slug}/" target="_blank" rel="noopener" class="blink" onclick="event.stopPropagation()" title="相关文章">${blogTitles[slug] ?? '相关文章'}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg></a>`;
}

const tgSVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>`;

function activateWithKeyboard(element, handler) {
    element.tabIndex = 0;
    element.setAttribute('role', 'button');
    element.addEventListener('keydown', event => {
        if (event.target !== element || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        handler();
    });
}

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
    sortByTravelDate(bases).forEach(b => {
        const bi = bases.indexOf(b);
        // Base card
        const be = document.createElement('div');
        be.className = 'tl-base'; be.id = `b-${bi}`;
        be.style.setProperty('--dot', b.color);
        be.innerHTML = `<div class="tl-dot" style="background:${b.color};box-shadow:0 0 0 2px ${b.color},0 1px 4px rgba(0,0,0,0.15);"></div>
            ${childrenOf(b).length ? `<button type="button" class="tl-toggle flipped" data-target="tps-${bi}" title="展开" aria-label="展开 ${b.city} 的旅行">${tgSVG}</button>` : ''}
            <div class="tl-period" style="color:${b.color}">${formatTravelDate(b)}</div>
            <div style="display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;">
                <span class="tl-city">${b.city}</span><span class="tl-prov">${b.province}</span>${blink(b.slug)}
            </div>
            ${(b.summary || b.note) ? `<div class="tl-note">${[b.summary, b.note].filter(Boolean).join(' · ')}</div>` : ''}`;
        be.addEventListener('click', () => selBase(bi));
        activateWithKeyboard(be, () => selBase(bi));
        be.addEventListener('mouseenter', () => pulse(b.lat,b.lng,true));
        be.addEventListener('mouseleave', () => pulse(b.lat,b.lng,false));
        be.querySelector('.tl-toggle')?.addEventListener('click', e => { e.stopPropagation(); toggleTrips(`tps-${bi}`); });

        // Trips
        const tl = document.createElement('div'); tl.className = 'tl-trips collapsed'; tl.id = `tps-${bi}`;
        sortByTravelDate(childrenOf(b)).forEach(t => {
            const oi = childrenOf(b).indexOf(t);
            if (t.kind === 'stay') {
                // Sub-base card (hollow diamond)
                const sub = document.createElement('div');
                sub.className = 'tl-base-sub'; sub.id = `b-${bi}-sub-${oi}`;
                sub.style.setProperty('--dot', b.color);
                const hasSub = childrenOf(t).length;
                sub.innerHTML = `<div class="tl-dot-sub"></div>
                    ${hasSub ? `<button type="button" class="tl-toggle flipped" data-target="tps-sub-${bi}-${oi}" title="展开" aria-label="展开 ${t.city} 的旅行" style="top:0.6rem;right:0.4rem;">${tgSVG}</button>` : ''}
                    <div class="tl-period" style="color:${b.color};font-size:0.68rem;">${formatTravelDate(t)}</div>
                    <div style="display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;">
                        <span class="tl-city" style="font-size:0.88rem;">${t.city}</span><span class="tl-prov">${t.province}</span>${blink(t.slug)}
                    </div>`;
                sub.addEventListener('click', e => { e.stopPropagation(); selTrip(bi,oi); });
                activateWithKeyboard(sub, () => selTrip(bi,oi));
                sub.addEventListener('mouseenter', () => pulse(t.lat,t.lng,true));
                sub.addEventListener('mouseleave', () => pulse(t.lat,t.lng,false));
                if (hasSub) sub.querySelector('.tl-toggle').addEventListener('click', e => { e.stopPropagation(); toggleTrips(`tps-sub-${bi}-${oi}`); });
                tl.appendChild(sub);

                // Sub-base's own trips
                if (childrenOf(t).length) {
                    const stl = document.createElement('div'); stl.className = 'tl-trips collapsed'; stl.id = `tps-sub-${bi}-${oi}`;
                    stl.style.marginLeft = '0.5rem';
                    sortByTravelDate(childrenOf(t)).forEach(st => {
                        const si = childrenOf(t).indexOf(st);
                        const ste = document.createElement('div');
                        ste.className = 'tl-trip'; ste.id = `t-${bi}-${oi}-sub-${si}`;
                        ste.style.setProperty('--dot', b.color);
                        ste.innerHTML = `<div class="tl-trip-dot" style="background:${b.color};box-shadow:0 0 0 1.5px ${b.color},0 1px 3px rgba(0,0,0,0.12);"></div>
                            <div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;">
                                <span class="tl-trip-year">${formatTravelDate(st)}</span>
                                <span class="tl-trip-city">${st.city}</span><span class="tl-trip-prov">${st.province}</span>${blink(st.slug)}
                            </div>
                            ${st.note?`<div class="tl-trip-note">${st.note}</div>`:''}`;
                        ste.addEventListener('click', e => { e.stopPropagation(); selSubTrip(bi,oi,si); });
                        activateWithKeyboard(ste, () => selSubTrip(bi,oi,si));
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
                        <span class="tl-trip-year">${formatTravelDate(t)}</span>
                        <span class="tl-trip-city">${t.city}</span><span class="tl-trip-prov">${t.province}</span>${blink(t.slug)}
                    </div>
                    ${t.note?`<div class="tl-trip-note">${t.note}</div>`:''}`;
                te.addEventListener('click', e => { e.stopPropagation(); selTrip(bi,oi); });
                activateWithKeyboard(te, () => selTrip(bi,oi));
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
    cm.marker._icon.classList.toggle('is-pulsing', on);
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
    stopJourney();
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
    stopJourney();
    clearSel();
    const b = bases[bi]; const t = childrenOf(b)[ti];
    expandTrips(`tps-${bi}`);
    const be = document.getElementById(`b-${bi}`);
    if(be) be.classList.add('sel');
    if (t.kind === 'stay') {
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
    stopJourney();
    clearSel();
    const b = bases[bi]; const t = childrenOf(b)[ti]; const st = childrenOf(t)[si];
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
    stopJourney();
    clearSel();
    const ctx = cm.contexts[0]; if(!ctx) return;
    if (ctx.type==='phase') {
        expandTrips(`tps-${ctx.bi}`);
        const el = document.getElementById(`b-${ctx.bi}`);
        if(el){ el.classList.add('sel'); el.scrollIntoView({behavior:'smooth',block:'nearest'}); }
        ui.selBase = ctx.bi;
        hiMarker(mkKey(ctx.data.lat,ctx.data.lng), true);
        showBack(true);
    } else if (ctx.type==='stay') {
        expandTrips(`tps-${ctx.bi}`);
        const be = document.getElementById(`b-${ctx.bi}`);
        const sub = document.getElementById(`b-${ctx.bi}-sub-${ctx.ti}`);
        if(be) be.classList.add('sel');
        if(sub){ sub.classList.add('sel'); sub.scrollIntoView({behavior:'smooth',block:'nearest'}); }
        ui.selBase = ctx.bi; ui.selTrip = `${ctx.bi}-${ctx.ti}`;
        hiMarker(mkKey(ctx.data.lat,ctx.data.lng), true);
        showBack(true);
    } else if (ctx.type==='nested-visit') {
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
    const places = [];
    walkPlaces(bases, place => places.push(place));
    const stays = places.filter(place => place.kind === 'stay');
    const locs = places.map(place => ({ c:place.city, p:place.province }));
    const uc = new Set(locs.map(l=>`${l.c}|${l.p}`));
    const pv = new Set(places.map(place => place.province));
    const totalBases = bases.length + stays.length;
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
document.getElementById('btnBack').addEventListener('click', ()=>{ window.location.href='/about/'; });

document.querySelectorAll('.map-ctrl-btn[data-view]').forEach(b => {
    b.addEventListener('click', async () => {
        stopJourney();
        await switchView(b.dataset.view);
    });
});
document.querySelectorAll('.map-ctrl-btn[data-mode]').forEach(b => {
    b.addEventListener('click', async () => {
        stopJourney();
        await switchHighlight(b.dataset.mode);
    });
});

document.getElementById('btnGlobal').addEventListener('click', goBack);
document.getElementById('btnJourney').addEventListener('click', () => {
    if (journey.active) stopJourney();
    else startJourney();
});
document.getElementById('btnJourneyPlay').addEventListener('click', () => {
    if (journey.active) toggleJourneyPlayback();
    else startJourney();
});
document.getElementById('btnJourneyNext').addEventListener('click', advanceJourney);

const journeyTimeTrack = document.getElementById('journeyTimeTrack');
let journeyScrubPointer = null;
journeyTimeTrack.addEventListener('pointerdown', event => {
    if (!journey.stops.length || event.button !== 0) return;
    journeyScrubPointer = event.pointerId;
    journeyTimeTrack.setPointerCapture(event.pointerId);
    journeyTimeTrack.classList.add('is-scrubbing');
    seekJourneyFromPointer(event);
    event.preventDefault();
});
journeyTimeTrack.addEventListener('pointermove', event => {
    if (event.pointerId !== journeyScrubPointer) return;
    seekJourneyFromPointer(event);
});
function finishJourneyScrub(event, seek = true) {
    if (event.pointerId !== journeyScrubPointer) return;
    if (seek) seekJourneyFromPointer(event);
    journeyScrubPointer = null;
    journeyTimeTrack.classList.remove('is-scrubbing');
    if (journeyTimeTrack.hasPointerCapture(event.pointerId)) {
        journeyTimeTrack.releasePointerCapture(event.pointerId);
    }
}
journeyTimeTrack.addEventListener('pointerup', finishJourneyScrub);
journeyTimeTrack.addEventListener('pointercancel', event => finishJourneyScrub(event, false));
journeyTimeTrack.addEventListener('keydown', event => {
    if (!journey.stops.length) return;
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        seekAdjacentJourney(-1);
        return;
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        seekAdjacentJourney(1);
        return;
    }
    else if (event.key === 'Home') seekJourneyBoundary('start');
    else if (event.key === 'End') seekJourneyBoundary('end');
    else return;
    event.preventDefault();
});

function isInteractiveShortcutTarget(target) {
    return target instanceof Element && Boolean(target.closest(
        'a, button, input, textarea, select, [contenteditable="true"], [role="slider"], .leaflet-container'
    ));
}

document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (isInteractiveShortcutTarget(event.target)) return;

    const key = event.key.toLowerCase();
    if (key === 'j') {
        if (!map || document.getElementById('btnJourney').disabled) return;
        event.preventDefault();
        if (journey.active) stopJourney();
        else startJourney();
        return;
    }
    if (event.key === 'Escape' && journey.stops.length) {
        event.preventDefault();
        stopJourney();
        return;
    }
    if (event.key === ' ' && journey.stops.length) {
        event.preventDefault();
        if (journey.active) toggleJourneyPlayback();
        else startJourney();
        return;
    }
    if (event.key === 'ArrowLeft' && journey.stops.length) {
        event.preventDefault();
        seekAdjacentJourney(-1);
        return;
    }
    if (event.key === 'ArrowRight' && journey.stops.length) {
        event.preventDefault();
        seekAdjacentJourney(1);
    }
});

window.addEventListener('eka-theme-change', () => {
    updateLayerStyles();
    journeyController.updateTheme();
});

document.getElementById('btnBackTop').addEventListener('click', ()=>{
    document.querySelector('.sidebar-scroll').scrollTo({top:0, behavior:'smooth'});
});

const btnMob = document.getElementById('btnMob');
const sideCol = document.getElementById('sidebarCol');
btnMob.addEventListener('click', ()=>{
    sideCol.classList.toggle('open');
    document.body.classList.toggle('map-sidebar-open', sideCol.classList.contains('open'));
    btnMob.setAttribute('aria-expanded', String(sideCol.classList.contains('open')));
    btnMob.innerHTML = sideCol.classList.contains('open')
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>`;
});

document.addEventListener('DOMContentLoaded', async ()=>{
    if (!(await init())) return;
    map.on('popupopen', e => {
        const m = e.popup._source; if(m&&m._cm&&!ui.noSync) syncFromMap(m._cm);
    });
    map.on('click', e => {
        const t = e.originalEvent.target;
        if (t.classList.contains('leaflet-tile') || t.closest('.leaflet-tile-pane')) {
            stopJourney();
            clearSel();
            map.closePopup();
        }
    });
});

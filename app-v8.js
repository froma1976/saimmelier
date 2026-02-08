/**
 * SIAmmelier Dobao - Stitch Edition (v7 - Full Data Integration)
 */

class SommelierApp {
    constructor() {
        this.menu = [];
        this.state = {
            currentStep: 'family',
            selection: {
                family: null,
                profileKeys: null,
                occasion: null,
                selectedWine: null,
                selectedFood: null
            }
        };

        // Elementos del DOM
        this.optionsGrid = document.getElementById('optionsGrid');
        this.headerTitle = document.getElementById('headerTitle');
        this.stepTitle = document.getElementById('stepTitle');
        this.wineResults = document.getElementById('wineResults');
        this.finalDisplay = document.getElementById('finalDisplay');
        this.btnBack = document.getElementById('btnBack');
        this.currentStepText = document.getElementById('currentStep');
        this.pairingConfirmArea = document.getElementById('pairingConfirmArea');

        this.sections = {
            selection: document.getElementById('step-selection'),
            results: document.getElementById('step-results'),
            final: document.getElementById('step-final'),
            summary: document.getElementById('step-summary')
        };

        this.recommendationMeta = new Map();
        this.analyticsStorageKey = 'siammelier_ranking_logs_v1';
        this.weightsStorageKey = 'siammelier_adaptive_weights_v1';
        this.experimentStorageKey = 'siammelier_ab_group_v1';
        this.recommendationHistoryStorageKey = 'siammelier_recent_recommendations_v1';
        this.experimentGroup = this.getOrCreateExperimentGroup();
        this.baseWeights = {
            lexical: 7,
            semantic: 3,
            ratings: 1.5,
            reviews: 1,
            budget: 1,
            occasion: 1
        };
        this.adaptiveMultipliers = this.loadAdaptiveMultipliers();
        this.lastRecommendationRun = null;
    }

    safeStorageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    safeStorageSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            // Ignore storage errors in restricted contexts
        }
    }

    getOrCreateExperimentGroup() {
        const existing = this.safeStorageGet(this.experimentStorageKey);
        if (existing === 'A' || existing === 'B') return existing;

        const assigned = Math.random() < 0.5 ? 'A' : 'B';
        this.safeStorageSet(this.experimentStorageKey, assigned);
        return assigned;
    }

    loadAdaptiveMultipliers() {
        const raw = this.safeStorageGet(this.weightsStorageKey);
        if (!raw) {
            return {
                lexical: 1,
                semantic: 1,
                ratings: 1,
                reviews: 1,
                budget: 1,
                occasion: 1
            };
        }

        try {
            const parsed = JSON.parse(raw);
            return {
                lexical: Number(parsed.lexical) || 1,
                semantic: Number(parsed.semantic) || 1,
                ratings: Number(parsed.ratings) || 1,
                reviews: Number(parsed.reviews) || 1,
                budget: Number(parsed.budget) || 1,
                occasion: Number(parsed.occasion) || 1
            };
        } catch (error) {
            return {
                lexical: 1,
                semantic: 1,
                ratings: 1,
                reviews: 1,
                budget: 1,
                occasion: 1
            };
        }
    }

    saveAdaptiveMultipliers() {
        this.safeStorageSet(this.weightsStorageKey, JSON.stringify(this.adaptiveMultipliers));
    }

    getScoringWeights() {
        if (this.experimentGroup === 'A') {
            return {
                lexical: 7,
                semantic: 1,
                ratings: 1.1,
                reviews: 0.8,
                budget: 1.2,
                occasion: 0.8
            };
        }

        return {
            lexical: this.baseWeights.lexical * this.adaptiveMultipliers.lexical,
            semantic: this.baseWeights.semantic * this.adaptiveMultipliers.semantic,
            ratings: this.baseWeights.ratings * this.adaptiveMultipliers.ratings,
            reviews: this.baseWeights.reviews * this.adaptiveMultipliers.reviews,
            budget: this.baseWeights.budget * this.adaptiveMultipliers.budget,
            occasion: this.baseWeights.occasion * this.adaptiveMultipliers.occasion
        };
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    adaptMultiplier(current, positiveSignal) {
        const next = positiveSignal ? current + 0.03 : current - 0.01;
        return this.clamp(next, 0.7, 1.8);
    }

    learnFromSelection(selectionFeatures) {
        if (!selectionFeatures || this.experimentGroup !== 'B') return;

        const hasLexical = selectionFeatures.lexicalHits > 0;
        const hasSemantic = selectionFeatures.semanticHits > 0;
        const hasRatings = selectionFeatures.ratingsScore > 6;
        const hasReviews = selectionFeatures.reviewsCount > 0;
        const goodBudgetFit = selectionFeatures.budgetFitScore >= 6;
        const goodOccasionFit = selectionFeatures.occasionAdjustment >= 2;

        this.adaptiveMultipliers.lexical = this.adaptMultiplier(this.adaptiveMultipliers.lexical, hasLexical);
        this.adaptiveMultipliers.semantic = this.adaptMultiplier(this.adaptiveMultipliers.semantic, hasSemantic);
        this.adaptiveMultipliers.ratings = this.adaptMultiplier(this.adaptiveMultipliers.ratings, hasRatings);
        this.adaptiveMultipliers.reviews = this.adaptMultiplier(this.adaptiveMultipliers.reviews, hasReviews);
        this.adaptiveMultipliers.budget = this.adaptMultiplier(this.adaptiveMultipliers.budget, goodBudgetFit);
        this.adaptiveMultipliers.occasion = this.adaptMultiplier(this.adaptiveMultipliers.occasion, goodOccasionFit);

        this.saveAdaptiveMultipliers();
    }

    appendRankingLog(eventData) {
        const raw = this.safeStorageGet(this.analyticsStorageKey);
        let logs = [];
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) logs = parsed;
            } catch (error) {
                logs = [];
            }
        }

        logs.push(eventData);
        if (logs.length > 200) {
            logs = logs.slice(logs.length - 200);
        }
        this.safeStorageSet(this.analyticsStorageKey, JSON.stringify(logs));
    }

    buildRecommendationQueryKey(family, profileKeys, occasion) {
        const normalizedProfiles = (profileKeys || []).map(k => this.normalizeText(k)).sort().join('|');
        const occasionKey = Array.isArray(occasion) ? `${occasion[0]}-${occasion[1]}` : 'na';
        return `${this.normalizeText(family)}::${normalizedProfiles}::${occasionKey}`;
    }

    loadRecommendationHistory() {
        const raw = this.safeStorageGet(this.recommendationHistoryStorageKey);
        if (!raw) return {};

        try {
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    getRecentRecommendationIds(queryKey) {
        const history = this.loadRecommendationHistory();
        const list = Array.isArray(history[queryKey]) ? history[queryKey] : [];
        return list.slice(0, 12);
    }

    updateRecommendationHistory(queryKey, selectedWineIds) {
        const history = this.loadRecommendationHistory();
        const existing = Array.isArray(history[queryKey]) ? history[queryKey] : [];
        const merged = [...selectedWineIds, ...existing.filter(id => !selectedWineIds.includes(id))].slice(0, 12);
        history[queryKey] = merged;
        this.safeStorageSet(this.recommendationHistoryStorageKey, JSON.stringify(history));
    }

    getRecencyPenalty(wineId, recentIds) {
        const idx = recentIds.indexOf(wineId);
        if (idx === -1) return 0;
        return Math.max(0, 12 - idx * 2);
    }

    async init() {
        // Cargar UI inmediatamente para evitar pantallas vacías
        this.renderFamilySelection();

        try {
            console.log("Intentando cargar datos...");
            let menuLoaded = false;

            // Priority 1: Fetch from JSON (Production)
            try {
                const response = await fetch('menu.json');
                if (response.ok) {
                    this.menu = await response.json();
                    console.log("Datos cargados vía fetch:", this.menu.length);
                    menuLoaded = true;
                } else {
                    console.warn(`Fetch de menu.json devolvió estado ${response.status}. Activando fallback local...`);
                }
            } catch (e) {
                console.warn("Fetch falló (probablemente local), intentando fallback variables...");
            }

            // Priority 2: Load fallback script only if fetch did not work
            if (!menuLoaded) {
                const fallbackLoaded = await this.loadFallbackMenuData();
                if (fallbackLoaded && typeof MENU_DATA !== 'undefined' && Array.isArray(MENU_DATA)) {
                    this.menu = MENU_DATA;
                    console.log("Datos cargados vía MENU_DATA (fallback):", this.menu.length);
                    menuLoaded = true;
                }
            }

            if (!menuLoaded) {
                console.error("CRITICAL: No se pudieron cargar datos ni de JSON ni de MENU_DATA");
                alert("Error: No se han podido cargar los vinos. Por favor contacte con soporte técnico.");
                return;
            }

            this.validateMenuData();

        } catch (error) {
            console.error('Error fatal al iniciar:', error);
        }
    }

    loadFallbackMenuData() {
        return new Promise((resolve) => {
            if (typeof MENU_DATA !== 'undefined' && Array.isArray(MENU_DATA)) {
                resolve(true);
                return;
            }

            const existing = document.getElementById('menuDataFallbackScript');
            if (existing) {
                existing.addEventListener('load', () => resolve(true), { once: true });
                existing.addEventListener('error', () => resolve(false), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.id = 'menuDataFallbackScript';
            script.src = 'menu-data.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
        });
    }

    validateMenuData() {
        const requiredFields = ['id', 'name', 'price', 'category'];
        const invalidItems = [];

        this.menu.forEach((item, index) => {
            const missing = requiredFields.filter(field => !item || item[field] === undefined || item[field] === null || item[field] === '');
            if (missing.length > 0) {
                invalidItems.push({ index, id: item && item.id ? item.id : 'SIN_ID', missing });
            }
        });

        if (invalidItems.length > 0) {
            const sample = invalidItems.slice(0, 5).map(it => `${it.id} [faltan: ${it.missing.join(', ')}]`).join(' | ');
            console.warn(`Se detectaron ${invalidItems.length} items con datos incompletos. Ejemplos: ${sample}`);
        }
    }

    parsePriceToNumber(price) {
        if (typeof price !== 'string') return NaN;
        return parseFloat(price.replace('€', '').trim().replace(',', '.'));
    }

    normalizeText(value) {
        return (value || '')
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    buildWineSearchText(wine) {
        const reviewText = Array.isArray(wine.user_reviews)
            ? wine.user_reviews.map(r => r.text || '').join(' ')
            : '';
        const pairingText = Array.isArray(wine.pairing_tags) ? wine.pairing_tags.join(' ') : '';
        const vivinoFoodText = Array.isArray(wine.vivino_food) ? wine.vivino_food.join(' ') : '';

        return this.normalizeText([
            wine.name,
            wine.do,
            wine.review,
            reviewText,
            pairingText,
            vivinoFoodText
        ].join(' '));
    }

    getSemanticTerms(profileKeys = []) {
        const map = {
            rioja: ['tempranillo', 'crianza', 'reserva', 'fruta roja', 'especias'],
            elegante: ['fino', 'sedoso', 'floral', 'fresco', 'equilibrado'],
            fino: ['ligero', 'delicado', 'elegante'],
            mencia: ['fruta roja', 'floral', 'atlantico', 'mineral'],
            crianza: ['roble', 'vainilla', 'especias', 'estructura'],
            reserva: ['complejo', 'estructura', 'profundo'],
            equilibrado: ['armonico', 'redondo', 'fresco'],
            ribera: ['tempranillo', 'estructura', 'cuerpo', 'fruta negra'],
            toro: ['potente', 'concentrado', 'tanino'],
            cuerpo: ['estructura', 'volumen', 'intenso'],
            estructura: ['tanino', 'persistente', 'profundo'],
            seco: ['fresco', 'acidez', 'citricos', 'salino'],
            mineral: ['pizarra', 'salino', 'piedra', 'atlantico'],
            godello: ['valdeorras', 'fruta blanca', 'volumen', 'untuoso'],
            aromatico: ['floral', 'jazmin', 'frutal', 'intenso'],
            floral: ['jazmin', 'flores', 'aromatico'],
            albarino: ['rias baixas', 'citricos', 'marisco', 'fresco'],
            frutal: ['melocoton', 'pera', 'manzana', 'tropical'],
            treixadura: ['ribeiro', 'fruta blanca', 'fresco'],
            brut: ['espumoso', 'burbuja', 'fresco', 'aperitivo'],
            rose: ['frutas rojas', 'fresa', 'fresco']
        };

        const terms = new Set();
        profileKeys.forEach(rawKey => {
            const key = this.normalizeText(rawKey);
            terms.add(key);
            (map[key] || []).forEach(term => terms.add(this.normalizeText(term)));
        });

        return [...terms].filter(Boolean);
    }

    getRatingsQualityScore(wine) {
        if (!wine.ratings) return 0;
        const values = Object.values(wine.ratings)
            .map(v => (typeof v === 'number' ? v : NaN))
            .filter(v => !Number.isNaN(v));

        if (values.length === 0) return 0;

        const normalized = values.map(v => {
            if (v <= 5) return v * 20;
            return v;
        });

        const avg = normalized.reduce((sum, v) => sum + v, 0) / normalized.length;
        return Math.max(0, Math.min(20, (avg - 70) / 1.5));
    }

    getOccasionType(occasion) {
        if (!Array.isArray(occasion)) return 'diario';
        if (occasion[1] <= 30) return 'diario';
        if (occasion[1] <= 70) return 'especial';
        return 'autor';
    }

    pickDiverseRecommendations(candidates, targetCount) {
        if (!Array.isArray(candidates) || candidates.length === 0) return [];

        const poolSize = Math.min(12, candidates.length);
        const randomizedPool = candidates
            .slice(0, poolSize)
            .map(candidate => ({
                ...candidate,
                randomizedScore: candidate.score + Math.random() * 6
            }))
            .sort((a, b) => b.randomizedScore - a.randomizedScore);

        const fallbackPool = candidates.slice(poolSize);
        const candidatePool = [...randomizedPool, ...fallbackPool];

        const selected = [];
        const selectedIds = new Set();
        const usedDO = new Set();

        for (const candidate of candidatePool) {
            if (selected.length >= targetCount) break;
            if (selectedIds.has(candidate.wine.id)) continue;
            const wineDO = candidate.wine.do || 'SIN_DO';
            if (usedDO.has(wineDO)) continue;

            selected.push(candidate);
            selectedIds.add(candidate.wine.id);
            usedDO.add(wineDO);
        }

        for (const candidate of candidatePool) {
            if (selected.length >= targetCount) break;
            if (selectedIds.has(candidate.wine.id)) continue;

            selected.push(candidate);
            selectedIds.add(candidate.wine.id);
        }

        return selected;
    }

    getItemImageSrc(item) {
        if (!item) return null;
        if (item.image_url) return item.image_url;
        if (item.image) return `fotos/${item.image}`;
        return null;
    }

    showSection(key) {
        Object.values(this.sections).forEach(s => {
            if (s) s.classList.add('hidden');
        });
        if (this.sections[key]) this.sections[key].classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateProgress(step) {
        if (this.currentStepText) this.currentStepText.textContent = step;
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i < step);
        });
    }

    renderFamilySelection() {
        this.state.currentStep = 'family';
        this.showSection('selection');
        this.updateProgress(1);
        if (this.btnBack) this.btnBack.style.display = 'none';
        this.headerTitle.textContent = "SIAmmelier Dobao";
        this.stepTitle.textContent = "¿Qué vamos a descorchar hoy?";

        const families = [
            {
                label: "Tinto",
                key: "VINOS TINTOS",
                type: "tinto",
                icon: "wine_bar",
                desc: "Cuerpo, estructura y carácter"
            },
            {
                label: "Blanco",
                key: "VINOS BLANCOS",
                type: "blanco",
                icon: "glass_cup",
                desc: "Frescura, mineralidad y elegancia"
            },
            {
                label: "Espumoso",
                key: "ESPUMOSOS",
                type: "espumoso",
                icon: "liquor",
                desc: "Burbujas, celebración y finura"
            }
        ];

        this.optionsGrid.className = "character-grid-v2 slide-up";
        this.optionsGrid.innerHTML = families.map(f => `
            <button class="character-card" data-type="${f.type}" onclick="app.selectFamily('${f.key}')">
                <div class="character-gradient"></div>
                <div class="character-content">
                    <span class="material-symbols-outlined character-icon">${f.icon}</span>
                    <h3 class="character-title">${f.label}</h3>
                    <p class="character-desc">${f.desc}</p>
                </div>
            </button>
        `).join('');
    }

    selectFamily(key) {
        this.state.selection.family = key;
        this.renderProfileSelection();
    }

    handleNextStep() {
        const step = this.state.currentStep;

        if (step === 'family' && this.state.selection.family) {
            this.renderProfileSelection();
        } else if (step === 'profile' && this.state.selection.profileKeys) {
            this.renderOccasionSelection();
        } else if (step === 'occasion' && this.state.selection.occasion) {
            this.getRecommendations();
        } else if (step === 'final' && this.state.selection.selectedFood) {
            this.finalize();
        }
    }

    renderProfileSelection() {
        this.state.currentStep = 'profile';
        this.showSection('selection');
        this.updateProgress(2);
        if (this.btnBack) this.btnBack.style.display = 'flex';
        this.stepTitle.textContent = "Describa el carácter";

        let profiles = [];
        if (this.state.selection.family === "VINOS TINTOS") {
            profiles = [
                {
                    label: "Fresco & Elegante",
                    keys: ["rioja", "elegante", "fino", "mencía"],
                    type: "elegante",
                    icon: "eco",
                    desc: "Tintos ligeros con acidez vibrante"
                },
                {
                    label: "Equilibrado",
                    keys: ["crianza", "reserva", "equilibrado"],
                    type: "equilibrado",
                    icon: "balance",
                    desc: "Armonía entre fruta y madera"
                },
                {
                    label: "Potente & Robusto",
                    keys: ["ribera", "toro", "cuerpo", "estructura"],
                    type: "robusto",
                    icon: "star",
                    desc: "Gran cuerpo y concentración"
                }
            ];
        } else if (this.state.selection.family === "VINOS BLANCOS") {
            profiles = [
                {
                    label: "Seco & Mineral",
                    keys: ["seco", "mineral", "godello"],
                    type: "mineral",
                    icon: "water_drop",
                    desc: "Frescura atlántica y salinidad"
                },
                {
                    label: "Aromático",
                    keys: ["aromático", "floral", "albariño"],
                    type: "aromatico",
                    icon: "local_florist",
                    desc: "Expresión frutal y flores blancas"
                },
                {
                    label: "Frutal & Goloso",
                    keys: ["frutal", "albariño", "treixadura"],
                    type: "frutal",
                    icon: "bakery_dining",
                    desc: "Untuoso con fruta madura"
                }
            ];
        } else {
            profiles = [
                {
                    label: "Clásico Brut",
                    keys: ["brut", "reserva"],
                    type: "espumoso",
                    icon: "auto_awesome",
                    desc: "Elegancia y burbuja fina"
                },
                {
                    label: "Rosé & Moderno",
                    keys: ["rosé", "fresco"],
                    type: "frutal",
                    icon: "local_florist",
                    desc: "Frutas rojas y frescura"
                }
            ];
        }

        this.optionsGrid.className = "character-grid-v2 slide-up";
        this.optionsGrid.innerHTML = profiles.map(p => `
            <button class="character-card" data-type="${p.type}" onclick="app.selectProfile('${p.keys.join(',')}')">
                <div class="character-gradient"></div>
                <div class="character-content">
                    <span class="material-symbols-outlined character-icon">${p.icon}</span>
                    <h3 class="character-title">${p.label}</h3>
                    <p class="character-desc">${p.desc}</p>
                </div>
            </button>
        `).join('');
    }

    selectProfile(keysStr) {
        this.state.selection.profileKeys = keysStr.split(',');
        this.renderOccasionSelection();
    }

    renderOccasionSelection() {
        this.state.currentStep = 'occasion';
        this.stepTitle.textContent = "¿Qué buscas en este vino?";
        this.updateProgress(3);

        const options = [
            {
                label: "Placer Diario",
                sublabel: "Vinos Versátiles",
                range: [0, 30],
                type: "diario",
                icon: "sunny",
                desc: "Disfrutar sin complicaciones, vinos accesibles para cualquier momento"
            },
            {
                label: "Experiencia Especial",
                sublabel: "Reservas y Crianzas",
                range: [30, 70],
                type: "especial",
                icon: "auto_awesome",
                desc: "Sorprender y deleitar, selecciones memorables de mayor complejidad"
            },
            {
                label: "Vino de Autor",
                sublabel: "Exclusividad",
                range: [70, 2000],
                type: "autor",
                icon: "workspace_premium",
                desc: "Joyas únicas, grandes reservas y ediciones limitadas de prestigio"
            }
        ];

        this.optionsGrid.className = "character-grid-v2 slide-up";
        this.optionsGrid.innerHTML = options.map(o => `
            <button class="character-card" data-type="${o.type}" onclick="app.selectOccasion(${o.range[0]}, ${o.range[1]})">
                <div class="character-gradient"></div>
                <div class="character-content">
                    <span class="material-symbols-outlined character-icon">${o.icon}</span>
                    <h3 class="character-title">${o.label}</h3>
                    <p class="character-sublabel">${o.sublabel}</p>
                    <p class="character-desc">${o.desc}</p>
                </div>
            </button>
        `).join('');
    }

    selectOccasion(min, max) {
        this.state.selection.occasion = [min, max];
        this.getRecommendations();
    }

    getRecommendations() {
        const { family, profileKeys, occasion } = this.state.selection;
        const queryKey = this.buildRecommendationQueryKey(family, profileKeys, occasion);
        const recentIds = this.getRecentRecommendationIds(queryKey);

        // Filtro duro de categoría
        let categoryCandidates = this.menu.filter(w => w.category === family);
        if (categoryCandidates.length === 0) {
            categoryCandidates = this.menu.filter(w => w.category && w.category.toUpperCase() === family.toUpperCase());
        }

        // Filtro duro de precio
        const [minPrice, maxPrice] = occasion;
        let priceCandidates = categoryCandidates.filter(w => {
            const priceNum = this.parsePriceToNumber(w.price);
            return !Number.isNaN(priceNum) && priceNum >= minPrice && priceNum <= maxPrice;
        });

        // Fallback de precio: ampliar margen manteniendo la categoría
        let expandedPriceRange = false;
        if (priceCandidates.length === 0 && categoryCandidates.length > 0) {
            expandedPriceRange = true;
            const expandedMin = Math.max(0, minPrice - 15);
            const expandedMax = maxPrice + 15;
            priceCandidates = categoryCandidates.filter(w => {
                const priceNum = this.parsePriceToNumber(w.price);
                return !Number.isNaN(priceNum) && priceNum >= expandedMin && priceNum <= expandedMax;
            });
        }

        if (priceCandidates.length === 0) {
            priceCandidates = categoryCandidates;
        }

        if (priceCandidates.length === 0) {
            this.recommendationMeta = new Map();
            this.renderWineResults([]);
            return;
        }

        // Búsqueda semántica ligera + lexical
        const semanticTerms = this.getSemanticTerms(profileKeys || []);
        const occasionType = this.getOccasionType(occasion);
        const weights = this.getScoringWeights();
        const budgetMidpoint = (minPrice + maxPrice) / 2;
        const budgetHalfRange = Math.max(1, (maxPrice - minPrice) / 2);

        const scoredCandidates = priceCandidates.map(wine => {
            const searchText = this.buildWineSearchText(wine);
            const priceNum = this.parsePriceToNumber(wine.price);

            const lexicalHits = (profileKeys || []).reduce((acc, rawKey) => {
                const key = this.normalizeText(rawKey);
                return acc + (searchText.includes(key) ? 1 : 0);
            }, 0);

            const semanticHits = semanticTerms.reduce((acc, term) => {
                return acc + (searchText.includes(term) ? 1 : 0);
            }, 0);

            const ratingsScore = this.getRatingsQualityScore(wine);
            const reviewsScore = Math.min(6, (wine.user_reviews || []).length * 2);

            const budgetDistance = Number.isNaN(priceNum)
                ? 1
                : Math.min(1, Math.abs(priceNum - budgetMidpoint) / budgetHalfRange);
            const budgetFitScore = (1 - budgetDistance) * 10;

            let occasionAdjustment = 0;
            if (!Number.isNaN(priceNum)) {
                if (occasionType === 'diario') {
                    occasionAdjustment = Math.max(0, (maxPrice - priceNum) / Math.max(1, maxPrice)) * 5;
                } else if (occasionType === 'especial') {
                    occasionAdjustment = budgetFitScore * 0.4;
                } else {
                    occasionAdjustment = Math.max(0, (priceNum - minPrice) / Math.max(1, maxPrice - minPrice)) * 5;
                }
            }

            const score =
                lexicalHits * weights.lexical +
                semanticHits * weights.semantic +
                ratingsScore * weights.ratings +
                reviewsScore * weights.reviews +
                budgetFitScore * weights.budget +
                occasionAdjustment * weights.occasion;

            const recencyPenalty = this.getRecencyPenalty(wine.id, recentIds);
            const finalScore = score - recencyPenalty;

            const reasons = [];
            if (lexicalHits > 0) reasons.push(`encaja con ${lexicalHits} rasgos del perfil`);
            if (semanticHits > 0) reasons.push(`coincide con ${semanticHits} señales semánticas`);
            if (ratingsScore > 0) reasons.push('respaldado por puntuaciones externas');
            if ((wine.user_reviews || []).length > 0) reasons.push('opiniones verificadas de clientes');
            if (!Number.isNaN(priceNum) && priceNum >= minPrice && priceNum <= maxPrice) reasons.push('dentro del presupuesto');
            if (expandedPriceRange && (!Number.isNaN(priceNum) && (priceNum < minPrice || priceNum > maxPrice))) {
                reasons.push('rango ampliado para no perder opciones');
            }

            return {
                wine,
                score: finalScore,
                reasons,
                lexicalHits,
                semanticHits,
                ratingsScore,
                budgetFitScore,
                reviewsCount: (wine.user_reviews || []).length,
                occasionAdjustment,
                recencyPenalty
            };
        });

        // Reranking final de top candidatos
        scoredCandidates.sort((a, b) => b.score - a.score);
        const topCandidates = scoredCandidates.slice(0, 20);

        // Diversidad controlada para evitar recomendaciones demasiado parecidas
        const selectedCandidates = this.pickDiverseRecommendations(topCandidates, 2);
        this.updateRecommendationHistory(queryKey, selectedCandidates.map(entry => entry.wine.id));

        this.recommendationMeta = new Map(
            selectedCandidates.map((entry, idx) => {
                const positionTag = idx === 0 ? 'Recomendación principal' : 'Alternativa equilibrada';
                const reasonText = entry.reasons.length > 0
                    ? entry.reasons.slice(0, 2).join(' + ')
                    : 'selección recomendada por ajuste global';

                return [
                    entry.wine.id,
                    {
                        score: entry.score,
                        rationale: `${positionTag}: ${reasonText}`
                    }
                ];
            })
        );

        this.lastRecommendationRun = {
            timestamp: new Date().toISOString(),
            family,
            profileKeys: [...(profileKeys || [])],
            occasion,
            experimentGroup: this.experimentGroup,
            weights,
            selected: selectedCandidates.map((entry, idx) => ({
                id: entry.wine.id,
                position: idx + 1,
                score: Number(entry.score.toFixed(2)),
                lexicalHits: entry.lexicalHits,
                semanticHits: entry.semanticHits,
                ratingsScore: Number(entry.ratingsScore.toFixed(2)),
                reviewsCount: entry.reviewsCount,
                budgetFitScore: Number(entry.budgetFitScore.toFixed(2)),
                occasionAdjustment: Number(entry.occasionAdjustment.toFixed(2))
            })),
            topRanking: topCandidates.slice(0, 20).map((entry, idx) => ({
                rank: idx + 1,
                id: entry.wine.id,
                name: entry.wine.name,
                score: Number(entry.score.toFixed(2)),
                lexicalHits: entry.lexicalHits,
                semanticHits: entry.semanticHits,
                ratingsScore: Number(entry.ratingsScore.toFixed(2)),
                reviewsCount: entry.reviewsCount,
                budgetFitScore: Number(entry.budgetFitScore.toFixed(2)),
                occasionAdjustment: Number(entry.occasionAdjustment.toFixed(2)),
                recencyPenalty: Number(entry.recencyPenalty.toFixed(2))
            }))
        };

        this.appendRankingLog({
            type: 'ranking',
            ...this.lastRecommendationRun
        });

        this.renderWineResults(selectedCandidates.map(entry => entry.wine));
    }

    renderWineResults(wines) {
        this.showSection('results');
        this.updateProgress(4);
        if (this.btnBack) this.btnBack.style.display = 'flex';

        if (wines.length === 0) {
            this.wineResults.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--gold); font-family: 'Playfair Display', serif; font-size: 1.5rem;">Lo sentimos, no hemos encontrado vinos con estos criterios.<br><span style="font-size: 1rem; color: var(--text-cream); font-family: 'Inter', sans-serif;">Pruebe a cambiar el presupuesto o el perfil.</span></p>`;
            return;
        }

        this.wineResults.innerHTML = wines.map((w, i) => {
            const isTop = (i === 0);
            const recommendationMeta = this.recommendationMeta.get(w.id);

            // Recopilar Puntuaciones
            let ratingsHtml = '';
            if (w.ratings) {
                const r = w.ratings;
                if (r.vivino) ratingsHtml += `<span class="badge-rating badge-vivino">Vivino ${r.vivino}★</span> `;
                if (r.parker) ratingsHtml += `<span class="badge-rating badge-parker">Parker ${r.parker}</span> `;
                if (r.penin) ratingsHtml += `<span class="badge-rating badge-penin">Peñín ${r.penin}</span> `;
                if (r.spectator) ratingsHtml += `<span class="badge-rating badge-ws">WS ${r.spectator}</span> `;
            } else {
                ratingsHtml = `<span class="badge-rating badge-autor">Selección de Autor</span>`;
            }

            // Recopilar una Reseña de Usuario
            let userReviewHtml = '';
            if (w.user_reviews && w.user_reviews.length > 0) {
                const rev = w.user_reviews[0];
                userReviewHtml = `
                    <div class="user-review-bubble">
                        <div class="user-review-header">
                            <span class="material-symbols-outlined" style="font-size:1.1rem;">verified</span> Opinión Verificada
                        </div>
                        <p class="user-review-text">"${rev.text}"</p>
                        <span class="user-review-author">— ${rev.author}</span>
                    </div>
                `;
            }

            // Imagen del Vino
            let imageHtml = '';
            const imageSrc = this.getItemImageSrc(w);
            if (imageSrc) {
                imageHtml = `
                    <div class="wine-image-container">
                        <img src="${imageSrc}" onerror="this.parentElement.style.display='none'">
                    </div>
                `;
            }

            // Precio por copa
            let glassPriceHtml = '';
            if (w.glass_price) {
                glassPriceHtml = `<span class="glass-badge">Copa: ${w.glass_price}</span>`;
            }

            return `
                <div class="wine-card slide-up" onclick="app.selectWine('${w.id}')">
                    ${isTop ? '<div class="wine-badge">MEJOR VALORADO</div>' : ''}
                    ${imageHtml}
                    
                    <div class="wine-info">
                        <h4 class="wine-name">${w.name}</h4>
                        <span class="wine-meta">${w.do}</span>
                        
                        <div class="ratings-container">${ratingsHtml}</div>
                        
                        <div class="price-container">
                            <!-- Precio Oculto a petición (Estrategia Premium) -->
                            <!-- <span class="wine-price">${w.price}</span> -->
                            ${glassPriceHtml}
                        </div>
                        
                        <div class="sommelier-review-box">
                            <p style="margin: 0;">${w.review}</p>
                        </div>

                        ${recommendationMeta ? `
                            <div class="sommelier-review-box" style="margin-top: 1rem; border-color: rgba(212, 175, 55, 0.4);">
                                <p style="margin: 0; color: var(--gold); font-size: 0.85rem; letter-spacing: 0.02em;">
                                    ${recommendationMeta.rationale}
                                </p>
                            </div>
                        ` : ''}

                        ${userReviewHtml}
                        
                        <button class="btn-primary" style="margin-top: 2.5rem; width: 100%;">
                            <span class="material-symbols-outlined">check_circle</span>
                            Seleccionar este vino
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    selectWine(id) {
        if (this.lastRecommendationRun && Array.isArray(this.lastRecommendationRun.selected)) {
            const chosen = this.lastRecommendationRun.selected.find(item => item.id === id);
            if (chosen) {
                this.learnFromSelection(chosen);
                this.appendRankingLog({
                    type: 'selection',
                    timestamp: new Date().toISOString(),
                    experimentGroup: this.experimentGroup,
                    selectedWineId: id,
                    selectedPosition: chosen.position,
                    selectedScore: chosen.score,
                    family: this.lastRecommendationRun.family,
                    profileKeys: this.lastRecommendationRun.profileKeys,
                    occasion: this.lastRecommendationRun.occasion
                });
            }
        }

        this.state.selection.selectedWine = this.menu.find(w => w.id === id);
        this.renderFoodSuggestions();
    }

    renderFoodSuggestions() {
        this.showSection('final');
        const wine = this.state.selection.selectedWine;

        // Buscar platos que mariden con este vino
        let foodSuggestions = [];

        // ESTRATEGIA 1: Buscar por tags de maridaje del vino
        const pairingTags = wine.pairing_tags || wine.vivino_food || [];

        if (pairingTags.length > 0) {
            const foodItems = this.menu.filter(item => item.category && item.category.includes('TAPEO'));

            foodSuggestions = foodItems.filter(food => {
                if (!food.pairing_tags) return false;
                return food.pairing_tags.some(tag =>
                    pairingTags.some(wineTag =>
                        wineTag.toLowerCase().includes(tag.toLowerCase()) ||
                        tag.toLowerCase().includes(wineTag.toLowerCase())
                    )
                );
            });
        }

        // ESTRATEGIA 2: Si no hay tags o no hay suficientes coincidencias, usar reglas por categoría
        if (foodSuggestions.length < 3) {
            const allFood = this.menu.filter(item => item.category && item.category.includes('TAPEO'));

            if (wine.category === "VINOS TINTOS") {
                const tintoKeywords = ['jamón', 'ibérico', 'cecina', 'queso', 'tabla', 'lacón', 'oreja', 'croqueta', 'rabo'];
                foodSuggestions = allFood.filter(f =>
                    tintoKeywords.some(kw => f.name.toLowerCase().includes(kw))
                ).slice(0, 4);
            } else if (wine.category === "VINOS BLANCOS") {
                const blancoKeywords = ['salmón', 'anchoa', 'sardina', 'ventresca', 'ensalada', 'burrata', 'tosta'];
                foodSuggestions = allFood.filter(f =>
                    blancoKeywords.some(kw => f.name.toLowerCase().includes(kw))
                ).slice(0, 4);
            } else if (wine.category === "ESPUMOSOS") {
                const espumosoKeywords = ['tosta', 'ensalada', 'burrata', 'salmón', 'anchoa', 'jamón'];
                foodSuggestions = allFood.filter(f =>
                    espumosoKeywords.some(kw => f.name.toLowerCase().includes(kw))
                ).slice(0, 4);
            }
        }

        if (foodSuggestions.length === 0) {
            const fallbackIds = ['FOOD_005', 'FOOD_003', 'FOOD_001', 'FOOD_011'];
            foodSuggestions = fallbackIds
                .map(id => this.menu.find(item => item.id === id))
                .filter(item => item);
        }

        foodSuggestions = [...new Map(foodSuggestions.map(f => [f.id, f])).values()].slice(0, 4);

        this.finalDisplay.innerHTML = `
            <div class="wine-card" style="border: 2px solid var(--gold); margin-bottom: 3rem;">
                <div class="wine-info" style="padding: 1.5rem; text-align: center;">
                    <span class="wine-badge" style="position:static; margin-bottom:1rem; display:inline-block;">✓ Su Elección</span>
                    <h4 class="wine-name" style="font-size: 1.5rem; margin: 0.5rem 0;">${wine.name}</h4>
                    <p class="wine-price" style="font-size: 1.5rem;">${wine.price}</p>
                </div>
            </div>

            <div class="pairing-header" style="text-align: center; margin-bottom: 2rem;">
                <h3 class="step-title" style="font-size: 1.8rem; margin-bottom: 0.5rem; color: var(--gold);">El Maridaje Perfecto</h3>
                <p style="color: rgba(245, 245, 220, 0.7); font-size: 0.95rem; font-style: italic;">Sugerencias artesanales de nuestra cocina para un ${wine.category === 'VINOS TINTOS' ? 'tinto' : wine.category === 'VINOS BLANCOS' ? 'blanco' : 'espumoso'}</p>
            </div>
            
            <div class="food-grid slide-up">
                ${foodSuggestions.map(food => `
                    <div class="food-suggestion-card" onclick="app.selectFood('${food.name}')">
                        <span class="material-symbols-outlined" style="color: var(--gold); font-size: 2.5rem; margin-bottom: 1rem;">restaurant</span>
                        <h4 class="food-name">${food.name}</h4>
                        <p class="food-price">${food.price}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    selectFood(name) {
        this.state.selection.selectedFood = name;
        if (this.pairingConfirmArea) {
            this.pairingConfirmArea.style.display = 'block';
            this.pairingConfirmArea.classList.add('slide-up');
        }
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    finalize() {
        const { selectedWine, selectedFood } = this.state.selection;
        const foodItem = this.menu.find(item => item.name === selectedFood);
        const foodPrice = foodItem ? foodItem.price : '0,00 €';

        const winePrice = parseFloat(selectedWine.price.replace('€', '').trim().replace(',', '.'));
        const foodPriceNum = parseFloat(foodPrice.replace('€', '').trim().replace(',', '.'));
        const total = (winePrice + foodPriceNum).toFixed(2).replace('.', ',');

        this.showSection('summary');
        this.updateProgress(6);
        this.headerTitle.textContent = "Resumen del Sommelier";

        document.getElementById('summaryDisplay').innerHTML = `
            <div class="summary-card slide-up">
                <span class="material-symbols-outlined summary-icon-large">task_alt</span>
                <h3 class="wine-name" style="font-size: 2rem; margin-bottom: 0.5rem;">Selección Completa</h3>
                <p style="color: rgba(245, 245, 220, 0.6); font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase;">Experiencia SIAmmelier</p>
                
                <div class="summary-details">
                    <div class="summary-item">
                        <p class="summary-label">Vino Seleccionado</p>
                        <p class="summary-value">${selectedWine.name}</p>
                        <p class="summary-price">${selectedWine.price}</p>
                    </div>
                    
                    <div class="summary-item">
                        <p class="summary-label">Maridaje</p>
                        <p class="summary-value">${selectedFood}</p>
                        <p class="summary-price">${foodPrice}</p>
                    </div>
                    
                    <div class="summary-total">
                        <span class="total-label">TOTAL ESTIMADO</span>
                        <span class="total-value">${total} €</span>
                    </div>
                </div>

                <div style="margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1rem;">
                    <button class="btn-primary" style="width: 100%;" onclick="app.finalizeSelection()">
                        Confirmar y Servir en Mesa
                    </button>
                    <button class="btn-secondary" style="width: 100%; border-color: rgba(212, 175, 55, 0.4); color: rgba(212, 175, 55, 0.6);" onclick="app.renderFamilySelection()">
                        Modificar Selección
                    </button>
                </div>
            </div>
        `;
    }

    finalizeSelection() {
        alert("¡Su selección ha sido enviada al equipo! En breves instantes le serviremos su elección. ¡Que lo disfrute!");
        this.restart();
    }

    goBack() {
        if (this.state.currentStep === 'profile') this.renderFamilySelection();
        else if (this.state.currentStep === 'occasion') this.renderProfileSelection();
        else if (this.state.currentStep === 'results') this.renderOccasionSelection();
        else this.renderFamilySelection();
    }

    restart() {
        this.state.selection = { family: null, profileKeys: null, occasion: null, selectedWine: null, selectedFood: null };
        if (this.pairingConfirmArea) this.pairingConfirmArea.style.display = 'none';
        this.renderFamilySelection();
    }

    showFoodMenu() {
        this.showSection('selection');
        this.headerTitle.textContent = "Carta de Tapeo";
        this.stepTitle.textContent = "Nuestra Selección Gastronómica";
        if (this.btnBack) this.btnBack.style.display = 'flex';

        const foodItems = this.menu.filter(item => item.category && item.category.includes('TAPEO'));

        this.optionsGrid.className = "wine-results slide-up";
        this.optionsGrid.innerHTML = foodItems.map(food => {
            const imageSrc = this.getItemImageSrc(food);
            let imgHtml = imageSrc ? `
                <div class="wine-image-container" style="height: 180px;">
                    <img src="${imageSrc}" onerror="this.parentElement.style.display='none'">
                </div>` : '';
            return `
            <div class="wine-card">
                ${imgHtml}
                <div class="wine-info">
                    <h4 class="wine-name" style="font-size: 1.5rem;">${food.name}</h4>
                    <p class="wine-meta">${food.description || ''}</p>
                    <span class="wine-price" style="font-size: 1.5rem;">${food.price}</span>
                </div>
            </div>
            `;
        }).join('');
    }

    showWineMenu() {
        this.showSection('selection');
        this.headerTitle.textContent = "Carta de Vinos";
        this.stepTitle.textContent = "Nuestra Bodega Completa";
        if (this.btnBack) this.btnBack.style.display = 'flex';

        const wines = this.menu.filter(item =>
            item.category === 'VINOS TINTOS' ||
            item.category === 'VINOS BLANCOS' ||
            item.category === 'ESPUMOSOS'
        );

        // Obtener D.O.s únicas
        const uniqueDOs = [...new Set(wines.map(w => w.do).filter(doName => doName))].sort();

        // Crear contenedor de filtros y grid
        this.optionsGrid.className = "wine-bodega-container slide-up";
        this.optionsGrid.innerHTML = `
            <div class="filter-chips-wrapper">
                <div class="filter-chips" id="wineFilterChips">
                    <button class="chip active" onclick="app.filterBodega('ALL')">Todos</button>
                    ${uniqueDOs.map(doName => `
                        <button class="chip" onclick="app.filterBodega('${doName}')">${doName}</button>
                    `).join('')}
                </div>
            </div>
            <div id="wineGrid" class="wine-results" style="margin-top: 2rem;">
                <!-- Se rellena con renderWineGrid -->
            </div>
        `;

        // Guardar vinos para filtrar luego
        this.currentWines = wines;
        this.filterBodega('ALL');
    }

    filterBodega(doName) {
        // Actualizar chips activos
        const chips = document.querySelectorAll('.chip');
        chips.forEach(c => {
            c.classList.toggle('active', c.textContent === doName || (doName === 'ALL' && c.textContent === 'Todos'));
        });

        const filtered = doName === 'ALL'
            ? this.currentWines
            : this.currentWines.filter(w => w.do === doName);

        const grid = document.getElementById('wineGrid');
        grid.innerHTML = filtered.map(wine => {
            const imageSrc = this.getItemImageSrc(wine);
            let imgHtml = imageSrc ? `
                <div class="wine-image-container" style="height: 200px;">
                    <img src="${imageSrc}" onerror="this.parentElement.style.display='none'">
                </div>` : '';
            let glassHtml = wine.glass_price ? `<span class="glass-badge">Copa: ${wine.glass_price}</span>` : '';

            return `
            <div class="wine-card">
                ${imgHtml}
                <div class="wine-info">
                    <span class="wine-badge" style="position:static; margin-bottom:0.5rem; display:inline-block;">${wine.category}</span>
                    <h4 class="wine-name" style="font-size: 1.5rem;">${wine.name}</h4>
                    <span class="wine-meta">${wine.do}</span>
                    
                    <div class="sommelier-review-box" style="margin: 1rem 0; padding: 1rem;">
                        <p style="margin: 0; font-size: 0.85rem;">${wine.review || ''}</p>
                    </div>

                    <div class="price-container" style="margin-bottom: 0;">
                        <span class="wine-price" style="font-size: 1.5rem;">${wine.price}</span>
                        ${glassHtml}
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    showAdminPanel() {
        // Redirigir a la pantalla de login de administrador
        window.location.href = "admin.html";
    }
}

// Estilos extra eliminados y movidos a style-bodega.css

// Inicializar
window.addEventListener('DOMContentLoaded', () => {
    window.app = new SommelierApp();
    window.app.init();
});

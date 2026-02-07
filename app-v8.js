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
    }

    async init() {
        try {
            console.log("Cargando datos de menu.json...");
            const response = await fetch('menu.json');
            if (!response.ok) throw new Error("No se pudo cargar menu.json");
            this.menu = await response.json();
            this.renderFamilySelection();
        } catch (error) {
            console.error('Error al iniciar:', error);
        }
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
                    type: "robusto",
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
        this.updateProgress(2);

        const options = [
            {
                label: "Placer Diario",
                sublabel: "Hasta 30€",
                range: [0, 30],
                type: "diario",
                icon: "sunny",
                desc: "Disfrutar sin complicaciones, vinos accesibles y versátiles"
            },
            {
                label: "Experiencia Especial",
                sublabel: "30€ - 70€",
                range: [30, 70],
                type: "especial",
                icon: "auto_awesome",
                desc: "Sorprender y deleitar, reservas y crianzas memorables"
            },
            {
                label: "Vino de Autor",
                sublabel: "+70€",
                range: [70, 2000],
                type: "autor",
                icon: "workspace_premium",
                desc: "Exclusividad y prestigio, gran reserva y ediciones limitadas"
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

        let filtered = this.menu.filter(w => w.category === family);

        // Filtro por precio
        filtered = filtered.filter(w => {
            const priceNum = parseFloat(w.price.replace('€', '').trim().replace(',', '.'));
            return priceNum >= occasion[0] && priceNum <= occasion[1];
        });

        // Calcular puntuación para cada vino
        const winesWithScores = filtered.map(wine => {
            let score = profileKeys.reduce((acc, k) => {
                const searchStr = (wine.name + " " + wine.review + " " + (wine.do || "")).toLowerCase();
                return acc + (searchStr.includes(k.toLowerCase()) ? 2 : 0);
            }, 0);

            // BOOST CRÍTICO: Si tiene ratings o si tiene reviews de usuarios, subirlo al top
            if (wine.ratings) score += 10;
            if (wine.user_reviews && wine.user_reviews.length > 0) score += 10;

            return { wine, score };
        });

        // Ordenar por puntuación
        winesWithScores.sort((a, b) => b.score - a.score);

        // Encontrar la puntuación máxima
        const maxScore = winesWithScores.length > 0 ? winesWithScores[0].score : 0;

        // Obtener TODOS los vinos con la puntuación máxima (o cercana)
        // Permitimos vinos con puntuación >= maxScore - 2 para tener más variedad
        const topCandidates = winesWithScores.filter(w => w.score >= maxScore - 2);

        // SELECCIÓN ALEATORIA: Mezclar los candidatos y elegir 2 al azar
        const shuffled = topCandidates.sort(() => Math.random() - 0.5);
        const selectedWines = shuffled.slice(0, 2).map(w => w.wine);

        this.renderWineResults(selectedWines);
    }

    renderWineResults(wines) {
        this.showSection('results');
        if (this.btnBack) this.btnBack.style.display = 'flex';

        if (wines.length === 0) {
            this.wineResults.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--gold); font-family: 'Playfair Display', serif; font-size: 1.5rem;">Lo sentimos, no hemos encontrado vinos con estos criterios.<br><span style="font-size: 1rem; color: var(--text-cream); font-family: 'Inter', sans-serif;">Pruebe a cambiar el presupuesto o el perfil.</span></p>`;
            return;
        }

        this.wineResults.innerHTML = wines.map((w, i) => {
            const isTop = (i === 0);

            // Recopilar Puntuaciones
            let ratingsHtml = '';
            if (w.ratings) {
                const r = w.ratings;
                if (r.vivino) ratingsHtml += `<span class="badge-rating" style="background:#f0e9e9; color:#4b0101;">Vivino ${r.vivino}★</span> `;
                if (r.parker) ratingsHtml += `<span class="badge-rating" style="background:#4b0101; color:white;">Parker ${r.parker}</span> `;
                if (r.penin) ratingsHtml += `<span class="badge-rating" style="background:#000; color:gold;">Peñín ${r.penin}</span> `;
                if (r.spectator) ratingsHtml += `<span class="badge-rating" style="background:#8b0000; color:white;">WS ${r.spectator}</span> `;
            } else {
                ratingsHtml = `<span class="badge-rating" style="background:rgba(212,175,55,0.1); color:var(--gold); border: 1px solid var(--gold);">Selección de Autor</span>`;
            }

            // Recopilar una Reseña de Usuario con diseño de burbuja
            let userReviewHtml = '';
            if (w.user_reviews && w.user_reviews.length > 0) {
                const rev = w.user_reviews[0];
                userReviewHtml = `
                    <div class="user-review-bubble">
                        <p style="font-weight: 800; font-size: 0.7rem; color: var(--gold); text-transform:uppercase; letter-spacing:0.1em; margin-bottom: 0.5rem; display:flex; align-items:center; gap:6px;">
                            <span class="material-symbols-outlined" style="font-size:1.1rem;">verified</span> Opinión Verificada
                        </p>
                        <p style="font-style: italic; font-size: 0.95rem; line-height: 1.5; color: var(--text-cream);">"${rev.text}"</p>
                        <p style="font-size: 0.8rem; font-weight: 700; margin-top: 0.75rem; color: var(--gold);">— ${rev.author}</p>
                    </div>
                `;
            }

            // Imagen del Vino
            let imageHtml = '';
            if (w.image) {
                imageHtml = `<div style="width:100%; height:280px; overflow:hidden; border-bottom: 1px solid rgba(212,175,55,0.2);">
                    <img src="fotos/${w.image}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'">
                </div>`;
            }

            // Precio por copa
            let glassPriceHtml = '';
            if (w.glass_price) {
                glassPriceHtml = `<span class="glass-badge">Copa: ${w.glass_price}</span>`;
            }

            return `
                <div class="wine-card slide-up" onclick="app.selectWine('${w.id}')">
                    ${isTop ? '<div class="wine-badge" style="position: absolute; top: 0; right: 0;">MEJOR VALORADO</div>' : ''}
                    ${imageHtml}
                    
                    <div class="wine-info">
                        <h4 class="wine-name">${w.name}</h4>
                        <p class="wine-meta">${w.do}</p>
                        
                        <div class="ratings-container" style="margin: 1.5rem 0; display: flex; flex-wrap: wrap; gap: 0.5rem;">${ratingsHtml}</div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <span class="wine-price">${w.price}</span>
                            ${glassPriceHtml}
                        </div>
                        
                        <div class="sommelier-review-box">
                            <p style="margin: 0;">${w.review}</p>
                        </div>

                        ${userReviewHtml}
                        
                        <button class="btn-primary" style="margin-top: 2.5rem; width: 100%;">
                            <span class="material-symbols-outlined">check_circle</span>
                            Elegir este vino
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    selectWine(id) {
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
            <div class="wine-card" style="border: 2px solid var(--gold);">
                <div class="wine-info" style="padding: 1.5rem;">
                    <span class="wine-badge" style="position:static; margin-bottom:0.5rem; display:inline-block; border-radius: 4px;">✓ Su Elección</span>
                    <h4 class="wine-name" style="font-size: 1.5rem; margin: 0.5rem 0;">${wine.name}</h4>
                    <p class="wine-price" style="font-size: 1.3rem;">${wine.price}</p>
                </div>
            </div>
            <h3 class="step-title" style="font-size: 1.5rem; margin-top: 2rem; margin-bottom: 0.5rem; color: var(--gold);">¿Con qué maridamos?</h3>
            <p style="color: var(--text-cream); margin-bottom: 2rem; font-size: 0.95rem; font-style: italic;">Sugerencia de nuestra carta para este ${wine.category === 'VINOS TINTOS' ? 'tinto' : wine.category === 'VINOS BLANCOS' ? 'blanco' : 'espumoso'}</p>
            
            <div class="food-grid slide-up">
                ${foodSuggestions.map(food => `
                    <div class="food-suggestion-card" onclick="app.selectFood('${food.name}')">
                        <span class="material-symbols-outlined" style="color: var(--gold); font-size: 2rem; margin-bottom: 0.5rem;">restaurant</span>
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
        this.headerTitle.textContent = "Resumen del Sommelier";

        document.getElementById('summaryDisplay').innerHTML = `
            <div class="wine-card slide-up" style="background: rgba(30, 20, 10, 0.95);">
                <div class="wine-info" style="text-align: center;">
                    <span class="material-symbols-outlined" style="font-size: 4rem; color: var(--gold); margin-bottom: 1rem;">task_alt</span>
                    <h3 class="wine-name" style="font-size: 1.8rem; margin-bottom: 1rem;">Selección Confirmada</h3>
                    
                    <div style="text-align: left; background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px; margin-top: 1.5rem; border: 1px solid rgba(212, 175, 55, 0.2);">
                        <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                            <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold); margin-bottom: 0.5rem;">Vino Elegido</p>
                            <p style="font-weight: 700; font-size: 1.2rem; color: var(--text-cream);">${selectedWine.name}</p>
                            <p style="color: var(--gold); font-weight: 700;">${selectedWine.price}</p>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                            <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold); margin-bottom: 0.5rem;">Maridaje</p>
                            <p style="font-weight: 700; font-size: 1.2rem; color: var(--text-cream);">${selectedFood}</p>
                            <p style="color: var(--gold); font-weight: 700;">${foodPrice}</p>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 800; font-size: 1rem; color: var(--gold);">TOTAL ESTIMADO</span>
                            <span style="font-weight: 800; font-size: 1.8rem; color: var(--gold);">${total} €</span>
                        </div>
                    </div>

                    <button class="btn-primary" style="margin-top: 2rem; width: 100%;" onclick="app.finalizeSelection()">
                        Finalizar y mostrar mesa
                    </button>
                    <button class="btn-secondary" style="margin-top: 1rem;" onclick="app.renderFamilySelection()">
                        Cambiar selección
                    </button>
                </div>
            </div>
        `;
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
            let imgHtml = food.image ? `<img src="fotos/${food.image}" style="width:100%; height:180px; object-fit:cover; border-radius:12px 12px 0 0;" onerror="this.style.display='none'">` : '';
            return `
            <div class="wine-card">
                ${imgHtml}
                <div class="wine-info">
                    <h4 class="wine-name" style="font-size: 1.3rem; margin-bottom: 0.5rem;">${food.name}</h4>
                    <p style="color: var(--text-cream); font-size: 0.9rem; margin-bottom: 1rem; font-style: italic;">${food.description || ''}</p>
                    <p class="wine-price" style="font-size: 1.2rem;">${food.price}</p>
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
            let imgHtml = wine.image ? `<img src="fotos/${wine.image}" style="width:100%; height:200px; object-fit:cover; border-radius:12px 12px 0 0;" onerror="this.style.display='none'">` : '';
            let glassHtml = wine.glass_price ? `<span style="font-size: 0.85rem; color: #666; margin-left: 0.5rem;"> | Copa: <b>${wine.glass_price}</b></span>` : '';

            return `
            <div class="wine-card">
                ${imgHtml}
                <div class="wine-info" style="padding: 1.5rem;">
                    <span class="wine-badge" style="position:static; margin-bottom:0.5rem; display:inline-block; font-size: 0.7rem;">${wine.category}</span>
                    <h4 class="wine-name" style="font-size: 1.3rem; margin-bottom: 0.25rem;">${wine.name}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.75rem;">${wine.do}</p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; font-style: italic;">${wine.review || ''}</p>
                    <div>
                        <span class="wine-price" style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">${wine.price}</span>
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

// Estilos extra para los chips de filtro y ratings
const extraStyles = document.createElement('style');
extraStyles.textContent = `
    .badge-rating {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
    }

    .filter-chips-wrapper {
        width: 100vw;
        margin-left: calc(-50vw + 50%);
        overflow-x: auto;
        padding: 0 1rem;
        -webkit-overflow-scrolling: touch;
    }

    .filter-chips {
        display: flex;
        gap: 0.75rem;
        padding: 0.5rem 0;
        min-width: max-content;
    }

    .chip {
        padding: 0.6rem 1.25rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 100px;
        font-size: 0.9rem;
        font-weight: 600;
        color: #4b5563;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
    }

    .chip.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
        box-shadow: 0 4px 12px rgba(75, 1, 1, 0.2);
    }

    @media (max-width: 768px) {
        .filter-chips-wrapper {
            margin-bottom: 1rem;
        }
    }
`;
document.head.appendChild(extraStyles);

// Inicializar
window.addEventListener('DOMContentLoaded', () => {
    window.app = new SommelierApp();
    window.app.init();
});

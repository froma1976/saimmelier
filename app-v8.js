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
        this.headerTitle.textContent = "Asesor Sommelier AI";
        this.stepTitle.textContent = "¿Qué vamos a descorchar hoy?";

        const families = [
            {
                label: "Tinto",
                key: "VINOS TINTOS",
                icon: "wine_bar",
                desc: "Cuerpo, estructura y carácter",
                gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            },
            {
                label: "Blanco",
                key: "VINOS BLANCOS",
                icon: "glass_cup",
                desc: "Frescura, mineralidad y elegancia",
                gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
            },
            {
                label: "Espumoso",
                key: "ESPUMOSOS",
                icon: "liquor",
                desc: "Burbujas, celebración y finura",
                gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
            }
        ];

        this.optionsGrid.className = "character-grid-v2 slide-up";
        this.optionsGrid.innerHTML = families.map(f => `
            <button class="character-card" onclick="app.selectFamily('${f.key}')">
                <div class="character-gradient" style="background: ${f.gradient};"></div>
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
                    icon: "eco",
                    desc: "Tintos ligeros con acidez vibrante",
                    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                },
                {
                    label: "Equilibrado",
                    keys: ["crianza", "reserva", "equilibrado"],
                    icon: "balance",
                    desc: "Armonía entre fruta y madera",
                    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                },
                {
                    label: "Potente & Robusto",
                    keys: ["ribera", "toro", "cuerpo", "estructura"],
                    icon: "star",
                    desc: "Gran cuerpo y concentración",
                    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                }
            ];
        } else if (this.state.selection.family === "VINOS BLANCOS") {
            profiles = [
                {
                    label: "Seco & Mineral",
                    keys: ["seco", "mineral", "godello"],
                    icon: "water_drop",
                    desc: "Frescura atlántica y salinidad",
                    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                },
                {
                    label: "Aromático",
                    keys: ["aromático", "floral", "albariño"],
                    icon: "local_florist",
                    desc: "Expresión frutal y flores blancas",
                    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
                },
                {
                    label: "Frutal & Goloso",
                    keys: ["frutal", "albariño", "treixadura"],
                    icon: "bakery_dining",
                    desc: "Untuoso con fruta madura",
                    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
                }
            ];
        } else {
            profiles = [
                {
                    label: "Clásico Brut",
                    keys: ["brut", "reserva"],
                    icon: "auto_awesome",
                    desc: "Elegancia y burbuja fina",
                    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
                },
                {
                    label: "Rosé & Moderno",
                    keys: ["rosé", "fresco"],
                    icon: "local_florist",
                    desc: "Frutas rojas y frescura",
                    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)"
                }
            ];
        }

        this.optionsGrid.className = "character-grid-v2 slide-up";
        this.optionsGrid.innerHTML = profiles.map(p => `
            <button class="character-card" onclick="app.selectProfile('${p.keys.join(',')}')">
                <div class="character-gradient" style="background: ${p.gradient};"></div>
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
                icon: "sunny",
                desc: "Disfrutar sin complicaciones, vinos accesibles y versátiles",
                gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
            },
            {
                label: "Experiencia Especial",
                sublabel: "30€ - 70€",
                range: [30, 70],
                icon: "auto_awesome",
                desc: "Sorprender y deleitar, reservas y crianzas memorables",
                gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            },
            {
                label: "Vino de Autor",
                sublabel: "+70€",
                range: [70, 2000],
                icon: "workspace_premium",
                desc: "Exclusividad y prestigio, gran reserva y ediciones limitadas",
                gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
            }
        ];

        this.optionsGrid.className = "character-grid-v2 slide-up";
        this.optionsGrid.innerHTML = options.map(o => `
            <button class="character-card" onclick="app.selectOccasion(${o.range[0]}, ${o.range[1]})">
                <div class="character-gradient" style="background: ${o.gradient};"></div>
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

        // Ranking por afinidad + Prioridad de Datos (Ratings y Reviews)
        filtered.sort((a, b) => {
            let scoreA = profileKeys.reduce((acc, k) => {
                const searchStr = (a.name + " " + a.review + " " + (a.do || "")).toLowerCase();
                return acc + (searchStr.includes(k.toLowerCase()) ? 2 : 0);
            }, 0);
            let scoreB = profileKeys.reduce((acc, k) => {
                const searchStr = (b.name + " " + b.review + " " + (b.do || "")).toLowerCase();
                return acc + (searchStr.includes(k.toLowerCase()) ? 2 : 0);
            }, 0);

            // BOOST CRÍTICO: Si tiene ratings o si tiene reviews de usuarios, subirlo al top
            if (a.ratings) scoreA += 10;
            if (b.ratings) scoreB += 10;
            if (a.user_reviews && a.user_reviews.length > 0) scoreA += 10;
            if (b.user_reviews && b.user_reviews.length > 0) scoreB += 10;

            return scoreB - scoreA;
        });

        this.renderWineResults(filtered.slice(0, 2));
    }

    renderWineResults(wines) {
        this.showSection('results');
        if (this.btnBack) this.btnBack.style.display = 'flex';

        if (wines.length === 0) {
            this.wineResults.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">No se han encontrado vinos que coincidan exactamente. Pruebe a ampliar el presupuesto.</p>`;
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
                ratingsHtml = `<span class="badge-rating" style="background:rgba(0,0,0,0.03); color:var(--text-muted);">Selección de Autor</span>`;
            }

            // Recopilar una Reseña de Usuario con diseño de burbuja
            let userReviewHtml = '';
            if (w.user_reviews && w.user_reviews.length > 0) {
                const rev = w.user_reviews[0];
                userReviewHtml = `
                    <div style="margin-top: 1.5rem; background: #fafafa; padding: 1.25rem; border-radius: 1.5rem; position: relative; border: 1px solid #eee;">
                        <p style="font-weight: 800; font-size: 0.7rem; color: #aaa; text-transform:uppercase; letter-spacing:0.1em; margin-bottom: 0.5rem; display:flex; align-items:center; gap:6px;">
                            <span class="material-symbols-outlined" style="font-size:1.1rem; color: #4caf50;">verified</span> Opinión Verificada
                        </p>
                        <p style="font-style: italic; font-size: 0.95rem; line-height: 1.5; color: #333;">"${rev.text}"</p>
                        <p style="font-size: 0.8rem; font-weight: 700; margin-top: 0.75rem; color: var(--primary);">— ${rev.author}</p>
                    </div>
                `;
            }

            // Imagen del Vino (Si existe, sino usar tarjeta standard)
            let imageHtml = '';
            if (w.image) {
                imageHtml = `<div style="width:100%; height:250px; overflow:hidden; border-radius:12px 12px 0 0;">
                    <img src="fotos/${w.image}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'">
                </div>`;
            }

            // Precio por copa
            let glassPriceHtml = '';
            if (w.glass_price) {
                glassPriceHtml = `<span style="font-size: 0.9rem; font-weight: 600; background: #f3f4f6; color: #4b5563; padding: 4px 8px; border-radius: 4px; margin-left: 0.5rem; vertical-align: middle;">Copa: ${w.glass_price}</span>`;
            }

            return `
                <div class="wine-card slide-up" onclick="app.selectWine('${w.id}')" style="cursor:pointer; margin-bottom: 2rem;">
                    ${isTop ? '<div class="wine-badge" style="position: absolute; top: 1rem; right: 1rem; z-index: 10;">MEJOR VALORADO</div>' : ''}
                    ${imageHtml}
                    
                    <div class="wine-info" style="padding: 2rem;">
                        <h4 class="wine-name" style="font-size: 1.8rem; margin-bottom: 0.5rem; line-height: 1.2;">${w.name}</h4>
                        <p class="wine-meta" style="font-size: 1rem; margin-bottom: 1.5rem; color: var(--text-secondary);">${w.do}</p>
                        
                        <div class="ratings-container" style="margin: 1.5rem 0; display: flex; flex-wrap: wrap; gap: 0.5rem;">${ratingsHtml}</div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <span class="wine-price" style="font-size: 2rem; font-weight: 800; color: var(--primary);">${w.price}</span>
                            ${glassPriceHtml}
                        </div>
                        
                        <div class="sommelier-review-box" style="margin: 1.5rem 0;">
                            <p style="margin: 0;">${w.review}</p>
                        </div>

                        ${userReviewHtml}
                        
                        <button class="btn-primary" style="margin-top: 2rem; width: 100%;">
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
                // Tintos: Carnes, embutidos, quesos curados
                const tintoKeywords = ['jamón', 'ibérico', 'cecina', 'queso', 'tabla', 'lacón', 'oreja', 'croqueta', 'rabo'];
                foodSuggestions = allFood.filter(f =>
                    tintoKeywords.some(kw => f.name.toLowerCase().includes(kw))
                ).slice(0, 4);

            } else if (wine.category === "VINOS BLANCOS") {
                // Blancos: Pescados, mariscos, ensaladas, quesos frescos
                const blancoKeywords = ['salmón', 'anchoa', 'sardina', 'ventresca', 'ensalada', 'burrata', 'tosta'];
                foodSuggestions = allFood.filter(f =>
                    blancoKeywords.some(kw => f.name.toLowerCase().includes(kw))
                ).slice(0, 4);

            } else if (wine.category === "ESPUMOSOS") {
                // Espumosos: Aperitivos, tostas, ensaladas, quesos suaves
                const espumosoKeywords = ['tosta', 'ensalada', 'burrata', 'salmón', 'anchoa', 'jamón'];
                foodSuggestions = allFood.filter(f =>
                    espumosoKeywords.some(kw => f.name.toLowerCase().includes(kw))
                ).slice(0, 4);
            }
        }

        // ESTRATEGIA 3: Fallback - platos populares si aún no hay suficientes
        if (foodSuggestions.length === 0) {
            const fallbackIds = ['FOOD_005', 'FOOD_003', 'FOOD_001', 'FOOD_011'];
            foodSuggestions = fallbackIds
                .map(id => this.menu.find(item => item.id === id))
                .filter(item => item);
        }

        // Limitar a 4 sugerencias únicas
        foodSuggestions = [...new Map(foodSuggestions.map(f => [f.id, f])).values()].slice(0, 4);

        this.finalDisplay.innerHTML = `
            <div class="wine-card" style="margin-bottom: 2rem; border: 2px solid var(--primary); max-width: 100%;">
                <div class="wine-info" style="padding: 1.5rem;">
                    <span class="wine-badge" style="position:static; margin-bottom:0.5rem; display:inline-block; background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 100px; font-size: 0.75rem;">✓ Su Elección</span>
                    <h4 class="wine-name" style="font-size: 1.5rem; margin: 0.5rem 0;">${wine.name}</h4>
                    <p class="wine-price" style="font-size: 1.3rem; font-weight: 700; color: var(--primary); margin: 0;">${wine.price}</p>
                </div>
            </div>
            <h3 class="step-title" style="font-size: 1.5rem; margin-top: 1rem; margin-bottom: 0.5rem;">¿Con qué maridamos?</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; padding: 0 1rem; font-size: 0.95rem;">Recomendación del Chef para este ${wine.category === 'VINOS TINTOS' ? 'tinto' : wine.category === 'VINOS BLANCOS' ? 'blanco' : 'espumoso'}</p>
            <div class="character-grid-v2">
                ${foodSuggestions.map((food, i) => {
            const gradients = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
            ];
            return `
                    <button class="character-card" onclick="app.selectFood('${food.name}')">
                        <div class="character-gradient" style="background: ${gradients[i % 4]};"></div>
                        <div class="character-content">
                            <span class="material-symbols-outlined character-icon">restaurant</span>
                            <h3 class="character-title" style="font-size: 1.2rem;">${food.name}</h3>
                            <p class="character-sublabel">${food.price}</p>
                        </div>
                    </button>
                `;
        }).join('')}
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

        // Buscar el plato seleccionado en el menú para obtener su precio
        const foodItem = this.menu.find(item => item.name === selectedFood);
        const foodPrice = foodItem ? foodItem.price : '0,00 €';

        // Calcular el total
        const winePrice = parseFloat(selectedWine.price.replace('€', '').trim().replace(',', '.'));
        const foodPriceNum = parseFloat(foodPrice.replace('€', '').trim().replace(',', '.'));
        const total = (winePrice + foodPriceNum).toFixed(2).replace('.', ',');

        this.showSection('summary');
        this.headerTitle.textContent = "Resumen del Sommelier";

        document.getElementById('summaryDisplay').innerHTML = `
            <div class="action-panel fade-in">
                <span class="material-symbols-outlined panel-icon" style="font-size: 4rem; color: var(--primary);">task_alt</span>
                <h3 class="panel-title" style="font-size: 1.8rem; margin-bottom: 0.5rem; font-weight: 700;">Cata Confirmada</h3>
                <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 2rem;">Su selección ha sido procesada</p>
                
                <div style="text-align: left; background: white; padding: 2rem; border-radius: var(--radius-lg); margin-top: 1.5rem; border: 1px solid rgba(0,0,0,0.08); box-shadow: var(--shadow-sm);">
                    <div style="margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.08);">
                        <p style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 800;">Vino Elegido</p>
                        <p style="font-weight: 700; font-size: 1.2rem; color: var(--text-primary); margin-bottom: 0.25rem;">${selectedWine.name}</p>
                        <p style="font-size: 1.1rem; color: var(--primary); font-weight: 700;">${selectedWine.price}</p>
                    </div>
                    
                    <div style="margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.08);">
                        <p style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 800;">Maridaje</p>
                        <p style="font-weight: 700; font-size: 1.2rem; color: var(--text-primary); margin-bottom: 0.25rem;">${selectedFood}</p>
                        <p style="font-size: 1.1rem; color: var(--primary); font-weight: 700;">${foodPrice}</p>
                    </div>
                    
                    <div style="background: var(--primary-light); padding: 1.5rem; border-radius: var(--radius-md); border: 2px solid var(--primary);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <p style="font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-primary); margin: 0; font-weight: 800;">Total a Pagar</p>
                            <p style="font-size: 2rem; color: var(--primary); margin: 0; font-weight: 800;">${total} €</p>
                        </div>
                    </div>
                </div>
                
                <p style="margin-top: 2rem; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                    SIAmmelier Dobao ha procesado su selección. Disfrute de la experiencia.
                </p>
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
                <div class="wine-info" style="padding: 1.5rem;">
                    <h4 class="wine-name" style="font-size: 1.3rem; margin-bottom: 0.5rem;">${food.name}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">${food.description || ''}</p>
                    <p class="wine-price" style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">${food.price}</p>
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

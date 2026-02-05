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
            { label: "Tinto", key: "VINOS TINTOS", icon: "wine_bar" },
            { label: "Blanco", key: "VINOS BLANCOS", icon: "glass_cup" },
            { label: "Espumoso", key: "ESPUMOSOS", icon: "liquor" }
        ];

        this.optionsGrid.className = "options-grid slide-up";
        this.optionsGrid.innerHTML = families.map(f => `
            <button class="option-button ${this.state.selection.family === f.key ? 'selected' : ''}" 
                    onclick="app.selectFamily('${f.key}')">
                <div class="option-content">
                    <span class="material-symbols-outlined">${f.icon}</span>
                    <p class="option-text">${f.label}</p>
                </div>
                <span class="material-symbols-outlined option-check">check_circle</span>
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
        this.stepTitle.textContent = "Presupuesto aproximado";
        this.updateProgress(2);

        const options = [
            { label: "Selección Diaria (Hasta 30€)", range: [0, 30], icon: "euro_symbol" },
            { label: "Ocasión Especial (30€ - 70€)", range: [30, 70], icon: "celebration" },
            { label: "Joyas de la Bodega (+70€)", range: [70, 2000], icon: "diamond" }
        ];

        this.optionsGrid.className = "options-grid slide-up";
        this.optionsGrid.innerHTML = options.map(o => `
            <button class="option-button" onclick="app.selectOccasion(${o.range[0]}, ${o.range[1]})">
                <div class="option-content">
                    <span class="material-symbols-outlined">${o.icon}</span>
                    <p class="option-text">${o.label}</p>
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

            return `
                <div class="wine-card slide-up" onclick="app.selectWine('${w.id}')" style="cursor:pointer; margin-bottom: 2rem;">
                    ${isTop ? '<div class="wine-badge" style="position: absolute; top: 1rem; right: 1rem; z-index: 10;">MEJOR VALORADO</div>' : ''}
                    
                    <div class="wine-info" style="padding: 2rem;">
                        <h4 class="wine-name" style="font-size: 1.8rem; margin-bottom: 0.5rem; line-height: 1.2;">${w.name}</h4>
                        <p class="wine-meta" style="font-size: 1rem; margin-bottom: 1.5rem; color: var(--text-secondary);">${w.do}</p>
                        
                        <div class="ratings-container" style="margin: 1.5rem 0; display: flex; flex-wrap: wrap; gap: 0.5rem;">${ratingsHtml}</div>
                        
                        <p class="wine-price" style="font-size: 2rem; font-weight: 800; color: var(--primary); margin-bottom: 1.5rem;">${w.price}</p>
                        
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

        // Obtener tags de maridaje del vino
        const pairingTags = wine.pairing_tags || wine.vivino_food || [];

        if (pairingTags.length > 0) {
            // Filtrar platos de comida del menú que tengan tags coincidentes
            const foodItems = this.menu.filter(item => item.category && item.category.includes('TAPEO'));

            foodSuggestions = foodItems.filter(food => {
                if (!food.pairing_tags) return false;
                // Verificar si hay algún tag en común
                return food.pairing_tags.some(tag =>
                    pairingTags.some(wineTag =>
                        wineTag.toLowerCase().includes(tag.toLowerCase()) ||
                        tag.toLowerCase().includes(wineTag.toLowerCase())
                    )
                );
            }).slice(0, 4); // Máximo 4 sugerencias
        }

        // Si no hay coincidencias, ofrecer platos populares
        if (foodSuggestions.length === 0) {
            const popularDishes = [
                'FOOD_005', // Jamón ibérico
                'FOOD_003', // Tabla de Quesos
                'FOOD_001', // Tabla Mixta pueblo
                'FOOD_011'  // Ración de Croquetas
            ];
            foodSuggestions = popularDishes
                .map(id => this.menu.find(item => item.id === id))
                .filter(item => item);
        }

        this.finalDisplay.innerHTML = `
            <div class="wine-card" style="margin-bottom: 2rem; border-color: var(--primary); max-width: 100%;">
                <div class="wine-info" style="padding: 1.5rem;">
                    <span class="wine-badge" style="position:static; margin-bottom:0.5rem; display:inline-block;">Su Elección</span>
                    <h4 class="wine-name" style="font-size: 1.4rem;">${wine.name}</h4>
                    <p class="wine-price">${wine.price}</p>
                </div>
            </div>
            <h3 class="step-title" style="font-size: 1.5rem; margin-top: 2rem;">¿Con qué maridamos?</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; padding: 0 1rem;">Recomendación del Chef</p>
            <div class="options-grid">
                ${foodSuggestions.map(food => `
                    <button class="option-button" onclick="app.selectFood('${food.name}')" style="text-align: left;">
                        <div class="option-content">
                            <span class="material-symbols-outlined">restaurant</span>
                            <div>
                                <p class="option-text" style="margin: 0; font-weight: 600;">${food.name}</p>
                                <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">${food.price}</p>
                            </div>
                        </div>
                    </button>
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
        this.showSection('summary');
        this.headerTitle.textContent = "Resumen del Sommelier";

        document.getElementById('summaryDisplay').innerHTML = `
            <div class="action-panel fade-in">
                <span class="material-symbols-outlined panel-icon" style="font-size: 4rem;">task_alt</span>
                <h3 class="panel-title" style="font-size: 1.5rem; margin-bottom: 1rem;">Cata Confirmada</h3>
                
                <div style="text-align: left; background: var(--background-light); padding: 1.5rem; border-radius: 1.5rem; margin-top: 1.5rem; border: 1px solid rgba(75,1,1,0.05);">
                    <div style="margin-bottom: 1.5rem;">
                        <p style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 0.25rem;">Vino Elegido</p>
                        <p style="font-weight: 700; font-size: 1.1rem; color: var(--primary);">${selectedWine.name}</p>
                        <p style="font-size: 0.9rem;">${selectedWine.price}</p>
                    </div>
                    
                    <div>
                        <p style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 0.25rem;">Maridaje</p>
                        <p style="font-weight: 700; font-size: 1.1rem; color: var(--primary);">${selectedFood}</p>
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
}

// Estilo extra para los badges de puntuación
const styleRatings = document.createElement('style');
styleRatings.textContent = `
    .badge-rating {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
    }
`;
document.head.appendChild(styleRatings);

// Inicializar
window.addEventListener('DOMContentLoaded', () => {
    window.app = new SommelierApp();
    window.app.init();
});

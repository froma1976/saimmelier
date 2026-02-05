/**
 * SIAmmelier Dobao - Stitch Edition
 * Lógica adaptada al diseño minimalista y moderno de Stitch.
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

        // DOM Elements
        this.optionsGrid = document.getElementById('optionsGrid');
        this.headerTitle = document.getElementById('headerTitle');
        this.stepTitle = document.getElementById('stepTitle');
        this.wineResults = document.getElementById('wineResults');
        this.finalDisplay = document.getElementById('finalDisplay');
        this.btnBack = document.getElementById('btnBack');
        this.btnNext = document.getElementById('btnNext');
        this.currentStepText = document.getElementById('currentStep');
        this.pairingConfirmArea = document.getElementById('pairingConfirmArea');

        this.sections = {
            selection: document.getElementById('step-selection'),
            results: document.getElementById('step-results'),
            final: document.getElementById('step-final'),
            summary: document.getElementById('step-summary')
        };

        this.init();
    }

    async init() {
        try {
            const response = await fetch('menu.json');
            this.menu = await response.json();
            this.renderFamilySelection();
        } catch (error) {
            console.error('Error al iniciar:', error);
        }
    }

    // --- Navegación ---

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

    // --- RENDERERS ---

    renderFamilySelection() {
        this.state.currentStep = 'family';
        this.showSection('selection');
        this.updateProgress(1);
        if (this.btnBack) this.btnBack.style.display = 'none';
        if (this.btnNext) this.btnNext.style.display = 'none';

        this.headerTitle.textContent = "AI Sommelier Advisor";
        this.stepTitle.textContent = "What are we pouring today?";

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

        this.stepTitle.textContent = "Describe the character";

        let profiles = [];
        if (this.state.selection.family === "VINOS TINTOS") {
            profiles = [
                { label: "Fresco / Ligero", keys: ["rioja", "elegante", "fino"], icon: "eco" },
                { label: "Intenso / Robusto", keys: ["ribera", "toro", "cuerpo", "estructura"], icon: "star" }
            ];
        } else if (this.state.selection.family === "VINOS BLANCOS") {
            profiles = [
                { label: "Seco / Mineral", keys: ["seco", "mineral"], icon: "mountain_flag" },
                { label: "Frutal / Goloso", keys: ["frutal", "albariño", "godello"], icon: "Bakery_Dining" }
            ];
        } else {
            profiles = [
                { label: "Clásico / Brut", keys: ["brut", "reserva"], icon: "auto_awesome" },
                { label: "Rosé / Moderno", keys: ["rosé", "fresco"], icon: "local_florist" }
            ];
        }

        this.optionsGrid.className = "character-grid slide-up";
        this.optionsGrid.innerHTML = profiles.map(p => `
            <button class="character-option" onclick="app.selectProfile('${p.keys.join(',')}')">
                <span class="material-symbols-outlined">${p.icon}</span>
                <p class="character-label">${p.label}</p>
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
            { label: "Joyas de la Bodega (+70€)", range: [70, 1000], icon: "diamond" }
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
            const price = parseFloat(w.price.replace('€', '').trim().replace(',', '.'));
            return price >= occasion[0] && price <= occasion[1];
        });

        // Ranking por afinidad
        filtered.sort((a, b) => {
            let scoreA = profileKeys.reduce((acc, k) => {
                const searchStr = (a.name + " " + a.review + " " + a.do).toLowerCase();
                return acc + (searchStr.includes(k.toLowerCase()) ? 1 : 0);
            }, 0);
            let scoreB = profileKeys.reduce((acc, k) => {
                const searchStr = (b.name + " " + b.review + " " + b.do).toLowerCase();
                return acc + (searchStr.includes(k.toLowerCase()) ? 1 : 0);
            }, 0);
            return scoreB - scoreA;
        });

        this.renderWineResults(filtered.slice(0, 6));
    }

    renderWineResults(wines) {
        this.showSection('results');
        if (this.btnBack) this.btnBack.style.display = 'flex';

        if (wines.length === 0) {
            this.wineResults.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">No se han encontrado vinos exactos. Intente ampliar el presupuesto.</p>`;
            return;
        }

        // Usamos una imagen genérica elegante si no hay fotos específicas
        const placeholderImg = "https://images.unsplash.com/photo-1510850463344-8b577003923a?auto=format&fit=crop&q=80&w=400";

        this.wineResults.innerHTML = wines.map((w, i) => {
            const isTop = (i === 0);
            return `
                <div class="wine-card slide-up" onclick="app.selectWine('${w.id}')">
                    <div class="wine-image-container">
                        ${isTop ? '<div class="wine-badge">AI Pick</div>' : ''}
                        <img src="${placeholderImg}" class="wine-image" alt="${w.name}">
                    </div>
                    <div class="wine-info">
                        <h4 class="wine-name">${w.name}</h4>
                        <p class="wine-meta">${w.do}</p>
                        <p class="wine-price">${w.price}</p>
                        <p class="wine-notes">${w.review.substring(0, 45)}...</p>
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

        this.finalDisplay.innerHTML = `
            <div class="wine-card" style="margin-bottom: 2rem; border-color: var(--primary);">
                <div class="wine-info">
                    <span class="wine-badge" style="position:static; margin-bottom:0.5rem; display:inline-block;">Seleccionado</span>
                    <h4 class="wine-name" style="font-size: 1.5rem;">${wine.name}</h4>
                    <p class="wine-price">${wine.price}</p>
                </div>
            </div>
            <h3 class="step-title" style="font-size: 1.5rem; margin-top: 2rem;">¿Con qué acompañamos?</h3>
            <div class="options-grid">
                ${wine.pairing_suggestions.map(f => `
                    <button class="option-button" onclick="app.selectFood('${f.name}')">
                        <div class="option-content">
                            <span class="material-symbols-outlined">restaurant</span>
                            <p class="option-text">${f.name}</p>
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
        this.headerTitle.textContent = "Resumen de Selección";

        document.getElementById('summaryDisplay').innerHTML = `
            <div class="action-panel fade-in">
                <span class="material-symbols-outlined panel-icon" style="font-size: 4rem;">verified_user</span>
                <h3 class="panel-title" style="font-size: 1.5rem; margin-bottom: 1rem;">Pedido Confirmado</h3>
                
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
                    Muestre este resumen al sommelier para proceder con la cata guiada.
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

const app = new SommelierApp();

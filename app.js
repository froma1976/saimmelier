/**
 * SIAmmelier Dobao - Edición "La Carta Privada"
 * Experiencia visual, táctil y formal en español.
 */

class SommelierApp {
    constructor() {
        this.menu = [];
        this.state = {
            currentStep: 'family', // family -> profile -> occasion -> results -> final
            selection: {
                family: null,
                profileKeys: null, // Guardamos las keys del perfil seleccionado
                occasion: null,    // Guardamos el rango de precios
                selectedWine: null,
                selectedFood: null
            },
            history: [] // For back button tracking
        };

        // DOM Elements
        this.optionsGrid = document.getElementById('optionsGrid');
        this.stepTitle = document.getElementById('stepTitle');
        this.stepSubtitle = document.getElementById('stepSubtitle');
        this.wineResults = document.getElementById('wineResults');
        this.finalDisplay = document.getElementById('finalDisplay');
        this.btnBack = document.getElementById('btnBack');
        this.pairingConfirmArea = document.getElementById('pairingConfirmArea');

        // Layout Steps
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

    // --- Navegación y Renderizado ---

    showSection(sectionKey) {
        Object.values(this.sections).forEach(s => s.classList.add('hidden'));
        this.sections[sectionKey].classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderFamilySelection() {
        this.state.currentStep = 'family';
        this.showSection('selection');
        this.btnBack.style.display = 'none';

        this.stepTitle.textContent = "Familia de Vino";
        this.stepSubtitle.textContent = "Elija el carácter de su experiencia";

        const options = [
            { label: "Vinos Tintos", key: "VINOS TINTOS", img: "https://images.unsplash.com/photo-1510850463344-8b577003923a?auto=format&fit=crop&q=80&w=800" },
            { label: "Vinos Blancos", key: "VINOS BLANCOS", img: "https://images.unsplash.com/photo-1559158517-733075677864?auto=format&fit=crop&q=80&w=800" },
            { label: "Espumosos", key: "ESPUMOSOS", img: "https://images.unsplash.com/photo-1506377247377-2a5b3b0ca7ef?auto=format&fit=crop&q=80&w=800" }
        ];

        this.optionsGrid.innerHTML = '';
        options.forEach(opt => {
            const card = this.createVisualCard(opt.label, opt.img, () => this.selectFamily(opt.key));
            this.optionsGrid.appendChild(card);
        });
    }

    selectFamily(key) {
        this.state.selection.family = key;
        this.renderProfileSelection();
    }

    renderProfileSelection() {
        this.state.currentStep = 'profile';
        this.btnBack.style.display = 'block';

        let profiles = [];
        if (this.state.selection.family === "VINOS TINTOS") {
            this.stepTitle.textContent = "Perfil de Tinto";
            profiles = [
                { label: "Elegante y Equilibrado", keys: ["rioja", "elegante", "fino"], img: "https://images.unsplash.com/photo-1506377247377-2a5b3b0ca7ef?auto=format&fit=crop&q=80&w=800" },
                { label: "Cuerpo y Estructura", keys: ["ribera", "toro", "cuerpo", "estructura"], img: "https://images.unsplash.com/photo-1516594915697-8aeb3b1c14ea?auto=format&fit=crop&q=80&w=800" },
                { label: "Intenso y Frutal", keys: ["mencía", "fruta", "sacra", "bierzo"], img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800" }
            ];
        } else if (this.state.selection.family === "VINOS BLANCOS") {
            this.stepTitle.textContent = "Perfil de Blanco";
            profiles = [
                { label: "Frutal y Goloso", keys: ["albariño", "godello", "frutal"], img: "https://images.unsplash.com/photo-1474724911195-2799d359d61e?auto=format&fit=crop&q=80&w=800" },
                { label: "Mineral y Seco", keys: ["rueda", "verdejo", "seco", "mineral"], img: "https://images.unsplash.com/photo-1596751303335-ca42b3ca50c1?auto=format&fit=crop&q=80&w=800" },
                { label: "Fresco y Cítrico", keys: ["fresco", "cítrico", "joven"], img: "https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&q=80&w=800" }
            ];
        } else {
            this.stepTitle.textContent = "Estilo de Burbujas";
            profiles = [
                { label: "Clásico y Fresco", keys: ["fresco", "cava"], img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800" },
                { label: "Complejo y Reserva", keys: ["lías", "champagne", "reserva"], img: "https://images.unsplash.com/photo-1543791187-df796fa11835?auto=format&fit=crop&q=80&w=800" },
                { label: "Rosado Radiante", keys: ["rosé", "rosado"], img: "https://images.unsplash.com/photo-1558220811-399fb8499292?auto=format&fit=crop&q=80&w=800" }
            ];
        }

        this.optionsGrid.innerHTML = '';
        profiles.forEach(p => {
            const card = this.createVisualCard(p.label, p.img, () => this.selectProfile(p.keys));
            this.optionsGrid.appendChild(card);
        });
    }

    selectProfile(keys) {
        this.state.selection.profileKeys = keys;
        this.renderOccasionSelection();
    }

    renderOccasionSelection() {
        this.state.currentStep = 'occasion';
        this.stepTitle.textContent = "¿Para qué ocasión?";
        this.stepSubtitle.textContent = "El momento define la elección";

        const occasions = [
            { label: "Descubrimiento Cotidiano", priceRange: "low", desc: "Vinos excelentes para disfrutar hoy mismo.", img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800" },
            { label: "Cena Especial", priceRange: "mid", desc: "Etiquetas con mayor complejidad y crianza.", img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800" },
            { label: "Experiencia Premium", priceRange: "high", desc: "Vinos de culto y grandes pagos.", img: "https://images.unsplash.com/photo-1504279577054-1235069775fb?auto=format&fit=crop&q=80&w=800" }
        ];

        this.optionsGrid.innerHTML = '';
        occasions.forEach(occ => {
            const card = this.createVisualCard(occ.label, occ.img, () => this.filterWines(occ.priceRange));
            // Añadir descripción pequeña debajo del título en la tarjeta
            const title = card.querySelector('h3');
            const desc = document.createElement('p');
            desc.textContent = occ.desc;
            desc.style.fontSize = "0.8rem";
            desc.style.fontWeight = "300";
            desc.style.marginTop = "0.5rem";
            title.after(desc);

            this.optionsGrid.appendChild(card);
        });
    }

    createVisualCard(label, imgUrl, action) {
        const div = document.createElement('div');
        div.className = 'visual-option';
        div.innerHTML = `
            <div class="option-overlay">
                <h3>${label}</h3>
            </div>
        `;
        div.onclick = action;
        return div;
    }

    filterWines(priceRange) {
        const keywords = this.state.selection.profileKeys;

        // Función para limpiar precio y convertir a número
        const getPrice = (priceStr) => parseFloat(priceStr.replace(' €', '').replace(',', '.'));

        const query = this.menu.filter(w => {
            const text = (w.review + " " + (w.do || "") + " " + (w.category || "") + " " + (w.name || "")).toLowerCase();
            const isType = w.category === this.state.selection.family;

            // 1. Filtro de Palabras Clave (Perfil)
            const matchesProfile = keywords.some(k => text.includes(k.toLowerCase()));

            // 2. Filtro de Precio (Ocasión)
            const price = getPrice(w.price);
            let matchesPrice = false;
            if (priceRange === 'low') matchesPrice = price < 25;
            else if (priceRange === 'mid') matchesPrice = price >= 25 && price <= 50;
            else if (priceRange === 'high') matchesPrice = price > 50;

            return isType && matchesProfile && matchesPrice;
        }).sort((a, b) => {
            // Ordenar por rating si tienen, si no por precio (descendente para premium, ascendente para value)
            const ratingA = a.ratings ? (a.ratings.critics_avg || a.ratings.vivino * 20) : 0;
            const ratingB = b.ratings ? (b.ratings.critics_avg || b.ratings.vivino * 20) : 0;
            return ratingB - ratingA;
        }).slice(0, 3);

        // Si no hay resultados exactos, intentar relajar el filtro de precio para no dar vacío
        if (query.length === 0) {
            const fallbackQuery = this.menu.filter(w => {
                const text = (w.review + " " + (w.do || "") + " " + (w.category || "")).toLowerCase();
                const isType = w.category === this.state.selection.family;
                const matchesProfile = keywords.some(k => text.includes(k.toLowerCase()));
                return isType && matchesProfile;
            }).slice(0, 3);
            this.renderResults(fallbackQuery);
        } else {
            this.renderResults(query);
        }
    }

    renderResults(wines) {
        this.showSection('results');
        this.wineResults.innerHTML = '';

        if (wines.length === 0) {
            this.wineResults.innerHTML = '<p style="text-align:center; padding: 5rem;">No hemos encontrado botellas que coincidan exactamente con estos criterios en nuestra cava privada.</p>';
            return;
        }

        // Mostrar solo 2 opciones: La Recomendación y la Alternativa
        const topSelections = wines.slice(0, 2);

        topSelections.forEach((wine, index) => {
            const card = document.createElement('div');
            card.className = 'wine-card';
            const label = index === 0 ? "NUESTRA RECOMENDACIÓN" : "EXCELENTE ALTERNATIVA";
            const borderStyle = index === 0 ? "border: 2px solid var(--gold);" : "border: 1px solid var(--gold-dim);";

            // Crear sección de ratings si existen
            const ratingsSection = wine.ratings ? `
                <div style="display: flex; gap: 1.5rem; justify-content: center; margin: 1.5rem 0; padding: 1rem; background: rgba(212, 175, 55, 0.05); border-left: 3px solid var(--champagne-gold);">
                    ${wine.ratings.vivino ? `<div style="text-align: center;"><div style="font-size: 0.7rem; color: var(--champagne-light); letter-spacing: 2px;">VIVINO</div><div style="font-size: 1.3rem; color: var(--champagne-gold); font-weight: 700;">${wine.ratings.vivino}/5</div></div>` : ''}
                    ${wine.ratings.parker ? `<div style="text-align: center;"><div style="font-size: 0.7rem; color: var(--champagne-light); letter-spacing: 2px;">PARKER</div><div style="font-size: 1.3rem; color: var(--champagne-gold); font-weight: 700;">${wine.ratings.parker}</div></div>` : ''}
                    ${wine.ratings.penin ? `<div style="text-align: center;"><div style="font-size: 0.7rem; color: var(--champagne-light); letter-spacing: 2px;">PEÑÍN</div><div style="font-size: 1.3rem; color: var(--champagne-gold); font-weight: 700;">${wine.ratings.penin}</div></div>` : ''}
                    ${wine.ratings.spectator ? `<div style="text-align: center;"><div style="font-size: 0.7rem; color: var(--champagne-light); letter-spacing: 2px;">SPECTATOR</div><div style="font-size: 1.3rem; color: var(--champagne-gold); font-weight: 700;">${wine.ratings.spectator}</div></div>` : ''}
                </div>
            ` : '';

            // Crear sección de reseñas si existen
            const reviewsSection = wine.user_reviews && wine.user_reviews.length > 0 ? `
                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(212, 175, 55, 0.15);">
                    <h4 style="font-size: 0.9rem; color: var(--champagne-gold); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 1.5rem; text-align: center;">Opiniones de Expertos</h4>
                    ${wine.user_reviews.slice(0, 3).map(review => `
                        <div style="margin-bottom: 1.2rem; padding: 1rem; background: rgba(107, 26, 26, 0.1); border-left: 2px solid rgba(212, 175, 55, 0.3);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-size: 0.85rem; color: var(--champagne-light); font-weight: 600;">${review.author}</span>
                                <span style="color: var(--champagne-gold); font-size: 0.9rem;">★ ${review.rating}/5</span>
                            </div>
                            <p style="font-size: 0.9rem; color: var(--ivory-warm); font-style: italic; line-height: 1.6; margin: 0;">"${review.text}"</p>
                        </div>
                    `).join('')}
                </div>
            ` : '';

            card.style = borderStyle;
            card.innerHTML = `
                <div class="wine-info">
                    <span class="wine-category" style="color: var(--champagne-gold); font-weight: 800; font-size: 0.8rem; letter-spacing: 2px;">${label}</span>
                    <br>
                    <span class="wine-category">${wine.category} — ${wine.do}</span>
                    <h3 class="wine-name" style="font-size: 2.2rem;">${wine.name}</h3>
                    ${ratingsSection}
                    <p class="wine-review">"${wine.review}"</p>
                    ${reviewsSection}
                    <p class="wine-price">${wine.price}</p>
                    <button class="btn-formal" onclick="app.selectWine('${wine.id}')">Seleccionar</button>
                </div>
            `;
            this.wineResults.appendChild(card);
        });
    }

    selectWine(wineId) {
        const wine = this.menu.find(w => w.id === wineId);
        this.state.selection.selectedWine = wine;
        this.renderPairingSelection();
    }

    renderPairingSelection() {
        this.showSection('final');
        const wine = this.state.selection.selectedWine;
        this.pairingConfirmArea.classList.add('hidden');

        // Obtener recomendaciones inteligentes basadas en el vino
        const foodSuggestions = this.getSmartPairing(wine);

        let html = `
            <div class="wine-card" style="margin-bottom: 2rem; border-color: var(--gold-dim);">
                <div class="wine-info">
                    <span class="wine-category">Su Elección</span>
                    <h3 class="wine-name" style="font-size: 2rem;">${wine.name}</h3>
                    <p class="wine-do">${wine.do}</p>
                </div>
            </div>
            
            <h3 style="text-align:center; margin-bottom: 2rem; color: var(--navy);">Armonías Sugeridas</h3>
            <div class="options-grid" style="grid-template-columns: 1fr 1fr; max-width: 900px; margin: 0 auto;">
        `;

        foodSuggestions.forEach((food, index) => {
            const label = index === 0 ? "MARIDAJE ESTELAR" : "OPCIÓN ALTERNATIVA";
            html += `
                <div class="visual-option" style="height: 150px;" id="food-card-${food.id}" onclick="app.selectFood('${food.id}')">
                    <div class="option-overlay">
                        <span style="font-size: 0.7rem; letter-spacing: 2px; color: var(--gold); font-weight: 700;">${label}</span>
                        <h3 style="font-size: 1.3rem; margin-top: 0.5rem; color: var(--navy);">${food.name}</h3>
                        <p style="color: var(--text-muted);">${food.price}</p>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        this.finalDisplay.innerHTML = html;
    }

    getSmartPairing(wine) {
        // Obtenemos todos los platos de comida
        const allFood = this.menu.filter(i => i.category === "DE TAPEO" || i.category === "RACIONES");

        let keywords = [];

        // Definir keywords según el tipo de vino y región
        if (wine.category === "VINOS TINTOS") {
            const isFullBodied = ["Toro", "Ribera", "Priorat", "Jumilla", "Somontano"].some(r => (wine.do || "").includes(r));

            if (isFullBodied) {
                // Tintos potentes -> Carnes rojas, curados fuertes, caza
                keywords = ["cecina", "jamón ibérico", "rabo de toro", "buey", "callos", "chorizo", "huevos", "tabla de quesos"];
            } else {
                // Tintos elegantes (Rioja, Mencía) -> Jamón, quesos suaves, carnes blancas, setas
                keywords = ["jamón", "croquetas", "setas", "champiñones", "queso", "lacón", "oreja", "solomillo"];
            }
        } else if (wine.category === "VINOS BLANCOS") {
            const isGalician = ["Rías Baixas", "Valdeorras", "Ribeiro"].some(r => (wine.do || "").includes(r));

            if (isGalician) {
                // Blancos atlánticos -> Marisco, pulpo, pescado
                keywords = ["pulpo", "zamburiñas", "gambas", "calamares", "sardina", "anchoas", "navajas", "mejillones"];
            } else {
                // Blancos Rueda/Otros -> Arroces, ensaladas, pescados, quesos frescos
                keywords = ["ensalada", "ventresca", "burrata", "salmón", "arroz", "queso de cabra"];
            }
        } else if (wine.category === "ESPUMOSOS" || wine.id.includes("CAVA") || wine.id.includes("CHAMPAGNE")) {
            // Espumosos -> Versátiles: desde aperitivos hasta mariscos y quesos
            keywords = ["jamón", "queso", "zamburiñas", "gambas", "ensaladilla", "croquetas", "burrata"];
        }

        // Función de puntuación para ordenar los platos
        const scoreFood = (food) => {
            let score = 0;
            const nameLower = food.name.toLowerCase();
            const reviewLower = (food.review || "").toLowerCase();

            // Puntos por coincidencia de palabras clave
            keywords.forEach(k => {
                if (nameLower.includes(k)) score += 10;
                if (reviewLower.includes(k)) score += 3;
            });

            // Evitar repetir 'Burritos' siempre si no es específico
            if (nameLower.includes("burrito") && score < 10) score -= 2;

            return score;
        };

        // Ordenar y devolver los top 2
        return allFood
            .map(f => ({ ...f, score: scoreFood(f) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 2);
    }

    getAtmosphericImage(category) {
        const images = {
            "VINOS TINTOS": "https://images.unsplash.com/photo-1510850463344-8b577003923a?auto=format&fit=crop&q=80&w=1200",
            "VINOS BLANCOS": "https://images.unsplash.com/photo-1559158517-733075677864?auto=format&fit=crop&q=80&w=1200",
            "ESPUMOSOS": "https://images.unsplash.com/photo-1506377247377-2a5b3b0ca7ef?auto=format&fit=crop&q=80&w=1200"
        };
        return images[category] || images["VINOS TINTOS"];
    }

    getFoodImage(name) {
        if (name.includes("Jamón")) return "https://images.unsplash.com/photo-1541414779316-956a5084c0d4?auto=format&fit=crop&q=80&w=800";
        if (name.includes("Queso") || name.includes("Tabla")) return "https://images.unsplash.com/photo-1485962391945-8205f28b4822?auto=format&fit=crop&q=80&w=800";
        if (name.includes("Anchoas") || name.includes("Sardina")) return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800";
        return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800";
    }

    selectFood(foodId) {
        const food = this.menu.find(i => i.id === foodId);
        this.state.selection.selectedFood = food;

        // Highlight selection
        document.querySelectorAll('.visual-option').forEach(el => el.style.borderColor = 'var(--gold-dim)');
        const selectedEl = document.getElementById(`food-card-${foodId}`);
        if (selectedEl) selectedEl.style.borderColor = 'var(--gold)';

        this.pairingConfirmArea.classList.remove('hidden');
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    finalize() {
        this.renderOrderSummary();
    }

    renderOrderSummary() {
        this.showSection('summary');
        const wine = this.state.selection.selectedWine;
        const food = this.state.selection.selectedFood;
        const summaryDisplay = document.getElementById('summaryDisplay');

        const winePrice = parseFloat(wine.price.replace(' €', '').replace(',', '.'));
        const foodPrice = parseFloat(food.price.replace(' €', '').replace(',', '.'));
        const total = (winePrice + foodPrice).toFixed(2).replace('.', ',');

        summaryDisplay.innerHTML = `
            <div class="wine-card" style="margin: 2rem auto;">
                <div class="wine-info">
                    <h3 class="wine-name" style="font-size: 2.2rem; margin-bottom: 2rem;">Resumen de su Pedido</h3>
                    
                    <div style="width: 100%; max-width: 500px; margin: 0 auto; background: rgba(17, 34, 64, 0.6); backdrop-filter: blur(20px); padding: 2.5rem; border: 1px solid var(--gold-dim); text-align: left;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 0.8rem; color: var(--white);">
                            <span><strong style="color: var(--gold-bright);">Vino:</strong> ${wine.name}</span>
                            <span style="color: var(--gold-bright);">${wine.price}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 0.8rem; color: var(--white);">
                            <span><strong style="color: var(--gold-bright);">Maridaje:</strong> ${food.name}</span>
                            <span style="color: var(--gold-bright);">${food.price}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 2rem; font-size: 1.8rem; color: var(--white);">
                            <strong>TOTAL</strong>
                            <strong style="color: var(--gold-bright);">${total} €</strong>
                        </div>
                    </div>

                    <p style="margin-top: 2rem; font-family: 'Cormorant Garamond', serif; font-style: italic; color: rgba(255, 255, 255, 0.7);">
                        Su selección está siendo preparada. El sumiller le servirá en unos momentos.
                    </p>
                </div>
            </div>
        `;
    }

    restart() {
        location.reload();
    }

    goBack() {
        if (this.state.currentStep === 'profile') this.renderFamilySelection();
        else if (this.state.currentStep === 'occasion') this.renderProfileSelection();
        else if (this.state.currentStep === 'results') this.renderOccasionSelection();
        else if (this.state.currentStep === 'final') this.showSection('results');
    }

    handleAdminClick() {
        console.log("SIAmmelier Dobao - Modo Depuración Activo");
    }
}

const app = new SommelierApp();

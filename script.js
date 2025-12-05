let products = [];
let recipes = [];
let selectedProducts = new Map();
let macroChart = null;
let microChart = null;
let currentView = 'individual';
let currentMealTime = 'breakfast';
let currentCategory = 'packaged';
let recipeIngredients = [];
let dailyLogs = {}; // Store daily food logs { 'YYYY-MM-DD': { meals: [], totalNutrition: {} } }
let currentDate = getLocalDateString(); // Current selected date
let weeklyChart = null;

// Helper function to get local date string in YYYY-MM-DD format
function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Tab navigation
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate corresponding nav item
    const navItem = document.querySelector(`[data-tab="${tabName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Update content based on tab
    if (tabName === 'recipes') {
        renderRecipesList();
    } else if (tabName === 'history') {
        initializeHistoryTab();
    }
}

// Render recipes list
function renderRecipesList() {
    const container = document.getElementById('recipesList');
    if (!container) return;
    
    if (recipes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍳</div>
                <div>No recipes created yet</div>
                <button class="btn btn-primary" onclick="openCreateRecipeModal(); switchTab('recipes');" style="margin-top: 1rem;">Create Your First Recipe</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recipes.map((recipe, index) => {
        return `
            <div class="recipe-card" onclick="selectRecipeFromList(${index})">
                <div class="recipe-card-title">🍳 ${recipe.name}</div>
                <div class="recipe-card-details">
                    ${recipe.ingredients.length} ingredient${recipe.ingredients.length !== 1 ? 's' : ''} • ${recipe.servings} serving${recipe.servings !== 1 ? 's' : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Select recipe from list (for future use)
function selectRecipeFromList(index) {
    // Switch to home tab and select recipe category
    switchTab('home');
    selectCategory('recipe');
    // Find and select the recipe in dropdown
    setTimeout(() => {
        const recipe = recipes[index];
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.value = recipe.name;
            filterProducts(recipe.name);
            setTimeout(() => {
                const recipeIndex = recipes.findIndex(r => r.name === recipe.name);
                if (recipeIndex !== -1) {
                    selectRecipeFromDropdown(recipeIndex);
                }
            }, 300);
        }
    }, 100);
}

// Initialize app
async function initializeApp() {
    try {
        // Load recipes from localStorage
        const storedRecipes = localStorage.getItem('nutrition_recipes');
        if (storedRecipes) {
            recipes = JSON.parse(storedRecipes);
        }

        // Load daily logs from localStorage
        const storedLogs = localStorage.getItem('nutrition_daily_logs');
        if (storedLogs) {
            dailyLogs = JSON.parse(storedLogs);
        }

        // Try to load from localStorage first
        const stored = localStorage.getItem('nutrition_products');
        if (stored) {
            products = JSON.parse(stored);
        } else {
            // Load from products.json file
            const response = await fetch('products.json');
            if (response.ok) {
                const data = await response.json();
                products = data.products || [];
                // Normalize all products
                products = products.map(p => normalizeProduct(p));
                // Save to localStorage
                saveProducts();
            } else {
                throw new Error('Failed to load products.json');
            }
        }
        renderProducts();
        updateRecipeIngredientSelect();
        renderRecipesList();
    } catch (error) {
        console.error('Error loading products:', error);
        const dropdownList = document.getElementById('dropdownList');
        if (dropdownList) {
            dropdownList.innerHTML = '<div class="error-message">Error loading products. Please refresh the page.</div>';
        }
    }
}

// Normalize product data structure
function normalizeProduct(product) {
    const servingSizeStr = product.serving_size || '100g';
    const servingSizeMatch = servingSizeStr.match(/(\d+(?:\.\d+)?)\s*(g|ml|kg|l)/i);
    const servingSize = servingSizeMatch ? parseFloat(servingSizeMatch[1]) : 100;
    const unit = servingSizeMatch ? servingSizeMatch[2].toLowerCase() : 'g';

    const normalized = {
        product_name: product.product_name,
        brand: product.brand || '',
        serving_size: servingSize,
        unit: unit,
        servings_per_container: parseInt(product.servings_per_container) || 1,
        ingredients: product.ingredients || [],
        allergens: product.allergens || [],
        notes: product.notes || '',
        nutrition_per_100: {}
    };

    // Normalize nutrition data
    const nutrition = product.nutrition || {};
    Object.keys(nutrition).forEach(key => {
        const value = nutrition[key];
        if (typeof value === 'object' && value !== null) {
            // Find per_100 value (could be per_100g, per_100ml, etc.)
            let per100Value = null;
            
            // Try different keys
            const possibleKeys = ['per_100g', 'per_100ml', 'per_100'];
            for (const k of possibleKeys) {
                if (value[k] !== undefined) {
                    per100Value = parseFloat(value[k]) || 0;
                    break;
                }
            }
            
            // If not found, try to calculate from per_serve
            if (per100Value === null && value.per_serve !== undefined) {
                const perServe = parseFloat(value.per_serve) || 0;
                // Calculate per 100 based on serving size
                per100Value = (perServe / servingSize) * 100;
            }
            
            // If still not found, use first numeric value
            if (per100Value === null) {
                const numericValues = Object.values(value).filter(v => typeof v === 'number');
                per100Value = numericValues.length > 0 ? numericValues[0] : 0;
            }

            normalized.nutrition_per_100[key] = per100Value;
        } else if (typeof value === 'number') {
            normalized.nutrition_per_100[key] = value;
        }
    });

    return normalized;
}

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('nutrition_products', JSON.stringify(products));
}

// Save recipes to localStorage
function saveRecipes() {
    localStorage.setItem('nutrition_recipes', JSON.stringify(recipes));
}

// Save daily logs to localStorage
function saveDailyLogs() {
    localStorage.setItem('nutrition_daily_logs', JSON.stringify(dailyLogs));
}

// Initialize history tab
function initializeHistoryTab() {
    const dateInput = document.getElementById('selectedDate');
    if (dateInput) {
        dateInput.value = currentDate;
    }
    loadDailyLog();
    renderWeeklyChart();
}

// Set date to today
function setToday() {
    currentDate = getLocalDateString();
    const dateInput = document.getElementById('selectedDate');
    if (dateInput) {
        dateInput.value = currentDate;
    }
    loadDailyLog();
}

// Change date by offset
function changeDate(offset) {
    const date = new Date(currentDate + 'T00:00:00');
    date.setDate(date.getDate() + offset);
    currentDate = getLocalDateString(date);
    const dateInput = document.getElementById('selectedDate');
    if (dateInput) {
        dateInput.value = currentDate;
    }
    loadDailyLog();
}

// Load daily log for selected date
function loadDailyLog() {
    const dateInput = document.getElementById('selectedDate');
    if (dateInput && dateInput.value) {
        currentDate = dateInput.value;
    }
    
    const dayLog = dailyLogs[currentDate] || { meals: [], totalNutrition: {} };
    
    // Update daily summary
    updateDailySummary(dayLog.totalNutrition);
    
    // Render meals list
    renderDailyMeals(dayLog.meals);
    
    // Update weekly chart
    renderWeeklyChart();
}

// Update daily summary display
function updateDailySummary(nutrition) {
    const caloriesEl = document.getElementById('dailyCalories');
    const proteinEl = document.getElementById('dailyProtein');
    const carbsEl = document.getElementById('dailyCarbs');
    const fatEl = document.getElementById('dailyFat');
    
    if (caloriesEl) caloriesEl.textContent = Math.round(nutrition.energy_kcal || 0);
    if (proteinEl) proteinEl.textContent = (nutrition.protein || 0).toFixed(1) + 'g';
    if (carbsEl) carbsEl.textContent = (nutrition.carbohydrate || 0).toFixed(1) + 'g';
    if (fatEl) fatEl.textContent = (nutrition.total_fat || 0).toFixed(1) + 'g';
}

// Render daily meals list
function renderDailyMeals(meals) {
    const container = document.getElementById('dailyMealsList');
    if (!container) return;
    
    if (meals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <div>No meals logged for this day</div>
            </div>
        `;
        return;
    }
    
    // Group meals by meal time
    const mealGroups = {
        breakfast: [],
        lunch: [],
        evening_snacks: [],
        dinner: [],
        other: []
    };
    
    meals.forEach(meal => {
        const mealTime = meal.mealTime || 'other';
        if (mealGroups[mealTime]) {
            mealGroups[mealTime].push(meal);
        } else {
            mealGroups.other.push(meal);
        }
    });
    
    const mealTimeLabels = {
        breakfast: '🌅 Breakfast',
        lunch: '🍽️ Lunch',
        evening_snacks: '☕ Evening Snacks',
        dinner: '🌙 Dinner',
        other: '📝 Other'
    };
    
    let html = '';
    Object.keys(mealGroups).forEach(mealTime => {
        if (mealGroups[mealTime].length > 0) {
            html += `<div class="meal-group">
                <div class="meal-group-title">${mealTimeLabels[mealTime]}</div>`;
            
            mealGroups[mealTime].forEach((meal, idx) => {
                const calories = Math.round(meal.nutrition?.energy_kcal || 0);
                const protein = (meal.nutrition?.protein || 0).toFixed(1);
                const deleteBtn = currentDate === getLocalDateString() 
                    ? `<button class="meal-item-delete" onclick="deleteMealFromLog('${currentDate}', '${mealTime}', ${idx})">×</button>`
                    : '';
                
                html += `
                    <div class="meal-item">
                        <div class="meal-item-info">
                            <div class="meal-item-name">${meal.displayName}</div>
                            <div class="meal-item-details">${meal.displayBrand}</div>
                        </div>
                        <div class="meal-item-nutrition">
                            <div>${calories} kcal</div>
                            <div>${protein}g protein</div>
                        </div>
                        ${deleteBtn}
                    </div>
                `;
            });
            
            html += '</div>';
        }
    });
    
    container.innerHTML = html;
}

// Delete meal from log
function deleteMealFromLog(date, mealTime, index) {
    if (!dailyLogs[date]) return;
    
    // Find and remove the meal
    const meals = dailyLogs[date].meals;
    const mealTimeItems = meals.filter(m => m.mealTime === mealTime);
    
    if (index >= 0 && index < mealTimeItems.length) {
        const mealToRemove = mealTimeItems[index];
        const mealIndex = meals.indexOf(mealToRemove);
        meals.splice(mealIndex, 1);
        
        // Recalculate totals
        dailyLogs[date].totalNutrition = calculateTotalNutrition(meals);
        saveDailyLogs();
        loadDailyLog();
    }
}

// Calculate total nutrition from meals
function calculateTotalNutrition(meals) {
    const total = {};
    
    meals.forEach(meal => {
        if (meal.nutrition) {
            Object.keys(meal.nutrition).forEach(key => {
                if (!total[key]) total[key] = 0;
                total[key] += meal.nutrition[key] || 0;
            });
        }
    });
    
    return total;
}

// Open save to daily log modal
function openSaveToDailyLogModal() {
    if (selectedProducts.size === 0) {
        alert('Please add some foods first');
        return;
    }
    
    const modal = document.getElementById('saveToDailyLogModal');
    const dateInput = document.getElementById('saveLogDate');
    const itemCount = document.getElementById('saveLogItemCount');
    
    // Set default date to today
    dateInput.value = getLocalDateString();
    itemCount.textContent = selectedProducts.size;
    
    modal.style.display = 'flex';
}

// Close save to daily log modal
function closeSaveToDailyLogModal() {
    const modal = document.getElementById('saveToDailyLogModal');
    modal.style.display = 'none';
}

// Confirm and save to daily log
function confirmSaveToDailyLog() {
    const dateInput = document.getElementById('saveLogDate');
    const selectedDate = dateInput.value;
    
    if (!selectedDate) {
        alert('Please select a date');
        return;
    }
    
    saveToDailyLog(selectedDate);
    closeSaveToDailyLogModal();
}

// Save current selection to daily log
function saveToDailyLog(dateStr = null) {
    const targetDate = dateStr || getLocalDateString();
    
    if (!dailyLogs[targetDate]) {
        dailyLogs[targetDate] = { meals: [], totalNutrition: {} };
    }
    
    // Convert selectedProducts to meals array
    const meals = Array.from(selectedProducts.values()).map(item => {
        let nutrition = {};
        
        if (item.type === 'recipe') {
            nutrition = item.nutrition;
        } else if (item.type === 'product') {
            // Calculate nutrition for product
            const product = item.product;
            const multiplier = item.amount / 100;
            
            Object.keys(product.nutrition_per_100 || {}).forEach(key => {
                nutrition[key] = (product.nutrition_per_100[key] || 0) * multiplier;
            });
        }
        
        return {
            displayName: item.displayName,
            displayBrand: item.displayBrand,
            mealTime: item.mealTime,
            category: item.category,
            nutrition: nutrition,
            timestamp: Date.now()
        };
    });
    
    // Add meals to target date's log
    dailyLogs[targetDate].meals.push(...meals);
    
    // Calculate total nutrition
    dailyLogs[targetDate].totalNutrition = calculateTotalNutrition(dailyLogs[targetDate].meals);
    
    // Save to localStorage
    saveDailyLogs();
    
    // Clear current selection
    selectedProducts.clear();
    renderSelected();
    updateSummary();
    
    // Show confirmation
    alert('Meals saved to daily log!');
}

// Render weekly calories chart
function renderWeeklyChart() {
    const canvas = document.getElementById('weeklyCaloriesChart');
    if (!canvas) return;
    
    // Get last 7 days
    const dates = [];
    const calories = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getLocalDateString(date);
        const dayLog = dailyLogs[dateStr] || { totalNutrition: {} };
        
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        calories.push(Math.round(dayLog.totalNutrition.energy_kcal || 0));
    }
    
    const ctx = canvas.getContext('2d');
    
    if (weeklyChart) {
        weeklyChart.destroy();
    }
    
    const theme = document.body.getAttribute('data-theme');
    const textColor = theme === 'dark' ? '#e9ecef' : '#212529';
    const gridColor = theme === 'dark' ? '#404040' : '#dee2e6';
    
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Calories',
                data: calories,
                backgroundColor: 'rgba(13, 110, 253, 0.7)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

// Toggle theme
function toggleTheme() {
    const current = document.body.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateCharts();
    if (weeklyChart) {
        renderWeeklyChart();
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);

let currentSelectedProductIndex = null;
let currentSelectedRecipeIndex = null;
let filteredProducts = [];

// Select meal time
function selectMealTime(mealTime) {
    currentMealTime = mealTime;
    document.querySelectorAll('.meal-time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-meal="${mealTime}"]`).classList.add('active');
}

// Select category
function selectCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    renderProducts();
}

// Get products by category
function getProductsByCategory() {
    if (currentCategory === 'recipe') {
        return recipes;
    } else if (currentCategory === 'raw') {
        // Raw foods are typically vegetables and fruits - check if brand is "Fresh" or empty
        return products.filter(p => !p.brand || p.brand === 'Fresh' || p.brand === '');
    } else {
        // Packaged foods
        return products.filter(p => p.brand && p.brand !== 'Fresh' && p.brand !== '');
    }
}

// Render products in dropdown
function renderProducts() {
    const categoryProducts = getProductsByCategory();
    filteredProducts = categoryProducts;
    console.log('Products loaded:', filteredProducts.length);
    renderDropdownList();
}

// Render dropdown list
function renderDropdownList(filtered = null) {
    const container = document.getElementById('dropdownList');
    if (!container) return;
    
    const listToShow = filtered !== null ? filtered : filteredProducts;
    
    if (!listToShow || listToShow.length === 0) {
        container.innerHTML = '<div class="dropdown-empty">No items found</div>';
        return;
    }

    if (currentCategory === 'recipe') {
        // Render recipes
        container.innerHTML = listToShow.map((recipe, index) => {
            return `
                <div class="dropdown-item" onclick="selectRecipeFromDropdown(${index})">
                    <div class="dropdown-item-name">🍳 ${recipe.name}</div>
                    <div class="dropdown-item-brand">Recipe (${recipe.ingredients.length} ingredients)</div>
                    <div class="dropdown-item-serving">Servings: ${recipe.servings}</div>
                </div>
            `;
        }).join('');
    } else {
        // Render products
        container.innerHTML = listToShow.map((product, index) => {
            const actualIndex = products.indexOf(product);
            if (actualIndex === -1) return '';
            return `
                <div class="dropdown-item" onclick="selectProductFromDropdown(${actualIndex})">
                    <div class="dropdown-item-name">${product.product_name}</div>
                    <div class="dropdown-item-brand">${product.brand}</div>
                    <div class="dropdown-item-serving">Serving: ${product.serving_size}${product.unit}</div>
                </div>
            `;
        }).filter(html => html !== '').join('');
    }
}

// Filter products based on search
function filterProducts(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const categoryProducts = getProductsByCategory();
    
    if (term === '') {
        filteredProducts = categoryProducts;
    } else {
        if (currentCategory === 'recipe') {
            filteredProducts = categoryProducts.filter(recipe => 
                recipe.name.toLowerCase().includes(term)
            );
        } else {
            filteredProducts = categoryProducts.filter(product => 
                product.product_name.toLowerCase().includes(term) ||
                (product.brand && product.brand.toLowerCase().includes(term))
            );
        }
    }
    
    renderDropdownList(filteredProducts);
    openDropdown();
}

// Open dropdown
function openDropdown() {
    const dropdown = document.getElementById('dropdownList');
    const arrow = document.getElementById('dropdownArrow');
    const wrapper = document.querySelector('.searchable-dropdown');
    
    if (!dropdown || !arrow || !wrapper) return;
    
    // Make sure we have products loaded
    if (filteredProducts.length === 0 && products.length > 0) {
        filteredProducts = products;
    }
    
    dropdown.classList.add('active');
    wrapper.classList.add('active');
    arrow.textContent = '▲';
    renderDropdownList();
}

// Close dropdown
function closeDropdown() {
    const dropdown = document.getElementById('dropdownList');
    const arrow = document.getElementById('dropdownArrow');
    const wrapper = document.querySelector('.searchable-dropdown');
    dropdown.classList.remove('active');
    wrapper.classList.remove('active');
    arrow.textContent = '▼';
}

// Toggle dropdown
function toggleDropdown() {
    const dropdown = document.getElementById('dropdownList');
    if (dropdown.classList.contains('active')) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

// Select product from dropdown
function selectProductFromDropdown(index) {
    const product = products[index];
    currentSelectedProductIndex = index;
    
    // Update input field
    const searchInput = document.getElementById('productSearch');
    searchInput.value = product.product_name;
    
    // Show selected product form
    const form = document.getElementById('selectedProductForm');
    document.getElementById('selectedProductName').textContent = product.product_name;
    document.getElementById('selectedProductBrand').textContent = product.brand || 'Raw Food';
    
    // Update unit select
    const unitSelect = document.getElementById('productUnit');
    unitSelect.innerHTML = `
        <option value="custom">${product.unit}</option>
        <option value="servings">servings</option>
    `;
    
    // Set default quantity
    document.getElementById('productQuantity').value = product.serving_size;
    
    form.style.display = 'block';
    closeDropdown();
    
    // Focus on quantity input
    setTimeout(() => {
        document.getElementById('productQuantity').focus();
    }, 100);
}

// Select recipe from dropdown
function selectRecipeFromDropdown(index) {
    const recipe = recipes[index];
    currentSelectedRecipeIndex = index;
    
    // Update input field
    const searchInput = document.getElementById('productSearch');
    searchInput.value = recipe.name;
    
    // Show selected product form
    const form = document.getElementById('selectedProductForm');
    document.getElementById('selectedProductName').textContent = `🍳 ${recipe.name}`;
    document.getElementById('selectedProductBrand').textContent = `Recipe (${recipe.servings} servings)`;
    
    // Update unit select for recipes
    const unitSelect = document.getElementById('productUnit');
    unitSelect.innerHTML = `
        <option value="servings">servings</option>
    `;
    
    // Set default quantity to 1 serving
    document.getElementById('productQuantity').value = 1;
    
    form.style.display = 'block';
    closeDropdown();
    
    // Focus on quantity input
    setTimeout(() => {
        document.getElementById('productQuantity').focus();
    }, 100);
}

// Add selected product to list
function addSelectedProduct() {
    let itemToAdd = null;
    let displayName = '';
    let displayBrand = '';
    let category = currentCategory;
    
    if (currentCategory === 'recipe' && currentSelectedRecipeIndex !== null) {
        // Adding a recipe
        const recipe = recipes[currentSelectedRecipeIndex];
        const quantity = parseFloat(document.getElementById('productQuantity').value) || 0;
        const unit = document.getElementById('productUnit').value;
        
        if (quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        // Calculate nutrition for recipe based on servings
        const servingMultiplier = quantity / recipe.servings;
        const recipeNutrition = calculateRecipeNutrition(recipe, servingMultiplier);
        
        itemToAdd = {
            type: 'recipe',
            recipe: recipe,
            servings: quantity,
            nutrition: recipeNutrition
        };
        
        displayName = recipe.name;
        displayBrand = `Recipe (${quantity} serving${quantity > 1 ? 's' : ''})`;
    } else if (currentSelectedProductIndex !== null) {
        // Adding a regular product
        const product = products[currentSelectedProductIndex];
        const quantity = parseFloat(document.getElementById('productQuantity').value) || 0;
        const unit = document.getElementById('productUnit').value;
        
        if (quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        // Calculate actual amount
        let actualAmount;
        if (unit === 'servings') {
            actualAmount = quantity * product.serving_size;
        } else {
            actualAmount = quantity;
        }

        itemToAdd = {
            type: 'product',
            product: product,
            amount: actualAmount,
            displayAmount: quantity,
            displayUnit: unit === 'servings' ? 'servings' : product.unit,
            productIndex: currentSelectedProductIndex
        };
        
        displayName = product.product_name;
        displayBrand = product.brand || 'Raw Food';
    } else {
        alert('Please select a food item first');
        return;
    }

    const id = `${category}-${currentMealTime}-${Date.now()}`;
    
    selectedProducts.set(id, {
        ...itemToAdd,
        mealTime: currentMealTime,
        category: category,
        displayName: displayName,
        displayBrand: displayBrand
    });

    // Reset form
    resetProductForm();
    renderSelected();
    updateSummary();
}

// Calculate nutrition for a recipe
function calculateRecipeNutrition(recipe, servingMultiplier = 1) {
    const nutrition = {};
    
    recipe.ingredients.forEach(ing => {
        const product = products[ing.productIndex];
        if (!product || !product.nutrition_per_100) return;
        
        // Calculate amount in grams/ml
        let amountInGrams = ing.amount;
        if (ing.unit === 'ml') {
            // For liquids, assume 1ml = 1g for nutrition calculation
            amountInGrams = ing.amount;
        }
        
        // Calculate multiplier based on recipe serving size
        const multiplier = (amountInGrams / 100) * servingMultiplier;
        
        Object.keys(product.nutrition_per_100).forEach(key => {
            if (!nutrition[key]) {
                nutrition[key] = 0;
            }
            nutrition[key] += (product.nutrition_per_100[key] || 0) * multiplier;
        });
    });
    
    return nutrition;
}

// Reset product form
function resetProductForm() {
    const form = document.getElementById('selectedProductForm');
    const searchInput = document.getElementById('productSearch');
    
    form.style.display = 'none';
    searchInput.value = '';
    currentSelectedProductIndex = null;
    currentSelectedRecipeIndex = null;
    closeDropdown();
}

// Handle keyboard navigation in search
function handleSearchKeydown(event) {
    if (event.key === 'Escape') {
        closeDropdown();
        event.target.blur();
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (filteredProducts.length > 0) {
            const firstProduct = filteredProducts[0];
            const index = products.indexOf(firstProduct);
            selectProductFromDropdown(index);
        }
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('dropdownList');
    const searchInput = document.getElementById('productSearch');
    const toggleBtn = document.querySelector('.dropdown-toggle');
    const wrapper = document.querySelector('.searchable-dropdown');
    
    if (dropdown && dropdown.classList.contains('active')) {
        if (!wrapper.contains(event.target)) {
            closeDropdown();
        }
    }
});

// Prevent dropdown from closing when clicking inside it
const dropdownList = document.getElementById('dropdownList');
if (dropdownList) {
    dropdownList.addEventListener('click', function(event) {
        event.stopPropagation();
    });
}

// Render selected products organized by meal time
function renderSelected() {
    const container = document.getElementById('selectedList');
    const exportButtons = document.getElementById('exportButtons');
    
    if (selectedProducts.size === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div>No foods selected yet</div></div>';
        exportButtons.style.display = 'none';
        return;
    }

    exportButtons.style.display = 'block';
    
    // Organize by meal time
    const mealTimeGroups = {
        breakfast: [],
        lunch: [],
        evening_snacks: [],
        dinner: [],
        other: []
    };
    
    const mealTimeLabels = {
        breakfast: '🌅 Breakfast',
        lunch: '🍽️ Lunch',
        evening_snacks: '☕ Evening Snacks',
        dinner: '🌙 Dinner',
        other: '📝 Other'
    };
    
    selectedProducts.forEach((item, id) => {
        const mealTime = item.mealTime || 'other';
        if (mealTimeGroups[mealTime]) {
            mealTimeGroups[mealTime].push({ id, item });
        }
    });
    
    // Render by meal time
    let html = '';
    Object.keys(mealTimeGroups).forEach(mealTime => {
        const items = mealTimeGroups[mealTime];
        if (items.length === 0) return;
        
        html += `<div class="meal-time-group">
            <div class="meal-time-header">${mealTimeLabels[mealTime]}</div>
            <div class="meal-time-items">`;
        
        items.forEach(({ id, item }) => {
            let displayDetails = '';
            if (item.type === 'recipe') {
                displayDetails = `${item.servings} serving${item.servings > 1 ? 's' : ''} • Recipe`;
            } else {
                displayDetails = `${item.displayAmount} ${item.displayUnit} • ${item.displayBrand}`;
            }
            
            html += `
                <div class="selected-item">
                    <div class="selected-item-info">
                        <div class="selected-item-name">${item.type === 'recipe' ? '🍳 ' : ''}${item.displayName}</div>
                        <div class="selected-item-details">${displayDetails}</div>
                    </div>
                    <button class="remove-btn" onclick="removeSelected('${id}')" title="Remove">×</button>
                </div>
            `;
        });
        
        html += `</div></div>`;
    });
    
    container.innerHTML = html;
}

// Remove selected product
function removeSelected(id) {
    selectedProducts.delete(id);
    renderSelected();
    updateSummary();
}

// Calculate nutrition totals
function calculateNutrition() {
    const totals = {};
    const individual = [];

    selectedProducts.forEach((item, id) => {
        let itemTotals = {};
        
        if (item.type === 'recipe') {
            // Use pre-calculated recipe nutrition
            itemTotals = item.nutrition || {};
        } else {
            // Calculate from product
            const multiplier = item.amount / 100;
            const nutrition = item.product.nutrition_per_100;
            
            Object.keys(nutrition).forEach(key => {
                const value = nutrition[key] * multiplier;
                itemTotals[key] = value;
            });
        }

        // Add to totals
        Object.keys(itemTotals).forEach(key => {
            totals[key] = (totals[key] || 0) + (itemTotals[key] || 0);
        });

        individual.push({
            id: id,
            name: item.displayName,
            brand: item.displayBrand,
            type: item.type,
            amount: item.amount || item.servings,
            displayAmount: item.displayAmount || item.servings,
            displayUnit: item.displayUnit || 'servings',
            mealTime: item.mealTime,
            nutrition: itemTotals
        });
    });

    return { totals, individual };
}

// Set view mode
function setView(view) {
    currentView = view;
    document.getElementById('viewTotals').classList.toggle('active', view === 'totals');
    document.getElementById('viewIndividual').classList.toggle('active', view === 'individual');
    updateSummary();
}

// Update summary display
function updateSummary() {
    if (selectedProducts.size === 0) {
        document.getElementById('nutritionDisplay').innerHTML = 
            '<div class="empty-state"><div class="empty-state-icon">📊</div><div>Select products to see nutrition information</div></div>';
        updateCharts();
        return;
    }

    const { totals, individual } = calculateNutrition();
    const container = document.getElementById('nutritionDisplay');

    if (currentView === 'totals') {
        displayTotals(totals, container);
    } else {
        displayIndividual(individual, totals, container);
    }

    updateCharts(totals);
}

// Display totals
function displayTotals(totals, container) {
    // Combine carbs values to avoid duplicates
    const carbsValue = totals.total_carbohydrates_g || totals.carbohydrates_g || 0;
    if (carbsValue > 0) {
        totals.carbs_combined = carbsValue;
    }
    
    const macros = [
        { key: 'energy_kcal', label: 'Calories', unit: 'kcal', rda: 2000 },
        { key: 'protein_g', label: 'Protein', unit: 'g', rda: 50 },
        { key: 'carbs_combined', label: 'Carbs', unit: 'g', rda: 300 },
        { key: 'total_fat_g', label: 'Fat', unit: 'g', rda: 65 }
    ];

    const micros = [
        { key: 'total_sugars_g', label: 'Sugars', unit: 'g' },
        { key: 'added_sugars_g', label: 'Added Sugars', unit: 'g' },
        { key: 'dietary_fiber_g', label: 'Fiber', unit: 'g', rda: 25 },
        { key: 'saturated_fat_g', label: 'Sat. Fat', unit: 'g', rda: 20 },
        { key: 'cholesterol_mg', label: 'Cholesterol', unit: 'mg', rda: 300 },
        { key: 'sodium_mg', label: 'Sodium', unit: 'mg', rda: 2300 },
        { key: 'calcium_mg', label: 'Calcium', unit: 'mg', rda: 1000 },
        { key: 'iron_mg', label: 'Iron', unit: 'mg', rda: 18 },
        { key: 'magnesium_mg', label: 'Magnesium', unit: 'mg', rda: 400 }
    ];

    const allNutrients = [...macros, ...micros].filter(item => totals[item.key] !== undefined && totals[item.key] > 0);

    container.innerHTML = allNutrients.map(item => {
        const value = totals[item.key];
        const rdaPercent = item.rda ? ((value / item.rda) * 100).toFixed(1) : null;
        
        return `
            <div class="nutrition-card">
                <div class="nutrition-label">${item.label}</div>
                <div class="nutrition-value">${value.toFixed(1)}<span class="nutrition-unit">${item.unit}</span></div>
                ${rdaPercent ? `<div class="nutrition-rda">${rdaPercent}% of RDA</div>` : ''}
                </div>
        `;
    }).join('');
}

// Display individual breakdown
function displayIndividual(individual, totals, container) {
    // Combine carbs for totals
    const carbsValue = totals.total_carbohydrates_g || totals.carbohydrates_g || 0;
    if (carbsValue > 0) {
        totals.carbs_combined = carbsValue;
    }
    
    const nutrients = [
        { key: 'energy_kcal', label: 'Calories', unit: 'kcal' },
        { key: 'protein_g', label: 'Protein', unit: 'g' },
        { key: 'carbs_combined', label: 'Carbs', unit: 'g' },
        { key: 'total_fat_g', label: 'Fat', unit: 'g' },
        { key: 'total_sugars_g', label: 'Sugars', unit: 'g' },
        { key: 'sodium_mg', label: 'Sodium', unit: 'mg' },
        { key: 'calcium_mg', label: 'Calcium', unit: 'mg' }
    ];

    let html = '<div class="individual-nutrition">';
    
    individual.forEach(item => {
        // Combine carbs for individual items
        const itemCarbs = item.nutrition.total_carbohydrates_g || item.nutrition.carbohydrates_g || 0;
        if (itemCarbs > 0) {
            item.nutrition.carbs_combined = itemCarbs;
        }
        
        html += `
            <div class="individual-card">
                <div class="individual-card-title">${item.name} (${item.displayAmount} ${item.displayUnit})</div>
                ${nutrients.filter(n => {
                    if (n.key === 'carbs_combined') {
                        return item.nutrition.carbs_combined !== undefined && item.nutrition.carbs_combined > 0;
                    }
                    return item.nutrition[n.key] !== undefined && item.nutrition[n.key] > 0;
                })
                    .map(n => {
                        const value = n.key === 'carbs_combined' ? item.nutrition.carbs_combined : item.nutrition[n.key];
                        return `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                            <span>${n.label}:</span>
                            <strong>${value.toFixed(1)} ${n.unit}</strong>
                        </div>
                    `;
                    }).join('')}
            </div>
        `;
    });

    // Add totals card
    html += `
        <div class="individual-card" style="border: 2px solid var(--accent);">
            <div class="individual-card-title" style="font-size: 1.1rem;">📊 Totals</div>
            ${nutrients.filter(n => {
                if (n.key === 'carbs_combined') {
                    return totals.carbs_combined !== undefined && totals.carbs_combined > 0;
                }
                return totals[n.key] !== undefined && totals[n.key] > 0;
            })
                .map(n => {
                    const value = n.key === 'carbs_combined' ? totals.carbs_combined : totals[n.key];
                    return `
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                        <span>${n.label}:</span>
                        <strong style="color: var(--accent);">${value.toFixed(1)} ${n.unit}</strong>
                    </div>
                `;
                }).join('')}
        </div>
    `;

    html += '</div>';
    container.innerHTML = html;
}

// Update charts
function updateCharts(totals = {}) {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#e9ecef' : '#212529';
    const gridColor = isDark ? '#404040' : '#dee2e6';

    Chart.defaults.color = textColor;

    // Macro chart
    const macroCtx = document.getElementById('macroChart').getContext('2d');
    if (macroChart) macroChart.destroy();

    const protein = totals.protein_g || 0;
    const carbs = totals.carbohydrates_g || totals.total_carbohydrates_g || 0;
    const fat = totals.total_fat_g || 0;

    if (protein > 0 || carbs > 0 || fat > 0) {
    macroChart = new Chart(macroCtx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                    data: [protein, carbs, fat],
                    backgroundColor: [getComputedStyle(document.documentElement).getPropertyValue('--chart-bg-1'),
                                    getComputedStyle(document.documentElement).getPropertyValue('--chart-bg-2'),
                                    getComputedStyle(document.documentElement).getPropertyValue('--chart-bg-3')]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                        position: 'bottom',
                        labels: { color: textColor, padding: 15 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed.toFixed(1) + 'g';
                            }
                        }
                }
            }
        }
    });
    } else {
        macroChart = new Chart(macroCtx, {
            type: 'doughnut',
            data: {
                labels: ['No data'],
                datasets: [{
                    data: [1],
                    backgroundColor: [gridColor]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Micro chart
    const microCtx = document.getElementById('microChart').getContext('2d');
    if (microChart) microChart.destroy();

    const microData = [
        { label: 'Calcium', value: totals.calcium_mg || 0, unit: 'mg' },
        { label: 'Sodium', value: totals.sodium_mg || 0, unit: 'mg' },
        { label: 'Iron', value: totals.iron_mg || 0, unit: 'mg' },
        { label: 'Magnesium', value: totals.magnesium_mg || 0, unit: 'mg' }
    ].filter(item => item.value > 0);

    if (microData.length > 0) {
    microChart = new Chart(microCtx, {
        type: 'bar',
        data: {
            labels: microData.map(d => d.label),
            datasets: [{
                    label: 'Amount',
                data: microData.map(d => d.value),
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-bg-1')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const data = microData[context.dataIndex];
                                return data.label + ': ' + context.parsed.y.toFixed(1) + ' ' + data.unit;
                            }
                        }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                        grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                        grid: { display: false }
                }
            }
        }
    });
    } else {
        microChart = new Chart(microCtx, {
            type: 'bar',
            data: {
                labels: ['No data'],
                datasets: [{
                    data: [0],
                    backgroundColor: gridColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    x: {
                        ticks: { color: textColor },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

// Modal functions
function openAddProductModal() {
    document.getElementById('addProductModal').classList.add('active');
    document.getElementById('productJson').focus();
}

function closeAddProductModal() {
    document.getElementById('addProductModal').classList.remove('active');
    document.getElementById('productJson').value = '';
    document.getElementById('jsonError').innerHTML = '';
}

// Add product from JSON
function addProduct() {
    const jsonText = document.getElementById('productJson').value.trim();
    const errorDiv = document.getElementById('jsonError');
    
    if (!jsonText) {
        errorDiv.innerHTML = '<div class="error-message">Please enter product JSON</div>';
        return;
    }
    
    try {
        const newProduct = JSON.parse(jsonText);
        
        // Validate required fields
        if (!newProduct.product_name) {
            throw new Error('Missing required field: product_name');
        }
        if (!newProduct.nutrition) {
            throw new Error('Missing required field: nutrition');
        }
        
        const normalized = normalizeProduct(newProduct);
        products.push(normalized);
        saveProducts();
        renderProducts();
        updateRecipeIngredientSelect();
        closeAddProductModal();
        alert('Product added successfully!');
    } catch (error) {
        errorDiv.innerHTML = `<div class="error-message">Invalid JSON: ${error.message}</div>`;
    }
}

// Export data
function exportData(format) {
    const { totals, individual } = calculateNutrition();
    
    const exportData = {
        export_date: new Date().toISOString(),
        selected_items: Array.from(selectedProducts.values()).map(item => ({
            name: item.displayName,
            type: item.type,
            category: item.category,
            meal_time: item.mealTime,
            amount: item.amount || item.servings,
            unit: item.displayUnit || 'servings',
            brand: item.displayBrand
        })),
        nutrition_totals: totals,
        nutrition_breakdown: individual.map(item => ({
            name: item.name,
            type: item.type,
            meal_time: item.mealTime,
            amount: item.amount,
            unit: item.displayUnit,
            nutrition: item.nutrition
        }))
    };

    if (format === 'json') {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    } else if (format === 'csv') {
        // Convert to CSV
        let csv = 'Product,Amount,Unit,';
        const nutrients = Object.keys(totals);
        csv += nutrients.join(',') + '\n';
        
        individual.forEach(item => {
            csv += `"${item.name}",${item.amount},${item.displayUnit},`;
            csv += nutrients.map(n => item.nutrition[n] || 0).join(',') + '\n';
        });
        
        csv += `TOTALS,,,${nutrients.map(n => totals[n] || 0).join(',')}\n`;
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nutrition-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    }
}

// Export charts
function exportCharts() {
    const macroCanvas = document.getElementById('macroChart');
    const microCanvas = document.getElementById('microChart');
    
    // Export macro chart
    macroCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `macronutrients-chart-${new Date().toISOString().split('T')[0]}.png`;
        a.click();
        URL.revokeObjectURL(url);
    }, 'image/png');

    // Export micro chart after a short delay
    setTimeout(() => {
        microCanvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `micronutrients-chart-${new Date().toISOString().split('T')[0]}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    }, 500);
}

// Export menu functions
function toggleExportMenu() {
    const dropdown = document.querySelector('.export-dropdown');
    dropdown.classList.toggle('active');
}

function closeExportMenu() {
    const dropdown = document.querySelector('.export-dropdown');
    dropdown.classList.remove('active');
}

// Close export menu when clicking outside
document.addEventListener('click', function(event) {
    const exportDropdown = document.querySelector('.export-dropdown');
    if (exportDropdown && exportDropdown.classList.contains('active')) {
        if (!exportDropdown.contains(event.target)) {
            closeExportMenu();
        }
    }
});

// Recipe creation functions
function openCreateRecipeModal() {
    document.getElementById('createRecipeModal').classList.add('active');
    recipeIngredients = [];
    updateRecipeIngredientList();
    updateRecipeIngredientSelect();
}

function closeCreateRecipeModal() {
    document.getElementById('createRecipeModal').classList.remove('active');
    document.getElementById('recipeName').value = '';
    document.getElementById('recipeServings').value = '1';
    recipeIngredients = [];
    updateRecipeIngredientList();
}

function updateRecipeIngredientSelect() {
    const select = document.getElementById('recipeIngredientSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select an ingredient...</option>';
    products.forEach((product, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${product.product_name}${product.brand ? ' - ' + product.brand : ''}`;
        select.appendChild(option);
    });
}

function addRecipeIngredient() {
    const select = document.getElementById('recipeIngredientSelect');
    const qtyInput = document.getElementById('recipeIngredientQty');
    const unitSelect = document.getElementById('recipeIngredientUnit');
    
    const productIndex = parseInt(select.value);
    const quantity = parseFloat(qtyInput.value);
    const unit = unitSelect.value;
    
    if (!select.value || isNaN(productIndex)) {
        alert('Please select an ingredient');
        return;
    }
    
    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }
    
    const product = products[productIndex];
    if (!product) return;
    
    // Calculate actual amount
    let actualAmount = quantity;
    if (unit === 'servings') {
        actualAmount = quantity * product.serving_size;
    }
    
    recipeIngredients.push({
        productIndex: productIndex,
        product: product,
        amount: actualAmount,
        quantity: quantity,
        unit: unit
    });
    
    // Reset inputs
    select.value = '';
    qtyInput.value = '';
    unitSelect.value = 'g';
    
    updateRecipeIngredientList();
}

function removeRecipeIngredient(index) {
    recipeIngredients.splice(index, 1);
    updateRecipeIngredientList();
}

function updateRecipeIngredientList() {
    const container = document.getElementById('recipeIngredientsList');
    if (!container) return;
    
    if (recipeIngredients.length === 0) {
        container.innerHTML = '<div class="empty-state-small">No ingredients added yet</div>';
        return;
    }
    
    container.innerHTML = recipeIngredients.map((ing, index) => {
        const displayQty = ing.quantity;
        const displayUnit = ing.unit === 'servings' ? 'servings' : ing.unit;
        return `
            <div class="recipe-ingredient-item">
                <div class="recipe-ingredient-info">
                    <div class="recipe-ingredient-name">${ing.product.product_name}</div>
                    <div class="recipe-ingredient-details">${displayQty} ${displayUnit}</div>
                </div>
                <button class="remove-btn" onclick="removeRecipeIngredient(${index})" title="Remove">×</button>
            </div>
        `;
    }).join('');
}

function saveRecipe() {
    const name = document.getElementById('recipeName').value.trim();
    const servings = parseInt(document.getElementById('recipeServings').value) || 1;
    
    if (!name) {
        alert('Please enter a recipe name');
        return;
    }
    
    if (recipeIngredients.length === 0) {
        alert('Please add at least one ingredient');
        return;
    }
    
    if (servings <= 0) {
        alert('Please enter a valid number of servings');
        return;
    }
    
    // Create recipe object
    const recipe = {
        name: name,
        servings: servings,
        ingredients: recipeIngredients.map(ing => ({
            productIndex: ing.productIndex,
            amount: ing.amount,
            quantity: ing.quantity,
            unit: ing.unit
        }))
    };
    
    recipes.push(recipe);
    saveRecipes();
    
    // Update UI if recipe category is selected
    if (currentCategory === 'recipe') {
        renderProducts();
    }
    
    // Update recipes list
    renderRecipesList();
    
    closeCreateRecipeModal();
    alert('Recipe created successfully!');
}

// Initialize on load
initializeApp();

// ===== History Import/Export Functions =====

// Toggle history export menu
function toggleHistoryExportMenu() {
    const menu = document.getElementById('historyExportMenu');
    const arrow = document.getElementById('historyExportArrow');
    if (menu && arrow) {
        const isOpen = menu.style.display === 'block';
        menu.style.display = isOpen ? 'none' : 'block';
        arrow.textContent = isOpen ? '▼' : '▲';
    }
    // Close import menu if open
    closeHistoryImportMenu();
}

function closeHistoryExportMenu() {
    const menu = document.getElementById('historyExportMenu');
    const arrow = document.getElementById('historyExportArrow');
    if (menu && arrow) {
        menu.style.display = 'none';
        arrow.textContent = '▼';
    }
}

// Toggle history import menu
function toggleHistoryImportMenu() {
    const menu = document.getElementById('historyImportMenu');
    const arrow = document.getElementById('historyImportArrow');
    if (menu && arrow) {
        const isOpen = menu.style.display === 'block';
        menu.style.display = isOpen ? 'none' : 'block';
        arrow.textContent = isOpen ? '▼' : '▲';
    }
    // Close export menu if open
    closeHistoryExportMenu();
}

function closeHistoryImportMenu() {
    const menu = document.getElementById('historyImportMenu');
    const arrow = document.getElementById('historyImportArrow');
    if (menu && arrow) {
        menu.style.display = 'none';
        arrow.textContent = '▼';
    }
}

// Export history data
function exportHistoryData(format) {
    if (format === 'json') {
        exportHistoryAsJSON();
    } else if (format === 'csv') {
        exportHistoryAsCSV();
    }
}

// Export history as JSON
function exportHistoryAsJSON() {
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        dailyLogs: dailyLogs
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-history-${getLocalDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export history as CSV
function exportHistoryAsCSV() {
    const rows = [];
    
    // CSV Headers
    rows.push(['Date', 'Meal Time', 'Food Name', 'Brand', 'Quantity', 'Unit', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)']);
    
    // Sort dates
    const sortedDates = Object.keys(dailyLogs).sort();
    
    // Process each date
    for (const date of sortedDates) {
        const dayLog = dailyLogs[date];
        if (dayLog.meals && dayLog.meals.length > 0) {
            for (const meal of dayLog.meals) {
                const mealTime = meal.mealTime || 'other';
                for (const item of meal.items) {
                    rows.push([
                        date,
                        mealTime,
                        item.product_name || '',
                        item.brand || '',
                        item.selectedQuantity || '',
                        item.selectedUnit || '',
                        Math.round(item.nutrition?.energy_kcal || 0),
                        Math.round((item.nutrition?.protein_g || 0) * 10) / 10,
                        Math.round((item.nutrition?.carbohydrates_g || 0) * 10) / 10,
                        Math.round((item.nutrition?.fat_g || 0) * 10) / 10
                    ]);
                }
            }
        }
    }
    
    // Convert to CSV string
    const csvContent = rows.map(row => 
        row.map(cell => {
            // Escape quotes and wrap in quotes if needed
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return '"' + cellStr.replace(/"/g, '""') + '"';
            }
            return cellStr;
        }).join(',')
    ).join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-history-${getLocalDateString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Trigger file input for import
function triggerHistoryImport(format) {
    if (format === 'json') {
        document.getElementById('historyJsonImport').click();
    } else if (format === 'csv') {
        document.getElementById('historyCsvImport').click();
    }
}

// Handle history import
function handleHistoryImport(event, format) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            if (format === 'json') {
                importHistoryFromJSON(e.target.result);
            } else if (format === 'csv') {
                importHistoryFromCSV(e.target.result);
            }
        } catch (error) {
            alert('Error importing file: ' + error.message);
            console.error('Import error:', error);
        }
    };
    
    if (format === 'json') {
        reader.readAsText(file);
    } else if (format === 'csv') {
        reader.readAsText(file);
    }
    
    // Reset file input
    event.target.value = '';
}

// Import history from JSON
function importHistoryFromJSON(jsonString) {
    const importData = JSON.parse(jsonString);
    
    // Validate structure
    if (!importData.dailyLogs) {
        throw new Error('Invalid JSON format: missing dailyLogs');
    }
    
    // Ask user for import strategy
    const strategy = confirm(
        'Click OK to MERGE with existing data.\nClick Cancel to REPLACE all existing data.'
    );
    
    if (strategy) {
        // Merge strategy
        for (const date in importData.dailyLogs) {
            if (!dailyLogs[date]) {
                dailyLogs[date] = importData.dailyLogs[date];
            } else {
                // Merge meals for existing dates
                const existingMeals = dailyLogs[date].meals || [];
                const importedMeals = importData.dailyLogs[date].meals || [];
                dailyLogs[date].meals = [...existingMeals, ...importedMeals];
                // Recalculate totals
                dailyLogs[date].totalNutrition = calculateTotalNutrition(dailyLogs[date].meals);
            }
        }
    } else {
        // Replace strategy
        dailyLogs = importData.dailyLogs;
    }
    
    saveDailyLogs();
    loadDailyLog();
    renderWeeklyChart();
    
    alert('History imported successfully!');
}

// Import history from CSV
function importHistoryFromCSV(csvString) {
    const lines = csvString.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
    }
    
    // Skip header row
    const dataLines = lines.slice(1);
    
    // Parse CSV
    const parsedData = {};
    
    for (const line of dataLines) {
        const values = parseCSVLine(line);
        
        if (values.length < 10) continue; // Skip invalid rows
        
        const [date, mealTime, foodName, brand, quantity, unit, calories, protein, carbs, fat] = values;
        
        if (!date || !foodName) continue; // Skip rows without essential data
        
        // Initialize date entry if needed
        if (!parsedData[date]) {
            parsedData[date] = {
                meals: [],
                totalNutrition: {}
            };
        }
        
        // Find or create meal entry
        let meal = parsedData[date].meals.find(m => m.mealTime === mealTime);
        if (!meal) {
            meal = {
                mealTime: mealTime,
                timestamp: new Date(date).toISOString(),
                items: []
            };
            parsedData[date].meals.push(meal);
        }
        
        // Add item to meal
        meal.items.push({
            product_name: foodName,
            brand: brand,
            selectedQuantity: parseFloat(quantity) || 0,
            selectedUnit: unit || 'g',
            nutrition: {
                energy_kcal: parseFloat(calories) || 0,
                protein_g: parseFloat(protein) || 0,
                carbohydrates_g: parseFloat(carbs) || 0,
                fat_g: parseFloat(fat) || 0
            }
        });
    }
    
    // Recalculate totals for each date
    for (const date in parsedData) {
        parsedData[date].totalNutrition = calculateTotalNutrition(parsedData[date].meals);
    }
    
    // Ask user for import strategy
    const strategy = confirm(
        'Click OK to MERGE with existing data.\nClick Cancel to REPLACE all existing data.'
    );
    
    if (strategy) {
        // Merge strategy
        for (const date in parsedData) {
            if (!dailyLogs[date]) {
                dailyLogs[date] = parsedData[date];
            } else {
                const existingMeals = dailyLogs[date].meals || [];
                const importedMeals = parsedData[date].meals || [];
                dailyLogs[date].meals = [...existingMeals, ...importedMeals];
                dailyLogs[date].totalNutrition = calculateTotalNutrition(dailyLogs[date].meals);
            }
        }
    } else {
        // Replace strategy
        dailyLogs = parsedData;
    }
    
    saveDailyLogs();
    loadDailyLog();
    renderWeeklyChart();
    
    alert('History imported successfully from CSV!');
}

// Parse CSV line handling quoted values
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add last field
    values.push(current.trim());
    
    return values;
}

// Calculate total nutrition from meals
function calculateTotalNutrition(meals) {
    const totals = {
        energy_kcal: 0,
        protein_g: 0,
        carbohydrates_g: 0,
        fat_g: 0,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 0,
        calcium_mg: 0,
        iron_mg: 0,
        vitamin_a_mcg: 0,
        vitamin_c_mg: 0
    };
    
    for (const meal of meals) {
        for (const item of meal.items) {
            if (item.nutrition) {
                for (const key in totals) {
                    totals[key] += item.nutrition[key] || 0;
                }
            }
        }
    }
    
    return totals;
}

// Close menus when clicking outside
document.addEventListener('click', function(event) {
    const exportMenu = document.getElementById('historyExportMenu');
    const importMenu = document.getElementById('historyImportMenu');
    
    // Check if click is outside export/import buttons and menus
    if (exportMenu && exportMenu.style.display === 'block') {
        const exportDropdown = exportMenu.closest('.export-dropdown');
        if (exportDropdown && !exportDropdown.contains(event.target)) {
            closeHistoryExportMenu();
        }
    }
    
    if (importMenu && importMenu.style.display === 'block') {
        const importDropdown = importMenu.closest('.export-dropdown');
        if (importDropdown && !importDropdown.contains(event.target)) {
            closeHistoryImportMenu();
        }
    }
});

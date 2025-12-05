# 🥗 Annalytica

A modern, interactive nutrition tracking web application that helps you analyze the nutritional content of food products and create comprehensive nutrition summaries.

## 📋 Features

### Core Functionality
- **Meal Time Tracking**: Organize foods by meal time (Breakfast, Lunch, Evening Snacks, Dinner, Other)
- **Food Categories**: Filter and select from three categories:
  - 📦 **Packaged Food**: Branded products and processed foods
  - 🥬 **Raw Food**: Fresh vegetables, fruits, and unprocessed ingredients
  - 🍳 **Recipe**: Custom recipes created from existing foods
- **Recipe Creation**: Create custom recipes by combining multiple ingredients
  - Add ingredients with specific quantities
  - Set number of servings
  - Automatic nutrition calculation from ingredients
- **Product Search & Selection**: Searchable dropdown with extensive product database
- **Nutrition Analysis**: Real-time calculation of macronutrients and micronutrients
- **Multiple Views**: Switch between totals and individual product views
- **Interactive Charts**: Visual representation of macronutrients and micronutrients using Chart.js
- **Data Export**: Export your nutrition data in multiple formats:
  - JSON export
  - CSV export
  - Chart images export

### User Experience
- **Dark/Light Theme**: Toggle between themes with a single click
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Meal Organization**: Selected foods automatically organized by meal time
- **Product Database**: Pre-loaded with:
  - Packaged food products (oats, paneer, bread, milk, etc.)
  - Common Indian vegetables (25+ varieties with Hindi names)
- **Custom Products**: Add your own products via JSON input
- **Recipe Management**: Create, save, and reuse custom recipes
- **Persistent Storage**: Products, recipes, and selections saved in browser localStorage

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for development)

### Installation

1. Clone or download this repository
2. Ensure all files are in the same directory:
   - `index.html`
   - `script.js`
   - `styles.css`
   - `products.json`
   - `icon.png`

### Running the Application

#### Option 1: Simple HTTP Server (Python)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option 2: Node.js HTTP Server
```bash
npx http-server
```

#### Option 3: VS Code Live Server
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

Then open your browser and navigate to `http://localhost:8000` (or the port shown).

## 📖 How to Use

### Adding Foods to Your Meal Plan

1. **Select Meal Time**:
   - Choose the meal time: 🌅 Breakfast, 🍽️ Lunch, ☕ Evening Snacks, 🌙 Dinner, or 📝 Other
   - The selected meal time will be applied to all foods you add

2. **Choose Food Category**:
   - **📦 Packaged Food**: For branded products and processed foods
   - **🥬 Raw Food**: For fresh vegetables, fruits, and unprocessed ingredients
   - **🍳 Recipe**: For custom recipes you've created

3. **Search and Select**:
   - Click on the search box in the "Add Food" panel
   - Type to search through the selected category
   - Select a food item from the dropdown

4. **Set Quantity**:
   - Enter the amount you want to add
   - Choose the unit (grams/milliliters or servings)
   - Click "Add" to add it to your meal plan

5. **View Organized Meals**:
   - Selected foods are automatically organized by meal time
   - Each meal time section shows all foods added to that meal

### Creating Recipes

1. **Open Recipe Creator**:
   - Click the "🍳 Create Recipe" button in the header

2. **Enter Recipe Details**:
   - Enter a recipe name (e.g., "Dal Rice", "Paneer Curry")
   - Set the number of servings the recipe makes

3. **Add Ingredients**:
   - Select an ingredient from the dropdown (all products are available)
   - Enter the quantity and unit (g, ml, or servings)
   - Click "Add" to add the ingredient
   - Repeat for all ingredients

4. **Save Recipe**:
   - Review your ingredient list
   - Click "Save Recipe" to save it
   - The recipe will appear in the Recipe category for future use

5. **Using Recipes**:
   - Select the Recipe category tab
   - Search for and select your saved recipe
   - Enter the number of servings you consumed
   - Nutrition is automatically calculated from all ingredients

### Adding Custom Products

1. **Open Add Product Modal**:
   - Click the "➕ Add Product" button in the header

2. **Enter Product Data**:
   - Paste your product JSON in the modal
   - Follow the product data format (see below)

3. **Save Product**:
   - Click "Add Product" to save it
   - The product will be available in the appropriate category

### Viewing Nutrition Information

- **Meal Organization**: Foods are displayed grouped by meal time for easy tracking
- **Totals View**: See aggregated nutrition values across all meals and foods
- **Individual View**: See nutrition breakdown per food item with meal time labels
- **Charts**: Visual representation of:
  - Macronutrients (Protein, Carbs, Fat)
  - Micronutrients (Vitamins and Minerals)
- **Recipe Nutrition**: Recipes automatically calculate nutrition from combined ingredients

### Exporting Data

1. Select products to analyze
2. Click the "📥 Download" button
3. Choose your export format:
   - **Export JSON**: Download nutrition data as JSON
   - **Export CSV**: Download as CSV for spreadsheet applications
   - **Export Charts**: Download chart images

## 📁 File Structure

```
annalytica/
├── index.html          # Main HTML file
├── script.js           # Application logic and functionality
├── styles.css          # Styling and responsive design
├── products.json       # Product database
├── icon.png           # Application icon
└── README.md          # This file
```

## 🎨 Product Data Format

Products in `products.json` follow this structure:

```json
{
  "product_name": "Product Name",
  "brand": "Brand Name",
  "serving_size": "100g",
  "servings_per_container": "1",
  "nutrition": {
    "energy_kcal": { "per_100g": 100 },
    "protein_g": { "per_100g": 10 },
    "total_carbohydrates_g": { "per_100g": 20 },
    "dietary_fiber_g": { "per_100g": 5 },
    "total_sugars_g": { "per_100g": 3 },
    "total_fat_g": { "per_100g": 2 },
    "saturated_fat_g": { "per_100g": 1 },
    "sodium_mg": { "per_100g": 200 },
    // ... additional nutrients
  },
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "allergens": ["Contains milk"],
  "notes": "Additional notes"
}
```

## 🥬 Included Products

### Packaged Foods
- High Protein Chocolate Oats
- Various Paneer types (Super Soft, High Protein, Malai)
- Organic Curd
- 5 Seed Bread
- High Protein Cow Milk

### Indian Vegetables (25+ varieties)
- Onion (Pyaaz)
- Tomato (Tamatar)
- Potato (Aloo)
- Brinjal (Baingan)
- Okra (Bhindi)
- Cauliflower (Gobi)
- Spinach (Palak)
- Fenugreek Leaves (Methi)
- And many more...

All vegetables include:
- English and Hindi names
- Complete nutritional information
- Usage notes

## 🛠️ Technologies Used

- **HTML5**: Structure and semantics
- **CSS3**: Modern styling with CSS variables, flexbox, and responsive design
- **JavaScript (ES6+)**: Application logic and interactivity
- **Chart.js**: Data visualization and charting
- **LocalStorage API**: Client-side data persistence

## 🎯 Key Features Explained

### Meal Time Tracking
- Organize your daily nutrition by meal times
- Track breakfast, lunch, evening snacks, dinner, and other meals separately
- Foods are automatically categorized and displayed by meal time
- Perfect for meal planning and daily nutrition tracking

### Food Categories
- **Packaged Food**: Automatically filters products with brand names
- **Raw Food**: Shows fresh vegetables and unprocessed ingredients (brand "Fresh" or empty)
- **Recipe**: Displays all your custom-created recipes
- Easy switching between categories for quick access

### Recipe Creation
- Combine multiple ingredients to create custom recipes
- Set serving sizes for accurate nutrition per serving
- Nutrition automatically calculated from all ingredients
- Recipes saved to localStorage and available for reuse
- Perfect for tracking home-cooked meals and complex dishes

### Nutrition Calculation
- Automatically calculates nutrition values based on quantity and serving size
- Supports multiple units (g, ml, kg, l, servings)
- Handles both per-100g and per-serving nutrition data
- Recipe nutrition calculated from combined ingredient values
- Accurate calculations for any quantity or serving size

### Responsive Design
- Mobile-first approach
- Breakpoints for tablets and mobile devices
- Touch-friendly interface elements
- Meal time buttons and category tabs optimized for mobile

### Theme Support
- Light and dark themes
- Theme preference saved in localStorage
- Smooth transitions between themes

## 📱 Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Customization

### Adding More Products
1. Edit `products.json` and add your product following the format
2. Or use the "Add Product" modal in the app
3. Products are automatically saved to localStorage
4. Products will appear in the appropriate category (Packaged or Raw) based on brand

### Creating Recipes
1. Use the "Create Recipe" button to build custom recipes
2. Combine any products from your database
3. Recipes are saved to localStorage
4. Recipes appear in the Recipe category for easy access

### Modifying Styles
- Edit `styles.css`
- CSS variables are defined at the top for easy theme customization
- Responsive breakpoints are clearly marked
- Meal time buttons and category tabs can be customized

## 📝 Notes

- All nutrition calculations are based on the data provided in `products.json`
- The app uses client-side storage - data is stored in your browser
  - Products are saved in `nutrition_products` key
  - Recipes are saved in `nutrition_recipes` key
  - Selected foods and theme preferences are also saved
- For accurate nutrition tracking, ensure product data is up-to-date
- Recipes calculate nutrition from their ingredients automatically
- Foods are organized by meal time for better meal planning
- Export functionality includes meal time and category information
- Recipe nutrition is calculated per serving based on ingredient quantities

## 🐛 Troubleshooting

### Products not loading
- Ensure `products.json` is in the same directory as `index.html`
- Check browser console for errors
- Verify you're running on a local server (not file://)
- Clear localStorage if you see old/corrupted data

### Recipes not appearing
- Ensure recipes are saved (check localStorage for `nutrition_recipes`)
- Make sure you're viewing the Recipe category tab
- Try creating a new recipe to test functionality

### Category filtering not working
- Packaged foods require a brand name (not "Fresh" or empty)
- Raw foods should have brand "Fresh" or no brand
- Recipes appear only in the Recipe category

### Charts not displaying
- Ensure Chart.js CDN is accessible
- Check browser console for JavaScript errors
- Make sure you have foods selected

### Theme not persisting
- Clear browser cache and localStorage
- Ensure JavaScript is enabled
- Check if localStorage is available in your browser

## 📄 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Feel free to:
- Add more products to the database
- Create and share recipe templates
- Improve the UI/UX
- Add new features (e.g., meal planning, nutrition goals)
- Report bugs
- Suggest new meal times or categories

## 📧 Support

For issues or questions, please check the code comments or create an issue in the repository.

---

**Made with ❤️ for better nutrition tracking**

# NutritionTracker

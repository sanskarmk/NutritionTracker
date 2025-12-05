# 🥗 Annalytica

A modern, interactive nutrition tracking web application that helps you analyze the nutritional content of food products and create comprehensive nutrition summaries.

## 📋 Features

### Core Functionality
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
- **Product Database**: Pre-loaded with:
  - Packaged food products (oats, paneer, bread, milk, etc.)
  - Common Indian vegetables (25+ varieties with Hindi names)
- **Custom Products**: Add your own products via JSON input
- **Persistent Storage**: Products and selections saved in browser localStorage

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

### Adding Products

1. **Search for Products**:
   - Click on the search box in the "Add Product" panel
   - Type to search through the product database
   - Select a product from the dropdown

2. **Set Quantity**:
   - Enter the amount you want to add
   - Choose the unit (grams/milliliters or servings)
   - Click "Add" to add it to your selection

3. **Add Custom Products**:
   - Click the "➕ Add Product" button in the header
   - Paste your product JSON in the modal
   - Click "Add Product" to save it

### Viewing Nutrition Information

- **Totals View**: See aggregated nutrition values across all selected products
- **Individual View**: See nutrition breakdown per product
- **Charts**: Visual representation of:
  - Macronutrients (Protein, Carbs, Fat)
  - Micronutrients (Vitamins and Minerals)

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

### Nutrition Calculation
- Automatically calculates nutrition values based on quantity and serving size
- Supports multiple units (g, ml, kg, l)
- Handles both per-100g and per-serving nutrition data

### Responsive Design
- Mobile-first approach
- Breakpoints for tablets and mobile devices
- Touch-friendly interface elements

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

### Modifying Styles
- Edit `styles.css`
- CSS variables are defined at the top for easy theme customization
- Responsive breakpoints are clearly marked

## 📝 Notes

- All nutrition calculations are based on the data provided in `products.json`
- The app uses client-side storage - data is stored in your browser
- For accurate nutrition tracking, ensure product data is up-to-date
- Export functionality allows you to save your analysis for external use

## 🐛 Troubleshooting

### Products not loading
- Ensure `products.json` is in the same directory as `index.html`
- Check browser console for errors
- Verify you're running on a local server (not file://)

### Charts not displaying
- Ensure Chart.js CDN is accessible
- Check browser console for JavaScript errors

### Theme not persisting
- Clear browser cache and localStorage
- Ensure JavaScript is enabled

## 📄 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Feel free to:
- Add more products to the database
- Improve the UI/UX
- Add new features
- Report bugs

## 📧 Support

For issues or questions, please check the code comments or create an issue in the repository.

---

**Made with ❤️ for better nutrition tracking**

# NutritionTracker

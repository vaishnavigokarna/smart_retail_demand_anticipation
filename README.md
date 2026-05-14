# Smart Retail AI Demand Forecasting Platform

An enterprise-grade, predictive analytics dashboard powered by Machine Learning. This platform uses pre-trained **SARIMA** and **ARIMA** models applied to real retail sales datasets (Walmart) to forecast product demand, analyze inventory risk, and project revenue timelines.

## ✨ Key Features

- **AI-Powered Forecasting**: Generates precise 1-week to 3-month predictive demand curves uniquely scaled for each product using historical `Weekly_Sales` data.
- **Premium Analytics UI**: A stunning, responsive "glassmorphism" interface built with Tailwind CSS, featuring floating glows, animated category cards, and deep dark theming (`#0f111a`).
- **Dynamic KPI Extrapolation**: Automatically calculates Annual Predicted Revenue (natively formatted in INR ₹), Demand Growth Percentage, and dynamic Inventory Risk based on the machine learning output.
- **Real-Time Data Visualization**: Integrates **Chart.js** to flawlessly render combined historical dataset trends (purple) with future AI forecast trajectories (dashed cyan).
- **Deep Linking**: Instantly share specific product analytics via URL parameter navigation (e.g., `?search=Bread`).

## 🛠 Tech Stack

- **Backend / API**: Python 3, Flask, Pandas, NumPy
- **Machine Learning**: Statsmodels, Scikit-learn, Joblib (SARIMA/ARIMA Ensembling)
- **Frontend Design**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Data Visualization**: Chart.js

## 📁 Directory Structure

```text
smart retail/
├── app.py                      # Core Flask backend API and ML integration logic
├── requirements.txt            # Python dependencies
├── README.md                   # Project documentation
├── models/                     # Directory containing trained ML artifacts
│   ├── arima_model.pkl         # Trained ARIMA model
│   └── sarima_model.pkl        # Trained SARIMA model
├── static/                     # Static web assets
│   ├── style.css               # Custom CSS (Glassmorphism, Gradients, Animations)
│   └── script.js               # Frontend Logic, Chart.js configurations, API fetching
└── templates/                  # Jinja2 HTML Templates
    ├── index.html              # Animated Category Landing Page
    └── dashboard.html          # Main Forecasting Analytics Dashboard
```

## 🚀 Installation & Setup

1. **Clone or Download the Repository**
   Ensure you have downloaded all files into your local directory.
   
2. **Setup Dataset Location**
   The application natively references the dataset located at `C:\Users\Admin\Documents\smart retail demand\data\retail_sales.csv`. Ensure your dataset is located there, or update the `DATASET_PATH` constant inside `app.py`.

3. **Install Dependencies**
   Navigate to the project root and install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Application**
   Start the Flask development server:
   ```bash
   python app.py
   ```

5. **View the Dashboard**
   Open your preferred web browser and navigate to:
   ```text
   http://127.0.0.1:5000
   ```

## 💡 How It Works

1. **Category Selection**: The user selects a high-level retail category on the landing page.
2. **Product Hashing**: The backend hashes queried product names (like "Milk" or "Laptop") to securely map them to exact `Store` and `Dept` arrays from the underlying Walmart dataset.
3. **Data Fetching**: True historical data is pulled and rendered for that specific department mapping. 
4. **Trajectory Scaling**: The global SARIMA prediction is automatically loaded via `joblib`, and mathematically scaled so that the forecasting vector flawlessly connects to the exact magnitude of the historical dataset without any harsh breaks. 
5. **Interactive UI**: The frontend immediately consumes this robust JSON payload, parsing the dates, formatting the KPI financials, and animating the Chart.js canvas.

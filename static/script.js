document.addEventListener('DOMContentLoaded', () => {
    // State
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category') || 'All Categories';
    let currentTimeline = urlParams.get('timeline') || '1M';
    let currentProduct = urlParams.get('search') || 'Milk'; // Default
    let chartInstance = null;

    // DOM Elements
    const timelineBtns = document.querySelectorAll('.timeline-btn');
    const searchInput = document.getElementById('product-search');
    const productTitle = document.getElementById('current-product-title');
    
    // KPI Elements
    const kpiAcc = document.getElementById('kpi-accuracy');
    const kpiGrowth = document.getElementById('kpi-growth');
    const kpiRev = document.getElementById('kpi-revenue');
    const kpiRisk = document.getElementById('kpi-risk');
    const kpiStock = document.getElementById('kpi-stock');

    // Setup Chart.js Defaults
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // Initialize
    fetchCategoriesAndProducts();
    
    // Set initial product based on category if possible, unless specified in URL
    setTimeout(() => {
        if (!urlParams.get('search')) {
            const topProductEl = document.querySelector('.top-product-item');
            if(topProductEl) {
                currentProduct = topProductEl.dataset.name;
            }
        }
        searchInput.value = currentProduct;
        fetchForecastData();
    }, 500);

    // Event Listeners
    timelineBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            timelineBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTimeline = e.target.dataset.time;
            fetchForecastData();
        });
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentProduct = searchInput.value.trim() || 'Product';
            fetchForecastData();
        }
    });

    // Functions
    function fetchCategoriesAndProducts() {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('top-products-list');
                list.innerHTML = '';
                
                // Fallback to Grocery if category not found
                const products = data.top_products[currentCategory] || data.top_products["Grocery & Supermarket"];
                
                products.forEach((prod, idx) => {
                    const delayClass = `delay-${(idx + 1) * 100}`;
                    const trendColor = prod.trend === 'up' ? 'text-green-400' : (prod.trend === 'down' ? 'text-red-400' : 'text-gray-400');
                    const trendIcon = prod.trend === 'up' ? 'fa-arrow-trend-up' : (prod.trend === 'down' ? 'fa-arrow-trend-down' : 'fa-minus');
                    
                    const item = document.createElement('div');
                    item.className = `glass-card p-3 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors animate-fade-in-up ${delayClass} top-product-item`;
                    item.dataset.name = prod.name;
                    
                    item.innerHTML = `
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs text-cyan-400 border border-white/10">
                                #${idx + 1}
                            </div>
                            <div>
                                <div class="font-bold text-sm text-white">${prod.name}</div>
                                <div class="text-xs text-gray-500">Score: ${prod.score}</div>
                            </div>
                        </div>
                        <div class="flex flex-col items-end">
                            <div class="font-bold ${trendColor} text-sm">+${prod.growth}%</div>
                            <i class="fa-solid ${trendIcon} ${trendColor} text-xs mt-1"></i>
                        </div>
                    `;
                    
                    item.addEventListener('click', () => {
                        currentProduct = prod.name;
                        searchInput.value = currentProduct;
                        fetchForecastData();
                    });
                    
                    list.appendChild(item);
                });
            })
            .catch(err => {
                document.getElementById('top-products-list').innerHTML = `<div class="text-red-400 text-sm">Failed to load predictions</div>`;
            });
    }

    function fetchForecastData() {
        // Add loading state
        productTitle.innerHTML = `${currentProduct} <i class="fa-solid fa-spinner fa-spin text-sm text-cyan-400 ml-2"></i>`;
        
        fetch(`/api/forecast?product=${encodeURIComponent(currentProduct)}&timeline=${currentTimeline}`)
            .then(res => res.json())
            .then(data => {
                productTitle.textContent = currentProduct;
                updateKPIs(data.kpis);
                renderChart(data);
            })
            .catch(err => {
                productTitle.textContent = currentProduct;
                console.error("Error fetching forecast:", err);
            });
    }

    function updateKPIs(kpis) {
        kpiAcc.textContent = kpis.accuracy;
        kpiGrowth.textContent = kpis.growth;
        
        // Dynamic risk coloring
        kpiRisk.textContent = kpis.inventory_risk;
        if(kpis.inventory_risk === 'High') {
            kpiRisk.className = 'text-2xl font-bold text-red-400';
        } else if(kpis.inventory_risk === 'Medium') {
            kpiRisk.className = 'text-2xl font-bold text-yellow-400';
        } else {
            kpiRisk.className = 'text-2xl font-bold text-green-400';
        }
        
        kpiRev.textContent = kpis.revenue;
        kpiStock.textContent = kpis.stock_availability;
    }

    function renderChart(data) {
        const ctx = document.getElementById('forecastChart').getContext('2d');
        
        if (chartInstance) {
            chartInstance.destroy();
        }

        const histDates = data.history.dates;
        const histValues = data.history.values;
        const foreDates = data.forecast.dates;
        const foreValues = data.forecast.values;

        const allLabels = [...histDates, ...foreDates];
        
        // Pad arrays so history stops where forecast starts
        const historicalDataArray = [...histValues, ...Array(foreValues.length).fill(null)];
        
        // Ensure the forecast line connects to the last historical point
        const forecastDataArray = [...Array(histValues.length - 1).fill(null), histValues[histValues.length - 1], ...foreValues];

        // Gradient for Forecast
        const gradientForecast = ctx.createLinearGradient(0, 0, 0, 400);
        gradientForecast.addColorStop(0, 'rgba(0, 240, 255, 0.5)');
        gradientForecast.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allLabels,
                datasets: [
                    {
                        label: 'Historical Data',
                        data: historicalDataArray,
                        borderColor: 'rgba(138, 43, 226, 0.6)', // Purple
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'AI Forecast',
                        data: forecastDataArray,
                        borderColor: '#00f0ff', // Cyan
                        backgroundColor: gradientForecast,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        borderDash: [5, 5] // Dashed line for future
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 17, 26, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#00f0ff',
                        borderColor: 'rgba(0, 240, 255, 0.3)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Demand: ${context.parsed.y.toFixed(0)} units`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: 10,
                            color: '#64748b'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
});

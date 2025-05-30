# 🚀 Dynamic Procurement Charts for Dashboard

[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Recharts](https://img.shields.io/badge/Recharts-2.0+-green.svg)](https://recharts.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0+-blue.svg)](https://tailwindcss.com/)

A powerful React-based dashboard system that generates charts dynamically using parameterized configurations stored in a database. Unlike traditional dashboards with hardcoded queries, this system builds SQL queries on-demand based on user parameters, providing ultimate flexibility for procurement spend analysis.

## ✨ Key Features

### 🎯 **Dynamic Chart System**
- **Parameterized Configurations**: Chart settings stored as JSON in database
- **Dynamic SQL Generation**: Queries built on-demand based on user parameters
- **No Hardcoded Queries**: Maximum flexibility for data exploration
- **Real-time Parameter Controls**: Users can adjust limits, filters, and date ranges

### 📊 **Supported Chart Types**
- **🔄 Horizontal Bar Charts** - Perfect for commodity/category analysis
- **🥧 Pie Charts** - Standard circular charts for proportions  
- **🍩 Donut Charts** - Pie charts with center hole for geographic/vendor data

### 🔧 **Interactive Features**
- **Live Parameter Controls** - Modify chart parameters in real-time
- **Chart Selector** - Add/remove charts dynamically
- **Responsive Design** - Works perfectly on desktop and mobile
- **Loading States** - Smooth user experience with proper feedback
- **Error Handling** - Graceful failure with user-friendly messages

## 🎬 Demo

![Dashboard Preview](docs/images/dashboard-preview.png)

*Dynamic charts with real-time parameter controls for procurement spend analysis*

## 🏗️ Architecture

### Database-Driven Configuration
```mermaid
graph TD
    A[User Interface] --> B[Parameter Controls]
    B --> C[Chart API Service]
    C --> D[Dynamic SQL Builder]
    D --> E[Database Query]
    E --> F[Chart Renderer]
    F --> A
    
    G[Chart Configs Table] --> D
    H[Spend Data Tables] --> E
```

### Component Structure
```
src/
├── components/
│   ├── Dashboard.jsx           # Main container component
│   ├── DynamicChart.jsx        # Generic chart renderer
│   ├── ChartControls.jsx       # Parameter input controls
│   └── ChartAPIService.js      # Data fetching service
├── data/
│   └── database-schema.sql     # Database setup
└── docs/
    ├── API.md                  # API documentation
    └── DEPLOYMENT.md           # Deployment guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- React 18+
- Database (SQLite/PostgreSQL/MySQL)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/myownipgit/dynamic-procurement-dashboard.git
cd dynamic-procurement-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
# Run the database schema
sqlite3 procurement.db < data/database-schema.sql
```

4. **Start the development server**
```bash
npm start
```

5. **Open your browser**
```
http://localhost:3000
```

## 📋 Current Chart Configurations

### 1. 📊 Top Commodities (horizontal_bar)
- **Purpose**: Analyze spending by commodity categories
- **Parameters**: 
  - `limit` (1-50) - Number of results
  - `date_range` - Time period filter
  - `min_amount` - Minimum spending threshold
- **Data Source**: `spend_transactions` + `commodities` tables

### 2. 🥧 Vendor Spend Analysis (pie)
- **Purpose**: Vendor spending distribution
- **Parameters**:
  - `limit` (default 5) - Number of vendors
  - `state_filter` - Filter by vendor state
- **Data Source**: `spend_transactions` + `vendors` tables

### 3. 🍩 Geographic Distribution (donut)
- **Purpose**: Spending by state/location
- **Parameters**:
  - `limit` (default 5) - Number of states
  - `exclude_states` - States to exclude
- **Data Source**: `spend_transactions` + `vendors` tables

## 🔄 Dynamic SQL Generation

The system automatically builds optimized SQL queries from configuration:

**Configuration Input:**
```json
{
  "base_table": "spend_transactions",
  "join_tables": ["commodities ON spend_transactions.commodity_id = commodities.commodity_id"],
  "group_by_field": "commodities.commodity_description",
  "value_field": "SUM(spend_transactions.total_amount)",
  "parameters": {"limit": 10, "min_amount": 1000000}
}
```

**Generated SQL Output:**
```sql
SELECT commodities.commodity_description as label, 
       SUM(spend_transactions.total_amount) as value,
       ROUND(SUM(spend_transactions.total_amount) * 100.0 / 
         (SELECT SUM(total_amount) FROM spend_transactions), 1) as percentage
FROM spend_transactions 
JOIN commodities ON spend_transactions.commodity_id = commodities.commodity_id
WHERE SUM(spend_transactions.total_amount) >= 1000000
GROUP BY commodities.commodity_description 
ORDER BY value DESC 
LIMIT 10
```

## 🛠️ Adding New Charts

Create a new chart by adding a configuration to the `dynamic_chart_configs` table:

```sql
INSERT INTO dynamic_chart_configs (
  chart_id, chart_name, chart_type, base_table, 
  join_tables, group_by_field, value_field, chart_options, parameters
) VALUES (
  'monthly_trends',
  'Monthly Spending Trends',
  'line',
  'spend_transactions',
  '[]',
  'strftime("%Y-%m", transaction_date)',
  'SUM(total_amount)',
  '{"colors": ["#3498DB"], "showPoints": true}',
  '{"months": {"type": "number", "default": 12}}'
);
```

The chart automatically appears in the dashboard with parameter controls!

## 🎨 Styling & Customization

### Color Schemes
Charts use predefined color palettes:
- **Standard**: `["#3498DB", "#E74C3C", "#2ECC71", "#F39C12", "#9B59B6"]`
- **Vendor Analysis**: `["#D2524F", "#5B9BD5", "#70AD47", "#E59C39", "#9B59B6"]`
- **Geographic**: `["#70AD47", "#5B9BD5", "#E59C39", "#9B59B6", "#D2524F"]`

### Responsive Design
- **Desktop**: Full-width charts with side-by-side parameter controls
- **Tablet**: Stacked layout with condensed controls  
- **Mobile**: Single-column layout with collapsible parameters

## 🔒 Security Features

- **🛡️ Parameterized Queries**: Prevents SQL injection attacks
- **✅ Input Validation**: Type checking on all parameters
- **🚫 Query Limits**: Maximum result limits to prevent performance issues
- **📝 Audit Logging**: Track chart access and parameter usage

## 📈 Performance Optimizations

- **⚡ Query Caching**: Frequently accessed data cached in memory
- **📊 Pagination**: Large result sets automatically paginated
- **🔍 Indexed Joins**: Optimized database indexes on join columns
- **🎯 Lazy Loading**: Charts loaded on-demand as users select them

## 🚀 Production Deployment

### Environment Setup
```bash
# Build for production
npm run build

# Set environment variables
export DATABASE_URL="postgresql://user:pass@host:5432/procurement"
export REDIS_URL="redis://localhost:6379"
export NODE_ENV="production"
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Database Migration
```bash
# PostgreSQL setup
psql $DATABASE_URL < data/postgresql-schema.sql

# Add indexes for performance
psql $DATABASE_URL < data/production-indexes.sql
```

## 📊 Sample Data

The repository includes sample procurement data:
- **10,000+ transactions** across multiple categories
- **1,650+ vendors** from various states
- **50+ commodity types** with realistic spending patterns
- **Geographic distribution** weighted toward Texas (81.9%)

## 🔮 Future Enhancements

### Planned Features
- [ ] **📈 Line Charts** - Time series analysis for spending trends
- [ ] **📋 Stacked Bar Charts** - Multi-dimensional category analysis  
- [ ] **📤 Export Functionality** - PDF and Excel export options
- [ ] **🔄 Real-time Updates** - WebSocket integration for live data
- [ ] **🎨 Custom Themes** - User-selectable color schemes
- [ ] **👥 User Preferences** - Personalized dashboard layouts
- [ ] **📱 Mobile App** - React Native companion app

### Advanced Analytics
- [ ] **🤖 AI-Powered Insights** - Automated spending anomaly detection
- [ ] **📊 Predictive Analytics** - Forecast future spending patterns
- [ ] **🎯 Smart Recommendations** - Suggest cost optimization opportunities
- [ ] **📈 Benchmark Analysis** - Compare against industry standards

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Recharts** - Excellent React charting library
- **Tailwind CSS** - Utility-first CSS framework
- **React** - Amazing UI library
- **SQLite** - Reliable embedded database

## 📞 Support

- 📧 **Email**: support@dynamicprocurement.com
- 💬 **Discussions**: [GitHub Discussions](https://github.com/myownipgit/dynamic-procurement-dashboard/discussions)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/myownipgit/dynamic-procurement-dashboard/issues)
- 📖 **Documentation**: [Wiki](https://github.com/myownipgit/dynamic-procurement-dashboard/wiki)

---

⭐ **Star this repository** if you find it helpful!

**Built with ❤️ for modern procurement analytics**

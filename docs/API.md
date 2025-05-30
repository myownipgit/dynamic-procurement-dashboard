# 🔗 API Documentation

The Dynamic Procurement Dashboard exposes RESTful APIs for chart configuration management and data retrieval. This document provides comprehensive information about available endpoints, request/response formats, and implementation examples.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Chart Configuration API](#chart-configuration-api)
- [Chart Data API](#chart-data-api)
- [Dynamic SQL Query Builder](#dynamic-sql-query-builder)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## 🌐 Base URL

```
Production:  https://api.dynamicprocurement.com/v1
Development: http://localhost:3001/api/v1
```

## 🔐 Authentication

All API requests require authentication using API keys or JWT tokens:

```http
Authorization: Bearer <your-api-token>
Content-Type: application/json
```

### API Key Management
```bash
# Get API key
curl -X POST /auth/api-keys \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"name": "Dashboard Access", "permissions": ["charts:read", "data:read"]}'
```

## 📊 Chart Configuration API

### List Available Charts

**GET** `/charts`

Retrieve all available chart configurations.

**Response:**
```json
{
  "charts": [
    {
      "id": "top_commodities_bar",
      "name": "Top Commodities",
      "type": "horizontal_bar",
      "description": "Analyze spending by commodity categories",
      "created_date": "2025-05-30T17:52:09Z",
      "updated_date": "2025-05-30T17:52:09Z"
    },
    {
      "id": "vendor_spend_analysis", 
      "name": "Vendor Spend Analysis",
      "type": "pie",
      "description": "Vendor spending distribution analysis",
      "created_date": "2025-05-30T17:52:09Z",
      "updated_date": "2025-05-30T17:52:09Z"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 50
}
```

### Get Chart Configuration

**GET** `/charts/{chart_id}/config`

Retrieve detailed configuration for a specific chart.

**Parameters:**
- `chart_id` (string, required): Unique chart identifier

**Response:**
```json
{
  "chart_id": "top_commodities_bar",
  "chart_name": "Top Commodities",
  "chart_type": "horizontal_bar",
  "base_table": "spend_transactions",
  "join_tables": ["commodities ON spend_transactions.commodity_id = commodities.commodity_id"],
  "group_by_field": "commodities.commodity_description",
  "value_field": "SUM(spend_transactions.total_amount)",
  "label_field": "commodities.commodity_description",
  "chart_options": {
    "colors": ["#3498DB", "#E74C3C", "#2ECC71", "#F39C12", "#9B59B6"],
    "showValues": true,
    "responsive": true
  },
  "parameters": {
    "limit": {
      "type": "number",
      "default": 10,
      "max": 50,
      "description": "Maximum number of results to return"
    },
    "date_range": {
      "type": "date_range", 
      "default": null,
      "description": "Filter by transaction date range"
    },
    "min_amount": {
      "type": "number",
      "default": null,
      "description": "Minimum spending amount threshold"
    }
  },
  "filters": {
    "active": true
  }
}
```

### Create Chart Configuration

**POST** `/charts/config`

Create a new chart configuration.

**Request Body:**
```json
{
  "chart_id": "monthly_trends_line",
  "chart_name": "Monthly Spending Trends",
  "chart_type": "line",
  "base_table": "spend_transactions",
  "join_tables": [],
  "group_by_field": "strftime('%Y-%m', transaction_date)",
  "value_field": "SUM(total_amount)",
  "label_field": "strftime('%Y-%m', transaction_date)",
  "chart_options": {
    "colors": ["#3498DB"],
    "showPoints": true,
    "responsive": true
  },
  "parameters": {
    "months": {
      "type": "number",
      "default": 12,
      "max": 24,
      "description": "Number of months to display"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "chart_id": "monthly_trends_line",
  "message": "Chart configuration created successfully",
  "created_date": "2025-05-30T18:00:00Z"
}
```

### Update Chart Configuration

**PUT** `/charts/{chart_id}/config`

Update an existing chart configuration.

**Response:**
```json
{
  "success": true,
  "chart_id": "monthly_trends_line",
  "message": "Chart configuration updated successfully",
  "updated_date": "2025-05-30T18:15:00Z"
}
```

### Delete Chart Configuration

**DELETE** `/charts/{chart_id}/config`

Delete a chart configuration.

**Response:**
```json
{
  "success": true,
  "message": "Chart configuration deleted successfully"
}
```

## 📈 Chart Data API

### Get Chart Data

**GET** `/charts/{chart_id}/data`

Retrieve chart data using dynamic SQL generation.

**Parameters:**
- `chart_id` (string, required): Chart identifier
- `limit` (number, optional): Limit number of results
- `offset` (number, optional): Pagination offset
- `date_from` (string, optional): Start date filter (ISO 8601)
- `date_to` (string, optional): End date filter (ISO 8601)
- `min_amount` (number, optional): Minimum amount filter
- `state_filter` (string, optional): State filter for geographic charts
- `exclude_states` (array, optional): States to exclude

**Example Request:**
```http
GET /charts/top_commodities_bar/data?limit=10&min_amount=1000000&date_from=2024-01-01
```

**Response:**
```json
{
  "chart_id": "top_commodities_bar",
  "data": [
    {
      "label": "Transformers",
      "value": 37877482,
      "percentage": 7.3,
      "formatted_value": "$37.9M"
    },
    {
      "label": "Watt-Hour Meters", 
      "value": 16008219,
      "percentage": 3.1,
      "formatted_value": "$16.0M"
    }
  ],
  "total_records": 2,
  "generated_sql": "SELECT commodities.commodity_description as label, SUM(spend_transactions.total_amount) as value...",
  "execution_time_ms": 45,
  "cache_hit": false,
  "parameters_used": {
    "limit": 10,
    "min_amount": 1000000,
    "date_from": "2024-01-01"
  }
}
```

### Bulk Chart Data

**POST** `/charts/data/bulk`

Retrieve data for multiple charts in a single request.

**Request Body:**
```json
{
  "charts": [
    {
      "chart_id": "top_commodities_bar",
      "parameters": {"limit": 10}
    },
    {
      "chart_id": "vendor_spend_analysis", 
      "parameters": {"limit": 5, "state_filter": "TX"}
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "chart_id": "top_commodities_bar",
      "data": [...],
      "success": true
    },
    {
      "chart_id": "vendor_spend_analysis",
      "data": [...], 
      "success": true
    }
  ],
  "total_execution_time_ms": 125
}
```

## ⚡ Dynamic SQL Query Builder

The system automatically generates optimized SQL queries based on chart configuration and user parameters.

### Query Building Process

1. **Base Query Construction**
   ```sql
   SELECT {group_by_field} as label, {value_field} as value
   ```

2. **Join Table Addition**
   ```sql
   FROM {base_table}
   JOIN {join_tables[0]}
   JOIN {join_tables[1]}
   ```

3. **Filter Application**
   ```sql
   WHERE {dynamic_conditions}
   ```

4. **Grouping and Ordering**
   ```sql
   GROUP BY {group_by_field}
   ORDER BY value DESC
   ```

5. **Limit Application**
   ```sql
   LIMIT {parameter_limit}
   ```

### Query Optimization

- **Parameterized Queries**: All user inputs are parameterized to prevent SQL injection
- **Index Utilization**: Queries are optimized to use existing database indexes
- **Result Caching**: Frequently requested data is cached for 5 minutes
- **Query Timeouts**: All queries have a 30-second timeout limit

### Supported SQL Features

- ✅ **Aggregation Functions**: SUM, COUNT, AVG, MIN, MAX
- ✅ **Date Functions**: Date formatting, extraction, arithmetic
- ✅ **String Functions**: LIKE, CONCAT, SUBSTRING
- ✅ **Conditional Logic**: CASE statements, COALESCE
- ✅ **Window Functions**: ROW_NUMBER, RANK, DENSE_RANK
- ❌ **Subqueries**: Limited to specific approved patterns
- ❌ **Dynamic DDL**: CREATE, ALTER, DROP statements blocked

## ❌ Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CHART_ID",
    "message": "Chart configuration not found",
    "details": "Chart ID 'invalid_chart' does not exist",
    "timestamp": "2025-05-30T18:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CHART_ID` | 404 | Chart configuration not found |
| `INVALID_PARAMETERS` | 400 | Invalid or missing parameters |
| `SQL_EXECUTION_ERROR` | 500 | Database query execution failed |
| `QUERY_TIMEOUT` | 408 | Query execution exceeded time limit |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 422 | Request validation failed |

### Error Recovery Strategies

1. **Retry Logic**: Implement exponential backoff for transient errors
2. **Circuit Breaker**: Stop making requests after consecutive failures
3. **Fallback Data**: Use cached data when real-time queries fail
4. **Graceful Degradation**: Show partial data or simplified charts

## 🚦 Rate Limiting

### Request Limits

| Endpoint Type | Requests per Minute | Burst Limit |
|---------------|-------------------|-------------|
| Chart Config | 100 | 20 |
| Chart Data | 500 | 50 |
| Bulk Data | 50 | 10 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 485
X-RateLimit-Reset: 1635724800
X-RateLimit-Retry-After: 60
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retry_after": 60
  }
}
```

## 🔧 Examples

### JavaScript/React Integration

```javascript
// Chart API Service
class ChartAPIService {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async getChartConfig(chartId) {
    const response = await fetch(`${this.baseURL}/charts/${chartId}/config`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getChartData(chartId, parameters = {}) {
    const queryParams = new URLSearchParams(parameters).toString();
    const url = `${this.baseURL}/charts/${chartId}/data?${queryParams}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createChart(config) {
    const response = await fetch(`${this.baseURL}/charts/config`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Usage example
const apiService = new ChartAPIService(
  'https://api.dynamicprocurement.com/v1',
  'your-api-key'
);

// Get chart data with parameters
const chartData = await apiService.getChartData('top_commodities_bar', {
  limit: 15,
  min_amount: 500000,
  date_from: '2024-01-01',
  date_to: '2024-12-31'
});
```

### Python Integration

```python
import requests
from typing import Dict, List, Optional

class ChartAPIClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def get_chart_data(self, chart_id: str, **params) -> Dict:
        url = f"{self.base_url}/charts/{chart_id}/data"
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def create_chart(self, config: Dict) -> Dict:
        url = f"{self.base_url}/charts/config"
        response = requests.post(url, headers=self.headers, json=config)
        response.raise_for_status()
        return response.json()

# Usage
client = ChartAPIClient(
    'https://api.dynamicprocurement.com/v1',
    'your-api-key'
)

data = client.get_chart_data(
    'vendor_spend_analysis',
    limit=10,
    state_filter='TX'
)
```

### cURL Examples

```bash
# Get chart configuration
curl -X GET "https://api.dynamicprocurement.com/v1/charts/top_commodities_bar/config" \
  -H "Authorization: Bearer your-api-key"

# Get chart data with parameters
curl -X GET "https://api.dynamicprocurement.com/v1/charts/top_commodities_bar/data?limit=10&min_amount=1000000" \
  -H "Authorization: Bearer your-api-key"

# Create new chart configuration
curl -X POST "https://api.dynamicprocurement.com/v1/charts/config" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "chart_id": "custom_analysis",
    "chart_name": "Custom Analysis",
    "chart_type": "bar",
    "base_table": "spend_transactions",
    "group_by_field": "department",
    "value_field": "SUM(total_amount)"
  }'

# Bulk data request
curl -X POST "https://api.dynamicprocurement.com/v1/charts/data/bulk" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "charts": [
      {"chart_id": "top_commodities_bar", "parameters": {"limit": 10}},
      {"chart_id": "vendor_spend_analysis", "parameters": {"limit": 5}}
    ]
  }'
```

## 🔒 Security Considerations

### Input Validation
- All parameters are validated against predefined schemas
- SQL injection prevention through parameterized queries
- Maximum query complexity limits to prevent DoS attacks

### Data Access Control
- Row-level security based on user permissions
- Audit logging for all data access requests
- Encryption of sensitive configuration data

### API Security
- HTTPS required for all requests
- API key rotation every 90 days
- Request signing for sensitive operations

---

**For more examples and advanced usage, see the [Examples Repository](https://github.com/myownipgit/dynamic-procurement-dashboard-examples)**
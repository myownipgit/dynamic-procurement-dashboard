import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Mock API service - In production, this would be actual REST API calls
class ChartAPIService {
  // Simulates the dynamic_chart_configs table
  static chartConfigs = {
    'top_commodities_bar': {
      chart_id: 'top_commodities_bar',
      chart_name: 'Top Commodities',
      chart_type: 'horizontal_bar',
      base_table: 'spend_transactions',
      join_tables: ['commodities ON spend_transactions.commodity_id = commodities.commodity_id'],
      group_by_field: 'commodities.commodity_description',
      value_field: 'SUM(spend_transactions.total_amount)',
      label_field: 'commodities.commodity_description',
      chart_options: {
        colors: ['#3498DB', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6'],
        showValues: true,
        responsive: true
      },
      parameters: {
        limit: { type: 'number', default: 10, max: 50 },
        date_range: { type: 'date_range', default: null },
        min_amount: { type: 'number', default: null }
      }
    },
    'vendor_spend_analysis': {
      chart_id: 'vendor_spend_analysis',
      chart_name: 'Vendor Spend Analysis',
      chart_type: 'pie',
      base_table: 'spend_transactions',
      join_tables: ['vendors ON spend_transactions.vendor_id = vendors.vendor_id'],
      group_by_field: 'vendors.vendor_name',
      value_field: 'SUM(spend_transactions.total_amount)',
      label_field: 'vendors.vendor_name',
      chart_options: {
        colors: ['#D2524F', '#5B9BD5', '#70AD47', '#E59C39', '#9B59B6'],
        innerRadius: 0,
        showPercentages: true
      },
      parameters: {
        limit: { type: 'number', default: 5 },
        state_filter: { type: 'string', default: null }
      }
    },
    'geographic_distribution': {
      chart_id: 'geographic_distribution',
      chart_name: 'Geographic Distribution',
      chart_type: 'donut',
      base_table: 'spend_transactions',
      join_tables: ['vendors ON spend_transactions.vendor_id = vendors.vendor_id'],
      group_by_field: 'vendors.state',
      value_field: 'SUM(spend_transactions.total_amount)',
      label_field: 'vendors.state',
      chart_options: {
        colors: ['#70AD47', '#5B9BD5', '#E59C39', '#9B59B6', '#D2524F'],
        innerRadius: 60,
        outerRadius: 120
      },
      parameters: {
        limit: { type: 'number', default: 5 },
        exclude_states: { type: 'array', default: [] }
      }
    }
  };

  // Dynamic SQL query builder
  static buildQuery(config, parameters = {}) {
    const { base_table, join_tables, group_by_field, value_field, label_field } = config;
    const limit = parameters.limit || config.parameters.limit.default;
    
    let query = `SELECT ${group_by_field} as label, ${value_field} as value`;
    
    // Add percentage calculation
    query += `, ROUND(${value_field} * 100.0 / (SELECT SUM(total_amount) FROM ${base_table}), 1) as percentage`;
    
    query += ` FROM ${base_table}`;
    
    // Add joins
    if (join_tables && join_tables.length > 0) {
      join_tables.forEach(join => {
        query += ` JOIN ${join}`;
      });
    }
    
    // Add WHERE conditions
    let whereConditions = [];
    
    if (parameters.state_filter) {
      whereConditions.push(`vendors.state = '${parameters.state_filter}'`);
    }
    
    if (parameters.min_amount) {
      whereConditions.push(`${value_field} >= ${parameters.min_amount}`);
    }
    
    if (config.filters?.exclude_null && group_by_field.includes('state')) {
      whereConditions.push(`vendors.state IS NOT NULL AND vendors.state != ''`);
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    query += ` GROUP BY ${group_by_field}`;
    query += ` ORDER BY value DESC`;
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    
    return query;
  }

  // Simulate API call to get chart configuration
  static async getChartConfig(chartId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.chartConfigs[chartId] || null);
      }, 100);
    });
  }

  // Simulate API call to get chart data
  static async getChartData(chartId, parameters = {}) {
    const config = this.chartConfigs[chartId];
    if (!config) return null;

    // Simulate database query execution
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [];
        
        if (chartId === 'top_commodities_bar') {
          data = [
            { label: 'Transformers', value: 37877482, percentage: 7.3 },
            { label: 'Watt-Hour Meters', value: 16008219, percentage: 3.1 },
            { label: 'Asphaltic Concrete', value: 13807827, percentage: 2.7 },
            { label: 'Switchgears', value: 13538858, percentage: 2.6 },
            { label: 'Air Tools', value: 13431282, percentage: 2.6 },
            { label: 'Construction Materials', value: 8500000, percentage: 1.6 },
            { label: 'Office Supplies', value: 5200000, percentage: 1.0 },
            { label: 'Vehicles', value: 4800000, percentage: 0.9 },
            { label: 'IT Equipment', value: 3900000, percentage: 0.8 },
            { label: 'Safety Equipment', value: 2100000, percentage: 0.4 }
          ];
        } else if (chartId === 'vendor_spend_analysis') {
          data = [
            { label: 'Techline', value: 30343314.45, percentage: 5.9 },
            { label: 'Sun Coast', value: 29703968.75, percentage: 5.8 },
            { label: 'TX Electric', value: 24473960.56, percentage: 4.7 },
            { label: 'Oldcastle', value: 12862213.76, percentage: 2.5 },
            { label: 'Priester-Mell', value: 12631177.43, percentage: 2.4 }
          ];
        } else if (chartId === 'geographic_distribution') {
          data = [
            { label: 'Texas', value: 422328849.38, percentage: 81.9 },
            { label: 'Florida', value: 9580663.01, percentage: 1.9 },
            { label: 'Ohio', value: 7450230.9, percentage: 1.4 },
            { label: 'New Jersey', value: 6635313.89, percentage: 1.3 },
            { label: 'Georgia', value: 6276214.45, percentage: 1.2 }
          ];
        }

        // Apply limit parameter
        const limit = parameters.limit || config.parameters.limit.default;
        if (limit && data.length > limit) {
          data = data.slice(0, limit);
        }

        resolve(data);
      }, 200);
    });
  }

  // Get available chart types
  static async getAvailableCharts() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Object.keys(this.chartConfigs).map(key => ({
          id: key,
          name: this.chartConfigs[key].chart_name,
          type: this.chartConfigs[key].chart_type
        })));
      }, 100);
    });
  }
}

// Chart Parameter Controls Component
const ChartControls = ({ config, parameters, onParameterChange }) => {
  if (!config?.parameters) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Chart Parameters</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(config.parameters).map(([key, param]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
            </label>
            {param.type === 'number' && (
              <input
                type="number"
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={parameters[key] || param.default || ''}
                onChange={(e) => onParameterChange(key, e.target.value ? parseInt(e.target.value) : null)}
                max={param.max}
                placeholder={`Default: ${param.default}`}
              />
            )}
            {param.type === 'string' && (
              <input
                type="text"
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={parameters[key] || ''}
                onChange={(e) => onParameterChange(key, e.target.value || null)}
                placeholder={`Optional filter`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Generic Chart Component
const DynamicChart = ({ chartId, parameters = {} }) => {
  const [config, setConfig] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChart = async () => {
      try {
        setLoading(true);
        const [chartConfig, chartData] = await Promise.all([
          ChartAPIService.getChartConfig(chartId),
          ChartAPIService.getChartData(chartId, parameters)
        ]);
        
        if (!chartConfig) {
          setError(`Chart configuration not found: ${chartId}`);
          return;
        }

        setConfig(chartConfig);
        setData(chartData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadChart();
  }, [chartId, JSON.stringify(parameters)]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{data.label}</p>
          <p className="text-blue-600">
            Value: ${(data.value / 1000000).toFixed(1)}M
          </p>
          <p className="text-green-600">
            Share: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!config || !data.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No data available for this chart</p>
      </div>
    );
  }

  const renderChart = () => {
    const { chart_options } = config;
    
    if (config.chart_type === 'horizontal_bar') {
      // Debug: Log the data to console
      console.log('Bar chart data:', data);
      
      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart 
            data={data} 
            layout="horizontal" 
            margin={{ top: 20, right: 60, left: 200, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              domain={[0, 'dataMax + 1000000']}
            />
            <YAxis 
              type="category" 
              dataKey="label" 
              width={180}
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <Tooltip 
              formatter={(value, name, props) => [`$${(value / 1000000).toFixed(1)}M`, 'Spend Amount']}
              labelFormatter={(label) => `Category: ${label}`}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chart_options.colors[index % chart_options.colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (config.chart_type === 'pie' || config.chart_type === 'donut') {
      const innerRadius = config.chart_type === 'donut' ? (chart_options.innerRadius || 60) : 0;
      
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={chart_options.outerRadius || 120}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
              label={({ percentage }) => `${percentage}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chart_options.colors[index % chart_options.colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return <div>Unsupported chart type: {config.chart_type}</div>;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200" key={`${chartId}-${JSON.stringify(parameters)}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{config.chart_name}</h3>
      <div className="mb-4 text-sm text-gray-600">
        <strong>Generated Query:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">
          {ChartAPIService.buildQuery(config, parameters)}
        </code>
      </div>
      {renderChart()}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [availableCharts, setAvailableCharts] = useState([]);
  const [selectedCharts, setSelectedCharts] = useState(['top_commodities_bar', 'vendor_spend_analysis']);
  const [chartParameters, setChartParameters] = useState({});
  const [availableConfigs, setAvailableConfigs] = useState({});

  useEffect(() => {
    const loadAvailableCharts = async () => {
      const charts = await ChartAPIService.getAvailableCharts();
      setAvailableCharts(charts);
      
      // Load configurations for parameter controls
      const configs = {};
      for (const chart of charts) {
        configs[chart.id] = await ChartAPIService.getChartConfig(chart.id);
      }
      setAvailableConfigs(configs);
    };

    loadAvailableCharts();
  }, []);

  const handleParameterChange = (chartId, paramKey, value) => {
    setChartParameters(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        [paramKey]: value
      }
    }));
  };

  const addChart = (chartId) => {
    if (!selectedCharts.includes(chartId)) {
      setSelectedCharts([...selectedCharts, chartId]);
    }
  };

  const removeChart = (chartId) => {
    setSelectedCharts(selectedCharts.filter(id => id !== chartId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Dynamic Procurement Dashboard</h1>
          <p className="text-gray-600 mt-1">Configurable charts with dynamic SQL generation</p>
        </div>
      </div>

      {/* Chart Selector */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Available Charts</h2>
          <div className="flex flex-wrap gap-2">
            {availableCharts.map(chart => (
              <button
                key={chart.id}
                onClick={() => selectedCharts.includes(chart.id) ? removeChart(chart.id) : addChart(chart.id)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedCharts.includes(chart.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {chart.name} ({chart.type})
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Charts */}
        <div className="space-y-6">
          {selectedCharts.map(chartId => (
            <div key={chartId}>
              {availableConfigs[chartId] && (
                <ChartControls
                  config={availableConfigs[chartId]}
                  parameters={chartParameters[chartId] || {}}
                  onParameterChange={(key, value) => handleParameterChange(chartId, key, value)}
                />
              )}
              <DynamicChart 
                chartId={chartId} 
                parameters={chartParameters[chartId] || {}}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
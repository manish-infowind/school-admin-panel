import { useState } from "react";
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";

const CHART_COLORS = ['#10b981', '#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface ChartRendererProps {
  data: ChartData[];
  chartType: 'bar' | 'pie';
  dataKeys: string[];
  height?: number;
  isMultiYearMonthly?: boolean;
  selectedYears?: number[];
  originalData?: any; // Original analytics data for year breakdown
}

export function ChartRenderer({ data, chartType, dataKeys, height = 400, isMultiYearMonthly = false, selectedYears, originalData }: ChartRendererProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  
  // Early return if no data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }
  
  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar 
              key={key} 
              dataKey={key} 
              fill={CHART_COLORS[index % CHART_COLORS.length]} 
              radius={[4, 4, 0, 0]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Get year breakdown for selected month
  const getYearBreakdown = (monthName: string) => {
    if (!isMultiYearMonthly || !selectedYears || !monthName) return [];
    
    const yearData: Array<{ name: string; value: number }> = [];
    const monthData = data.find(d => d.name === monthName);
    
    if (monthData) {
      selectedYears.forEach((year) => {
        const key = `${year} - Total Users`;
        const value = monthData[key];
        if (value !== undefined) {
          yearData.push({
            name: year.toString(),
            value: typeof value === 'number' ? value : Number(value) || 0
          });
        }
      });
    }
    
    return yearData;
  };

  // If month is selected, show year breakdown, otherwise show monthly data
  const yearBreakdownData = selectedMonth ? getYearBreakdown(selectedMonth) : [];
  
  // Pie chart - use all data, not just last 10
  const pieData = selectedMonth && yearBreakdownData.length > 0
    ? yearBreakdownData.map(item => ({
        name: item.name,
        value: item.value,
        originalName: item.name // For consistency
      }))
    : data.map(item => {
        const name = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;
        
        // For multi-year monthly, sum all year values for the month
        let value = 0;
        if (isMultiYearMonthly && selectedYears) {
          selectedYears.forEach((year) => {
            const key = `${year} - Total Users`;
            const yearValue = item[key];
            if (yearValue !== undefined) {
              value += typeof yearValue === 'number' ? yearValue : Number(yearValue) || 0;
            }
          });
        } else {
          // Use the first dataKey for value
          if (dataKeys && dataKeys.length > 0) {
            const dataKey = dataKeys[0];
            const itemValue = item[dataKey];
            if (itemValue !== undefined) {
              value = typeof itemValue === 'number' ? itemValue : Number(itemValue) || 0;
            }
          }
          // Fallback: try 'value' key if dataKey doesn't exist or is 0
          if (value === 0 && item['value'] !== undefined) {
            value = typeof item['value'] === 'number' ? item['value'] : Number(item['value']) || 0;
          }
        }
        
        return {
          name,
          value,
          originalName: item.name
        };
      }).filter(item => item.value > 0);

  // If no data, show empty state
  if (pieData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      {selectedMonth && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between z-10 mb-3 px-1">
          <button
            onClick={() => setSelectedMonth(null)}
            className="flex items-center gap-1.5 px-2.5 h-8 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div className="px-2.5 h-8 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-semibold text-gray-800 flex items-center">
            {selectedMonth} by Year
          </div>
          <div className="w-[85px]"></div> {/* Spacer for alignment */}
        </div>
      )}
      <ResponsiveContainer width="100%" height={selectedMonth ? height - 40 : height}>
        <RechartsPieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy={selectedMonth ? "48%" : "50%"}
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={selectedMonth ? 110 : 120}
            fill="#8884d8"
            dataKey="value"
            onClick={(data, index, e) => {
              // Click to show year breakdown (only for monthly multi-year view, and only when showing months)
              if (isMultiYearMonthly && !selectedMonth) {
                const monthName = data.originalName || data.name;
                if (monthName) {
                  setSelectedMonth(monthName);
                }
              }
            }}
          >
            {pieData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                style={{ 
                  cursor: isMultiYearMonthly && !selectedMonth ? 'pointer' : 'default'
                }}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
              padding: '8px 12px'
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}


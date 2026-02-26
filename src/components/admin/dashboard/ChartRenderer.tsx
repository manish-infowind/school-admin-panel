import { useState, useMemo } from "react";
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface ChartRendererProps {
  data: ChartData[];
  chartType: 'bar' | 'pie' | 'line';
  dataKeys: string[];
  height?: number;
  isMultiYearMonthly?: boolean;
  selectedYears?: number[];
  originalData?: any; // Original analytics data for year breakdown
  conversionType?: string; // For conversion insights chart
}

export function ChartRenderer({ data, chartType, dataKeys, height = 400 }: ChartRendererProps) {
  // Y-axis tick formatter
  const formatYAxisTick = (value: number) => {
    return value.toLocaleString();
  };

  // Custom tooltip formatter
  const formatTooltipValue = (value: number) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }
    return value.toLocaleString();
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
          <p className="font-semibold mb-2">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="mb-1">
              {entry.name}: {formatTooltipValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate if we need dual Y-axis (when values have very different scales)
  const needsDualAxis = useMemo(() => {
    if (dataKeys.length < 2 || !data || data.length === 0) return false;

    // Get max values for each data key
    const maxValues = dataKeys.map(key => {
      const values = data.map(item => {
        const val = item[key];
        return typeof val === 'number' ? val : Number(val) || 0;
      });
      return Math.max(...values, 0);
    });

    if (maxValues.length < 2) return false;

    // If one max is more than 10x the other, consider dual axis
    const sortedMax = [...maxValues].sort((a, b) => b - a);
    return sortedMax[0] > sortedMax[1] * 10;
  }, [data, dataKeys]);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center flex-col gap-2 text-muted-foreground"
        style={{ height }}
      >
        <p>No data available for the selected period</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickFormatter={formatYAxisTick}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 20, fontSize: 12 }}
            />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickFormatter={formatYAxisTick}
              yAxisId="left"
            />
            {needsDualAxis && (
              <YAxis
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickFormatter={formatYAxisTick}
                yAxisId="right"
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 20, fontSize: 12 }}
            />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                yAxisId={(needsDualAxis && index === 1) ? "right" : "left"}
              />
            ))}
          </RechartsLineChart>
        );
      case 'pie':
        return (
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: 20, fontSize: 12 }}
            />
          </RechartsPieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart() || <div>Chart type not supported</div>}
      </ResponsiveContainer>
    </div>
  );
}

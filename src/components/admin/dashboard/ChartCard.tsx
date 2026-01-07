import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ChartFilters, ChartConfig } from "./ChartFilters";
import { ChartRenderer } from "./ChartRenderer";

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
  data: ChartData[];
  dataKeys: string[];
  delay?: number;
  originalData?: any; // Original analytics data for year breakdown
}

export function ChartCard({
  title,
  icon: Icon,
  iconColor = "text-brand-green",
  config,
  onConfigChange,
  data,
  dataKeys,
  delay = 0.2,
  originalData
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon className={`h-5 w-5 ${iconColor}`} />
              {title}
            </CardTitle>
            <ChartFilters
              config={config}
              onConfigChange={onConfigChange}
              title={title}
              iconColor={iconColor}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ChartRenderer
              data={data}
              chartType={config.chartType}
              dataKeys={dataKeys}
              height={400}
              isMultiYearMonthly={config.timeRange === 'monthly' && config.selectedYears && config.selectedYears.length > 1 && config.chartType === 'pie'}
              selectedYears={config.selectedYears}
              originalData={originalData}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


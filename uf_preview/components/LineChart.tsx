'use client'

import { useGlobal } from '@/context/GlobalContext';
import { Tooltip } from '@/components/Tooltip';
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip as TooltipDisplay,
  XAxis,
  YAxis
} from 'recharts';
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip';
import i18n from '@/app/components/i18n';

type ContentAlign = "left" | "center" | "right";

export interface LineChartData {
  name: string;
  [key: string]: string | number;
}

export interface LineChartProps {
  data: LineChartData[];
  title?: string;
  showCurrencySign?: string;
  fillContainer?: boolean;
  contentAlign?: ContentAlign;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  className?: string;
  colors?: string[];
  numberKey?: string;
  onClick?: (data: any, index: number, event: React.MouseEvent) => void;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title = "",
  showCurrencySign = "",
  className = "",
  fillContainer = true,
  contentAlign = "left",
  needTooltip = false,
  tooltipProps,
  headerText = "",
  headerPosition = "top",
  colors = [],
  numberKey,
  onClick
}) => {
  const { theme } = useGlobal();
  const keyset:any=i18n.keyset("language"); 

  const getFillClasses = () => {
    if (!fillContainer) return "";
    return "w-full h-full";
  };

  const getContentAlignClasses = () => {
    switch (contentAlign) {
      case "left":
        return "justify-start items-start";
      case "right":
        return "justify-end items-end";
      case "center":
      default:
        return "justify-center items-center";
    }
  };

  // Remove process_id if exists and parse data
  const expenseData = data.map(({ process_id, ...rest }: any) => rest);

  const parsedExpenseData: LineChartData[] = expenseData.map(item => {
    const parsedItem: LineChartData = { name: String(item.name) };
    Object.keys(item).forEach(key => {
      if (key !== 'name') {
        item[key] = item[key] === null ? '0' : item[key];
        const cleanedValue = String(item[key]).replace(/,/g, "");
        parsedItem[key] = parseFloat(cleanedValue as string);
      }
    });
    return parsedItem;
  });

  const totalExpenses = parsedExpenseData.reduce((acc, item) => {
    const { name, ...rest } = item;
    const sum = Object.values(rest as Record<string, number>).reduce(
      (sum, value) => sum + value,
      0
    );
    return acc + sum;
  }, 0);
  const isDark = theme === "dark" || theme === "dark-hc";

  const chartElement = (
    <div className={`w-full h-full ${className}`} style={onClick ? { cursor: "pointer" } : undefined}>
      {onClick && (
        <style>{`.recharts-wrapper, .recharts-surface { cursor: pointer !important; }`}</style>
      )}
      {title && <h3 className='font-semibold'>{title}</h3>}
      {parsedExpenseData.length > 0 ? (
        <ResponsiveContainer width='100%' height={title ? '90%' : '100%'}>
          <RechartsLineChart
            data={parsedExpenseData}
            onClick={onClick ? ((chartData: any, e: any, idx: any) => {
              if (chartData?.activePayload?.length) {
                onClick(chartData.activePayload[0], idx, e);
              }
            }) as any : undefined}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey="name"
              className="text-xs"
              tickFormatter={(value) => {
                const maxLength = 6;
                const values=`${keyset(value)}`
                return values && values.length > maxLength
                  ? `${values.substring(0, maxLength)}...`
                  : values;
              }}
              interval={0}
            />
            <YAxis
              className="text-xs"
              tickFormatter={(value) => {
                const maxLength = 6;
                const values=`${keyset(value)}`
                return values && values.length > maxLength
                  ? `${values.substring(0, maxLength)}...`
                  : `${values}`;
              }}
            />
           <TooltipDisplay
              labelFormatter={(label) => keyset(label)}
              formatter={(value, name) => [`${showCurrencySign}${value}`, `${keyset(name)}`]}
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? '#374151' : '#d1d5db',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              wrapperStyle={{
                outline: 'none'
              }}
              labelStyle={{
                color: isDark ? '#e5e7eb' : '#374151',
                fontWeight: '600',
                fontSize: '12px',
                marginBottom: '4px'
              }}
              itemStyle={{
                color: isDark ? '#d1d5db' : '#6b7280',
                fontSize: '11px',
                padding: '2px 0'
              }}
            />
            <Legend />
            {Object.keys(parsedExpenseData[0] || {})
              .filter((key) => key !== 'name' && (!numberKey || key === numberKey))
              .map((key, index) => (
                <Line
                  key={key}
                  type='monotone'
                  dataKey={key}
                  name={keyset(key)}
                  stroke={colors[index % colors.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      ) : (
        <p className='text-center text-gray-500'>No data available</p>
      )}
    </div>
  );

 return (
         <CommonHeaderAndTooltip
           needTooltip={needTooltip}
           tooltipProps={tooltipProps}
           headerText={headerText}
           headerPosition={headerPosition}
           fillContainer={fillContainer}
         >
           {chartElement}
         </CommonHeaderAndTooltip>
       )
}

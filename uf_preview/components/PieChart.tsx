'use client'

import { useGlobal } from '@/context/GlobalContext';
import { Tooltip } from '@/components/Tooltip';
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { Cell, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip as TooltipDisplay } from 'recharts';
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip';
import i18n from '@/app/components/i18n';

type ContentAlign = "left" | "center" | "right";

export interface PieChartData {
  name: string;
  [key: string]: string | number;
}

export interface PieChartProps {
  data: PieChartData[];
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

export const PieChart: React.FC<PieChartProps> =({
  data,
  title = "",
  className = "",
  showCurrencySign = "",
  fillContainer = true,
  contentAlign = "right",
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

  const parsedExpenseData: PieChartData[] = expenseData.map(item => {
    const parsedItem: PieChartData = { name: String(item.name) };
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
    const sum = Object.keys(rest)
      .filter((key) => !numberKey || key === numberKey)
      .reduce((sum, key) => sum + (rest as Record<string, number>)[key], 0);
    return acc + sum;
  }, 0);
  const isDark = theme === "dark" || theme === "dark-hc";

  const formattedTotalExpenses = totalExpenses.toLocaleString('en-IN');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name } = payload[0].payload;
      const selectedData = expenseData.find((item) => item.name === name);
      if (selectedData) {
        return (
          <div className= {`${isDark ? "bg-gray-800" : "bg-white"} p-2 border border-gray-300 rounded shadow`}>
            <p className='font-bold'>{name}</p>
            {Object.keys(selectedData)
              .filter((key) => key !== 'name' && (!numberKey || key === numberKey))
              .map((key) => (
                <p key={key}>
                  {key}: {showCurrencySign}{selectedData[key]}
                </p>
              ))}
          </div>
        );
      }
    }
    return null;
  };

  const pieChartData = parsedExpenseData.map((item) => ({
    name: item.name,
    value: Object.keys(item)
      .filter((key) => key !== 'name' && (!numberKey || key === numberKey))
      .reduce((acc, key) => acc + (item[key] as number), 0),
  }));


  const chartElement = (
    <div className={`w-full h-full ${className}`}>
      {title && <h3 className='font-semibold'>{title}</h3>}
      {parsedExpenseData.length > 0 ? (
        <ResponsiveContainer width='100%' height={title ? '90%' : '100%'}>
          <RechartsPieChart>
            <Pie
              data={pieChartData}
              cx='50%'
              cy='50%'
              innerRadius='60%'
              outerRadius='80%'
              paddingAngle={2}
              dataKey='value'
              startAngle={90}
              endAngle={-270}
              cursor={onClick ? "pointer" : "default"}
              onClick={onClick ? (pieData: any, idx: number, e: React.MouseEvent) => {
                onClick(pieData, idx, e);
              } : undefined}
            >
              {pieChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </Pie>
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
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(value, entry) => {
                const formattedValue = Number(entry?.payload?.value).toLocaleString("en-IN");
                return (
                  <span style={{ color: entry.color }}>
                    {`${keyset(value)}`} - {showCurrencySign}{formattedValue}
                  </span>
                );
              }}
            />
            <text
              x='50%'
              y='50%'
              textAnchor='middle'
              dominantBaseline='middle'
              fill={isDark ? "#fff" : "#000"}
              fontSize='16'
            >
              {`${keyset("Total")}`}: {showCurrencySign}{formattedTotalExpenses}
            </text>
          </RechartsPieChart>
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

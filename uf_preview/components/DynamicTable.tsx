"use client";

import React, { useState, useEffect } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Icon } from "./Icon";
import { getBorderRadiusClass } from"@/app/utils/branding";
import { BiSort } from "react-icons/bi";
import { twMerge } from "tailwind-merge";
import { useTheme } from "@/hooks/useTheme";
import { Pagination } from "./Pagination";
import i18n from "@/app/components/i18n";
import { Tooltip } from "./Tooltip";
import {
  HeaderPosition,
  TooltipProps as TooltipPropsType,
} from "@/types/global";

interface RenderRowActionsProps {
  item: any;
  index: number;
  nodeName:string
}

// Wrapper to support both sync and async renderRowActions
const RowActionCell: React.FC<{
  renderFn: (props: RenderRowActionsProps) => React.ReactNode | Promise<React.ReactNode>;
  props: RenderRowActionsProps;
}> = ({ renderFn, props }) => {
  const [node, setNode] = useState<React.ReactNode>(null);

  useEffect(() => {
    const result = renderFn(props);
    if (result instanceof Promise) {
      result.then(setNode);
    } else {
      setNode(result);
    }
  }, [props.item, props.index, props.nodeName]);

  return <>{node}</>;
};

interface ColumnType {
  id: string;
  nodeid?: string;
  name: string;
  meta?: { sort?: boolean };
  className?: string;
  hide?: boolean;
  isSearch?: boolean;
  colourIndicator?: unknown[];
  type?: string;
  controlType?: string;
}

interface TableProps {
  search?: boolean;
  tableActions?: boolean;
  tableSelection?: boolean;
  tableSettings?: boolean;
  tableSorting?: boolean;
  isHyperLink?: boolean;
  emptyMessage?:string | React.ReactNode;
  data?: Record<string, string | number | boolean | null>[];
  columns?: ColumnType[];
  onRowClick?: (row: any, index: any) => void;
  className?: string;
  renderRowActions?: (props: RenderRowActionsProps) => React.ReactNode | Promise<React.ReactNode>;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  selectionMode?: 'Single' | 'Multi';
  getRowId?: (row: any, index: number) => string;
  edgePadding?: boolean;
  wordWrap?: boolean;
  loading?: boolean;
  isRowclick?: boolean;
  // Pagination props
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    pageSizeOptions?: number[];
    onUpdate: (data: { page: number; pageSize: number }) => void;
  };
  showPagination?: boolean;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  fillContainer?: boolean;
  headerButtonsRenders?:React.ReactNode
  dataOrientation?: "vertical" | "horizontal";
}
        
export const DynamicTable: React.FC<TableProps> = ({

  search = false,
  tableActions = false,
  tableSelection = false,
  tableSettings = false,
  tableSorting = false,
  isHyperLink = false,
  isRowclick = false,
  emptyMessage = "No Data Available",
  data = [],
  columns = [],
  onRowClick,
  className = "",
  renderRowActions,
  selectedIds=[],
  onSelectionChange,
  selectionMode = 'single',
  getRowId,
  edgePadding = true,
  wordWrap = false,
  loading = false,
  pagination,
  showPagination = false,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = 'top',
  fillContainer = true,
  headerButtonsRenders=<></>,
  dataOrientation = "vertical",
}) => {
  const { theme, branding,direction,displayFormat } = useGlobal();
  const { borderColor } = useTheme()
  const [searchTerm, setSearchTerm] = useState("");
  const [clickedRowId, setClickedRowId] = useState<string | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showColumnModal, setShowColumnModal] = useState(false);
  const keyset:any=i18n.keyset("language"); 

  // Normalize columns to handle both string[] and object[] formats
  let normalizedColumns = columns.map((col: ColumnType) =>
    typeof col === 'string' ? { id: col, name: col } : col
  );
  normalizedColumns = normalizedColumns.filter((ele)=>(ele?.hide!=true))
  const [visibleColumns, setVisibleColumns] = useState<ColumnType[]>([]);

  // Update visible columns when columns prop changes - default to all columns selected
  useEffect(() => {
    setVisibleColumns(normalizedColumns);
  }, [columns]);

  // Use controlled selection if selectedIds is provided, otherwise use internal state
  // Helper function to get row ID
  const getRowIdHelper = (row: any, index: number): string => {
    if (getRowId) {
      return getRowId(row, index);
    }
    return index.toString();
  };

  const handleRowSelection = (row: any, index: number) => {
    if (tableSelection && onSelectionChange) {
      const rowId = getRowIdHelper(row, index);

      if (selectionMode === 'single') {
        // Single selection mode: replace selection with clicked row
        if (selectedIds.includes(rowId)) {
          onSelectionChange([]);
        } else {
          onSelectionChange([rowId]);
        }
      } else {
        // Multi selection mode: toggle selection
        if (selectedIds.includes(rowId)) {
          onSelectionChange(selectedIds.filter((id) => id !== rowId));
        } else {
          onSelectionChange([...selectedIds, rowId]);
        }
      }
    }
  };

  const handleSort = (columnId: string) => {
    if (tableSorting) {
      if (sortColumn === columnId) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(columnId);
        setSortDirection("asc");
      }
    }
  };

  const handleColumnToggle = (columnId: string) => {
    setVisibleColumns((prev) => {
      const foundColumn = normalizedColumns.find((col) => col.id === columnId);
        return prev.some((col) => col.id === columnId)
          ? prev.filter((col) => col.id !== columnId)
          : foundColumn ? [...prev, foundColumn] : prev;
      }
    );
  };

  const handleSelectAllColumns = () => {
    setVisibleColumns(normalizedColumns);
  };

  const handleDeselectAllColumns = () => {
    setVisibleColumns([]);
  };

  const filteredData = search
    ? data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

const sortedData = sortColumn
  ? [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;  // Push nulls to end
      if (bVal == null) return -1;
      
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortDirection === "asc" ? comparison : -comparison;
    })
  : filteredData;

  // Use all sorted data without pagination
  const displayData = sortedData;

  const handleSelectAllRows = () => {
    if (!onSelectionChange) return;

    const allIds = displayData.map((row, index) => getRowIdHelper(row, index));
    const allSelected = allIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      // Deselect all rows
      onSelectionChange(selectedIds.filter(id => !allIds.includes(id)));
    } else {
      // Select all rows
      const newSelectedIds = [...selectedIds];
      allIds.forEach(id => {
        if (!newSelectedIds.includes(id)) {
          newSelectedIds.push(id);
        }
      });
      if(selectedIds?.length==0 && selectionMode!='Single')
      {
        onSelectionChange(newSelectedIds);
        return
      }
      onSelectionChange([]);
    }
  };

  // Check if all rows are selected
  const allIds = displayData.map((row, index) => getRowIdHelper(row, index));
  const isAllRowsSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
  const isSomeRowsSelected = allIds.some(id => selectedIds.includes(id)) && !isAllRowsSelected;

  const isDark = theme === "dark" || theme === "dark-hc";

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex?.slice(1, 3), 16);
    const g = parseInt(hex?.slice(3, 5), 16);
    const b = parseInt(hex?.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
    
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    switch (displayFormat?.datePickerProperty?.dateDisplayFormat||"DD-MM-YYYY") {
      case "DD-MM-YYYY": return `${day}-${month}-${year}`;
      case "d,M,yyyy":      return `${parseInt(day)},${parseInt(month)},${year}`;
      default:           return `${year}-${month}-${day}`;
    }
  };
  const convertToformat=(data:any)=>{
    if (typeof data !== 'string') return data;
    function isValidDate(dateString:any) {
      return !isNaN(Date.parse(dateString));
    }
    if(isValidDate(data))
      return formatDateDisplay(data?.split("T")?.at(0) ?? "")

    return data
  }

  const horizontalTableElement = (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <div className={twMerge("border rounded-lg flex flex-col overflow-hidden flex-1 min-h-0", borderColor)}>
        <div className="overflow-auto flex-1 min-h-0">
          <table className={`w-full ${getBorderRadiusClass(branding.borderRadius)} ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <thead
              className={`sticky top-0 z-10 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
              style={{ boxShadow: isDark ? "0 2px 4px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.1)" }}
            >
              <tr>
                <th className={`px-4 py-3 text-left  font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  Field
                </th>
                {displayData.map((row, index) => {
                  const rowId = getRowIdHelper(row, index);
                  return (
                    <th
                      key={rowId}
                      className={`px-4 py-3 text-left  font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}
                    >
                      {index + 1}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={displayData.length + 1} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-3 min-h-[200px]">
                      <div className="animate-spin flex items-center justify-center">
                        <Icon data="FaSpinner" size={32} />
                      </div>
                      <span className={` font-medium`}>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={1} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <span className={` font-medium`}>{emptyMessage}</span>
                  </td>
                </tr>
              ) : (
                visibleColumns
                  .filter((col) => col.type !== "__ActionDetails__")
                  .map((column) => (
                    <tr
                      key={column.id}
                      className={`border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
                    >
                      <td className={`px-4 py-3 font-semibold  ${isDark ? "text-gray-200" : "text-gray-700"} whitespace-nowrap`}>
                        {column.name}
                      </td>
                      {displayData.map((row, index) => {
                        const rowId = getRowIdHelper(row, index);
                        return (
                          <td
                            key={rowId}
                            className={`px-4 py-3  ${isDark ? "text-gray-300" : "text-gray-700"} ${wordWrap ? "break-words" : "whitespace-nowrap"} ${column?.className}`}
                          >
                            {convertToformat(row[column.id])}
                          </td>
                        );
                      })}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        {showPagination && pagination && pagination.total > 0 && (
          <div className={`flex-shrink-0 border-t ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} px-4 py-3`}>
            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              pageSizeOptions={pagination.pageSizeOptions || [5, 10, 20, 50, 100]}
              onUpdate={pagination.onUpdate}
              alignment="middle"
              showButtonText={true}
            />
          </div>
        )}
      </div>
    </div>
  );

  const tableElement = (
     <div className={`w-full h-full flex flex-col ${edgePadding ? "" : ""} ${className}`}>
      {/* Column Visibility Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`
              ${getBorderRadiusClass(branding.borderRadius)}
              ${isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"}
              border-2
              p-6
              w-96
              overflow-auto
              shadow-xl
            `}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                {`${keyset("SelectColumn")}`}
              </h3>
              <button
                onClick={() => setShowColumnModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <Icon data="IoIosCloseCircleOutline" size={20} />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={handleSelectAllColumns}
                className={`
                  flex-1
                  px-3 py-1.5
                  text-sm
                  ${getBorderRadiusClass(branding.borderRadius)}
                  ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"}
                  transition-all duration-200
                `}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = hexToRgba(branding.hoverColor, 0.3);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#E5E7EB';
                }}
              >
                {`${keyset("Select All")}`}
              </button>
              <button
                onClick={handleDeselectAllColumns}
                className={`
                  flex-1
                  px-3 py-1.5
                  text-sm
                  ${getBorderRadiusClass(branding.borderRadius)}
                  ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"}
                  transition-all duration-200
                `}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = hexToRgba(branding.hoverColor, 0.3);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#E5E7EB';
                }}
              >
                {`${keyset("Deselect All")}`}
              </button>
            </div>

            <div className="space-y-2">
              {normalizedColumns.map((column) => (
                <label
                  key={column.id}
                  className={`
                    flex items-center gap-3
                    p-3
                    ${getBorderRadiusClass(branding.borderRadius)}
                    cursor-pointer
                    transition-colors
                    ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.some((col) => col.id === column.id)}
                    onChange={() => handleColumnToggle(column.id)}
                    className="w-4 h-4 cursor-pointer"
                    style={{
                      accentColor: branding.brandColor,
                    }}
                  />
                  <span className={` ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                    {column.name}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowColumnModal(false)}
                className={`
                  px-4 py-2
                  ${getBorderRadiusClass(branding.borderRadius)}
                  
                  font-medium
                  transition-all duration-200
                  text-white
                `}
                style={{
                  backgroundColor: branding.brandColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = branding.hoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = branding.brandColor;
                }}
              >
                {`${keyset("Apply")}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={twMerge("border rounded-lg flex flex-col overflow-hidden flex-1 min-h-0", borderColor)}>
        <div className="overflow-auto flex-1 min-h-0">
          <table
            className={`
              w-full
              ${getBorderRadiusClass(branding.borderRadius)}
              ${isDark ? "bg-gray-800" : "bg-white"}
            `}
          >
            <thead
              className={`
                sticky top-0 z-10
                ${isDark ? "bg-gray-700" : "bg-gray-100"}
              `}
              style={{
                boxShadow: isDark ? "0 2px 4px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
            <tr>
              {tableSelection && (
                <th className="px-4 py-3 w-12">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllRowsSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isSomeRowsSelected;
                        }
                      }}
                      onChange={handleSelectAllRows}
                      className={twMerge("accent-[var(--selection-color)] hover:accent-[var(--hover-color)] " , ``)}
                    />
                  </div>
                </th>
              )}
                {(visibleColumns.find((cols:any)=>(cols?.type=='__ActionDetails__')) && tableActions==true)&&(<th
                  className={`
                    px-2 py-3
                    w-12
                    text-left
                    
                    font-semibold
                    ${tableSorting ? "cursor-pointer hover:bg-opacity-80" : ""}
                    ${isDark ? "text-gray-200" : "text-gray-700"}
                  `}
                >
                  <div className="flex items-center gap-2">
                    Actions
                  </div>
                </th>)}
              {visibleColumns.map((column) =>{
                if(column?.type=="__ActionDetails__"&& tableActions != true){
                return (
                <th
                  key={column.id}
                  onClick={() => handleSort(column.id)}
                  className={`
                    px-4 py-3
                    text-left
                    
                    font-semibold
                    ${tableSorting ? "cursor-pointer hover:bg-opacity-80" : ""}
                    ${isDark ? "text-gray-200" : "text-gray-700"}
                     ${column?.className}
                  `}
                >
      
                    {column.name}
                    {tableSorting && sortColumn === column.id && (
                      <BiSort
                        size={14}
                      />
                    )}
           
                </th>
              )
                }
              if(column?.type!="__ActionDetails__"){
                return (
                <th
                  key={column.id}
                  onClick={() => handleSort(column.id)}
                  className={`
                    px-4 py-3
                    text-left
                    
                    font-semibold
                    ${tableSorting ? "cursor-pointer hover:bg-opacity-80" : ""}
                    ${isDark ? "text-gray-200" : "text-gray-700"}
                    ${column?.className}
                  `}
                >

                    {column.name}
                    {tableSorting && sortColumn === column.id && (
                      <BiSort
                        size={14}
                      />
                    )}

                </th>
              )
                }
              } )}

              {/* Column Visibility Control */}
              {tableSettings && 
                 <th className="px-4 py-3 w-12">
                <button
                  onClick={() => setShowColumnModal(!showColumnModal)}
                  className={`
                    
                    ${getBorderRadiusClass(branding.borderRadius)}
                    flex items-center gap-1
                    transition-colors
                    ${isDark ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
                  `}
                  style={{
                    backgroundColor: showColumnModal ? branding.brandColor : undefined,
                    color: showColumnModal ? 'white' : undefined,
                  }}
                >
                  <Icon data="FaRegSun" size={16} />
                </button>
              </th>}
            </tr>
          </thead>
          <tbody>
              {(loading && displayData.length !== 0) ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (tableSelection ? 1 : 0) + (tableSettings ? 1 : 0)}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3 min-h-[200px]">
                      <div className="animate-spin flex items-center justify-center">
                        <Icon data="FaSpinner" size={32} />
                      </div>
                      <span className={` font-medium`}>
                        Loading...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : displayData.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (tableSelection ? 1 : 0) + (tableSettings ? 1 : 0)}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className={` font-medium`}>
                        {emptyMessage}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (displayData.map((row, index) => {
              const rowId = getRowIdHelper(row, index);
              const isSelected = selectedIds.includes(rowId) || clickedRowId === rowId;

              return (
                <tr
                  key={rowId}
                  onClick={() => {
                    if(isRowclick){                      
                      onRowClick?.(row,rowId);
                      handleRowSelection(row, index);
                    }
                  }}
                  className={`
                    border-t
                    ${isDark ? "border-gray-700" : "border-gray-200"}
                    ${isSelected ? "bg-opacity-20" : ""}
                    transition-all duration-200
                    ${isRowclick ? "cursor-pointer" : ""}
                  `}
                  style={{
                    backgroundColor: isSelected
                      ? branding.selectionColor : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = branding.hoverColor;
                  }}
                  onMouseLeave={(e) => {
                    if (isSelected){
                      e.currentTarget.style.backgroundColor = branding.selectionColor;
                    }else{
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {tableSelection && (
                    <td className="px-4 py-3 w-12">
                      <div className="flex items-center justify-center">
                        <input
                          type={ "checkbox"}
                          checked={isSelected}
                          onChange={() => handleRowSelection(row, index)}
                          onClick={(e) => e.stopPropagation()}
                          className={twMerge("accent-[var(--selection-color)] hover:accent-[var(--hover-color)] " , ``)}
                        />
                      </div>
                    </td>
                  )}
                  {/* modeller dont change the find visible columns part use your rowAction component */}
                    {
                    (visibleColumns.find((cols:any)=>(cols?.type=='__ActionDetails__'))&&tableActions==true && renderRowActions)&&
                    (
                      <td
                      className="w-12"
                      onClick={(e) => e.stopPropagation()}
                      >
                        <RowActionCell renderFn={renderRowActions} props={{ item: row, index, nodeName: "ss" }} />
                      </td>
                    )
                  }
                  {/* the above visible columns object only */}
                  {visibleColumns.map((column) =>
                  { 
                    if(column.type== '__ActionDetails__'&& tableActions!=true && renderRowActions)
                    {
                      return(
                        <td
                        className="w-[10%]"
                          key={column.id}
                          onClick={(e) => e.stopPropagation()}
                          >
                          <RowActionCell renderFn={renderRowActions} props={{ item: row, index, nodeName: `${column?.controlType + column?.id}` }} />
                          </td>
                          )
                        }
                        else if(column.type!= '__ActionDetails__') {
                          return(
                          <td
                            key={column.id}
                            className={`
                              px-4 py-3
                              
                              ${isDark ? "text-gray-300" : "text-gray-700"}
                              ${isHyperLink ? "text-blue-500 underline" : ""}
                              ${wordWrap ? "break-words" : "whitespace-nowrap"}
                              ${column?.className}
                            `}
                          >
                            {convertToformat(row[column.id])}
                          </td>
                          )
                        }
                  })}
                </tr>
              );
            }))}
          </tbody>
        </table>
        </div>
        {/* Pagination */}
        {showPagination && pagination && pagination.total > 0 && (
          <div className={`flex-shrink-0 border-t ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} px-4 py-3`}>
            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              pageSizeOptions={pagination.pageSizeOptions || [5, 10, 20, 50, 100]}
              onUpdate={pagination.onUpdate}
              alignment="middle"
              showButtonText={true}
            />
          </div>
        )}
      </div>
    </div>
  );
  const headerClasses = `font-semibold mb-2 ${
    isDark ? "text-gray-300" : "text-gray-700"
  }`;

  const renderWithHeader = (element: React.ReactNode) => {
    if (!headerText) return (
          <div className={`flex flex-col ${fillContainer ? 'h-full w-full min-h-0' : ''} ${className}`}>
            <div className={`${headerClasses} flex items-center gap-2 flex-shrink-0`}>
              <div className="flex-1 min-w-0 overflow-x-auto">{headerButtonsRenders}</div>
            </div>
            <div className={fillContainer ? 'min-h-0 flex-1' : ''}>{element}</div>
          </div>
          );

    switch (headerPosition) {
      case 'top':
        return (
          <div className={`flex flex-col ${fillContainer ? 'h-full w-full min-h-0' : ''} ${className}`}>
            <div className={`${headerClasses} flex items-center gap-2 flex-shrink-0`}>
              <div className="flex-shrink-0 pl-2">{headerText}</div>
              <div className="flex-1 min-w-0 overflow-x-auto">{headerButtonsRenders}</div>
            </div>
            <div className={fillContainer ? 'min-h-0 flex-1' : ''}>{element}</div>
          </div>
        );
      case 'bottom':
        return (
          <div className={`flex flex-col ${fillContainer ? 'h-full w-full' : ''} ${className}`}>
            <div className={fillContainer ? 'min-h-0 flex-1' : ''}>
              <div className="flex-1 min-w-0 overflow-x-auto">{headerButtonsRenders}</div>
              {element}
              </div>
            <div className={`${headerClasses} mb-0 mt-1`}>{headerText}</div>
          </div>
        );
      case 'left':
        return (
          <div className={`flex items-center ${fillContainer ? 'h-full w-full' : ''} ${className}`}>
            <div className={`${headerClasses} mb-0 flex-shrink-0 ${direction === 'RTL' ? 'ml-2' : 'mr-2'}`}>
              {headerText}
            </div>
            <div className={fillContainer ? 'h-full min-w-0 flex-1' : ''}>
              <div className="flex-1 min-w-0 overflow-x-auto">{headerButtonsRenders}</div>
              {element}
            </div>
          </div>
        );
      case 'right':
        return (
          <div className={`flex items-center ${fillContainer ? 'h-full w-full' : ''} ${className}`}>
            <div className={fillContainer ? 'h-full min-w-0 flex-1' : ''}>
              <div className="flex-1 min-w-0 overflow-x-auto">{headerButtonsRenders}</div>
              {element}
            </div>
            <div className={`${headerClasses} mb-0 flex-shrink-0 ${direction === 'RTL' ? 'mr-2' : 'ml-2'}`}>
              {headerText}
            </div>
          </div>
        );
      default:
        return (
          <div>
            <div className="flex-1 min-w-0 overflow-x-auto">{headerButtonsRenders}</div>
            {element}
          </div>
          );
    }
  };

  const activeTableElement = dataOrientation === "horizontal" ? horizontalTableElement : tableElement;

  const wrappedElement = renderWithHeader(
    <div className={fillContainer ? "w-full h-full min-h-0" : ""}>{activeTableElement}</div>
  );

  if (needTooltip && tooltipProps) {
    return (
      <Tooltip title={tooltipProps.title} placement={tooltipProps.placement} triggerClassName={fillContainer ? "h-full w-full" : ""}>
        <div className={`${fillContainer ? 'h-full w-full' : ''} ${className}`}>{wrappedElement}</div>
      </Tooltip>
    );
  }

  return <div className={`${fillContainer ? 'h-full w-full min-h-0' : ''} ${className}`}>{wrappedElement}</div>;
};
import * as XLSX from "@e965/xlsx";

export function exportJsonToExcel(jsonData:any, fileName = "data.xlsx") {
  // Convert JSON to worksheet
  const worksheet = XLSX.utils.json_to_sheet(jsonData);

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Append worksheet
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Download file
  XLSX.writeFile(workbook, fileName);
}
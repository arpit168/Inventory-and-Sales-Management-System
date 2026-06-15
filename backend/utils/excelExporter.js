import ExcelJS from 'exceljs';

class ExcelExporter {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'Inventory Management System';
    this.workbook.created = new Date();
  }

  async exportToExcel(data, columns, sheetName = 'Sheet1') {
    const worksheet = this.workbook.addWorksheet(sheetName);
    
    // Set columns
    worksheet.columns = columns;

    // Add data rows
    data.forEach(row => {
      worksheet.addRow(row);
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = Math.max(column.width || 10, 15);
    });

    return this.workbook;
  }

  async generateBuffer() {
    return await this.workbook.xlsx.writeBuffer();
  }

  async saveToFile(filePath) {
    await this.workbook.xlsx.writeFile(filePath);
  }
}

export default ExcelExporter;
const ExcelJS = require('exceljs')
const jsonToExcel = async (jsonData, filePath) => {
  // Create a new workbook and add a worksheet
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet 1')

  // Add columns headers
  const headers = Object.keys(jsonData[0])
  worksheet.columns = headers.map((header) => ({ header, key: header }))

  // Add rows
  jsonData.forEach((data) => {
    worksheet.addRow(data)
  })

  // Write to file
  await workbook.xlsx.writeFile(filePath)
  console.log('Excel file successfully written at', filePath)
}  

module.exports = jsonToExcel;

#!/usr/bin/env node

/**
 * Excel Data Validator
 * 
 * This script validates the Excel data format and reports potential issues
 * before running the actual transformation.
 * 
 * Usage: node scripts/validate-excel-data.js
 */

const XLSX = require('xlsx');
const path = require('path');

function validateExcelData(excelFilePath) {
    try {
        console.log('📊 Validating Excel file:', excelFilePath);
        
        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(excelFilePath)) {
            throw new Error('Excel file not found');
        }
        
        // Read the Excel file
        const workbook = XLSX.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`\n📋 Sheet: ${sheetName}`);
        console.log(`📊 Total rows: ${jsonData.length}`);
        
        // Analyze column headers
        const headers = Object.keys(jsonData[0] || {});
        console.log(`\n🏷️  Detected columns (${headers.length}):`);
        headers.forEach((header, index) => {
            console.log(`  ${index + 1}. "${header}"`);
        });
        
        // Check for expected columns
        const expectedColumns = {
            company: ['Company name', 'Company', 'company_name'],
            firstName: ['FirstName', 'First Name', 'first_name'],
            lastName: ['Last Name', 'LastName', 'last_name'],
            email: ['Email Id', 'Email', 'email'],
            designation: ['Designation', 'Title', 'designation'],
            phone: ['Phone', 'phone']
        };
        
        console.log(`\n🔍 Column mapping analysis:`);
        
        for (const [field, variations] of Object.entries(expectedColumns)) {
            const found = variations.find(variation => headers.includes(variation));
            if (found) {
                console.log(`  ✅ ${field}: "${found}"`);
            } else {
                console.log(`  ❌ ${field}: Not found (expected one of: ${variations.join(', ')})`);
            }
        }
        
        // Analyze data quality
        console.log(`\n🔍 Data quality analysis:`);
        
        let validRows = 0;
        let rowsWithCompany = 0;
        let rowsWithEmail = 0;
        let rowsWithName = 0;
        let rowsWithPhone = 0;
        let swappedRows = 0;
        let invalidEmails = 0;
        
        const sampleIssues = [];
        
        jsonData.forEach((row, index) => {
            const rowNum = index + 2; // Excel row number (accounting for header)
            
            // Get potential values
            const company = row['Company name'] || row['Company'] || row['company_name'] || '';
            const email = row['Email Id'] || row['Email'] || row['email'] || '';
            const firstName = row['FirstName'] || row['First Name'] || row['first_name'] || '';
            const lastName = row['Last Name'] || row['LastName'] || row['last_name'] || '';
            const phone = row['Phone'] || row['phone'] || '';
            
            // Check for swapped company/email
            if (company.includes('@') && !email.includes('@')) {
                swappedRows++;
                if (sampleIssues.length < 5) {
                    sampleIssues.push(`Row ${rowNum}: Company and email appear swapped - Company: "${company}", Email: "${email}"`);
                }
            }
            
            // Check email validity
            if (email && !isValidEmail(email)) {
                invalidEmails++;
                if (sampleIssues.length < 5) {
                    sampleIssues.push(`Row ${rowNum}: Invalid email format - "${email}"`);
                }
            }
            
            // Count valid data
            if (company && !company.includes('@')) rowsWithCompany++;
            if (email && isValidEmail(email)) rowsWithEmail++;
            if (firstName || lastName) rowsWithName++;
            if (phone && phone.trim()) rowsWithPhone++;
            if ((company && !company.includes('@')) && (firstName || lastName)) validRows++;
        });
        
        console.log(`  📊 Rows with valid company: ${rowsWithCompany} (${(rowsWithCompany/jsonData.length*100).toFixed(1)}%)`);
        console.log(`  📊 Rows with valid email: ${rowsWithEmail} (${(rowsWithEmail/jsonData.length*100).toFixed(1)}%)`);
        console.log(`  📊 Rows with employee name: ${rowsWithName} (${(rowsWithName/jsonData.length*100).toFixed(1)}%)`);
        console.log(`  📊 Rows with phone number: ${rowsWithPhone} (${(rowsWithPhone/jsonData.length*100).toFixed(1)}%)`);
        console.log(`  📊 Rows with complete data: ${validRows} (${(validRows/jsonData.length*100).toFixed(1)}%)`);
        
        if (rowsWithPhone < jsonData.length) {
            const missingPhones = jsonData.length - rowsWithPhone;
            console.log(`  📞 Missing phone numbers: ${missingPhones} (dummy numbers will be generated)`);
        }
        if (swappedRows > 0) {
            console.log(`  ⚠️  Rows with swapped company/email: ${swappedRows}`);
        }
        
        if (invalidEmails > 0) {
            console.log(`  ⚠️  Rows with invalid emails: ${invalidEmails}`);
        }
        
        // Show sample issues
        if (sampleIssues.length > 0) {
            console.log(`\n⚠️  Sample issues found:`);
            sampleIssues.forEach(issue => console.log(`  ${issue}`));
            if (swappedRows + invalidEmails > sampleIssues.length) {
                console.log(`  ... and ${(swappedRows + invalidEmails) - sampleIssues.length} more issues`);
            }
        }
        
        // Analyze unique companies
        const companies = new Set();
        jsonData.forEach(row => {
            let company = row['Company name'] || row['Company'] || row['company_name'] || '';
            // Handle swapped data
            if (company.includes('@')) {
                company = row['Email id'] || row['Email'] || row['email'] || '';
            }
            if (company && !company.includes('@')) {
                companies.add(company.trim());
            }
        });
        
        console.log(`\n🏢 Unique companies detected: ${companies.size}`);
        
        if (companies.size <= 10) {
            console.log(`Company list:`);
            Array.from(companies).sort().forEach((company, index) => {
                console.log(`  ${index + 1}. ${company}`);
            });
        } else {
            console.log(`Sample companies:`);
            Array.from(companies).sort().slice(0, 10).forEach((company, index) => {
                console.log(`  ${index + 1}. ${company}`);
            });
            console.log(`  ... and ${companies.size - 10} more`);
        }
        
        // Overall assessment
        console.log(`\n📈 Overall Assessment:`);
        
        if (validRows / jsonData.length >= 0.8) {
            console.log(`  ✅ Data quality is GOOD (${(validRows/jsonData.length*100).toFixed(1)}% complete rows)`);
        } else if (validRows / jsonData.length >= 0.5) {
            console.log(`  ⚠️  Data quality is MODERATE (${(validRows/jsonData.length*100).toFixed(1)}% complete rows)`);
        } else {
            console.log(`  ❌ Data quality is POOR (${(validRows/jsonData.length*100).toFixed(1)}% complete rows)`);
        }
        
        if (swappedRows > 0) {
            console.log(`  🔄 The transformation script will automatically fix ${swappedRows} swapped company/email entries`);
        }
        
        if (invalidEmails > 0) {
            console.log(`  ⚠️  ${invalidEmails} rows have invalid email formats that will be cleaned`);
        }
        
        console.log(`\n✅ Validation complete. Run 'npm run transform-data' to proceed with transformation.`);
        
        return {
            totalRows: jsonData.length,
            validRows,
            companies: companies.size,
            issues: swappedRows + invalidEmails
        };
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        throw error;
    }
}

// Email validation function
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

// Main execution
async function main() {
    const excelFilePath = path.join(__dirname, '../data.xlsx');
    
    try {
        const result = await validateExcelData(excelFilePath);
        
        if (result.issues > 0) {
            console.log(`\n💡 Tip: The transformation script includes automatic fixes for common data issues.`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Validation failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { validateExcelData };

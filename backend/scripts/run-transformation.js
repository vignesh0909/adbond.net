#!/usr/bin/env node

/**
 * Data Transformation Script
 * 
 * This script transforms the Excel data from data.xlsx into the PostgreSQL database.
 * 
 * Usage:
 * node scripts/run-transformation.js
 * 
 * Make sure:
 * 1. PostgreSQL is running
 * 2. Database connection is configured in .env
 * 3. data.xlsx file exists in the project root
 */

const { transformExcelToDatabase } = require('./transform-excel-data');
const path = require('path');

async function main() {
    console.log('🚀 Starting Excel to Database transformation...\n');
    
    const excelFilePath = path.join(__dirname, '../data.xlsx');
    
    try {
        // Check if Excel file exists
        const fs = require('fs');
        if (!fs.existsSync(excelFilePath)) {
            console.error('❌ Error: data.xlsx file not found in project root');
            console.log('Please ensure the Excel file is placed at:', excelFilePath);
            console.log('\n💡 Tip: Run "npm run validate-data" first to check your Excel file format');
            process.exit(1);
        }
        
        console.log(`📊 Processing Excel file: ${excelFilePath}`);
        console.log('💡 Tip: Run "npm run validate-data" first to preview data quality\n');
        
        const result = await transformExcelToDatabase(excelFilePath);
        
        console.log('\n✅ Transformation completed successfully!');
        console.log('📊 Summary:');
        console.log(`   • Total companies processed: ${result.totalCompanies}`);
        console.log(`   • Companies inserted: ${result.companiesInserted}`);
        console.log(`   • Companies skipped: ${result.companiesSkipped || 0}`);
        console.log(`   • Total employees processed: ${result.totalEmployees}`);
        console.log(`   • Employees inserted: ${result.employeesInserted}`);
        console.log(`   • Employees skipped: ${result.employeesSkipped || 0}`);
        
        if (result.errors && result.errors.length > 0) {
            console.log(`   • Errors encountered: ${result.errors.length}`);
        }
        
        if (result.companiesInserted === 0 && result.employeesInserted === 0) {
            console.log('\n⚠️  No new data was inserted. This might mean:');
            console.log('   • The data already exists in the database');
            console.log('   • There was an issue with the data format');
            console.log('   • Run "npm run validate-data" to check data quality');
        }
        
        console.log('\n🎉 You can now use the API endpoints to access the data!');
        console.log('   • GET /api/companies - List all companies');
        console.log('   • GET /api/companies/:id/employees - Get company employees');
        console.log('   • GET /api/companies/employees/search?q=searchterm - Search employees');
        
    } catch (error) {
        console.error('\n❌ Transformation failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Database connection failed. Please check:');
            console.log('   • PostgreSQL is running');
            console.log('   • Database credentials in .env file are correct');
            console.log('   • Database exists and is accessible');
        } else if (error.code === 'ENOENT') {
            console.log('\n💡 File not found. Please check:');
            console.log('   • data.xlsx exists in the project root');
            console.log('   • File permissions are correct');
        } else {
            console.log('\n💡 For detailed error information, check the logs above.');
        }
        
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⏹️  Transformation cancelled by user');
    process.exit(0);
});

// Run the main function
main();

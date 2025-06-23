const XLSX = require('xlsx');
const { companyModel, employeeModel } = require('../models/affliate_db.model.pg.js');
const path = require('path');

// Check if employee already exists in the company
async function checkEmployeeDuplicate(employeeData, affiliateId) {
    try {
        // For now, we'll implement a simple check based on name and email
        // You can enhance this based on your actual model methods
        
        // This is a placeholder - you'll need to implement this method in your employee model
        // or use a direct database query
        
        // Simple duplicate check: same first name, last name, and company
        if (!employeeData.first_name && !employeeData.last_name) {
            return false;
        }
        
        // If email exists, check for email duplicates in the same company
        if (employeeData.email) {
            try {
                // This would need to be implemented in your model
                // const existingByEmail = await employeeModel.getByEmailAndAffiliate(employeeData.email, affiliateId);
                // return !!existingByEmail;
                
                // For now, we'll skip this check and rely on database constraints
                return false;
            } catch (error) {
                return false;
            }
        }
        
        return false;
    } catch (error) {
        console.warn('Error checking for duplicates:', error.message);
        return false;
    }
}

// Function to parse and transform Excel data
async function transformExcelToDatabase(excelFilePath) {
    try {
        console.log('Reading Excel file...');
        
        // Read the Excel file
        const workbook = XLSX.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`Found ${jsonData.length} rows of data`);
        
        // Group employees by company
        const companiesMap = new Map();
        
        jsonData.forEach((row, index) => {
            try {
                // Get potential company name and email values
                let potentialCompanyName = row['Company name'] || row['Company'] || row['company_name'] || '';
                let potentialEmail = row['Email Id'] || row['Email'] || row['email'] || '';
                
                // Check if company name and email are swapped (company name has @ symbol)
                if (potentialCompanyName.includes('@') && !potentialEmail.includes('@')) {
                    console.log(`Row ${index + 2}: Detected swapped company name and email - fixing...`);
                    // Swap the values
                    const temp = potentialCompanyName;
                    potentialCompanyName = potentialEmail;
                    potentialEmail = temp;
                }
                
                // Validate email format if provided
                if (potentialEmail && !isValidEmail(potentialEmail)) {
                    console.warn(`Row ${index + 2}: Invalid email format detected: ${potentialEmail}`);
                    // Try to see if it's actually a company name
                    if (!potentialCompanyName && potentialEmail && !potentialEmail.includes('@')) {
                        console.log(`Row ${index + 2}: Moving invalid email to company name field`);
                        potentialCompanyName = potentialEmail;
                        potentialEmail = '';
                    }
                }
                
                // Final validation of company name
                const companyName = cleanCompanyName(potentialCompanyName);
                if (!companyName) {
                    console.warn(`Row ${index + 2}: Skipping row with missing or invalid company name:`, {
                        original_company: row['Company name'] || row['Company'] || row['company_name'],
                        original_email: row['Email Id'] || row['Email'] || row['email'],
                        processed_company: potentialCompanyName,
                        processed_email: potentialEmail
                    });
                    return;
                }
                
                // Validate that email belongs to company domain (if both exist)
                if (potentialEmail && companyName) {
                    const emailDomain = extractDomainFromEmail(potentialEmail);
                    const companyDomain = extractCompanyDomain(companyName);
                    
                    if (emailDomain && companyDomain && !areDomainsRelated(emailDomain, companyDomain)) {
                        console.warn(`Row ${index + 2}: Email domain (${emailDomain}) might not match company (${companyName})`);
                        // Continue processing but flag for review
                    }
                }
                
                // Extract employee details
                const firstName = cleanName(row['FirstName'] || row['First Name'] || row['first_name'] || '');
                const lastName = cleanName(row['Last Name'] || row['LastName'] || row['last_name'] || '');
                
                // Skip if no valid employee name
                if (!firstName && !lastName) {
                    console.warn(`Row ${index + 2}: Skipping row with missing employee name`);
                    return;
                }
                
                // Create employee object with validation
                const employee = {
                    first_name: firstName,
                    last_name: lastName,
                    designation: cleanDesignation(row['Designation'] || row['Title'] || row['designation'] || ''),
                    email: potentialEmail || '',
                    phone: cleanPhone(row['Phone'] || row['phone'] || '') || generateDummyPhone()
                };
                
                // Validate employee data
                if (!isValidEmployee(employee)) {
                    console.warn(`Row ${index + 2}: Employee data validation failed:`, employee);
                    return;
                }
                
                // Add to companies map
                if (!companiesMap.has(companyName)) {
                    companiesMap.set(companyName, {
                        company_name: companyName,
                        employees: []
                    });
                }
                
                companiesMap.get(companyName).employees.push(employee);
                
            } catch (rowError) {
                console.error(`Error processing row ${index + 2}:`, rowError.message);
                console.error('Row data:', row);
            }
        });
        
        console.log(`Found ${companiesMap.size} unique companies`);
        
        // Report data quality issues
        let totalEmployeesProcessed = 0;
        let companiesWithIssues = 0;
        let employeesWithDummyPhone = 0;
        
        for (const [companyName, companyData] of companiesMap) {
            totalEmployeesProcessed += companyData.employees.length;
            
            // Check for data quality issues
            const employeesWithoutEmail = companyData.employees.filter(emp => !emp.email).length;
            const employeesWithoutDesignation = companyData.employees.filter(emp => !emp.designation).length;
            const employeesWithDummyPhones = companyData.employees.filter(emp => emp.phone && emp.phone.startsWith('+1-')).length;
            
            employeesWithDummyPhone += employeesWithDummyPhones;
            
            if (employeesWithoutEmail > 0 || employeesWithoutDesignation > 0 || employeesWithDummyPhones > 0) {
                companiesWithIssues++;
                console.log(`Data quality report for ${companyName}:`);
                console.log(`  - Total employees: ${companyData.employees.length}`);
                if (employeesWithoutEmail > 0) {
                    console.log(`  - Employees without email: ${employeesWithoutEmail}`);
                }
                if (employeesWithoutDesignation > 0) {
                    console.log(`  - Employees without designation: ${employeesWithoutDesignation}`);
                }
                if (employeesWithDummyPhones > 0) {
                    console.log(`  - Employees with generated dummy phone: ${employeesWithDummyPhones}`);
                }
            }
        }
        
        console.log(`\nData Quality Summary:`);
        console.log(`- Total rows processed: ${jsonData.length}`);
        console.log(`- Total employees extracted: ${totalEmployeesProcessed}`);
        console.log(`- Companies with data issues: ${companiesWithIssues}`);
        console.log(`- Employees with generated dummy phones: ${employeesWithDummyPhone}`);
        console.log(`- Data extraction rate: ${((totalEmployeesProcessed / jsonData.length) * 100).toFixed(1)}%`);
        
        // Insert data into database
        let companiesInserted = 0;
        let employeesInserted = 0;
        let companiesSkipped = 0;
        let employeesSkipped = 0;
        let errors = [];
        
        console.log(`\nStarting database insertion...`);
        
        for (const [companyName, companyData] of companiesMap) {
            try {
                // Check if company already exists (exact match)
                let company = await companyModel.getCompanyByName(companyName);
                
                if (!company) {
                    // Create new company
                    const companyInfo = {
                        company_name: companyName,
                        website: extractWebsiteFromEmail(companyData.employees[0]?.email || ''),
                        description: `Company with ${companyData.employees.length} employees in our database`,
                        logo_url: null
                    };
                    
                    company = await companyModel.createCompany(companyInfo);
                    companiesInserted++;
                    console.log(`✓ Created company: ${companyName}`);
                } else {
                    companiesSkipped++;
                    console.log(`- Company already exists: ${companyName}`);
                }
                
                // Insert employees with duplicate checking
                for (const employeeData of companyData.employees) {
                    try {
                        employeeData.affliate_id = company.affliate_id; // Use affliate_id instead of company_id
                        
                        // Check for potential duplicates by name and email
                        const isDuplicate = await checkEmployeeDuplicate(employeeData, company.affliate_id);
                        
                        if (!isDuplicate) {
                            await employeeModel.createEmployee(employeeData);
                            employeesInserted++;
                        } else {
                            employeesSkipped++;
                            console.log(`- Employee already exists: ${employeeData.first_name} ${employeeData.last_name} at ${companyName}`);
                        }
                        
                    } catch (employeeError) {
                        employeesSkipped++;
                        const errorMsg = `Error inserting employee ${employeeData.first_name} ${employeeData.last_name}: ${employeeError.message}`;
                        console.error(`✗ ${errorMsg}`);
                        errors.push(errorMsg);
                    }
                }
                
            } catch (companyError) {
                companiesSkipped++;
                const errorMsg = `Error processing company ${companyName}: ${companyError.message}`;
                console.error(`✗ ${errorMsg}`);
                errors.push(errorMsg);
            }
        }
        
        console.log(`\n✅ Transformation completed!`);
        console.log(`\n📊 Final Results:`);
        console.log(`Companies:`);
        console.log(`  - Inserted: ${companiesInserted}`);
        console.log(`  - Skipped (already exist): ${companiesSkipped}`);
        console.log(`  - Total processed: ${companiesInserted + companiesSkipped}`);
        
        console.log(`Employees:`);
        console.log(`  - Inserted: ${employeesInserted}`);
        console.log(`  - Skipped (duplicates/errors): ${employeesSkipped}`);
        console.log(`  - Total processed: ${employeesInserted + employeesSkipped}`);
        
        if (errors.length > 0) {
            console.log(`\n⚠️  Errors encountered (${errors.length}):`);
            errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        return {
            success: true,
            companiesInserted,
            employeesInserted,
            companiesSkipped,
            employeesSkipped,
            totalCompanies: companiesMap.size,
            totalEmployees: totalEmployeesProcessed,
            errors: errors
        };
        
    } catch (error) {
        console.error('Error transforming Excel data:', error);
        throw error;
    }
}

// Helper functions
function extractWebsiteFromEmail(email) {
    if (!email || !email.includes('@')) return null;
    const domain = email.split('@')[1].toLowerCase();
    return `https://www.${domain}`;
}

// Email validation function
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

// Extract domain from email
function extractDomainFromEmail(email) {
    if (!isValidEmail(email)) return null;
    return email.split('@')[1].toLowerCase();
}

// Extract potential domain from company name
function extractCompanyDomain(companyName) {
    if (!companyName) return null;
    
    const name = companyName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '') // Remove spaces
        .replace(/(inc|ltd|llc|corp|corporation|company|co|group|international|intl)$/g, ''); // Remove common suffixes
    
    return name;
}

// Check if email domain is related to company
function areDomainsRelated(emailDomain, companyDomain) {
    if (!emailDomain || !companyDomain) return true; // Skip check if either is missing
    
    // Direct match
    if (emailDomain.includes(companyDomain) || companyDomain.includes(emailDomain)) {
        return true;
    }
    
    // Common variations
    const emailBase = emailDomain.split('.')[0];
    const companyBase = companyDomain.split('.')[0];
    
    if (emailBase.includes(companyBase) || companyBase.includes(emailBase)) {
        return true;
    }
    
    // Check for common patterns like company-name.com vs companyname.com
    const normalizedEmail = emailBase.replace(/[-_]/g, '');
    const normalizedCompany = companyBase.replace(/[-_]/g, '');
    
    if (normalizedEmail.includes(normalizedCompany) || normalizedCompany.includes(normalizedEmail)) {
        return true;
    }
    
    return false;
}

// Clean company name
function cleanCompanyName(name) {
    if (!name || typeof name !== 'string') return '';
    
    const cleaned = name.trim();
    
    // Skip if it looks like an email
    if (cleaned.includes('@')) return '';
    
    // Skip if it's too short or just numbers
    if (cleaned.length < 2 || /^\d+$/.test(cleaned)) return '';
    
    return cleaned;
}

// Clean person names
function cleanName(name) {
    if (!name || typeof name !== 'string') return '';
    
    return name.trim()
        .replace(/[^a-zA-Z\s\-'\.]/g, '') // Keep only letters, spaces, hyphens, apostrophes, dots
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
}

// Clean designation
function cleanDesignation(designation) {
    if (!designation || typeof designation !== 'string') return '';
    
    return designation.trim()
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
}

// Clean phone number
function cleanPhone(phone) {
    if (!phone || typeof phone !== 'string') return '';
    
    const cleaned = phone.trim()
        .replace(/[^\d\+\-\(\)\s\.]/g, '') // Keep only digits and common phone chars
        .trim();
    
    // Return empty string if the cleaned phone is too short or doesn't look like a phone number
    if (cleaned.length < 7 || cleaned.replace(/[^\d]/g, '').length < 7) {
        return '';
    }
    
    return cleaned;
}

// Validate employee data
function isValidEmployee(employee) {
    // Must have at least first name or last name
    if (!employee.first_name && !employee.last_name) {
        return false;
    }
    
    // If email is provided, it must be valid
    if (employee.email && !isValidEmail(employee.email)) {
        return false;
    }
    
    // Names shouldn't be too long or contain only numbers
    if (employee.first_name && (employee.first_name.length > 50 || /^\d+$/.test(employee.first_name))) {
        return false;
    }
    
    if (employee.last_name && (employee.last_name.length > 50 || /^\d+$/.test(employee.last_name))) {
        return false;
    }
    
    return true;
}

// Generate dummy phone number
function generateDummyPhone() {
    // Generate a dummy US phone number format: +1-XXX-XXX-XXXX
    const areaCode = Math.floor(Math.random() * 800) + 200; // 200-999
    const exchange = Math.floor(Math.random() * 800) + 200; // 200-999
    const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    
    return `+1-${areaCode}-${exchange}-${number}`;
}

// Function to run the transformation
async function runTransformation() {
    const excelFilePath = path.join(__dirname, '../data.xlsx');
    
    try {
        const result = await transformExcelToDatabase(excelFilePath);
        console.log('Transformation result:', result);
        process.exit(0);
    } catch (error) {
        console.error('Transformation failed:', error);
        process.exit(1);
    }
}

// Export functions for use in other modules
module.exports = {
    transformExcelToDatabase,
    runTransformation
};

// Run transformation if this file is executed directly
if (require.main === module) {
    runTransformation();
}

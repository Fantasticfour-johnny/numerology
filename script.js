// Google Sheets Web App settings
const SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw_NvMm7jSfWCXeWc7z-Cm-_NsV_pQBOh13g19w6GQbXmri6M3oWN5_19xh5zHOat87LA/exec";
const ENABLE_PER_FIELD_LOGS = false; // set true to log every calculation as its own row

// Central app state to keep latest inputs and computed outputs
const appState = {
    dob: "",
    birthNumber: null,
    destinyNumber: null,
    name: "",
    nameResult: null,
    phone: "",
    phoneResult: null
};

// Send data to Google Sheets Web App (generic event logger)
function sendToGoogleSheet(type, input, result) {
    const data = {
        type,
        input,
        result,
        timestamp: new Date().toISOString()
    };
    fetch(SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(data)
    });
}

function logEvent(type, input, result) {
    if (!ENABLE_PER_FIELD_LOGS) return;
    sendToGoogleSheet(type, input, result);
}

async function saveRowToGoogleSheet() {
    const saveButton = document.getElementById('saveToSheet');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerText = 'Saving...';
    }
    // Build arrays from base and dynamic fields
    const sections = buildSectionArrays();
    const payload = {
        timestamp: new Date().toISOString(),
        dob: appState.dob,
        birthNumber: appState.birthNumber,
        destinyNumber: appState.destinyNumber,
        names: sections.names,
        namesResults: sections.namesResults,
        phones: sections.phones,
        phonesResults: sections.phonesResults
    };
    try {
        await fetch(SHEETS_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        // After sending, clear and reload
        resetFormAndDynamicFields();
        setTimeout(() => window.location.reload(), 200);
    } catch (e) {
        console.error('Failed to save to Google Sheets', e);
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerText = 'Save to Google Sheet';
        }
    }
}

// CSV Data for Birth Number - Destiny Number combinations
const csvData = {
    "1-1": { lucky: "1, 2, 3, 5, 9", neutral: "4, 6, 7", unlucky: "8", luckyColors: "Red, Orange, White, Yellow, Green", unluckyColors: "BLACK", auspicious: "Govt Job" },
    "1-2": { lucky: "1, 3, 5", neutral: "2, 6, 7", unlucky: "8, 4, 9", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "BLACK", auspicious: "Normal" },
    "1-3": { lucky: "1, 2, 3, 5", neutral: "4, 7, 9", unlucky: "8, 6", luckyColors: "Red, Orange, White, Yellow, Green", unluckyColors: "BLACK, INDIGO", auspicious: "Daiva Sambutharu (Intercast Marriage)" },
    "1-4": { lucky: "1", neutral: "3, 5, 6, 7", unlucky: "8, 2, 4, 9", luckyColors: "Red, Orange", unluckyColors: "BLACK", auspicious: "Normal" },
    "1-5": { lucky: "1, 2, 3, 5", neutral: "4, 6, 7, 9", unlucky: "8", luckyColors: "Red, Orange, White, Yellow, Green", unluckyColors: "BLACK", auspicious: "BudhaAditya Yoga, Super" },
    "1-6": { lucky: "5", neutral: "1, 2, 4, 6, 7, 9", unlucky: "8, 3", luckyColors: "Green", unluckyColors: "BLACK, YELLOW", auspicious: "Normal" },
    "1-7": { lucky: "1, 5", neutral: "2, 3, 4, 6, 7, 9", unlucky: "8", luckyColors: "Red, Orange, Green", unluckyColors: "BLACK", auspicious: "Normal" },
    "1-8": { lucky: "3, 5", neutral: "6, 7, 9", unlucky: "8, 4, 1, 2", luckyColors: "Yellow, Green", unluckyColors: "BLACK, RED, ORANGE", auspicious: "Everywhere Enemies" },
    "1-9": { lucky: "1, 3, 5", neutral: "6, 7, 9", unlucky: "8, 2, 4", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "BLACK", auspicious: "Super" },
    "2-1": { lucky: "1, 3, 5", neutral: "2, 6, 7", unlucky: "4, 9, 8", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "BLACK", auspicious: "Normal" },
    "2-2": { lucky: "1, 3, 5", neutral: "2, 6, 7", unlucky: "4, 9, 8", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "BLACK", auspicious: "Auspicious" },
    "2-3": { lucky: "1, 3, 5", neutral: "2, 7", unlucky: "4, 9, 6, 8", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "BLACK, INDIGO", auspicious: "Wonderful, GajaKesari Yoga" },
    "2-4": { lucky: "1", neutral: "3, 5, 6, 7", unlucky: "4, 9, 2, 8", luckyColors: "Red, Orange", unluckyColors: "BLACK", auspicious: "Super" },
    "2-5": { lucky: "1, 3, 5", neutral: "2, 6, 7", unlucky: "4, 9, 8", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "BLACK", auspicious: "Auspicious" },
    "2-6": { lucky: "5", neutral: "1, 2, 6, 7", unlucky: "4, 9, 3, 8", luckyColors: "Green", unluckyColors: "BLACK, YELLOW", auspicious: "Normal" },
    "2-7": { lucky: "1, 5", neutral: "2, 3, 6, 7", unlucky: "4, 9, 8", luckyColors: "Red, Orange, Green", unluckyColors: "BLACK", auspicious: "Auspicious, Wonderful" },
    "2-8": { lucky: "3, 5", neutral: "6, 7", unlucky: "4, 9, 8, 1, 2", luckyColors: "Yellow, Green", unluckyColors: "BLACK, RED, ORANGE", auspicious: "Mental Torture" },
    "2-9": { lucky: "1, 3, 5", neutral: "6, 7", unlucky: "4, 9, 2, 8", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "BLACK", auspicious: "Enemies, Disasters, Accidents, Marriage Life Disturbed" },
    "3-1": { lucky: "1, 2, 3, 5", neutral: "4, 7, 9", unlucky: "6, 8", luckyColors: "Red, Orange, White, Yellow, Green", unluckyColors: "INDIGO, BLACK", auspicious: "Bhadraka Yoga, Very Auspicious" },
    "3-2": { lucky: "1, 3, 5", neutral: "2, 7", unlucky: "6, 4, 9, 8", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "INDIGO, BLACK", auspicious: "GajaKesari, Very Auspicious" },
    "3-3": { lucky: "1, 2, 3, 5", neutral: "4, 7, 8, 9", unlucky: "6", luckyColors: "Red, Orange, White, Yellow, Green", unluckyColors: "INDIGO", auspicious: "Very Auspicious" },
    "3-4": { lucky: "1", neutral: "3, 5, 7", unlucky: "6, 2, 4, 8, 9", luckyColors: "Red, Orange", unluckyColors: "INDIGO, BLACK", auspicious: "Normal" },
    "3-5": { lucky: "1, 2, 3, 5", neutral: "4, 7, 8, 9", unlucky: "6", luckyColors: "Red, Orange, White, Yellow, Green", unluckyColors: "INDIGO", auspicious: "Very Opposite, Lose" },
    "3-6": { lucky: "5", neutral: "1, 2, 4, 7, 8, 9", unlucky: "6, 3", luckyColors: "Green", unluckyColors: "INDIGO, YELLOW", auspicious: "Very Opposite, Lose" },
    "3-7": { lucky: "1, 5", neutral: "2, 3, 4, 7, 8, 9", unlucky: "6", luckyColors: "Red, Orange, Green", unluckyColors: "INDIGO, BLACK", auspicious: "InAuspicious" },
    "3-8": { lucky: "3, 5", neutral: "7, 9", unlucky: "6, 4, 8, 1, 2", luckyColors: "Yellow, Green", unluckyColors: "INDIGO, RED, ORANGE", auspicious: "Auspicious" },
    "3-9": { lucky: "1, 3, 5", neutral: "7, 8, 9", unlucky: "6, 2, 4", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "INDIGO", auspicious: "Very Auspicious, Very Special" },
    "4-1": { lucky: "1", neutral: "3, 5, 6, 7", unlucky: "2, 4, 8, 9", luckyColors: "Red, Orange", unluckyColors: "BLACK", auspicious: "Auspicious" },
    "4-2": { lucky: "1", neutral: "3, 5, 6, 7", unlucky: "2, 4, 8, 9", luckyColors: "Red, Orange", unluckyColors: "BLACK", auspicious: "InAuspicious" },
    "4-3": { lucky: "1", neutral: "3, 5, 7", unlucky: "2, 4, 8, 9, 6", luckyColors: "Red, Orange", unluckyColors: "BLACK, INDIGO", auspicious: "Normal" },
    "4-4": { lucky: "1, 6, 7", neutral: "3, 5", unlucky: "2, 4, 8, 9", luckyColors: "Red, Orange, White, Indigo, Blue, Grey", unluckyColors: "BLACK", auspicious: "Normal" },
    "4-5": { lucky: "1, 6", neutral: "3, 5, 7", unlucky: "2, 4, 8, 9", luckyColors: "Red, Orange, White, Indigo", unluckyColors: "BLACK", auspicious: "InAuspicious" },
    "4-6": { lucky: "6, 7", neutral: "1, 5", unlucky: "2, 4, 8, 9, 3", luckyColors: "White, Indigo, Blue, Grey", unluckyColors: "BLACK, YELLOW", auspicious: "Very Special" },
    "4-7": { lucky: "1, 6", neutral: "3, 5, 7", unlucky: "2, 4, 8, 9", luckyColors: "Red, Orange, White, Indigo", unluckyColors: "BLACK", auspicious: "Very Auspicious" },
    "4-8": { lucky: "6", neutral: "3, 5, 7", unlucky: "2, 4, 8, 9, 1", luckyColors: "White, Indigo", unluckyColors: "BLACK, RED, ORANGE", auspicious: "Very Opposite" },
    "4-9": { lucky: "1", neutral: "3, 5, 6, 7", unlucky: "2, 4, 8, 9", luckyColors: "Red, Orange", unluckyColors: "BLACK", auspicious: "Auspicious" },
    "5-1": { lucky: "1, 2, 3, 5", neutral: "4, 6, 7, 9", unlucky: "8", luckyColors: "Red, Orange, White, Yellow, Green", unluckyColors: "BLACK", auspicious: "Very Auspicious, Super" },
    "5-2": { lucky: "1, 3, 5", neutral: "2, 6, 7", unlucky: "4, 9, 8", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "BLACK", auspicious: "Normal" },
    "5-3": { lucky: "1, 2, 3, 5", neutral: "4, 7, 8, 9", unlucky: "6", luckyColors: "Red, Orange, White, Yellow, Green", unluckyColors: "INDIGO", auspicious: "Very Opposite" },
    "5-4": { lucky: "1, 6", neutral: "3, 5, 7", unlucky: "2, 4, 8, 9", luckyColors: "Red, Orange, White, Indigo", unluckyColors: "BLACK", auspicious: "Opposite" },
    "5-5": { lucky: "1, 2, 3, 5, 6", neutral: "4, 7, 8, 9", unlucky: "", luckyColors: "Red, Orange, White, Yellow, Green, White, Indigo", unluckyColors: "-", auspicious: "Very Auspicious" },
    "5-6": { lucky: "5, 6", neutral: "1, 2, 4, 7, 8, 9", unlucky: "3", luckyColors: "Green, White, Indigo", unluckyColors: "YELLOW", auspicious: "Very Auspicious" },
    "5-7": { lucky: "1, 5, 6", neutral: "2, 3, 4, 7, 8, 9", unlucky: "", luckyColors: "Red, Orange, Green, White, Indigo", unluckyColors: "BLACK", auspicious: "Opposite" },
    "5-8": { lucky: "3, 5, 6", neutral: "7, 9", unlucky: "4, 8, 1, 2", luckyColors: "Yellow, Green, White, Indigo", unluckyColors: "RED, ORANGE", auspicious: "Very Good" },
    "5-9": { lucky: "1, 3, 5", neutral: "6, 7, 8, 9", unlucky: "2, 4", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "-", auspicious: "Auspicious" },
    "6-1": { lucky: "5", neutral: "1, 2, 4, 6, 7, 9", unlucky: "3, 8", luckyColors: "Green", unluckyColors: "YELLOW, BLACK", auspicious: "Opposite" },
    "6-2": { lucky: "5", neutral: "1, 2, 6, 7", unlucky: "3, 4, 9, 8", luckyColors: "Green", unluckyColors: "YELLOW, BLACK", auspicious: "Normal" },
    "6-3": { lucky: "5", neutral: "1, 2, 4, 7, 8, 9", unlucky: "3, 6", luckyColors: "Green", unluckyColors: "YELLOW, INDIGO", auspicious: "Opposite" },
    "6-4": { lucky: "6, 7", neutral: "1, 5", unlucky: "3, 2, 4, 8, 9", luckyColors: "White, Indigo, Blue , Grey", unluckyColors: "YELLOW, BLACK", auspicious: "Super" },
    "6-5": { lucky: "5, 6", neutral: "1, 2, 4, 7, 8, 9", unlucky: "3", luckyColors: "Green, White, Indigo", unluckyColors: "YELLOW", auspicious: "Very Auspicious" },
    "6-6": { lucky: "4, 5, 6, 7", neutral: "1, 2, 8, 9", unlucky: "3", luckyColors: "Grey, Green, White, Indigo, Blue, Grey", unluckyColors: "YELLOW", auspicious: "Very Auspicious" },
    "6-7": { lucky: "4, 5, 6", neutral: "1, 2, 7, 8, 9", unlucky: "3", luckyColors: "Grey, Green, White, Indigo", unluckyColors: "YELLOW, BLACK", auspicious: "Best" },
    "6-8": { lucky: "5, 6", neutral: "7, 9", unlucky: "3, 4, 8, 1, 2", luckyColors: "Green, White, Indigo", unluckyColors: "YELLOW, RED, ORANGE", auspicious: "Auspicious" },
    "6-9": { lucky: "5", neutral: "1, 6, 7, 8, 9", unlucky: "3, 2, 4", luckyColors: "Green", unluckyColors: "YELLOW", auspicious: "Auspicious" },
    "7-1": { lucky: "1, 5", neutral: "2, 3, 4, 6, 7, 9", unlucky: "8", luckyColors: "Red, Orange, Green", unluckyColors: "BLACK", auspicious: "Normal" },
    "7-2": { lucky: "1, 5", neutral: "2, 3, 6, 7", unlucky: "4, 9, 8", luckyColors: "Red, Orange, Green", unluckyColors: "BLACK", auspicious: "Super, Auspicious" },
    "7-3": { lucky: "1, 5", neutral: "2, 3, 4, 7, 8, 9", unlucky: "6", luckyColors: "Red, Orange, Green", unluckyColors: "BLACK, INDIGO", auspicious: "InAuspicious" },
    "7-4": { lucky: "1, 6", neutral: "3, 5, 7", unlucky: "2, 4, 8, 9", luckyColors: "Red, Orange, White, Indigo", unluckyColors: "BLACK", auspicious: "Very Auspicious" },
    "7-5": { lucky: "1, 5, 6", neutral: "2, 3, 4, 7, 8, 9", unlucky: "", luckyColors: "Red, Orange, Green, White, Indigo", unluckyColors: "BLACK", auspicious: "Opposite" },
    "7-6": { lucky: "4, 5, 6", neutral: "1, 2, 7, 8, 9", unlucky: "3", luckyColors: "Grey, Green, White, Indigo", unluckyColors: "BLACK, YELLOW", auspicious: "Special" },
    "7-7": { lucky: "1, 4, 5, 6", neutral: "2, 3, 7, 8, 9", unlucky: "", luckyColors: "Red, Orange, Grey, Green, White, Indigo", unluckyColors: "BLACK", auspicious: "Normal" },
    "7-8": { lucky: "5, 6", neutral: "3, 7, 9", unlucky: "4, 8, 1, 2", luckyColors: "Green, White, Indigo", unluckyColors: "BLACK, RED, ORANGE", auspicious: "Very Dangerous" },
    "7-9": { lucky: "1, 5", neutral: "3, 6, 7, 8, 9", unlucky: "2, 4", luckyColors: "Red, Orange, Green", unluckyColors: "BLACK", auspicious: "Very Dangerous, Very Opposite" },
    "8-1": { lucky: "3, 5", neutral: "6, 7, 9", unlucky: "4, 8, 1, 2", luckyColors: "Yellow, Green", unluckyColors: "RED, ORANGE, BLACK", auspicious: "Opposite" },
    "8-2": { lucky: "3, 5", neutral: "6, 7", unlucky: "4, 8, 9, 1, 2", luckyColors: "Yellow, Green", unluckyColors: "RED, ORANGE, BLACK", auspicious: "Problems from Enemies" },
    "8-3": { lucky: "3, 5", neutral: "7, 9", unlucky: "4, 8, 6, 1, 2", luckyColors: "Yellow, Green", unluckyColors: "RED, ORANGE, INDIGO", auspicious: "Very Auspicious" },
    "8-4": { lucky: "6", neutral: "3, 5, 7", unlucky: "4, 8, 2, 9, 1", luckyColors: "White, Indigo", unluckyColors: "RED, ORANGE, BLACK", auspicious: "Heavy Loans, Attempt to Murder" },
    "8-5": { lucky: "3, 5, 6", neutral: "7, 9", unlucky: "4, 8, 1, 2", luckyColors: "Yellow, Green, White, Indigo", unluckyColors: "RED, ORANGE", auspicious: "Very Auspicious" },
    "8-6": { lucky: "5, 6", neutral: "7, 9", unlucky: "4, 8, 3, 1, 2", luckyColors: "Green, White, Indigo", unluckyColors: "RED, ORANGE, YELLOW", auspicious: "Very Special" },
    "8-7": { lucky: "5, 6", neutral: "3, 7, 9", unlucky: "4, 8, 1, 2", luckyColors: "Green, White, Indigo", unluckyColors: "RED, ORANGE, BLACK", auspicious: "Very Dangerous, Very Opposite" },
    "8-8": { lucky: "3, 5, 6", neutral: "7, 9", unlucky: "4, 8, 1, 2", luckyColors: "Yellow, Green, White, Indigo", unluckyColors: "RED, ORANGE", auspicious: "Heavy Problems" },
    "8-9": { lucky: "3, 5", neutral: "6, 7, 9", unlucky: "4, 8, 2, 1", luckyColors: "Yellow, Green", unluckyColors: "RED, ORANGE", auspicious: "Good" },
    "9-1": { lucky: "1, 3, 5", neutral: "6, 7, 9", unlucky: "2, 4, 8", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "BLACK", auspicious: "More Powerful, Special" },
    "9-2": { lucky: "1, 3, 5", neutral: "6, 7", unlucky: "2, 4, 9, 8", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "BLACK", auspicious: "More Powerful, Special" },
    "9-3": { lucky: "1, 3, 5", neutral: "7, 8, 9", unlucky: "2, 4, 6", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "INDIGO", auspicious: "More Powerful, Special" },
    "9-4": { lucky: "1", neutral: "3, 5, 6, 7", unlucky: "2, 4, 8, 9", luckyColors: "Red, Orange", unluckyColors: "BLACK", auspicious: "More Powerful, Special" },
    "9-5": { lucky: "1, 3, 5", neutral: "6, 7, 8, 9", unlucky: "2, 4", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "-", auspicious: "Very Auspicious" },
    "9-6": { lucky: "5", neutral: "1, 6, 7, 8, 9", unlucky: "2, 4, 3", luckyColors: "Green", unluckyColors: "YELLOW", auspicious: "Very Special, Auspicious" },
    "9-7": { lucky: "1, 5", neutral: "3, 6, 7, 8, 9", unlucky: "2, 4", luckyColors: "Red, Orange, Green", unluckyColors: "BLACK", auspicious: "Very Dangerous, Very Opposite" },
    "9-8": { lucky: "3, 5", neutral: "6, 7, 9", unlucky: "2, 4, 8, 1", luckyColors: "Yellow, Green", unluckyColors: "RED, ORANGE", auspicious: "Auspicious" },
    "9-9": { lucky: "1, 3, 5", neutral: "6, 7, 8, 9", unlucky: "2, 4", luckyColors: "Red, Orange, Yellow, Green", unluckyColors: "-", auspicious: "More Powerful, Special" }
};

// Function to format date as dd/mm/yyyy
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Calculate missing numbers from DOB including birth and destiny numbers
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {Array} - Array of missing numbers
 */
function calculateMissingNumbersFromDOB(dob) {
    if (!dob) return [];
    
    const dateParts = dob.split('-');
    const dobString = dateParts[2] + dateParts[1] + dateParts[0]; // DDMMYYYY
    const dobDigits = dobString.split('').map(d => parseInt(d)).filter(d => d !== 0);
    
    // Create array of all numbers used (DOB + birth + destiny)
    const usedNumbers = [...dobDigits];
    
    // Add destiny number if available
    if (appState.destinyNumber) {
        usedNumbers.push(appState.destinyNumber);
    }
    
    // Add birth number if allowed by rule
    const dateDD = parseInt(dateParts[2]);
    const excludedDates = [1,2,3,4,5,6,7,8,9,10,20,30];
    if (appState.birthNumber && !excludedDates.includes(dateDD)) {
        usedNumbers.push(appState.birthNumber);
    }
    
    // Get unique numbers that are present
    const presentNumbers = [...new Set(usedNumbers)];
    
    // Find missing numbers from 1-9
    const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const missingNumbers = allNumbers.filter(num => !presentNumbers.includes(num));
    
    return missingNumbers;
}

// ===== PDF GENERATION FUNCTIONS =====

/**
 * Creates a styled header for the PDF
 * @param {jsPDF} doc - The jsPDF document object
 * @param {string} title - The title text
 * @param {number} y - Starting Y position
 * @returns {number} - New Y position after header
 */
function createPDFHeader(doc, title, y) {
    const leftMargin = 10;
    const pageWidth = 210;
    const contentWidth = pageWidth - 20; // 10mm margins on each side
    
    // Main title (no background lines)
    doc.setFontSize(22);
    doc.setTextColor(75, 0, 130); // Purple color
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Professional Numerology Analysis Report', pageWidth / 2, y + 8, { align: 'center' });
    
    return y + 20; // Reduced spacing since no lines
}

/**
 * Creates a section header with styling
 * @param {jsPDF} doc - The jsPDF document object
 * @param {string} title - Section title
 * @param {number} y - Starting Y position
 * @param {Array} color - RGB color array [r, g, b]
 * @returns {number} - New Y position after section header
 */
function createSectionHeader(doc, title, y, color = [59, 130, 246]) {
    const leftMargin = 10;
    const pageWidth = 210;
    const contentWidth = pageWidth - 20;
    
    // Background rectangle for section header
    doc.setFillColor(color[0], color[1], color[2]);
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.roundedRect(leftMargin, y - 2, contentWidth, 10, 2, 2, 'FD');
    
    // Section title text
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255); // White text
    doc.text(title, leftMargin + 5, y + 5);
    
    return y + 15;
}

/**
 * Creates a column-wise table without combo column and with missing numbers from DOB
 * @param {jsPDF} doc - The jsPDF document object
 * @param {Object} data - The data to display in table
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @param {string} combo - The birth-destiny combination
 * @param {string} dob - Date of birth for missing numbers calculation
 * @returns {number} - New Y position after table
 */
function createNumerologyTable(doc, data, startX, startY, combo, dob) {
    let y = startY;
    
    // Define column widths and positions - adjusted to fit within page margins
    const colWidths = [22, 22, 22, 28, 28, 38, 22]; // Adjusted widths for 7 columns
    const colPositions = [startX];
    for (let i = 1; i < colWidths.length; i++) {
        colPositions[i] = colPositions[i-1] + colWidths[i-1];
    }
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    const headerHeight = 15;
    const rowHeight = 15;
    
    // Calculate missing numbers from DOB instead of CSV data
    const missingNumbers = calculateMissingNumbersFromDOB(dob);
    
    // Table headers with background colors (updated structure)
    const headers = [
        { text: 'LUCKY\nNUMBERS', color: [144, 238, 144] }, // Light green
        { text: 'NEUTRAL\nNUMBERS', color: [255, 255, 224] }, // Light yellow
        { text: 'UNLUCKY\nNUMBERS', color: [255, 182, 193] }, // Light pink
        { text: 'LUCKY\nCOLORS', color: [173, 216, 230] }, // Light blue
        { text: 'UNLUCKY\nCOLORS', color: [221, 160, 221] }, // Plum
        { text: 'AUSPICIOUS /\nINAUSPICIOUS', color: [255, 215, 0] }, // Gold
        { text: 'MISSING\nNUMBERS', color: [255, 200, 200] } // Light red
    ];
    
    // Draw header row
    headers.forEach((header, colIndex) => {
        doc.setFillColor(header.color[0], header.color[1], header.color[2]);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(colPositions[colIndex], y, colWidths[colIndex], headerHeight, 'FD');
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        
        // Handle multi-line headers and center them
        const lines = header.text.split('\n');
        const lineHeight = 4;
        const totalTextHeight = lines.length * lineHeight;
        const startTextY = y + (headerHeight - totalTextHeight) / 2 + lineHeight;
        
        lines.forEach((line, lineIndex) => {
            const textWidth = doc.getTextWidth(line);
            const textX = colPositions[colIndex] + (colWidths[colIndex] - textWidth) / 2;
            doc.text(line, textX, startTextY + (lineIndex * lineHeight));
        });
    });
    
    y += headerHeight;
    
    // Data row (updated structure with auspicious/inauspicious)
    const cellData = [
        data.lucky,
        data.neutral,
        data.unlucky,
        data.luckyColors,
        data.unluckyColors,
        data.auspicious || '', // Get from CSV
        missingNumbers.join(', ')
    ];
    
    // Calculate required row height based on content
    let maxLines = 1;
    cellData.forEach((content, colIndex) => {
        const lines = doc.splitTextToSize(content.toString(), colWidths[colIndex] - 4);
        maxLines = Math.max(maxLines, lines.length);
    });
    
    const adjustedRowHeight = Math.max(rowHeight, maxLines * 4 + 8);
    
    // Draw data cells
    cellData.forEach((content, colIndex) => {
        // White background for data row
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(0, 0, 0);
        doc.rect(colPositions[colIndex], y, colWidths[colIndex], adjustedRowHeight, 'FD');
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        
        // Split text to fit in cell and center it
        const textLines = doc.splitTextToSize(content.toString(), colWidths[colIndex] - 4);
        const lineHeight = 4;
        const totalTextHeight = textLines.length * lineHeight;
        const startTextY = y + (adjustedRowHeight - totalTextHeight) / 2 + lineHeight;
        
        textLines.forEach((line, lineIndex) => {
            // Center text horizontally
            const textWidth = doc.getTextWidth(line);
            const textX = colPositions[colIndex] + (colWidths[colIndex] - textWidth) / 2;
            doc.text(line, textX, startTextY + (lineIndex * lineHeight));
        });
    });
    
    return y + adjustedRowHeight + 5; // Add spacing after table
}

/**
 * Creates name analysis section with compact calculations
 * @param {jsPDF} doc - The jsPDF document object
 * @param {Array} names - Array of names
 * @param {Array} nameResults - Array of name calculation results
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @returns {number} - New Y position after section
 */
function createNameAnalysisSection(doc, names, nameResults, startX, startY) {
    if (names.length === 0) return startY;
    
    let y = startY;
    
    names.forEach((name, index) => {
        // Name header
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Name ${index + 1}: ${name}`, startX, y);
        y += 8;
        
        // Calculate detailed breakdown for each part of the name
        const nameParts = name.trim().split(/\s+/);
        const calculations = [];
        let totalSum = 0;
        
        nameParts.forEach(part => {
            const calc = calculateNamePartSteps(part);
            calculations.push(calc);
            totalSum += calc.sum;
        });
        
        // Display individual word calculations
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        
        calculations.forEach((calc, partIndex) => {
            doc.text(`${calc.name}: ${calc.breakdown} = ${calc.sum}`, startX + 5, y);
            y += 6;
        });
        
        // Display total, reduction, and final number in compact format (single lines)
        const totalBreakdown = calculations.map(c => c.name).join(' + ') + ` = ${totalSum}`;
        doc.text(`Total: ${totalBreakdown}`, startX + 5, y);
        y += 6;
        
        // Display reduction steps in one line
        const reductionSteps = getReductionSteps(totalSum);
        if (reductionSteps.length > 0) {
            doc.text(`Reducing total ${totalSum}: ${reductionSteps.join(' → ')}`, startX + 5, y);
            y += 6;
        }
        
        doc.text(`Final Number: ${nameResults[index] || 'Not calculated'}`, startX + 5, y);
        y += 8; // Reduced spacing
    });
    
    return y;
}

/**
 * Calculate name part with detailed breakdown
 * @param {string} namePart - Part of the name to calculate
 * @returns {Object} - Calculation details
 */
function calculateNamePartSteps(namePart) {
    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5, 'I': 1,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8, 'Q': 1, 'R': 2,
        'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5, 'Y': 1, 'Z': 7
    };
    
    const cleanName = namePart.replace(/[^A-Za-z]/g, '').toUpperCase();
    let sum = 0;
    let breakdown = '';
    
    for (let i = 0; i < cleanName.length; i++) {
        const char = cleanName[i];
        const value = letterValues[char] || 0;
        sum += value;
        breakdown += `${char}=${value}`;
        if (i < cleanName.length - 1) breakdown += ' + ';
    }
    
    return {
        name: namePart.toUpperCase(),
        breakdown: breakdown,
        sum: sum
    };
}

/**
 * Get reduction steps for a number
 * @param {number} num - Number to reduce
 * @returns {Array} - Array of reduction steps
 */
function getReductionSteps(num) {
    const steps = [];
    let current = num;
    
    while (current > 9) {
        const digits = current.toString().split('').map(Number);
        const sum = digits.reduce((a, b) => a + b, 0);
        steps.push(`${digits.join(' + ')} = ${sum}`);
        current = sum;
    }
    
    return steps;
}

/**
 * Creates a 3x3 Loshu Grid
 * @param {jsPDF} doc - The jsPDF document object
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @returns {number} - New Y position after grid
 */
function createLoshuGrid(doc, startX, startY) {
    const gridSize = 50; // Reduced size to fit both grids
    const cellSize = 16; // Smaller cells
    
    // Loshu grid numbers (magic square)
    const loshuNumbers = [
        [4, 9, 2],
        [3, 5, 7],
        [8, 1, 6]
    ];
    
    // Grid title
    doc.setFontSize(10);
    doc.setTextColor(75, 0, 130);
    doc.text('LOSHU GRID (Magic Square)', startX + gridSize/2, startY - 5, { align: 'center' });
    
    // Draw grid
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const x = startX + (col * cellSize);
            const y = startY + (row * cellSize);
            
            // Draw cell border
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(1);
            doc.rect(x, y, cellSize, cellSize);
            
            // Add magic square numbers in center of cell
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            const number = loshuNumbers[row][col].toString();
            doc.text(number, x + cellSize/2, y + cellSize/2 + 2, { align: 'center' });
        }
    }
    
    return startY + gridSize + 10;
}

/**
 * Creates a DOB-based Loshu Grid with missing numbers, destiny number, and birth number
 * @param {jsPDF} doc - The jsPDF document object
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {number} - New Y position after grid
 */
function createDOBLoshuGrid(doc, startX, startY, dob) {
    const gridSize = 50;
    const cellSize = 16;
    
    // Grid title
    doc.setFontSize(10);
    doc.setTextColor(75, 0, 130);
    doc.text('DOB LOSHU GRID', startX + gridSize/2, startY - 5, { align: 'center' });
    
    // Extract numbers from DOB (YYYY-MM-DD format)
    const dateParts = dob.split('-');
    const dobString = dateParts[2] + dateParts[1] + dateParts[0]; // DDMMYYYY
    const dobDigits = dobString.split('').map(d => parseInt(d)).filter(d => d !== 0); // Remove zeros
    
    // Get date part for birth number rule (DD not day)
    const dateDD = parseInt(dateParts[2]);
    
    // Create position mapping based on Loshu grid layout
    const positionMap = {
        1: [2, 1], // Position of 1 in Loshu grid (row 2, col 1)
        2: [0, 2], // Position of 2 in Loshu grid (row 0, col 2)
        3: [1, 0], // Position of 3 in Loshu grid (row 1, col 0)
        4: [0, 0], // Position of 4 in Loshu grid (row 0, col 0)
        5: [1, 1], // Position of 5 in Loshu grid (row 1, col 1)
        6: [2, 2], // Position of 6 in Loshu grid (row 2, col 2)
        7: [1, 2], // Position of 7 in Loshu grid (row 1, col 2)
        8: [2, 0], // Position of 8 in Loshu grid (row 2, col 0)
        9: [0, 1], // Position of 9 in Loshu grid (row 0, col 1)
    };
    
    // Count occurrences of each digit from DOB (keep repetitions)
    const digitCounts = {};
    dobDigits.forEach(digit => {
        digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    });
    
    // Add destiny number if available
    if (appState.destinyNumber) {
        digitCounts[appState.destinyNumber] = (digitCounts[appState.destinyNumber] || 0) + 1;
    }
    
    // Add birth number with rule: only if date (DD) is NOT in [1,2,3,4,5,6,7,8,9,10,20,30]
    const excludedDates = [1,2,3,4,5,6,7,8,9,10,20,30];
    if (appState.birthNumber && !excludedDates.includes(dateDD)) {
        digitCounts[appState.birthNumber] = (digitCounts[appState.birthNumber] || 0) + 1;
    }
    
    // Draw grid
    // Draw grid
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const x = startX + (col * cellSize);
            const y = startY + (row * cellSize);
            
            // Draw cell border
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(1);
            doc.rect(x, y, cellSize, cellSize);
            
            // Find which digit belongs to this position
            let cellContent = '';
            for (let digit = 1; digit <= 9; digit++) {
                if (positionMap[digit] && positionMap[digit][0] === row && positionMap[digit][1] === col) {
                    if (digitCounts[digit]) {
                        // Repeat the digit based on its count
                        cellContent = digit.toString().repeat(digitCounts[digit]);
                    }
                    break;
                }
            }
            
            // Add content in center of cell
            doc.setFontSize(12); // Increased to match normal Loshu grid
            doc.setTextColor(0, 0, 0);
            
            if (cellContent) {
                // Handle long content by splitting into lines
                const maxWidth = cellSize - 2;
                const lines = doc.splitTextToSize(cellContent, maxWidth);
                const lineHeight = 2.5;
                const startTextY = y + (cellSize - (lines.length * lineHeight)) / 2 + lineHeight;
                
                lines.forEach((line, lineIndex) => {
                    doc.text(line, x + cellSize/2, startTextY + (lineIndex * lineHeight), { align: 'center' });
                });
            }
        }
    }
    
    return startY + gridSize + 10;
}

/**
 * Creates both Loshu grids side by side
 * @param {jsPDF} doc - The jsPDF document object
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {number} - New Y position after grids
 */
/**
 * Creates an 8x2 analysis table next to the DOB Loshu Grid
 * @param {jsPDF} doc - The jsPDF document object
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @param {string} dob - Date of birth for calculations
 * @returns {number} - New Y position after table
 */
function createAnalysisTable(doc, startX, startY, dob) {
    const tableWidth = 80;
    const col1Width = 55;
    const col2Width = 25;
    const rowHeight = 7;
    
    // Table data
    const tableRows = [
        'Mind Plane',
        'Emotional Plane', 
        'Practical Plane',
        'Thought Plane',
        'Will Plane',
        'Action Plane',
        'Golden Yog/Raj Yog',
        'Earth Element Plane/Rajyoga Plane'
    ];
    
    // Calculate percentages for each plane
    const percentages = calculatePlanePercentages(dob);
    
    // Table title
    doc.setFontSize(10);
    doc.setTextColor(75, 0, 130);
    doc.text('PLANE ANALYSIS', startX + tableWidth/2, startY - 5, { align: 'center' });
    
    // Draw table headers
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.setFillColor(220, 220, 220);
    doc.rect(startX, startY, col1Width, rowHeight, 'FD');
    doc.rect(startX + col1Width, startY, col2Width, rowHeight, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('Plane Type', startX + 2, startY + 4.5);
    doc.text('Percentage', startX + col1Width + 2, startY + 4.5);
    
    // Draw table rows
    for (let i = 0; i < tableRows.length; i++) {
        const y = startY + ((i + 1) * rowHeight);
        
        // Draw borders
        doc.setFillColor(255, 255, 255);
        doc.rect(startX, y, col1Width, rowHeight, 'FD');
        doc.rect(startX + col1Width, y, col2Width, rowHeight, 'FD');
        
        // Add text in first column
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(tableRows[i], startX + 2, y + 4.5);
        
        // Add percentage in second column
        const percentage = percentages[i] || '0%';
        doc.text(percentage, startX + col1Width + 8, y + 4.5, { align: 'center' });
    }
    
    return startY + ((tableRows.length + 1) * rowHeight) + 5;
}

/**
 * Calculate percentages for each plane based on DOB Loshu grid
 * @param {string} dob - Date of birth
 * @returns {Array} - Array of percentages for each plane
 */
function calculatePlanePercentages(dob) {
    if (!dob) return ['0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%'];
    
    // Get DOB digits and build digit counts (same logic as createDOBLoshuGrid)
    const dateParts = dob.split('-');
    const dobString = dateParts[2] + dateParts[1] + dateParts[0]; // DDMMYYYY
    const dobDigits = dobString.split('').map(d => parseInt(d)).filter(d => d !== 0);
    const dateDD = parseInt(dateParts[2]);
    
    const digitCounts = {};
    dobDigits.forEach(digit => {
        digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    });
    
    // Add destiny number if available
    if (appState.destinyNumber) {
        digitCounts[appState.destinyNumber] = (digitCounts[appState.destinyNumber] || 0) + 1;
    }
    
    // Add birth number with rule
    const excludedDates = [1,2,3,4,5,6,7,8,9,10,20,30];
    if (appState.birthNumber && !excludedDates.includes(dateDD)) {
        digitCounts[appState.birthNumber] = (digitCounts[appState.birthNumber] || 0) + 1;
    }
    
    // Define plane mappings (Loshu grid positions)
    const planes = [
        [4, 9, 2], // Mind Plane (row 1)
        [3, 5, 7], // Emotional Plane (row 2) 
        [8, 1, 6], // Practical Plane (row 3)
        [4, 3, 8], // Thought Plane (col 1)
        [9, 5, 1], // Will Plane (col 2)
        [2, 7, 6], // Action Plane (col 3)
        [4, 5, 6], // Golden Yog/Raj Yog (diagonal)
        [2, 5, 8]  // Earth Element Plane (diagonal)
    ];
    
    // Calculate percentages
    const percentages = [];
    for (let plane of planes) {
        let filledCount = 0;
        for (let number of plane) {
            if (digitCounts[number]) {
                filledCount++;
            }
        }
        
        let percentage = 0;
        if (filledCount === 3) percentage = 100;
        else if (filledCount === 2) percentage = 66;
        else if (filledCount === 1) percentage = 33;
        
        percentages.push(`${percentage}%`);
    }
    
    return percentages;
}

function createBothLoshuGrids(doc, startX, startY, dob) {
    const gridSpacing = 55; // Space between grids (reduced so grids sit closer)
    
    // Create original Loshu grid on the left
    createLoshuGrid(doc, startX, startY);
    
    // Create DOB Loshu grid in the middle
    createDOBLoshuGrid(doc, startX + gridSpacing, startY, dob);
    
    // Create analysis table on the right (moved left for better alignment)
    createAnalysisTable(doc, startX + (gridSpacing * 2) - 5, startY, dob);
    
    return startY + 60; // Return position after both grids and table
}

/**
 * Adds a professional footer to the PDF
 * @param {jsPDF} doc - The jsPDF document object
 * @param {number} pageHeight - Height of the page
 */
function addPDFFooter(doc, pageHeight = 297) {
    const footerY = pageHeight - 15;
    const leftMargin = 10;
    const pageWidth = 210;
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, footerY - 5, pageWidth - 10, footerY - 5);
    
    // Footer text with 12-hour format
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    
    // Format time in 12-hour format
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    
    doc.text(`Generated on: ${now.toLocaleDateString('en-GB')} at ${timeString}`, leftMargin, footerY);
    doc.text('Sree Anantha Vastu', pageWidth - 10, footerY, { align: 'right' });
}

/**
 * Main PDF generation function with improved structure and formatting
 */
function saveToPdf() {
    try {
        const { jsPDF } = window.jspdf;
        // Reduce margins by using landscape orientation or adjusting margins
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            putOnlyUsedFonts: true
        });
        
        // Set smaller margins (1cm = ~10mm instead of default 2.54cm)
        const leftMargin = 10;
        const rightMargin = 10;
        const topMargin = 10;
        const pageWidth = 210; // A4 width
        const pageHeight = 297; // A4 height
        const contentWidth = pageWidth - leftMargin - rightMargin;
        
        let currentY = topMargin + 5;
        const marginBottom = 20;
        
        // Create main header
        currentY = createPDFHeader(doc, 'NUMEROLOGY REPORT', currentY);
        
        // Get sections data
        const sections = buildSectionArrays();
        
        // 1. NAME ANALYSIS SECTION (First)
        if (sections.names.length > 0) {
            currentY = createSectionHeader(doc, 'NAME ANALYSIS', currentY, [20, 184, 166]);
            currentY = createNameAnalysisSection(doc, sections.names, sections.namesResults, leftMargin + 5, currentY);
        }
        
        // 2. PHONE NUMBER ANALYSIS SECTION (Second)
        if (sections.phones.length > 0) {
            currentY = createSectionHeader(doc, 'PHONE NUMBER ANALYSIS', currentY, [147, 51, 234]);
            
            sections.phones.forEach((phone, index) => {
            doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`Phone ${index + 1}: ${phone}`, leftMargin + 5, currentY);
                currentY += 8;
            doc.setFontSize(10); // Slightly smaller per request
                doc.text(`Phone Number: ${sections.phonesResults[index] || 'Not calculated'}`, leftMargin + 10, currentY);
                currentY += 8; // Reduced spacing
            });
            currentY += 2; // Very small gap after phone section
        }
        
        // 3. DATE OF BIRTH ANALYSIS SECTION (Third) - moved up to reduce gap
        if (appState.dob) {
            currentY = createSectionHeader(doc, 'DATE OF BIRTH ANALYSIS', currentY, [59, 130, 246]);
            
            // Format and display date
            const dateParts = appState.dob.split('-');
            const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Date of Birth: ${formattedDate}`, leftMargin + 5, currentY);
            currentY += 8;
            
            if (appState.birthNumber && appState.destinyNumber) {
                const combo = `${appState.birthNumber}-${appState.destinyNumber}`;
                // Single line format for Birth/Destiny/Combination
                doc.text(`Birth Number: ${appState.birthNumber} | Destiny Number: ${appState.destinyNumber} | Combination: ${combo}`, leftMargin + 5, currentY);
                currentY += 6; // Reduced spacing to lift the table up more
                
                // Get and display combo data
                const comboData = csvData[combo];
                if (comboData) {
                    currentY = createNumerologyTable(doc, comboData, leftMargin, currentY, combo, appState.dob);
                    
                    // Add both Loshu Grids and analysis table below the table (move down more)
                    currentY += 10; // More spacing to avoid overlap
                    currentY = createBothLoshuGrids(doc, leftMargin + 10, currentY, appState.dob);
                } else {
                    doc.setFontSize(10);
                    doc.setTextColor(255, 0, 0);
                    doc.text('No numerology data found for this combination', leftMargin + 5, currentY);
                    currentY += 15;
                }
            } else {
                doc.setFontSize(10);
                doc.setTextColor(128, 128, 128);
                doc.text('Please calculate birth and destiny numbers to see detailed analysis', leftMargin + 5, currentY);
                currentY += 15;
            }
        }
        
        // Add footer to all pages
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            addPDFFooter(doc, pageHeight);
        }
        
        // Save the PDF with filename based on user's Name input (sanitized) + timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        // Prefer appState.name, fall back to a #name input if present
        let rawName = (appState && appState.name) ? appState.name : '';
        try {
            const nameInput = document.getElementById('name');
            if ((!rawName || rawName.trim() === '') && nameInput && nameInput.value) rawName = nameInput.value;
        } catch (e) {
            // ignore DOM errors in non-browser contexts
        }

        rawName = (rawName || '').toString().trim();
        // sanitize: allow alphanumerics, dash, underscore, dot and spaces; convert spaces to underscore
        let safeBase = rawName.replace(/[^a-zA-Z0-9\-_. ]+/g, '').replace(/\s+/g, '_');
        if (!safeBase) safeBase = 'numerology-report';
        // limit length to avoid overly long filenames
        if (safeBase.length > 80) safeBase = safeBase.slice(0, 80);

        const filename = `${safeBase}-${timestamp}.pdf`;
        doc.save(filename);
        
        // Show success message
        showNotification('PDF report generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

/**
 * Shows a notification message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Set styling based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Professional Numerology Calculator JavaScript

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupAddFieldButtons();
    setupEventListeners();
    const saveBtn = document.getElementById('saveToSheet');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveRowToGoogleSheet);
    }
    const pdfBtn = document.getElementById('saveToPdf');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', saveToPdf);
    }
});

// Setup event listeners for input fields
function setupEventListeners() {
    document.getElementById('dob').addEventListener('change', calculateDigitSum);
    document.getElementById('phone').addEventListener('input', calculatePhoneDigits);
    document.getElementById('name').addEventListener('input', calculateNameDigits);
}

function calculatePhoneDigits() {
    const phoneInput = document.getElementById('phone').value;
    if (!phoneInput) {
        document.getElementById('phoneResult').classList.add('hidden');
        return;
    }

    // Extract only digits from phone number
    const digits = phoneInput.replace(/\D/g, '');
    if (!digits) {
        document.getElementById('phoneResult').classList.add('hidden');
        return;
    }

    let sum = 0;
    let steps = [];
    
    // Calculate initial sum
    for (let i = 0; i < digits.length; i++) {
        sum += parseInt(digits[i]);
    }
    steps.push(`Initial sum: ${digits.split('').join(' + ')} = ${sum}`);
    
    // Reduce to single digit if needed
    let currentSum = sum;
    while (currentSum > 9) {
        const digitsArray = currentSum.toString().split('');
        const newSum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);
        steps.push(`Reducing ${currentSum}: ${digitsArray.join(' + ')} = ${newSum}`);
        currentSum = newSum;
    }

    // Display simple text output
    const resultText = `
${steps.join('\n')}

Phone Number Result: ${currentSum}
            `;
    
    document.getElementById('phoneCalculation').innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    document.getElementById('phoneResult').classList.remove('hidden');
    document.getElementById('phoneDigit').innerHTML = '';
    appState.phone = document.getElementById('phone').value;
    appState.phoneResult = currentSum;
    logEvent('Phone', phoneInput, currentSum);
}

function calculateNameDigits() {
    const nameInput = document.getElementById('name').value.trim();
    if (!nameInput) {
        document.getElementById('nameResult').classList.add('hidden');
        return;
    }

    // Split name into words
    const words = nameInput.split(/\s+/);
    let steps = [];
    let totalSum = 0;
    
    // Calculate sum for each word
    words.forEach(word => {
        let wordSum = 0;
        let wordSteps = [];
        
        // Convert to uppercase and calculate each letter's value based on provided mapping
        const upperWord = word.toUpperCase();
        const letterValues = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5,
            'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8,
            'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5,
            'Y': 1, 'Z': 7
        };
        for (let i = 0; i < upperWord.length; i++) {
            const char = upperWord[i];
            if (letterValues.hasOwnProperty(char)) {
                const value = letterValues[char];
                wordSum += value;
                wordSteps.push(`${char}=${value}`);
            }
        }
        
        if (wordSteps.length > 0) {
            steps.push(`<strong>${word}</strong>: ${wordSteps.join(' + ')} = ${wordSum}`);
            totalSum += wordSum;
        }
    });

    // Calculate total sum
    steps.push(`<strong>Total</strong>: ${words.map(w => w.toUpperCase()).join(' + ')} = ${totalSum}`);
    
    // Reduce total sum to single digit if needed
    let currentSum = totalSum;
    while (currentSum > 9) {
        const digitsArray = currentSum.toString().split('');
        const newSum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);
        steps.push(`Reducing total ${currentSum}: ${digitsArray.join(' + ')} = ${newSum}`);
        currentSum = newSum;
    }

    // Display simple text output
    const resultText = `
${steps.join('\n')}

Name Number Result: ${currentSum}
            `;
    
    document.getElementById('nameCalculation').innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    document.getElementById('nameResult').classList.remove('hidden');
    document.getElementById('nameDigit').innerHTML = '';
    appState.name = document.getElementById('name').value;
    appState.nameResult = currentSum;
    logEvent('Name', nameInput, currentSum);
}

function calculateDigitSum() {
    const dobInput = document.getElementById('dob').value;
    if (!dobInput) return;
    
    // Get day part (last 2 digits after splitting by '-')
    const dayDigits = dobInput.split('-')[2];
    let birthSum = 0;
    let steps = [];
    
    // Calculate birth number (sum of day digits)
    for (let i = 0; i < dayDigits.length; i++) {
        birthSum += parseInt(dayDigits[i]);
    }
    steps.push(`Birth number (day ${dayDigits}): ${dayDigits.split('').join(' + ')} = ${birthSum}`);
    
    // Reduce birth number to single digit if needed
    let currentBirthSum = birthSum;
    while (currentBirthSum > 9) {
        const digitsArray = currentBirthSum.toString().split('');
        const newSum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);
        steps.push(`Reducing ${currentBirthSum}: ${digitsArray.join(' + ')} = ${newSum}`);
        currentBirthSum = newSum;
    }
    
    // Remove hyphens from full date (YYYY-MM-DD)
    const allDigits = dobInput.replace(/-/g, '');
    let destinySum = 0;
    
    // Calculate destiny number (sum of all digits)
    for (let i = 0; i < allDigits.length; i++) {
        destinySum += parseInt(allDigits[i]);
    }
    steps.push(`Destiny number (full date): ${allDigits.split('').join(' + ')} = ${destinySum}`);
    
    // Reduce destiny number to single digit if needed
    let currentDestinySum = destinySum;
    while (currentDestinySum > 9) {
        const digitsArray = currentDestinySum.toString().split('');
        const newSum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);
        steps.push(`Reducing ${currentDestinySum}: ${digitsArray.join(' + ')} = ${newSum}`);
        currentDestinySum = newSum;
    }
    
    // Meanings for both numbers
    const meanings = {
        1: "SUN - King - Leadership Quality, Confident",
        2: "MOON - Queen - Emotional, Sentiment, Attractive, Creative",
        3: "JUPITER - Adviser - Guru, Trainer, Hungry of Knowledge",
        4: "RAHU - Suddenness - Travels a lot, Confused, Researcher",
        5: "MERCURY - Money - Businessmen, Money Minded",
        6: "VENUS - Luxury - Enjoyment, Attractive, brand conscious",
        7: "KETU - Luck - Spiritual, Deep Thinker",
        8: "SATURN - Hard work - God Believer, Spiritual",
        9: "MARS - Energy - Courageous, Confident"
    };
    
    // Get numbers used in calculation
    const allDigitsUsed = new Set(allDigits.split('').map(Number));
    allDigitsUsed.add(currentBirthSum);
    allDigitsUsed.add(currentDestinySum);
    
    // Filter out 0 and sort
    const presentNumbers = Array.from(allDigitsUsed)
        .filter(num => num !== 0)
        .sort((a, b) => a - b);
    
    // Find missing numbers (1-9 not in presentNumbers)
    const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const missingNumbers = allNumbers.filter(num => !presentNumbers.includes(num));
    
    // Display simple text output with numbers present/absent
    const resultText = `
${steps.join('\n')}

Your Birth Number: ${currentBirthSum} - ${meanings[currentBirthSum]}
Your Destiny Number: ${currentDestinySum} - ${meanings[currentDestinySum]}

Numbers present in your calculation: ${presentNumbers.join(', ')}
Numbers missing: ${missingNumbers.join(', ')}
            `;
    
    document.getElementById('calculationSteps').innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    appState.dob = dobInput;
    appState.birthNumber = currentBirthSum;
    appState.destinyNumber = currentDestinySum;
    logEvent('DOB', dobInput, { birthNumber: currentBirthSum, destinyNumber: currentDestinySum });
}

function addField(sectionId, calculateFunction, sectionType) {
    const section = document.getElementById(sectionId);
    const fieldCount = section.querySelectorAll('.dynamic-field').length + 1;
    const uniqueId = `${sectionType}_${fieldCount}_${Date.now()}`;

    // Create a container for the input-output pair
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'dynamic-field mb-6 p-4 bg-white/80 rounded-xl shadow-md border border-gray-200 transition-all duration-300 relative';

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 flex items-center justify-center text-xs';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', () => {
        fieldContainer.style.opacity = '0';
        fieldContainer.style.transform = 'scale(0.95)';
        setTimeout(() => fieldContainer.remove(), 300);
    });

    // Create a new input field
    const newInput = document.createElement('input');
    newInput.type = sectionType === 'phone' ? 'tel' : 'text';
    newInput.id = `${uniqueId}_input`;
    newInput.className = 'w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300';
    
    // Set appropriate placeholder and styling based on section type
    if (sectionType === 'phone') {
        newInput.placeholder = 'Enter phone number';
        newInput.className = newInput.className.replace('focus:border-blue-500', 'focus:border-purple-500').replace('focus:ring-blue-200', 'focus:ring-purple-200');
    } else if (sectionType === 'name') {
        newInput.placeholder = 'Enter full name';
        newInput.className = newInput.className.replace('focus:border-blue-500', 'focus:border-teal-500').replace('focus:ring-blue-200', 'focus:ring-teal-200');
    }

    // Create a new result container
    const newResult = document.createElement('div');
    newResult.id = `${uniqueId}_result`;
    newResult.className = 'hidden mt-4';

    const newResultContent = document.createElement('div');
    newResultContent.id = `${uniqueId}_calculation`;
    newResultContent.className = 'mb-2';

    const newResultDigit = document.createElement('div');
    newResultDigit.id = `${uniqueId}_digit`;

    newResult.appendChild(newResultContent);
    newResult.appendChild(newResultDigit);

    // Set up input event handler for dynamic calculation
    newInput.addEventListener('input', () => {
        if (sectionType === 'phone') {
            calculateDynamicPhoneDigits(newInput, newResult, newResultContent, newResultDigit);
        } else if (sectionType === 'name') {
            calculateDynamicNameDigits(newInput, newResult, newResultContent, newResultDigit);
        }
    });

    // Append elements to the field container
    fieldContainer.appendChild(closeButton);
    fieldContainer.appendChild(newInput);
    fieldContainer.appendChild(newResult);

    // Append the field container to the section
    section.appendChild(fieldContainer);

    // Animate the appearance of the new field
    fieldContainer.style.opacity = 0;
    fieldContainer.style.transform = 'scale(0.95)';
    setTimeout(() => {
        fieldContainer.style.opacity = 1;
        fieldContainer.style.transform = 'scale(1)';
    }, 100);
}

// Build arrays from base and dynamic inputs for each section
function buildSectionArrays() {
    const getValues = (baseSelector, sectionId) => {
        const values = [];
        const base = document.querySelector(baseSelector);
        if (base && base.value.trim()) values.push(base.value.trim());
        const dynamicInputs = document.querySelectorAll(`#${sectionId} .dynamic-field input`);
        dynamicInputs.forEach(inp => {
            const v = inp.value.trim();
            if (v) values.push(v);
        });
        return values;
    };

    const letterValues = { A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,J:1,K:2,L:3,M:4,N:5,O:7,P:8,Q:1,R:2,S:3,T:4,U:6,V:6,W:6,X:5,Y:1,Z:7 };
    const reduceToSingleDigit = (sum) => {
        while (sum > 9) {
            sum = sum.toString().split('').reduce((a,b)=>a+parseInt(b,10),0);
        }
        return sum;
    };
    const calcResult = (text, mode) => {
        const up = text.toUpperCase();
        let sum = 0;
        for (let i = 0; i < up.length; i++) {
            const ch = up[i];
            if (/[A-Z]/.test(ch) && (mode === 'letters+digits' || mode === 'letters')) {
                sum += letterValues[ch] || 0;
            } else if (/\d/.test(ch) && (mode === 'letters+digits' || mode === 'digits')) {
                sum += parseInt(ch, 10);
            }
        }
        return reduceToSingleDigit(sum);
    };

    const names = getValues('#name', 'nameSection');
    const namesResults = names.map(v => calcResult(v, 'letters'));

    const phones = getValues('#phone', 'phoneSection');
    const phonesResults = phones.map(v => calcResult(v, 'digits'));

    return {
        names,
        namesResults,
        phones,
        phonesResults
    };
}

function resetFormAndDynamicFields() {
    // Clear base inputs
    const baseIds = ['dob','name','phone'];
    baseIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    // Remove dynamic fields
    document.querySelectorAll('.dynamic-field').forEach(el => el.remove());
    // Hide results sections
    const resultIds = ['nameResult','phoneResult'];
    resultIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    // Reset calculation text areas
    const calcIds = ['calculationSteps','nameCalculation','phoneCalculation'];
    calcIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
}

// Dynamic calculation functions for added fields
function calculateDynamicPhoneDigits(input, resultContainer, calculationDiv, digitDiv) {
    const phoneInput = input.value;
    if (!phoneInput) {
        resultContainer.classList.add('hidden');
        return;
    }

    const digits = phoneInput.replace(/\D/g, '');
    if (!digits) {
        resultContainer.classList.add('hidden');
        return;
    }

    let sum = 0;
    let steps = [];
    
    for (let i = 0; i < digits.length; i++) {
        sum += parseInt(digits[i]);
    }
    steps.push(`Initial sum: ${digits.split('').join(' + ')} = ${sum}`);
    
    let currentSum = sum;
    while (currentSum > 9) {
        const digitsArray = currentSum.toString().split('');
        const newSum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);
        steps.push(`Reducing ${currentSum}: ${digitsArray.join(' + ')} = ${newSum}`);
        currentSum = newSum;
    }

    // Display simple text output
    const resultText = `
${steps.join('\n')}

Phone Number Result: ${currentSum}
            `;

    calculationDiv.innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    resultContainer.classList.remove('hidden');
    digitDiv.innerHTML = '';
}

function calculateDynamicNameDigits(input, resultContainer, calculationDiv, digitDiv) {
    const nameInput = input.value.trim();
    if (!nameInput) {
        resultContainer.classList.add('hidden');
        return;
    }

    const words = nameInput.split(/\s+/);
    let steps = [];
    let totalSum = 0;
    
    words.forEach(word => {
        let wordSum = 0;
        let wordSteps = [];
        
        const upperWord = word.toUpperCase();
        const letterValues = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5,
            'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8,
            'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5,
            'Y': 1, 'Z': 7
        };
        for (let i = 0; i < upperWord.length; i++) {
            const char = upperWord[i];
            if (letterValues.hasOwnProperty(char)) {
                const value = letterValues[char];
                wordSum += value;
                wordSteps.push(`${char}=${value}`);
            }
        }
        
        if (wordSteps.length > 0) {
            steps.push(`${word}: ${wordSteps.join(' + ')} = ${wordSum}`);
            totalSum += wordSum;
        }
    });

    steps.push(`Total: ${words.map(w => w.toUpperCase()).join(' + ')} = ${totalSum}`);
    
    let currentSum = totalSum;
    while (currentSum > 9) {
        const digitsArray = currentSum.toString().split('');
        const newSum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);
        steps.push(`Reducing total ${currentSum}: ${digitsArray.join(' + ')} = ${newSum}`);
        currentSum = newSum;
    }

    // Display simple text output
    const resultText = `
${steps.join('\n')}

Name Number Result: ${currentSum}
            `;

    calculationDiv.innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    resultContainer.classList.remove('hidden');
    digitDiv.innerHTML = '';
}

function setupAddFieldButtons() {
    document.getElementById('addNameField').addEventListener('click', () => addField('nameSection', calculateNameDigits, 'name'));
    document.getElementById('addPhoneField').addEventListener('click', () => addField('phoneSection', calculatePhoneDigits, 'phone'));
}
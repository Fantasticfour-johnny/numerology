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
    phoneResult: null,
    vehicle: "",
    vehicleResult: null,
    bankAccount: "",
    bankAccountResult: null,
    company: "",
    companyResult: null,
    brandName: "",
    brandNameResult: null,
    houseNumber: "",
    houseNumberResult: null,
    houseName: "",
    houseNameResult: null,
    emailId: "",
    emailIdResult: null
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
        phonesResults: sections.phonesResults,
        vehicles: sections.vehicles,
        vehiclesResults: sections.vehiclesResults,
        bankAccounts: sections.bankAccounts,
        bankAccountsResults: sections.bankAccountsResults,
        companies: sections.companies,
        companiesResults: sections.companiesResults,
        brandNames: sections.brandNames,
        brandNamesResults: sections.brandNamesResults,
        houseNumbers: sections.houseNumbers,
        houseNumbersResults: sections.houseNumbersResults,
        houseNames: sections.houseNames,
        houseNamesResults: sections.houseNamesResults,
        emailIds: sections.emailIds,
        emailIdsResults: sections.emailIdsResults
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
// Professional Numerology Calculator JavaScript

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupAddFieldButtons();
    setupEventListeners();
    const saveBtn = document.getElementById('saveToSheet');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveRowToGoogleSheet);
    }
});

// Setup event listeners for input fields
function setupEventListeners() {
    document.getElementById('dob').addEventListener('change', calculateDigitSum);
    document.getElementById('phone').addEventListener('input', calculatePhoneDigits);
    document.getElementById('name').addEventListener('input', calculateNameDigits);
    document.getElementById('company').addEventListener('input', calculateCompanyDigits);
    document.getElementById('vehicle').addEventListener('input', calculateVehicleDigits);
    document.getElementById('bankAccount').addEventListener('input', calculateBankAccountDigits);
    document.getElementById('houseNumber').addEventListener('input', calculateHouseNumberDigits);
    document.getElementById('brandName').addEventListener('input', calculateBrandNameDigits);
    document.getElementById('emailId').addEventListener('input', calculateEmailIdDigits);
    document.getElementById('houseName').addEventListener('input', calculateHouseNameDigits);
}

function calculateVehicleDigits() {
    const vehicleInput = document.getElementById('vehicle').value.trim().toUpperCase();
    if (!vehicleInput) {
        document.getElementById('vehicleResult').classList.add('hidden');
        return;
    }

    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5,
        'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8,
        'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5,
        'Y': 1, 'Z': 7
    };

    let sum = 0;
    let steps = [];
    
    // Process each character
    for (let i = 0; i < vehicleInput.length; i++) {
        const char = vehicleInput[i];
        if (/\d/.test(char)) {
            // It's a digit
            const num = parseInt(char);
            sum += num;
        } else if (/[A-Z]/.test(char) && letterValues[char]) {
            // It's a letter with known value
            const value = letterValues[char];
            sum += value;
        }
    }

    steps.push(`Total sum: ${sum}`);

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

Vehicle Number Result: ${currentSum}
            `;
    
    document.getElementById('vehicleCalculation').innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    document.getElementById('vehicleResult').classList.remove('hidden');
    document.getElementById('vehicleDigit').innerHTML = '';
    appState.vehicle = document.getElementById('vehicle').value;
    appState.vehicleResult = currentSum;
    logEvent('Vehicle', vehicleInput, currentSum);
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

function calculateCompanyDigits() {
    const companyInput = document.getElementById('company').value.trim();
    if (!companyInput) {
        document.getElementById('companyResult').classList.add('hidden');
        return;
    }

    // Split company name into words
    const words = companyInput.split(/\s+/);
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

Company Name Result: ${currentSum}
            `;
    
    document.getElementById('companyCalculation').innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    document.getElementById('companyResult').classList.remove('hidden');
    document.getElementById('companyDigit').innerHTML = '';
    appState.company = document.getElementById('company').value;
    appState.companyResult = currentSum;
    logEvent('Company', companyInput, currentSum);
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
    } else if (sectionType === 'vehicle') {
        newInput.placeholder = 'e.g. KA 05 QA 9683';
        newInput.className = newInput.className.replace('focus:border-blue-500', 'focus:border-amber-500').replace('focus:ring-blue-200', 'focus:ring-amber-200');
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
        } else if (sectionType === 'vehicle') {
            calculateDynamicVehicleDigits(newInput, newResult, newResultContent, newResultDigit);
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

    const vehicles = getValues('#vehicle', 'vehicleSection');
    const vehiclesResults = vehicles.map(v => calcResult(v, 'letters+digits'));

    const bankAccounts = getValues('#bankAccount', 'bankAccountSection');
    const bankAccountsResults = bankAccounts.map(v => calcResult(v, 'letters+digits'));

    const companies = getValues('#company', 'companySection');
    const companiesResults = companies.map(v => calcResult(v, 'letters'));

    const brandNames = getValues('#brandName', 'brandNameSection');
    const brandNamesResults = brandNames.map(v => calcResult(v, 'letters+digits'));

    const houseNumbers = getValues('#houseNumber', 'houseNumberSection');
    const houseNumbersResults = houseNumbers.map(v => calcResult(v, 'letters+digits'));

    const houseNames = getValues('#houseName', 'houseNameSection');
    const houseNamesResults = houseNames.map(v => calcResult(v, 'letters'));

    const emailIds = getValues('#emailId', 'emailIdSection');
    const emailIdsResults = emailIds.map(v => calcResult(v, 'letters+digits'));

    return {
        names,
        namesResults,
        phones,
        phonesResults,
        vehicles,
        vehiclesResults,
        bankAccounts,
        bankAccountsResults,
        companies,
        companiesResults,
        brandNames,
        brandNamesResults,
        houseNumbers,
        houseNumbersResults,
        houseNames,
        houseNamesResults,
        emailIds,
        emailIdsResults
    };
}

function resetFormAndDynamicFields() {
    // Clear base inputs
    const baseIds = [
        'dob','name','phone','vehicle','bankAccount','company','brandName','houseNumber','houseName','emailId'
    ];
    baseIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    // Remove dynamic fields
    document.querySelectorAll('.dynamic-field').forEach(el => el.remove());
    // Hide results sections
    const resultIds = [
        'nameResult','phoneResult','vehicleResult','bankAccountResult','companyResult','brandNameResult','houseNumberResult','houseNameResult','emailIdResult'
    ];
    resultIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    // Reset calculation text areas
    const calcIds = [
        'calculationSteps','nameCalculation','phoneCalculation','vehicleCalculation','bankAccountCalculation','companyCalculation','brandNameCalculation','houseNumberCalculation','houseNameCalculation','emailIdCalculation'
    ];
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

function calculateDynamicCompanyDigits(input, resultContainer, calculationDiv, digitDiv) {
    const companyInput = input.value.trim();
    if (!companyInput) {
        resultContainer.classList.add('hidden');
        return;
    }

    const words = companyInput.split(/\s+/);
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

Company Name Result: ${currentSum}
            `;

    calculationDiv.innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    resultContainer.classList.remove('hidden');
    digitDiv.innerHTML = '';
}

function calculateDynamicVehicleDigits(input, resultContainer, calculationDiv, digitDiv) {
    const vehicleInput = input.value.trim().toUpperCase();
    if (!vehicleInput) {
        resultContainer.classList.add('hidden');
        return;
    }

    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5,
        'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8,
        'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5,
        'Y': 1, 'Z': 7
    };

    let sum = 0;
    let steps = [];
    
    for (let i = 0; i < vehicleInput.length; i++) {
        const char = vehicleInput[i];
        if (/\d/.test(char)) {
            const num = parseInt(char);
            sum += num;
        } else if (/[A-Z]/.test(char) && letterValues[char]) {
            const value = letterValues[char];
            sum += value;
        }
    }

    steps.push(`Total sum: ${sum}`);

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

Vehicle Number Result: ${currentSum}
            `;

    calculationDiv.innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    resultContainer.classList.remove('hidden');
    digitDiv.innerHTML = '';
}

// Bank Account Number Calculation (copy of vehicle)
function calculateBankAccountDigits() {
    const input = document.getElementById('bankAccount').value.trim().toUpperCase();
    if (!input) {
        document.getElementById('bankAccountResult').classList.add('hidden');
        return;
    }
    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5,
        'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8,
        'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5,
        'Y': 1, 'Z': 7
    };
    let sum = 0;
    let steps = [];
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (/\d/.test(char)) {
            sum += parseInt(char);
        } else if (/[A-Z]/.test(char) && letterValues[char]) {
            sum += letterValues[char];
        }
    }
    steps.push(`Total sum: ${sum}`);
    let currentSum = sum;
    while (currentSum > 9) {
        const digitsArray = currentSum.toString().split('');
        const newSum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);
        steps.push(`Reducing ${currentSum}: ${digitsArray.join(' + ')} = ${newSum}`);
        currentSum = newSum;
    }
    const resultText = `\n${steps.join('\n')}\n\nBank Account Number Result: ${currentSum}\n            `;
    document.getElementById('bankAccountCalculation').innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    document.getElementById('bankAccountResult').classList.remove('hidden');
    document.getElementById('bankAccountDigit').innerHTML = '';
    appState.bankAccount = document.getElementById('bankAccount').value;
    appState.bankAccountResult = currentSum;
    logEvent('BankAccount', input, currentSum);
}

// House Number Calculation (copy of vehicle)
function calculateHouseNumberDigits() {
    const input = document.getElementById('houseNumber').value.trim().toUpperCase();
    if (!input) {
        document.getElementById('houseNumberResult').classList.add('hidden');
        return;
    }
    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5,
        'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8,
        'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5,
        'Y': 1, 'Z': 7
    };
    let sum = 0;
    let steps = [];
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (/\d/.test(char)) {
            sum += parseInt(char);
        } else if (/[A-Z]/.test(char) && letterValues[char]) {
            sum += letterValues[char];
        }
    }
    steps.push(`Total sum: ${sum}`);
    let currentSum = sum;
    while (currentSum > 9) {
        const digitsArray = currentSum.toString().split('');
        const newSum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);
        steps.push(`Reducing ${currentSum}: ${digitsArray.join(' + ')} = ${newSum}`);
        currentSum = newSum;
    }
    const resultText = `\n${steps.join('\n')}\n\nHouse Number Result: ${currentSum}\n            `;
    document.getElementById('houseNumberCalculation').innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    document.getElementById('houseNumberResult').classList.remove('hidden');
    document.getElementById('houseNumberDigit').innerHTML = '';
    appState.houseNumber = document.getElementById('houseNumber').value;
    appState.houseNumberResult = currentSum;
    logEvent('HouseNumber', input, currentSum);
}

// Brand Name Calculation (copy of vehicle)
function calculateBrandNameDigits() {
    const input = document.getElementById('brandName').value.trim().toUpperCase();
    if (!input) {
        document.getElementById('brandNameResult').classList.add('hidden');
        return;
    }
    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5,
        'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8,
        'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5,
        'Y': 1, 'Z': 7
    };
    let sum = 0;
    let steps = [];
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (/\d/.test(char)) {
            sum += parseInt(char);
        } else if (/[A-Z]/.test(char) && letterValues[char]) {
            sum += letterValues[char];
        }
    }
    steps.push(`Total sum: ${sum}`);
    let currentSum = sum;
    while (currentSum > 9) {
        const digitsArray = currentSum.toString().split('');
        const newSum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);
        steps.push(`Reducing ${currentSum}: ${digitsArray.join(' + ')} = ${newSum}`);
        currentSum = newSum;
    }
    const resultText = `\n${steps.join('\n')}\n\nBrand Name Result: ${currentSum}\n            `;
    document.getElementById('brandNameCalculation').innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    document.getElementById('brandNameResult').classList.remove('hidden');
    document.getElementById('brandNameDigit').innerHTML = '';
    appState.brandName = document.getElementById('brandName').value;
    appState.brandNameResult = currentSum;
    logEvent('BrandName', input, currentSum);
}

// Email ID Calculation (copy of vehicle)
function calculateEmailIdDigits() {
    const input = document.getElementById('emailId').value.trim().toUpperCase();
    if (!input) {
        document.getElementById('emailIdResult').classList.add('hidden');
        return;
    }
    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5,
        'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8,
        'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5,
        'Y': 1, 'Z': 7
    };
    let sum = 0;
    let steps = [];
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (/\d/.test(char)) {
            sum += parseInt(char);
        } else if (/[A-Z]/.test(char) && letterValues[char]) {
            sum += letterValues[char];
        }
    }
    steps.push(`Total sum: ${sum}`);
    let currentSum = sum;
    while (currentSum > 9) {
        const digitsArray = currentSum.toString().split('');
        const newSum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);
        steps.push(`Reducing ${currentSum}: ${digitsArray.join(' + ')} = ${newSum}`);
        currentSum = newSum;
    }
    const resultText = `\n${steps.join('\n')}\n\nEmail ID Result: ${currentSum}\n            `;
    document.getElementById('emailIdCalculation').innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    document.getElementById('emailIdResult').classList.remove('hidden');
    document.getElementById('emailIdDigit').innerHTML = '';
    appState.emailId = document.getElementById('emailId').value;
    appState.emailIdResult = currentSum;
    logEvent('EmailId', input, currentSum);
}

// House Name Calculation (copy of name)
function calculateHouseNameDigits() {
    const nameInput = document.getElementById('houseName').value.trim();
    if (!nameInput) {
        document.getElementById('houseNameResult').classList.add('hidden');
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
            steps.push(`<strong>${word}</strong>: ${wordSteps.join(' + ')} = ${wordSum}`);
            totalSum += wordSum;
        }
    });
    steps.push(`<strong>Total</strong>: ${words.map(w => w.toUpperCase()).join(' + ')} = ${totalSum}`);
    let currentSum = totalSum;
    while (currentSum > 9) {
        const digitsArray = currentSum.toString().split('');
        const newSum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);
        steps.push(`Reducing total ${currentSum}: ${digitsArray.join(' + ')} = ${newSum}`);
        currentSum = newSum;
    }
    const resultText = `\n${steps.join('\n')}\n\nHouse Name Result: ${currentSum}\n            `;
    document.getElementById('houseNameCalculation').innerHTML = `<pre class="calculation-result">${resultText}</pre>`;
    document.getElementById('houseNameResult').classList.remove('hidden');
    document.getElementById('houseNameDigit').innerHTML = '';
    appState.houseName = document.getElementById('houseName').value;
    appState.houseNameResult = currentSum;
    logEvent('HouseName', nameInput, currentSum);
}

function setupAddFieldButtons() {
    document.getElementById('addNameField').addEventListener('click', () => addField('nameSection', calculateNameDigits, 'name'));
    document.getElementById('addVehicleField').addEventListener('click', () => addField('vehicleSection', calculateVehicleDigits, 'vehicle'));
    document.getElementById('addPhoneField').addEventListener('click', () => addField('phoneSection', calculatePhoneDigits, 'phone'));
    document.getElementById('addBankAccountField').addEventListener('click', () => addField('bankAccountSection', calculateBankAccountDigits, 'vehicle'));
    document.getElementById('addHouseNumberField').addEventListener('click', () => addField('houseNumberSection', calculateHouseNumberDigits, 'vehicle'));
    document.getElementById('addBrandNameField').addEventListener('click', () => addField('brandNameSection', calculateBrandNameDigits, 'vehicle'));
    document.getElementById('addEmailIdField').addEventListener('click', () => addField('emailIdSection', calculateEmailIdDigits, 'vehicle'));
    document.getElementById('addHouseNameField').addEventListener('click', () => addField('houseNameSection', calculateHouseNameDigits, 'name'));
}

// Remove duplicate DOB listener that also posted to sheets. Use the Save button instead.
const CODE_LIMIT = 3;
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handleCodeLengthChange() {
    updateUI('codeLengthValue', getInputValue('codeLength'));
}

function getCurrentDateISO() {
    return new Date().toISOString().split('T')[0];
}

function isWithinLimit() {
    const generationData = getGenerationData();
    const today = getCurrentDateISO();
    return (generationData.date === today && generationData.count < CODE_LIMIT);
}

function getGenerationData() {
    return JSON.parse(localStorage.getItem('generatedToday')) || { date: '', count: 0, resetTime: null };
}

function resetGenerationData() {
    localStorage.setItem('generatedToday', JSON.stringify({ date: getCurrentDateISO(), count: 0, resetTime: null }));
}

function updateCodeGenerationCount() {
    const generationData = getGenerationData();
    generationData.date = getCurrentDateISO();
    generationData.count++;
    if (generationData.count >= CODE_LIMIT) {
        generationData.resetTime = Date.now() + RESET_INTERVAL;
    }
    localStorage.setItem('generatedToday', JSON.stringify(generationData));
}

function updateUI(elementId, value) {
    document.getElementById(elementId).textContent = value;
}

function getInputValue(inputId) {
    return document.getElementById(inputId).value;
}

function handleGenerateCode() {
    if (!canGenerateCode()) {
        return;
    }

    hideErrorMessage();
    const code = generateRandomCode(getInputValue('codeLength'));
    displayGeneratedCode(code);
    updateCodeGenerationCount();
    const remainingCodes = Math.max(CODE_LIMIT - getGenerationData().count, 0); // Prevent negative values
    updateUI('limitReminder', `You can generate ${remainingCodes} more code(s) today.`);
    showSuccessMessage("Code generated successfully!");
}

function generateRandomCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars.charAt(getRandomInt(0, chars.length - 1))).join('');
}

function displayGeneratedCode(code) {
    updateUI('referralCode', code);
    showElement('copyButton');
    showElement('sendWhatsAppButton');
}

function copyCodeToClipboard() {
    const code = document.getElementById('referralCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showSuccessMessage("Code copied to clipboard!");
        hideElementAfterDelay('successMessage', 3000);
    });
}

function sendCodeToWhatsApp() {
    const code = document.getElementById('referralCode').textContent;
    const phoneNumber = '6282225566158';
    const message = `INI CODE AKU: ${code}`;
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function canGenerateCode() {
    const generationData = getGenerationData();
    const today = getCurrentDateISO();
    if (generationData.date === today && generationData.count >= CODE_LIMIT) {
        const remainingTime = generationData.resetTime - Date.now();
        if (remainingTime > 0) {
            displayTimer(remainingTime);
            return false;
        } else {
            resetGenerationData();
        }
    }
    return true;
}

function displayTimer(remainingTime) {
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    showErrorMessage(`You have reached the daily limit. Try again in ${hours}h ${minutes}m ${seconds}s.`);
    setTimeout(() => {
        displayTimer(remainingTime - 1000);
    }, 1000); // Update the timer every second
}

function showErrorMessage(message) {
    document.getElementById('errorMessage').textContent = message;
    showElement('errorMessage');
}

function hideErrorMessage() {
    hideElement('errorMessage');
}

function showSuccessMessage(message) {
    document.getElementById('successMessage').textContent = message;
    showElement('successMessage');
}

function hideElementAfterDelay(elementId, delay) {
    setTimeout(() => hideElement(elementId), delay);
}

function showElement(elementId) {
    document.getElementById(elementId).classList.remove('hidden');
}

function hideElement(elementId) {
    document.getElementById(elementId).classList.add('hidden');
}

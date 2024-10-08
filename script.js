const CODE_LIMIT = 3; // Set the limit to 3

function updateLength() {
    document.getElementById('codeLengthValue').textContent = document.getElementById('codeLength').value;
}

function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function canGenerateCode() {
    const generatedToday = JSON.parse(localStorage.getItem('generatedToday')) || { date: '', count: 0, resetTime: null };
    const today = getCurrentDate();

    // Check if the current date is the same as the generated date
    if (generatedToday.date === today) {
        // If the count is at limit, check the reset time
        if (generatedToday.count >= CODE_LIMIT) {
            const now = new Date().getTime();
            const resetTime = generatedToday.resetTime;
            if (resetTime && now < resetTime) {
                // If the current time is less than the reset time, user can't generate
                const remainingTime = resetTime - now;
                displayTimer(remainingTime);
                return false;
            }
        }
    }
    return true; // User can generate
}

function displayTimer(remainingTime) {
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    document.getElementById('errorMessage').textContent = `You have reached the daily limit for code generation. Try again in ${hours}h ${minutes}m ${seconds}s.`;
    document.getElementById('errorMessage').style.display = 'block';
}

function updateCodeGenerationCount() {
    const generatedToday = JSON.parse(localStorage.getItem('generatedToday')) || { date: '', count: 0, resetTime: null };
    const today = getCurrentDate();
    
    if (generatedToday.date !== today) {
        generatedToday.date = today;
        generatedToday.count = 1;
        generatedToday.resetTime = null; // Reset the timer
    } else {
        generatedToday.count++;
        // If count reaches limit, set reset time for 24 hours later
        if (generatedToday.count >= CODE_LIMIT) {
            generatedToday.resetTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours from now
        }
    }

    localStorage.setItem('generatedToday', JSON.stringify(generatedToday));
}

function generateCode() {
    if (!canGenerateCode()) {
        return; // Early return if the user cannot generate the code
    }

    document.getElementById('errorMessage').style.display = 'none';
    const length = document.getElementById('codeLength').value;
    const code = generateRandomCode(length);
    document.getElementById('referralCode').textContent = code;

    updateCodeGenerationCount();
    document.getElementById('copyButton').style.display = 'inline-block';
    document.getElementById('sendWhatsAppButton').style.display = 'inline-block';
    document.getElementById('successMessage').textContent = "Code generated successfully!";
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('limitReminder').textContent = `You can generate ${CODE_LIMIT - JSON.parse(localStorage.getItem('generatedToday')).count} more code(s) today.`;
}

function generateRandomCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function copyToClipboard() {
    const codeText = document.getElementById('referralCode').textContent;
    navigator.clipboard.writeText(codeText).then(() => {
        document.getElementById('successMessage').textContent = "Code copied to clipboard!";
        document.getElementById('successMessage').style.display = 'block';
        setTimeout(() => {
            document.getElementById('successMessage').style.display = 'none';
        }, 3000);
    });
}

function sendToWhatsApp() {
    const codeText = document.getElementById('referralCode').textContent;
    const phoneNumber = '6282225566158'; // Replace with the actual phone number
    const message = `INI CODE AKU: ${codeText}`;
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

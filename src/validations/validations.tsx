// Validate Email format
export const CheckEmail = (email: string) => {
    if (!email || email.trim() === '') {
        return 'Email is required';
    }
    if (!email.includes('@')) {
        return 'Please include an \'@\' in the email address';
    }
    if (!email.includes('.')) {
        return 'Please include a valid domain in the email address';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    return '';
};

// Validate 6 digit number OTP
export const Check6DigitPassword = (password: string) => {
    if (!password || password.trim() === '') {
        return 'Password is required';
    }
    if (password.length < 6) {
        return 'Password must be at least 6 characters long';
    }
    return '';
};

// Validate Strong Password with Special Char/Number/8 digit long
export const checkStrongPassword = (text: string) => {
    const hasUpperCase = /[A-Z]/.test(text);
    const hasLowerCase = /[a-z]/.test(text);
    const hasNumber = /\d/.test(text);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(text);
    const isLongEnough = text.length >= 8;

    return {
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar,
        isLongEnough,
        isValid: hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough
    };
};

// check Re-Enter password is matched
export const checkMatchedPassword = (text: string, confirmText: string) => {
    return text === confirmText && text.length > 0;
};


// FIRST and LAST name character for Profile rendering
export const getInitials = (name: string) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    const firstChar = words[0][0];
    const lastChar = words[words.length - 1][0];
    return (firstChar + lastChar).toUpperCase();
};

// Format and validate country code input - only allows + followed by digits, max 10 characters
export const formatCountryCode = (value: string): string => {
    // If empty, return +
    if (value === '') {
        return '+';
    }
    
    // Remove any characters that aren't + or digits
    let cleaned = value.replace(/[^+\d]/g, '');
    
    // Ensure it starts with +
    if (cleaned && !cleaned.startsWith('+')) {
        // If user types a digit first, prepend +
        cleaned = '+' + cleaned.replace(/\+/g, '');
    }
    
    // After the +, only allow digits
    if (cleaned.length > 1) {
        const afterPlus = cleaned.substring(1);
        const digitsOnly = afterPlus.replace(/\D/g, '');
        cleaned = '+' + digitsOnly;
    } else if (cleaned === '') {
        cleaned = '+';
    }
    
    // Limit to 10 characters (including the +)
    if (cleaned.length > 10) {
        cleaned = cleaned.substring(0, 10);
    }
    
    return cleaned;
};

// Format and validate phone number input - only allows digits, max 15 characters
export const formatPhoneNumber = (value: string): string => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 15 digits (international standard)
    const limited = cleaned.substring(0, 15);
    
    return limited;
};
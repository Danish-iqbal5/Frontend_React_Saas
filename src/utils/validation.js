export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  
  if (email.length > 254) {
    return 'Email is too long';
  }
  
  return '';
};


export const validatePassword = (password, isRequired = true) => {
  if (!password || !password.trim()) {
    return isRequired ? 'Password is required' : '';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (password.length > 128) {
    return 'Password is too long';
  }
  
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
    return 'Password must contain at least one uppercase letter, lowercase letter, number, and special character';
  }
  
  return '';
};

export const validateFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return 'Full name is required';
  }
  
  if (fullName.trim().length < 2) {
    return 'Full name must be at least 2 characters long';
  }
  
  if (fullName.trim().length > 50) {
    return 'Full name is too long';
  }
  
  
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(fullName.trim())) {
    return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
  }
  
  return '';
};

export const validateProductName = (productName) => {
  if (!productName || !productName.trim()) {
    return 'Product name is required';
  }
  
  if (productName.trim().length < 3) {
    return 'Product name must be at least 3 characters long';
  }
  
  if (productName.trim().length > 100) {
    return 'Product name is too long';
  }
  
  return '';
};


export const validateProductDescription = (description) => {
  if (!description || !description.trim()) {
    return 'Product description is required';
  }
  
  if (description.trim().length < 10) {
    return 'Product description must be at least 10 characters long';
  }
  
  if (description.trim().length > 1000) {
    return 'Product description is too long';
  }
  
  return '';
};


export const validatePrice = (price) => {
  if (!price && price !== 0) {
    return 'Price is required';
  }
  
  const numPrice = parseFloat(price);
  
  if (isNaN(numPrice)) {
    return 'Price must be a valid number';
  }
  
  if (numPrice < 0) {
    return 'Price cannot be negative';
  }
  
  if (numPrice > 999999.99) {
    return 'Price is too high';
  }
  
  
  const priceStr = price.toString();
  if (priceStr.includes('.') && priceStr.split('.')[1].length > 2) {
    return 'Price can have maximum 2 decimal places';
  }
  
  return '';
};


export const validateQuantity = (quantity) => {
  if (!quantity && quantity !== 0) {
    return 'Quantity is required';
  }
  
  const numQuantity = parseInt(quantity);
  
  if (isNaN(numQuantity)) {
    return 'Quantity must be a valid number';
  }
  
  if (numQuantity < 0) {
    return 'Quantity cannot be negative';
  }
  
  if (numQuantity > 999999) {
    return 'Quantity is too high';
  }
  
  if (!Number.isInteger(numQuantity)) {
    return 'Quantity must be a whole number';
  }
  
  return '';
};


export const validateOTP = (otp) => {
  if (!otp || !otp.trim()) {
    return 'OTP is required';
  }
  
  if (otp.length !== 6) {
    return 'OTP must be 6 digits long';
  }
  
  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otp)) {
    return 'OTP must contain only numbers';
  }
  
  return '';
};


export const validateUserType = (userType) => {
  const validTypes = ['normal_customer', 'vendor', 'vip_customer'];
  
  if (!userType) {
    return 'Account type is required';
  }
  
  if (!validTypes.includes(userType)) {
    return 'Please select a valid account type';
  }
  
  return '';
};


export const validateWholesalePrice = (price) => {
  if (!price && price !== 0) {
    return 'Wholesale price is required';
  }
  
  const numPrice = parseFloat(price);
  
  if (isNaN(numPrice)) {
    return 'Wholesale price must be a valid number';
  }
  
  if (numPrice < 0) {
    return 'Wholesale price cannot be negative';
  }
  
  if (numPrice > 999999.99) {
    return 'Wholesale price is too high';
  }
  
  // Check for valid decimal places (max 2)
  const priceStr = price.toString();
  if (priceStr.includes('.') && priceStr.split('.')[1].length > 2) {
    return 'Wholesale price can have maximum 2 decimal places';
  }
  
  return '';
};


export const validateRetailPrice = (retailPrice, wholesalePrice = null) => {
  if (!retailPrice && retailPrice !== 0) {
    return 'Retail price is required';
  }
  
  const numRetailPrice = parseFloat(retailPrice);
  
  if (isNaN(numRetailPrice)) {
    return 'Retail price must be a valid number';
  }
  
  if (numRetailPrice < 0) {
    return 'Retail price cannot be negative';
  }
  
  if (numRetailPrice > 999999.99) {
    return 'Retail price is too high';
  }
  
  const priceStr = retailPrice.toString();
  if (priceStr.includes('.') && priceStr.split('.')[1].length > 2) {
    return 'Retail price can have maximum 2 decimal places';
  }
  
  // Check if retail price is greater than or equal to wholesale price
  if (wholesalePrice !== null) {
    const numWholesalePrice = parseFloat(wholesalePrice);
    if (!isNaN(numWholesalePrice) && numRetailPrice < numWholesalePrice) {
      return 'Retail price must be greater than or equal to wholesale price';
    }
  }
  
  return '';
};


export const validateStockQuantity = (stockQuantity) => {
  if (!stockQuantity && stockQuantity !== 0) {
    return 'Stock quantity is required';
  }
  
  const numQuantity = parseInt(stockQuantity);
  
  if (isNaN(numQuantity)) {
    return 'Stock quantity must be a valid number';
  }
  
  if (numQuantity < 0) {
    return 'Stock quantity cannot be negative';
  }
  
  if (numQuantity > 999999) {
    return 'Stock quantity is too high';
  }
  
  if (!Number.isInteger(numQuantity)) {
    return 'Stock quantity must be a whole number';
  }
  
  return '';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
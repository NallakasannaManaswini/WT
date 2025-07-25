function calculateInterest(principal, years, rate) {
  return principal * years * (rate / 100);
}

function calculateTotalAmount(principal, interest) {
  return principal + interest;
}

function calculateEMI(totalAmount, years) {
  return +(totalAmount / (years * 12)).toFixed(2);
}

module.exports = {
  calculateInterest,
  calculateTotalAmount,
  calculateEMI
};
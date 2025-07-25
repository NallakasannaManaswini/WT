function formatIndianCurrency(num) {
  let [intPart, decPart] = num.toString().split('.');
  let lastThree = intPart.slice(-3);
  let other = intPart.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return (other ? other + "," : "") + lastThree + (decPart ? "." + decPart : "");
}

module.exports = formatIndianCurrency;
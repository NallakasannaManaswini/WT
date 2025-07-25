function minimizeLoss(prices) {
  let minLoss = Infinity;
  let buyYear = -1, sellYear = -1;

  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      let loss = prices[i] - prices[j];
      if (loss > 0 && loss < minLoss) {
        minLoss = loss;
        buyYear = i + 1;
        sellYear = j + 1;
      }
    }
  }

  return { buyYear, sellYear, loss: minLoss };
}
module.exports = minimizeLoss;
function analysis() {

  this.mean = function mean(priceChangeArray, range = priceChangeArray.length) {
    //sum of price array
    var sum = priceChangeArray.reduce((accumulator, currentValue) => 
      accumulator + currentValue
    );
      return sum / range; //mean
  }

  this.delta = function delta(priceArray) {
    //Calculates change in price array
    var deltaArray = [];
    for (i=1; i < priceArray.length; i++) {
      deltaArray.push(priceArray[i] - priceArray[i - 1])
    }
    return deltaArray;
  }

  this.rsValue = function rsValue(priceChangeArray, timeFrame = priceChangeArray.length) {
    //Calculates initial relative strength array, [numerator,denominator]
    var gains = priceChangeArray.filter(x => x > 0);
    var losses = priceChangeArray.filter(x => x < 0);
    //array of average gains and average losses
    var rsValues = [this.mean(gains, timeFrame) , Math.abs(this.mean(losses, timeFrame))];
    return rsValues;
  }

  this.smoothedRS = function smoothedRS(rsValues, priceChangeArray, timeFrame) {
    //calculate recursive RS, but store in array of arrays [[numerator, denominator]]
    var averageArray = [ [rsValues[0], rsValues[1]] ];
    for (i = 0; i < priceChangeArray.length; i++) {
      if ( priceChangeArray[i] >= 0) {
        var nextAverageGain = 
          (averageArray[i][0]*(timeFrame - 1) + priceChangeArray[i]) / timeFrame;
        var nextAverageLoss = 
          (averageArray[i][1]*(timeFrame - 1)) / timeFrame;
      } else { 
        var nextAverageGain = 
          (averageArray[i][0]*(timeFrame - 1)) / timeFrame;
        var nextAverageLoss = 
          (averageArray[i][1]*(timeFrame - 1) + Math.abs(priceChangeArray[i])) / timeFrame;
      }
    averageArray.push([nextAverageGain, nextAverageLoss])
    }
    return averageArray //this is the un-divided smoothed RS
  }

  this.rsi = function rsi(rs) {
    var rsi = rs.map(x => 
      100 - 100 / (1 +  x[0] / x[1])
    );
    return rsi;
  }

  this.maximum = function maximumWithinPeriod(array, period) {
    var highestHigh = -Infinity
    for (i = 0; i < period; i++) {
      if (array[i] > highestHigh) {
        highestHigh = array[i];
      }
    }
    return highestHigh;
  }
  this.minimum = function minimumWithinPeriod(array, period = array.length) {
    var lowestLow   =  Infinity;
    for (i = 0; i < period; i++) {
      if (array[i] < lowestLow) {
        lowestLow = array[i];
      }
    }
    return lowestLow
  }
}
module.exports = analysis;
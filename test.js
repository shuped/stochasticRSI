const fetchBitmex = require("./fetchBitmex.js");
const analysis = require("./analysis");
const mysql = require('mysql');

const calc = new analysis();
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "pass",
  database: "mydb"
});

const timeFrame = 14; const maximumQueries = 100;
const binSize = ["1m", "5m", "1h", "1d"]
var dataObject = {}; 

//initialize the program:
binSize.forEach( period => {
  //dataObject[period] = 
  fetchBitmex(period, 'XBTUSD', maximumQueries)
  .then(bitmexJSON => {
    
    this.RSIs = calculateRSIs(bitmexJSON)[0];
    this.lastRSvalue = calculateRSIs(bitmexJSON)[1];

    this.StochRSI = calculateStochRSIs(this.RSIs);
    this.timestampedRSIs = timestamp(this.RSIs, bitmexJSON, offset = timeFrame - 1)

    //return this.timestampedRSIs     
    dataObject[period] = this.timestampedRSIs;
  })
});

setTimeout(x => console.log(dataObject), 5000)




// // 
function calculateRSIs(bitmexJSON) {
  var closeArray = bitmexJSON.map(bucket => bucket.close);
  var priceChanges = calc.delta(closeArray);

  var initialData = priceChanges.slice(0, timeFrame + 1);
  var smoothingData = priceChanges.slice(timeFrame);

  var initialRSValue = calc.rsValue(initialData);
  var smoothedRSarray = calc.smoothedRS(initialRSValue, smoothingData, timeFrame);

  var rsiArray = calc.rsi(smoothedRSarray);
  var lastRSvalue = smoothedRSarray.pop()
  
  return [rsiArray, lastRSvalue]
}

function calculateStochRSIs(RSIs) {
  var highestHigh = calc.maximum(RSIs, period = timeFrame)
  var lowestLow = calc.minimum(RSIs, period = timeFrame)


  

}

function timestamp(stampee, stamperJSON, offset = 0) {
  return stampee.map((element, index) =>
    [stamperJSON[index + offset].timestamp, element]
  )
}

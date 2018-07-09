const fetch = require('node-fetch');
const crypto = require('crypto');
const qs = require('qs');

const apiKey = "rPBnDzKI88qViRTJnnUwFVLm";
const apiSecret = "OhFbvLHcibZ9Wvx-_hfvP2RsmDUsKJrEVMBe-8Pj8U00xBz8";

function startTime(binSize, count) {
  var startTime = new Date().getTime();
  if (binSize == "1m") {startTime -= (count - 1)*1  *  1000*60}
  if (binSize == "5m") {startTime -= (count - 1)*5  *  1000*60}
  if (binSize == "1h") {startTime -= (count - 1)*60 *  1000*60}
  if (binSize == "1d") {startTime -= (count - 1)*60*24*1000*60}
  return new Date(startTime);
}

function makeRequest(verb, endpoint, data = {}) {
  const apiRoot = '/api/v1/';

  const expires = new Date().getTime() + (60 * 1000);  // 1 min in the future

  let query = '', postBody = '';
  if (verb === 'GET')
    query = '?' + qs.stringify(data);
  else
    // Pre-compute the reqBody so we can be sure that we're using *exactly* the same body in the request
    // and in the signature. If you don't do this, you might get differently-sorted keys and blow the signature.
    postBody = JSON.stringify(data);

  const signature = crypto.createHmac('sha256', apiSecret)
    .update(verb + apiRoot + endpoint + query + expires + postBody).digest('hex');

  const headers = {
    'content-type': 'application/json',
    'accept': 'application/json',
    // This example uses the 'expires' scheme. You can also use the 'nonce' scheme. See
    // https://www.bitmex.com/app/apiKeysUsage for more details.
    'api-expires': expires,
    'api-key': apiKey,
    'api-signature': signature,
  };

  const requestOptions = {
    method: verb,
    headers,
  };
  if (verb !== 'GET') requestOptions.body = postBody;  // GET/HEAD requests can't have body

  const url = 'https://www.bitmex.com' + apiRoot + endpoint + query;

  return fetch(url, requestOptions).then(response => response.json()).then(
    response => {
      if ('error' in response) throw new Error(response.error.message);
      return response;
    },
    error => console.error('Network error', error),
  );
}

async function main(binSize, symbol, count, partial = true) {
    try {
        const result = await makeRequest('GET', 'trade/bucketed', {
          binSize: binSize, 
          partial: partial,
          symbol: symbol,
          columns: ['timestamp', 'close'],
          count: count,
          startTime: startTime(binSize, count)
        })
          return result;
      } catch (e) {
        console.error(e);
  };
};

module.exports = main;
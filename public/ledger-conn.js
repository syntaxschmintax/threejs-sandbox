'use strict';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const RippleAPI = require('ripple-lib').RippleAPI;
const server_domain = 'xrpgoat.com'
const server_address = `wss://${server_domain}:6005`
const api = new RippleAPI({server: server_address});

api.on('connected', () => {
  console.log('Connection Open -- ' + server_address);
});

api.on('disconnected', (code) => {
  if (code !== 1000) {
    console.log('Exited due to error!');
  } else {
    console.log('Disconnected Normally');
  }
});

api.on('error', (errorCode, errorMessage, data) => {
  console.log(errorCode + '  ' + errorMessage);
});

api.on('ledger', ledger => {
  let ledger_opts = {
    includeTransactions: true,
    includeAllData: true,
    ledgerVersion: ledger.ledgerVersion
  }
  api.getLedger(ledger_opts)
    .then(ledger_content => {console.log(ledger_content)});
});

api.connect().then(() => {
  return api.getServerInfo();
}).then(async info => {
  // Print server info and mock a 30s connection. TODO: The actual conn/break things
  console.log(info);
  console.log('getServerInfo done. listening for 30s');
  await new Promise(done => setTimeout(done, 30000));
}).then(() => {return api.disconnect();
}).catch(console.error);

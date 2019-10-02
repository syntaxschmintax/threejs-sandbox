var socket_url = 'wss://xrpgoat.com:6005/';
var api = new ripple.RippleAPI({server: socket_url});
api.on('connected', () => { console.log('connected!!!!!') });

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

api.connect().then(function() {
  return api.getServerInfo();
}).then(function(server_info) {
  document.body.innerHTML += `<p> -- Connected to ${socket_url} -- </p>` +
    `<table>` +
    `  <tr><th>Version</th>` +
    `    <td>${server_info.buildVersion}</td></tr>` +
    `  <tr><th>Ledgers available</th>` +
    `    <td>${server_info.completeLedgers}</td></tr>` +
    `  <tr><th>hostID</th>` +
    `    <td>${server_info.hostID}</td></tr>` +
    `  <tr><th>Most Recent Validated Ledger Seq.</th>` +
    `    <td>${server_info.validatedLedger.ledgerVersion}</td></tr>` +
    `  <tr><th>Most Recent Validated Ledger Hash</th>` +
    `    <td>${server_info.validatedLedger.hash}</td></tr>` +
    `  <tr><th>Seconds since last ledger validated</th>` +
    `    <td>${server_info.validatedLedger.age}</td></tr>` +
    `</table>`;
}).then(async info => {
  // Mock a 30s connection. TODO: The actual conn/break things
  console.log('getServerInfo done. listening for 30s');
  await new Promise(done => setTimeout(done, 30000));
}).then(() => {return api.disconnect();
}).catch(console.error);
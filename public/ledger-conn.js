var socket_url = 'wss://xrpgoat.com:6005/';
var api = new ripple.RippleAPI({server: socket_url});
api.on('connected', () => { console.log(`connected to ${socket_url}`); });

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
  console.log(`Received Ledger#: ${ledger.ledgerVersion}`); 
  addCubeAtRandom3DPosition(1, {ledger_content: ledger, color: 0x29b6f8});
});

api.connect().then(function() {
  return api.getServerInfo();
}).then(function(server_info) {
  console.log(server_info);
}).then(async info => {
  console.log('Socket open for 5 minutes');
  await new Promise(done => setTimeout(done, 300000));
}).then(() => {return api.disconnect();
}).catch(console.error);
'use strict';

const vaultserver = require('./src/server');

const DEFAULT_SERVER_PORT = 3001;

// Load arguments passed from CLI
const argvConfig = parseArgv();

const VaultServer = vaultserver(argvConfig.port);
VaultServer.start();

function parseArgv() {
  let port;
  let portOpt = process.argv.find(opt => opt.lastIndexOf('-p=') != -1);

  if (portOpt) {
    const optValue = /-\w=(\d+)/.exec(portOpt);
    // Make sure we've captured the value of the opt
    if (optValue && optValue.length === 2) {
      port = optValue[1];
    }
  }

  return {
      port: port || DEFAULT_SERVER_PORT
  };
}

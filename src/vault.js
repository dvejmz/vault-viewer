'use strict';

const cp = require('child_process');

module.exports = () => {
  const exec = cp.exec;
  const execSync = cp.execSync;
  const env_variables = 'PATH='+process.env.PATH;
  const { PATH, VAULT_ADDR, VAULT_CACERT } = process.env;

  return {
    get
  };

  function runCommandSync(cmd) {
    return execSync(cmd, {
      env: {
        PATH,
        VAULT_ADDR,
        VAULT_CACERT
      },
      encoding: 'utf-8'
    });
  }

  function read(path) {
    const cmd = `vault read -format json secret/${path.replace(/^\/+/, '')}`; 
    let stdout = null;

    try {
      stdout = runCommandSync(cmd);
    } catch (e) {
        console.log('Failed to read secret on path: ', path, '. Error: ', e);
        throw e;
    }

    return JSON.parse(stdout).data;
  }

  function list(path) {
    const cmd = `vault list secret/${path}`; 
    let stdout = null;

    try {
      stdout = runCommandSync(cmd);
    } catch (e) {
        return null;
    }

    return stdout;
  }

  function get(path, cb) {
    let listOutput = list(path);

    if (listOutput) {
      const list = listOutput.split('\n')
        .filter((key) => {
          return key;
        })
        .map((key)=> {
          return { name: key, link: key };
        });

      return cb(
        null,
        {
          type: 'directory',
          content: list
        }
      );
    }

    // Try reading the path as a secret
    //
    // Detecting whether `path` leads to a directory
    // of secrets or a secret by capturing exceptions 
    // is not ideal but Vault doesn't make this information available.
    if (!listOutput) {
      let readOutput = null;
      try {
        readOutput = read(path);
      } catch (e) {
        return cb(e, null);
      }

      // Render secrets view
      return cb(
        null,
        {
          type: 'secrets',
          content: readOutput
        }
      );
    }
  }
};

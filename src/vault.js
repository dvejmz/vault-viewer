'use strict';

const util = require('util');
const cp = require('child_process');

const options = {
  token: '',
};
const vault = require('node-vault')(options);
process.env.DEBUG = 'node-vault';

module.exports = () => {
  const exec = cp.exec;
  const execSync = cp.execSync;
  const env_variables = 'PATH='+process.env.PATH;
  const { PATH, VAULT_ADDR, VAULT_CACERT, HOME } = process.env;

  return {
    get
  };

  function runCommandSync(cmd) {
    return execSync(cmd, {
      env: {
        HOME,
        PATH,
        VAULT_ADDR,
        VAULT_CACERT
      },
      encoding: 'utf-8'
    });
  }

  function trimPath(path) {
    return path.replace(/^\/+/, '');
  }

  async function read(path) {
    let value = null;
    try {
      const res = await vault.read(`secret/${trimPath(path)}`);
      return res.data;
    } catch (e) {
      console.log(e.toString());
    }

    return null;
  }

  function list(path) {
    const cmd = `vault list -format json secret/${trimPath(path)}`; 
    let stdout = null;

    try {
      stdout = runCommandSync(cmd);
    } catch (e) {
        return null;
    }

    return JSON.parse(stdout);
  }

  async function get(path) {
    let listOutput = list(path);

    if (listOutput) {
      const list = listOutput
        .map((key)=> {
          return { name: key, link: key };
        });

      return {
        type: 'directory',
        content: list
      };
    }

    // Try reading the path as a secret
    //
    // Detecting whether `path` leads to a directory
    // of secrets or a secret by capturing exceptions 
    // is not ideal but Vault doesn't make this information available.
    if (!listOutput) {
      let readOutput = null;
      try {
        readOutput = await read(path);
      } catch (e) {
        console.error(e.toString());
        return null;
      }

      return {
        type: 'secrets',
        content: readOutput,
      };
    }
  }
};

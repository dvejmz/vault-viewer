const options = {
  token: '',
};
const vault = require('node-vault')(options);

module.exports = () => {
  const env_variables = 'PATH='+process.env.PATH;
  const { PATH, VAULT_ADDR, VAULT_CACERT, HOME } = process.env;

  return {
    get
  };

  function trimPath(path) {
    return path.replace(/^\/+/, '');
  }

  async function read(path) {
    try {
      const res = await vault.read(`secret/${trimPath(path)}`);
      return res.data;
    } catch (e) {
      console.log(e.toString());
    }

    return null;
  }

  async function list(path) {
    try {
      const res = await vault.list(`secret/${trimPath(path)}`);
      return res.data.keys;
    } catch (e) {
      console.log(e.toString());
    }

    return null;
  }

  async function get(path) {
    let listOutput = await list(path);

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

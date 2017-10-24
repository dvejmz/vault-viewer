'use strict';

const express = require('express');
const pug = require('pug');
const vault = require('./vault')();

module.exports = (port) => {
  const app = express();
  init(port);

  return {
    start
  };

  function start() {
    app.listen(port, function () {
      console.log(`Vault Viewer listening on port ${port}!`);

      if (process.platform) {
        const { exec } = require('child_process');
        switch (process.platform) {
          case 'darwin':
            exec(`open http://localhost:${port}`);
            break;
          case 'linux':
            exec(`xdg-open http://localhost:${port}`);
            break;
          default:
            console.log(`Cannot launch web view: unrecognised platform. Visit http://localhost:${port}/ in your browser to use Vault Viewer.`);
            break;
        }
      }
    });
  }

  function init(port) {
    app.set('view engine', 'pug');
    app.use(function (req, res) {

      console.log(req.path);

      vault.get(req.path, (err, result) => {
        if (err) {
          console.error(err);
          res.redirect('back');
          return;
        }

        if (result.type === 'secrets') {
          res.render('entries', {
            entries: result.content,
            backLink: req.get('Referrer')
          });

          return;
        }

        if (result.type === 'directory') {
          let list = result.content;
          // Remove table headers
          list = list.slice(2);
          const originalUrl = req.url.split('/').filter(el => { return el; });

          if (originalUrl) {
            let backLink = '';
            if (originalUrl.length > 1) {
              backLink = originalUrl;
              backLink.pop();
              backLink = backLink.join('/');
            }

            list.unshift({
              name: '../',
              link: [req.baseUrl, backLink].join('/')
            });
          }

          // Render directories view
          res.render('list', { list: list });
          return;
        }
      });
    });
  }
};

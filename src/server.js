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

  function getBreadcrumb(url) {
    const originalUrlPaths = url.split('/').filter(p => p && p !== '').map(p => p.replace(/\/+/, ''));
    console.log(originalUrlPaths)
    const rootCrumb = {
      name: 'root',
      link: '/'
    };
    const breadcrumb = [rootCrumb];
    if (!originalUrlPaths || originalUrlPaths.length === 0) {
      return breadcrumb;
    }

    for (let i = 0; i < originalUrlPaths.length; i++) {
      let crumb = ['/'];
      for (let j = 0; j <= i; j++) {
        crumb.push(originalUrlPaths[j]);
      }

      breadcrumb.push({
        name: crumb[crumb.length-1],
        link: crumb.join('/').replace(/^\/{2}/, '/'),
      });
    }

    console.log("bc: ", breadcrumb);
    return breadcrumb;
  }

  function init(port) {
    app.set('view engine', 'pug');

    app.get('/favicon.ico', function(req, res){
      res.status(404).end();
    });

    app.use(express.static('public'));
    app.use(function (req, res) {
      console.log(req.path);

      vault.get(req.path, (err, result) => {
        if (err) {
          console.error(err.toString());
          return;
        }

        const breadcrumb = getBreadcrumb(req.url);
        if (result.type === 'secrets') {
          res.render('entries', {
            entries: result.content,
            breadcrumb,
            backLink: req.get('Referrer')
          });

          return;
        }

        if (result.type === 'directory') {
          let list = result.content;
          // Remove table headers
          const originalUrl = req.url.split('/').filter(el => { return el; });

          if (originalUrl) {
            let backLink = '';
            if (originalUrl.length > 1) {
              backLink = originalUrl;
              backLink.pop();
              backLink = backLink.join('/');
            }

            //list.unshift({
            //  name: 'BACK',
            //  link: [req.baseUrl, backLink].join('/'),
            //  class: 'back-button'
            //});
          }

          // Render directories view
          res.render('list', {
            list,
            breadcrumb
          });
          return;
        }
      });
    });
  }
};

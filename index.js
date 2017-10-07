'use strict';

const express = require('express')
const app = express()
const pug = require('pug');
const vault = require('./src/vault')();

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

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

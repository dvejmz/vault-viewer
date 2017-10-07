'use strict';
const express = require('express')
const app = express()
const pug = require('pug');
app.set('view engine', 'pug');

app.use(function (req, res) {

  console.log(req.path);

  const cp = require('child_process');

  const exec = cp.exec;

  let env_variables = 'PATH='+process.env.PATH;
  let cmd = `${env_variables} ./vlt ${req.path}`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      res.redirect('back');
      return;
    }

    if (stdout.indexOf('Keys') !== 0) {
        // Render secrets view
        res.render('entries', {
            entries: stdout,
            backLink: req.get('Referrer')
        });
        return;
    }

    let list = stdout.split('\n')
        .filter((key) => {
            return key;
        })
        .map((key)=> {
            return { name: key, link: key };
        });

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
  });

})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

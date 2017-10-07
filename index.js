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
        res.render('entries', { entries: stdout });
        return;
    }

    let list = stdout.split('\n')
        .filter((key) => {
            return key;
        })
        .map((key)=> {
            return { name: key, link: key };
        });

    list.shift();
    res.render('list', { list: list });
  });

})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

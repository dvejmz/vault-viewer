'use strict';

const cp = require('child_process');

module.exports = () => {
    const exec = cp.exec;
    const env_variables = 'PATH='+process.env.PATH;

    return {
        get
    };

    function get(path, cb) {
        const cmd = `${env_variables} ./vlt ${path}`;
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                return cb(err, null);
            }

            if (stdout.indexOf('Keys') !== 0) {
                // Render secrets view
                return cb(
                    null,
                    {
                        type: 'secrets',
                        content: stdout
                    }
                );
            }

            const list = stdout.split('\n')
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
        });
    }
};

var express = require('express');
const { runCommand } = require("../service/commandRunner");
var router = express.Router();
var config = require("../config.js");
const { getIPAddress } = require("../service/networkService");

router.post('/', function(req, res, next) {
    const requested_url = req.body.url;
    const ips_to_push = config.ips_to_push;

    const fetchPromises = ips_to_push.map(ip => {
        return Promise.race([
            fetch(`http://${ip}:12629/push/receivePush`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({url: requested_url})
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 5000)
            )
        ])
            .then(response => response.json())
            .then(r => ({ip, success: r.success, fail: r.fail, total: r.total, requests: r.requests}))
            .catch(error => ({ip, success: 0, fail: 1, total: 0, requests: [{cmd: `http://${ip}:12629/push/receivePush`, success: false, error: error.toString()}]}));
    });

    Promise.allSettled(fetchPromises)
        .then(results => {
            res.json(results.map(result => result.value)).send();
        });
});

router.post('/receivePush', function(req, res, next) {
    const requested_url = req.body.url;
    const return_data = {ip: getIPAddress(), success: 0, fail: 0, total: 0, requests: []}

    const commands = [
        `${config.chrome_cmd} "${requested_url}"`,
        `${config.msedge_cmd} "${requested_url}"`,
        `${config.firefox_cmd} "${requested_url}"`,
    ]

    const promises = commands.map(cmd => {
        return runCommand(cmd)
            .then(stdout => {
                return_data.success += 1;
                const d = {
                    cmd: cmd,
                    success: true,
                    stdout: stdout
                }
                return_data.requests.push(d);
            })
            .catch(error => {
                return_data.fail += 1;
                const d = {
                    cmd: cmd,
                    success: false,
                    error: error
                }
                return_data.requests.push(d);
            })
            .finally(() => {
                return_data.total += 1;
            });
    });

    Promise.all(promises).then(() => {
        res.json(return_data).send();
    });
})

module.exports = router;

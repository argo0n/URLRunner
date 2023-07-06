const os = require('os');

function getIPAddress() {
    const interfaces = os.networkInterfaces();
    let ipAddress = '';

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                continue;
            }
            ipAddress = iface.address;
        }
    }

    return ipAddress;
}

module.exports = {
    getIPAddress,
}
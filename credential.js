const CREDENTIAL = "WTF";

function accessDenied(client) {
    client.write("HTTP/1.1 401 Access Denied\r\n\r\n");
    client.end();
    client.destroy(
        new Error(
            `ACCESS DENIED KICKED! ${client.remoteAddress}:${client.remotePort}`
        )
    );
    return;
}

module.exports = function credential(client, data) {
    if (!data) {
        accessDenied(client)
    }

    if (data.indexOf("X-Pass:") === -1) {
        accessDenied(client)
    }

    if (!data.includes(CREDENTIAL)) {
        accessDenied(client)
    }
}

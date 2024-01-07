const moment = require("moment");
const net = require("net");

const host = "0.0.0.0";
const port = 8080;

const targetHost = "127.0.0.1";
const targetPort = 22;

const TIMEOUT = 60000;

const server = net.createServer({ keepAlive: true, allowHalfOpen: false }, (client) => {
  console.log(
    `\x1b[32m[NEW CONNECTION]: ${client.remoteAddress}:${client.remotePort}\x1b[0m`
  );

  client.setKeepAlive(true);
  client.setDefaultEncoding("binary");
  client.setEncoding("binary");
  client.setTimeout(TIMEOUT)

  client.on("timeout", () => {
    console.log(`\x1b[31m[TIMEOUT REACHED]${client.remoteAddress}:${client.remotePort}\x1b[0m`)
    client.end()
    client.destroy()
  })

  client.once("data", (data) => {
    console.log(`Dados recebidos do cliente: ${data}`);

    let target = net.createConnection({ host: targetHost, port: targetPort });
    target.setKeepAlive(true);
    target.setDefaultEncoding("binary");
    target.setEncoding("binary");
    target.setTimeout(TIMEOUT);

    target.on("timeout", () => {
      console.log(`\x1b[31m[TIMEOUT REACHED]${target.remoteAddress}:${target.remotePort}\x1b[0m`)
      target.end()
      target.destroy()
    })

    target.on("end", () => console.log(`\x1b[31m[TARGET END CONNECTION]\x1b[0m`))

    target.once("ready", () => {
      console.log("\x1b[32m[TARGET READY]\x1b[0m");
      client.write("HTTP/1.1 200 Websocket\r\n\r\n", "utf8")
      target.on("data", (data) => {
        client.write(data);
      });
    });

    client.on("data", (buffer) => {
      target.write(buffer);
    });
  });

  client.on("end", () => {
    console.log(`\x1b[31m[CLIENT DISCONNECTED]${client.remoteAddress}:${client.remotePort}\x1b[0m`);
  });

  client.on("error", (err) => {
    console.error(
      `\x1b[31m${moment(new Date()).format("YYYY-MM-DD HH:mm:ss")} ${client.remoteAddress
      } [CONNECTION ERROR]: ${err.message}\x1b[0m`
    );
  });
});

server.listen(port, host, () => {
  console.log(`Servidor TCP está ouvindo em ${host}:${port}`);
});

server.on("error", (err) => {
  console.error(`Erro no servidor: ${err.message}`);
});

server.on("close", () => {
  console.log("Servidor fechado");
});

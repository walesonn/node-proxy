const net = require("net");

const host = "0.0.0.0";
const port = 8080;

const targetHost = "0.0.0.0";
const targetPort = 22;

const CREDENTIAL = "WTF";

const server = net.createServer({ keepAlive: true }, (client) => {
  console.log(
    `\x1b[32m[NEW CONNECTION]: ${client.remoteAddress}:${client.remotePort}\x1b[0m`
  );

  client.setKeepAlive(true);
  client.setDefaultEncoding("binary");
  client.setEncoding("binary");

  client.write("HTTP/1.1 200 ok!\r\n\r\n");

  client.on("timeout", () => console.log("[CLIENT CONNECTION TIMEOUT]"));
  client.on("connect", () => console.log("[CLIENT CONNECTED]"));

  client.once("data", (data) => {
    console.log(`Dados recebidos do cliente: ${data}`);
    if (data.indexOf("X-Pass:") === -1) {
      client.write("HTTP/1.1 401 Access Denied\r\n\r\n");
      client.end();
      client.destroy(
        new Error(
          `ACCESS DENIED KICKED! ${client.remoteAddress}:${client.remotePort}`
        )
      );
      return;
    }

    if (!data.includes(CREDENTIAL)) {
      client.write("HTTP/1.1 401 Access Denied\r\n\r\n");
      client.end();
      client.destroy(
        new Error(
          `ACCESS DENIED KICKED! ${client.remoteAddress}:${client.remotePort}`
        )
      );
      return;
    }

    let target = net.createConnection({ host: targetHost, port: targetPort });
    target.setKeepAlive(true);
    target.setDefaultEncoding("binary");
    target.setEncoding("binary");

    target.once("ready", () => {
      console.log("\x1b[32m[TARGET READY]\x1b[0m");
      target.on("data", (data) => {
        client.write(data);
      });
    });

    client.on("data", (buffer) => {
      target.write(buffer);
    });
  });

  client.on("end", () => {
    console.log("\x1b[31m[CLIENT DISCONNECTED]\x1b[0m");
  });

  client.on("error", (err) => {
    console.error(`\x1b[31m[CONNECTION ERROR]: ${err.message}\x1b[0m`);
  });
});

// Escutar por conexões no host e porta especificados
server.listen(port, host, () => {
  console.log(`Servidor TCP está ouvindo em ${host}:${port}`);
});

// Manipular eventos de erro do servidor
server.on("error", (err) => {
  console.error(`Erro no servidor: ${err.message}`);
});

// Manipular eventos de fechamento do servidor
server.on("close", () => {
  console.log("Servidor fechado");
});

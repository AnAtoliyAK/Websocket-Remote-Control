import httpServer from "./http_server/index";
import { WebSocketServer } from "ws";
import { SocketMessages } from "./constants/messages";
import { SocketCommands } from "./constants/commands";
import { HTTP_PORT, WS_PORT } from "./constants/common";
import onConnect from "./controller/controller";

httpServer.listen(HTTP_PORT);

console.log(
  `${SocketMessages.START_STATIC_SERVER}${HTTP_PORT}${SocketMessages.START_PORT}`
);

const wsServer = new WebSocketServer({ port: WS_PORT });

wsServer.on(SocketCommands.CONNECTION, onConnect);

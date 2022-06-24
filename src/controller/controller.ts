import { SocketMessages } from "../constants/messages";
import { SocketCommands } from "../constants/commands";
import { ICustomWebSocket } from "../types/customWebSocket";
import controlsSwitcher from "./controlsSwitcher";

function onConnect(wsClient: ICustomWebSocket) {
  wsClient.send(SocketMessages.CONNECTED_SUCCESSFULLY);

  wsClient.on(SocketCommands.MESSAGE, async function (message: Buffer) {
    try {
      controlsSwitcher(message, wsClient);
    } catch (error) {
      console.log(SocketMessages.ERROR, error);
    }
  });

  wsClient.on(SocketCommands.CLOSE, async function () {
    console.log(SocketMessages.CONNECTION_INTERRUPTED);
  });
}

export default onConnect;

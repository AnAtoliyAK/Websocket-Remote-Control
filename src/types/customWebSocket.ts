export interface ICustomWebSocket extends WebSocket {
  on: (str: string, cb: (message: Buffer) => Promise<void>) => void;
}

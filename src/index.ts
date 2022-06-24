import Jimp from 'jimp';
import httpServer from './http_server/index';
import robot, { Bitmap } from 'robotjs';
import { WebSocketServer } from 'ws';
import { RemoteControls } from './constants/remoteControls';

const HTTP_PORT = 3500;

console.log(`Start static http server on the http://localhost:${HTTP_PORT}/ port!`);
httpServer.listen(HTTP_PORT);

const wsServer = new WebSocketServer({port: 9000});
wsServer.on('connection', onConnect);
//!!!!!TODO RENAME THIS GENIUS IFACE
interface ICW extends WebSocket {
  on: (str: string, cb: (message: Buffer) => Promise<void>)=> void
}


//TODO!!!!!! MOUSE MOVEMENT MESSAGES
function onConnect(wsClient: ICW) {
  wsClient.send('Connected successfully');
  

wsClient.on('message', async function(message: Buffer) {
    try {
    const jsonMessage = message.toString('utf-8').split(' ');

    let {x,y} = robot.getMousePos();

    switch (jsonMessage[0]) {
      case RemoteControls.MOUSE_DOWN:
        y += +jsonMessage[1];
    robot.dragMouse(x, y);
        break;
      case "mouse_up":
        y -= +jsonMessage[1];
    robot.dragMouse(x, y);

        break;
      case "mouse_left":
        x -= +jsonMessage[1];
    robot.dragMouse(x, y);

        break;
      case "mouse_right":
        x += +jsonMessage[1];
    robot.dragMouse(x, y);

        break;

      case "mouse_position":
        wsClient.send(`mouse_position ${x}px,${y}px`);
        break;
      case "draw_circle":
        // robot.setMouseDelay(200)
        wsClient.send(`draw_circle ${jsonMessage[1]}`);
        robot.mouseToggle("down");

        for (let i = 0; i <= Math.PI * 2; i += 0.01) {
          const radius = Number(jsonMessage[1] )
            // Convert polar coordinates to cartesian
            const a = x + (radius * Math.cos(i));
            const b = y + (radius * Math.sin(i));
            
            robot.dragMouse(a, b);
        }
        robot.mouseToggle("up");
        // robot.setMouseDelay(0)
        break;
      case "draw_rectangle":
        wsClient.send(`draw_rectangle ${jsonMessage[1]} ${jsonMessage[2]}`);
        robot.setMouseDelay(1000)
        robot.mouseToggle("down");
        let aa = x + +jsonMessage[1]
        robot.moveMouseSmooth(aa, y);
        let bb = y + +jsonMessage[2]
        robot.moveMouseSmooth(aa, bb);
        aa = aa - +jsonMessage[1]
        robot.moveMouseSmooth(aa, bb);
        bb = bb - +jsonMessage[2]
        robot.moveMouseSmooth(aa, bb);
        robot.setMouseDelay(10)
        robot.mouseToggle("up");
        break;
      case "draw_square":
        wsClient.send(`draw_square ${jsonMessage[1]}`);
        robot.setMouseDelay(1000)
        robot.mouseToggle("down");
        let a = x + +jsonMessage[1]
        robot.dragMouse(a, y);
        let b = y + +jsonMessage[1]
        robot.dragMouse(a, b);
        a = a - +jsonMessage[1]
        robot.dragMouse(a, b);
        b = b - +jsonMessage[1]
        robot.dragMouse(a, b);
        robot.setMouseDelay(10)
        robot.mouseToggle("up");

        break;
    case "prnt_scrn":
        const img = robot.screen.capture(x - 100, y - 100, 200, 200)
        

    const capturedScreen: string = await screenCaptureToFile(img)
    const cropedBase64ImageTextRRRRRRRRRRRRRRRR = capturedScreen.split(',')[1]
    wsClient.send(`prnt_scrn ${cropedBase64ImageTextRRRRRRRRRRRRRRRR}`);
        break;
      default:
        console.log(
          "UNKNOWN COMMAND READ TASK DESCRIPTION !!!"
        );
        break;
    }
  } catch (error) {
    console.log('ERROR!!!:', error);
  }

  })
wsClient.on('close',async function() {
    console.log('Connection interrupted');
  })
}

function screenCaptureToFile(robotScreenPic: Bitmap): Promise<string> {
  console.log(typeof robotScreenPic, robotScreenPic)
    return new Promise((resolve, reject) => {
      try {
        const image = new Jimp(robotScreenPic.width, robotScreenPic.height);
        let pos = 0;
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
          image.bitmap.data[idx + 2] = robotScreenPic.image.readUInt8(pos++);
          image.bitmap.data[idx + 1] = robotScreenPic.image.readUInt8(pos++);
          image.bitmap.data[idx + 0] = robotScreenPic.image.readUInt8(pos++);
          image.bitmap.data[idx + 3] = robotScreenPic.image.readUInt8(pos++);
        });
        const tempImage = image.getBase64Async(Jimp.MIME_PNG)
        resolve(tempImage);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

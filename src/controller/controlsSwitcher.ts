import robot from "robotjs";
import {
  IMAGE_WIDTH,
  IMAGE_HEIGHT,
  CIRCLE_STEP,
  DEFAULT_MOUSE_DELAY,
  SMALL_MOUSE_DELAY,
} from "../constants/common";
import { RemoteControls } from "../constants/remoteControls";
import screenCaptureToFile from "../utils/screenCaptureToFile";
import { ICustomWebSocket } from "../types/customWebSocket";

export default async function controlsSwitcher(
  message: Buffer,
  wsClient: ICustomWebSocket
) {
  const jsonMessageArray = message.toString("utf-8").split(" ");
  const jsonMessageCommand = jsonMessageArray[0];
  const firstMessageParam = jsonMessageArray[1];
  const secondMessageParam = jsonMessageArray[2];

  let { x, y } = robot.getMousePos();

  switch (jsonMessageCommand) {
    case RemoteControls.MOUSE_DOWN:
      y += +firstMessageParam;
      robot.dragMouse(x, y);
      wsClient.send(`${RemoteControls.MOUSE_DOWN} ${firstMessageParam}`);

      break;
    case RemoteControls.MOUSE_UP:
      y -= +firstMessageParam;
      robot.dragMouse(x, y);
      wsClient.send(`${RemoteControls.MOUSE_UP} ${firstMessageParam}`);

      break;
    case RemoteControls.MOUSE_LEFT:
      x -= +firstMessageParam;
      robot.dragMouse(x, y);
      wsClient.send(`${RemoteControls.MOUSE_LEFT} ${firstMessageParam}`);

      break;
    case RemoteControls.MOUSE_RIGHT:
      x += +firstMessageParam;
      robot.dragMouse(x, y);
      wsClient.send(`${RemoteControls.MOUSE_RIGHT} ${firstMessageParam}`);

      break;
    case RemoteControls.MOUSE_POSITION:
      wsClient.send(`${RemoteControls.MOUSE_POSITION} ${x}px,${y}px`);

      break;
    case RemoteControls.DRAW_CIRCLE:
      wsClient.send(`${RemoteControls.DRAW_CIRCLE} ${firstMessageParam}`);
      robot.mouseToggle(RemoteControls.MOUSE_BUTTON_DOWN);

      for (let i = 0; i <= Math.PI * 2; i += CIRCLE_STEP) {
        const radius = Number(firstMessageParam);
        const a = x + radius * Math.cos(i);
        const b = y + radius * Math.sin(i);

        robot.dragMouse(a, b);
      }
      robot.mouseToggle(RemoteControls.MOUSE_UP);

      break;
    case RemoteControls.DRAW_RECTANGLE:
      wsClient.send(
        `${RemoteControls.DRAW_RECTANGLE} ${firstMessageParam} ${secondMessageParam}`
      );

      robot.setMouseDelay(SMALL_MOUSE_DELAY);
      robot.mouseToggle(RemoteControls.MOUSE_BUTTON_DOWN);

      let rectangleWidth = x + +firstMessageParam;
      robot.moveMouseSmooth(rectangleWidth, y);

      let rectangleLength = y + +secondMessageParam;
      robot.moveMouseSmooth(rectangleWidth, rectangleLength);

      rectangleWidth = rectangleWidth - +firstMessageParam;
      robot.moveMouseSmooth(rectangleWidth, rectangleLength);

      rectangleLength = rectangleLength - +secondMessageParam;
      robot.moveMouseSmooth(rectangleWidth, rectangleLength);

      robot.mouseToggle(RemoteControls.MOUSE_BUTTON_UP);
      robot.setMouseDelay(DEFAULT_MOUSE_DELAY);

      break;
    case RemoteControls.DRAW_SQUARE:
      wsClient.send(`${RemoteControls.DRAW_SQUARE} ${firstMessageParam}`);

      robot.setMouseDelay(SMALL_MOUSE_DELAY);
      robot.mouseToggle(RemoteControls.MOUSE_BUTTON_DOWN);

      let squareWidth = x + +firstMessageParam;
      robot.dragMouse(squareWidth, y);

      let squareLength = y + +firstMessageParam;
      robot.dragMouse(squareWidth, squareLength);

      squareWidth = squareWidth - +firstMessageParam;
      robot.dragMouse(squareWidth, squareLength);

      squareLength = squareLength - +firstMessageParam;
      robot.dragMouse(squareWidth, squareLength);

      robot.setMouseDelay(DEFAULT_MOUSE_DELAY);
      robot.mouseToggle(RemoteControls.MOUSE_BUTTON_UP);

      break;
    case RemoteControls.PRINT_SCREEN:
      const img = robot.screen.capture(
        x - IMAGE_WIDTH / 2,
        y - IMAGE_HEIGHT / 2,
        IMAGE_WIDTH,
        IMAGE_HEIGHT
      );

      const capturedScreen: string = await screenCaptureToFile(img);
      const croppedBase64ImageText = capturedScreen.split(",")[1];

      wsClient.send(`${RemoteControls.PRINT_SCREEN} ${croppedBase64ImageText}`);

      break;
    default:
      console.log(RemoteControls.UNKNOWN_COMMAND);

      break;
  }
}

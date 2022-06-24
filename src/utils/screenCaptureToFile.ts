import Jimp from "jimp";
import { Bitmap } from "robotjs";

function screenCaptureToFile(robotScreenPic: Bitmap): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const image = new Jimp(robotScreenPic.width, robotScreenPic.height);
      let pos = 0;
      image.scan(
        0,
        0,
        image.bitmap.width,
        image.bitmap.height,
        (_, __, idx) => {
          image.bitmap.data[idx + 2] = robotScreenPic.image.readUInt8(pos++);
          image.bitmap.data[idx + 1] = robotScreenPic.image.readUInt8(pos++);
          image.bitmap.data[idx + 0] = robotScreenPic.image.readUInt8(pos++);
          image.bitmap.data[idx + 3] = robotScreenPic.image.readUInt8(pos++);
        }
      );
      const tempImage = image.getBase64Async(Jimp.MIME_PNG);
      resolve(tempImage);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}

export default screenCaptureToFile;

import { error } from "console";
import fs from "fs";
import crypto from "crypto";
import extractFileFromMultipart from "../utils/FileExtractor.js";
export const uploadHandler = async (req, res) => {
  const body = [];
  const contentType = req.headers["content-type"];
  const boundaryMatch = contentType.match(/boundary=(.+)/);

  if (!boundaryMatch) {
    return res.status(400).json({ message: "Not a multipart request" });
  }

  const boundary = "--" + boundaryMatch[1];
  console.log(boundary);

  const uuid = crypto.randomUUID();

  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", async () => {
    try {
      const fullBuffer = Buffer.concat(body);
      const result = await extractFileFromMultipart(fullBuffer, boundary);
      console.log("result=",result);
      if (!result) {
        return res.status(400).json({ message: "File extraction failed" });
      }else if(!result.rawFileBuffer){
        return res.status(400).json({ message: "File extraction failed due to lack of buffer" });
      }else if(!result.filename){
        return res.status(400).json({ message: "File extraction failed due to lack of filename" });
      }
      const { rawFileBuffer, filename } = result;
      // Split filename into name and extension
      const lastDot = filename.lastIndexOf(".");
      let baseName = filename;
      let ext = "";
      if (lastDot !== -1) {
        baseName = filename.substring(0, lastDot);
        ext = filename.substring(lastDot); // includes the dot
      }
      const filePath = `../uploads/${baseName}_${uuid}${ext}`;
      await fs.promises.writeFile(filePath, rawFileBuffer);
      return res
        .status(200)
        .json({ message: "File uploaded", location: filePath });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "File upload failed due to server error" });
    }
  });

  req.on("error", (error) => {
    console.error(error);
    return res
      .status(400)
      .json({ message: "File upload failed due to file stream error" });
  });
};

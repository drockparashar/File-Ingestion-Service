/**
 * @param {Buffer} fullBuffer - The complete binary body of the HTTP request.
 * @param {string} boundaryString - The boundary string obtained from the Content-Type header.
 * @returns {Promise<Buffer | null>} - The raw file Buffer, or null if parsing fails.
 */
export default async function extractFileFromMultipart(
  fullBuffer,
  boundaryString
) {
  const boundary = Buffer.from(boundaryString, "ascii");
  const headerDataSeparator = Buffer.from("\r\n\r\n", "ascii");
  const lineBreak = Buffer.from("\r\n", "ascii");

  // 1. Find the start of the file part (after the first boundary)
  // The first boundary is often at index 0, but we look for the next part's start.
  let partStart = fullBuffer.indexOf(boundary);
  if (partStart === -1) {
    console.error("Error: Could not find starting boundary.");
    return null;
  }

  // Move past the first boundary line (\r\n is often included in the search, so we account for its length)
  let headerStart = fullBuffer.indexOf(lineBreak, partStart) + lineBreak.length;

  // 2. Find the end of the file part (the start of the final boundary delimiter)
  // The final boundary is the full boundary followed by '--'
  const finalBoundary = Buffer.from(boundaryString + "--", "ascii");
  let partEnd = fullBuffer.indexOf(finalBoundary);

  if (partEnd === -1) {
    // If the final boundary isn't found, use the last occurrence of the regular boundary
    partEnd = fullBuffer.lastIndexOf(boundary);
    if (partEnd === -1) {
      console.error("Error: Could not find closing boundary.");
      return null;
    }
  }

  // Isolate the content part between the two main boundaries
  const contentPart = fullBuffer.slice(headerStart, partEnd);

  // 3. Find Header/Data Separator
  let separatorIndex = contentPart.indexOf(headerDataSeparator);
  if (separatorIndex === -1) {
    console.error("Error: Could not find header/data separator.");
    return null;
  }

  // 4. Isolate the Raw File Binary Data
  // The data starts right after the separator
  const rawFileBuffer = contentPart.slice(
    separatorIndex + headerDataSeparator.length
  );

  // Optional: Extract Headers (e.g., filename and content-type)
  const headerBuffer = contentPart.slice(0, separatorIndex);
  const headers = headerBuffer.toString("utf8");

  // Simple example of getting the filename
  const filenameMatch = headers.match(/filename="(.+?)"/);
  const filename = filenameMatch ? filenameMatch[1] : "extracted_file";

  const fileTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
  const fileType = fileTypeMatch ? fileTypeMatch[1].trim() : null;

  console.log(`Extracted filename: ${filename}`);
  console.log(`Extracted file type: ${fileType}`);
//   console.log(`Extracted buffer: ${rawFileBuffer}`);

  return {rawFileBuffer, filename};
}

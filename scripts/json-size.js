import { bytes } from "bytes";
import { fullKeyedTestData, getAbbrObject } from "./utils.js";

const abbrKeyedTestData = getAbbrObject(fullKeyedTestData);

async function getGZippedJSONSize(jsonObj) {
  const json = JSON.stringify(jsonObj);
  const blob = new Blob([json]);
  const compressionStream = new CompressionStream("gzip");
  const compressedStream = blob.stream().pipeThrough(compressionStream);
  const compressedResponse = await new Response(compressedStream).blob();
  return bytes(compressedResponse.size);
}

async function getJSONSize(json) {
  const inBytes = new TextEncoder().encode(JSON.stringify(json)).length;
  return bytes(inBytes);
}

console.info("full keyed test data: ", fullKeyedTestData);
console.info("abbreviated data: ", abbrKeyedTestData);

console.info(
  "uncompressed: full keyed: ",
  await getJSONSize(fullKeyedTestData),
);

console.info(
  "uncompressed: abbr keyed: ",
  await getJSONSize(abbrKeyedTestData),
);

console.info(
  "gzipped: full keyed: ",
  await getGZippedJSONSize(fullKeyedTestData),
);

console.info(
  "gzipped: abbr keyed: ",
  await getGZippedJSONSize(abbrKeyedTestData),
);

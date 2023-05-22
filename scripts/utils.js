import snakeCase from "lodash/snakeCase";
import { abbrKeysToFullKeysDict } from "./abbr-keys-to-full-keys-map.js";
import { jsonTestData } from "./data.js";

const abbreviatedData = jsonTestData.pageProps.pageApiResponse;

// data creation
export function convertAbbrObjToFullKeysObj(obj) {
  const json = JSON.stringify(obj, (key, value) => {
    if (!(value && value.constructor === Object)) {
      return value;
    }

    // todo: check if Object.entries only iterate over own properties of `value`
    const replacedKeyTupleArray = Object.entries(value).map(([k, v]) => {
      const replacedKey = abbrKeysToFullKeysDict[k] ?? k;
      return [replacedKey, v];
    });

    const newValue = Object.fromEntries(replacedKeyTupleArray);
    return newValue;
  });

  return JSON.parse(json);
}

export const fullKeyedTestData = convertAbbrObjToFullKeysObj(abbreviatedData);

// key pruning, chat gpt generated
export function getAbbrObject(obj) {
  const abbreviationsByOriginalKey = {};
  const abbreviationsByValue = {};

  function getAbbreviatedKey(key) {
    let index = 0;

    const snakeCasedKey = snakeCase(key);
    const originalKey = key;
    key = snakeCasedKey;

    if (abbreviationsByOriginalKey[key]) return abbreviationsByOriginalKey[key];

    const words = key.split(/(?=[A-Z])|_/);

    let abbreviation = "";

    for (const word of words) {
      if (word !== "") {
        abbreviation += word[0].toLowerCase();
      }
    }

    // If the abbreviation already exists, make it unique
    if (abbreviationsByValue.hasOwnProperty(abbreviation)) {
      let uniqueAbbreviation = abbreviation;

      while (abbreviationsByValue.hasOwnProperty(uniqueAbbreviation)) {
        uniqueAbbreviation = abbreviation + originalKey.charAt(index);
        index++;
      }

      abbreviation = uniqueAbbreviation;
    }

    // Store the abbreviation for future reference
    abbreviationsByOriginalKey[key] = abbreviation;
    abbreviationsByValue[abbreviation] = key;

    return abbreviation;
  }

  const jsonString = JSON.stringify(obj, (key, value) => {
    if (!(value && value.constructor === Object)) {
      return value;
    }

    const replacedKeyTupleArray = Object.entries(value).map(([k, v]) => {
      const replacedKey = getAbbreviatedKey(k);
      return [replacedKey, v];
    });

    const newValue = Object.fromEntries(replacedKeyTupleArray);
    return newValue;
  });

  const abbreviatedObj = JSON.parse(jsonString);
  return abbreviatedObj;
}

export function JSONtoStream(data) {
  return new Blob([JSON.stringify(data)], {
    type: "text/plain",
  }).stream();
}

export async function compressStream(stream) {
  const compressedReadableStream = stream.pipeThrough(
    new CompressionStream("gzip"),
  );

  return new Response(compressedReadableStream);
}

export async function responseToBuffer(response) {
  const blob = await response.blob();
  return blob.arrayBuffer();
}

/**
 * Function to extract data between specific XML tags from an XML string.
 * @param {string}  xml - The XML string from which data is to be extracted.
 * @param {string}  tag - The tag within which data is to be extracted.
 * @returns {string|null} The data between the specified XML tags, or null if no data is found.
 */
export function extractXMLTag(xml: string, tag: string) {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`);
  const match = regex.exec(xml);
  return match ? match[1] : null;
}

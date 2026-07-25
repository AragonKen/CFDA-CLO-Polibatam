import { EXTENSION_ICON, EXTENSION_IMAGE, EXTENSION_VIDEO } from "./multer";

export const GetMediaType = (extension: string) => {
  const EXTENSION_DOCUMENT = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
  ];

  if (!extension.startsWith(".")) extension = `.${extension}`;

  if (EXTENSION_IMAGE.includes(extension.toLowerCase())) return "IMAGE";
  if (EXTENSION_ICON.includes(extension.toLowerCase())) return "ICON";
  if (EXTENSION_VIDEO.includes(extension.toLowerCase())) return "VIDEO";
  if (EXTENSION_DOCUMENT.includes(extension.toLowerCase())) return "DOCUMENT";
  return "MEDIA";
};

export const DecodeTipTapContent = (content: string) => {
  // Remove HTML tags from content
  return content.replace(/<[^>]*>/g, "");
};

export const SlugGenerator = (str: string, arr: string[]) => {
  const slug = str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (!arr.includes(slug)) {
    return slug;
  }

  let i = 1;
  while (arr.includes(`${slug}-${i}`)) {
    i++;
  }

  return `${slug}-${i}`;
};

export const PermissionCodeGenerator = (name: string, codes: string[]) => {
  const code = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/(^_|_$)+/g, "");

  if (!codes.includes(code)) {
    return code;
  }

  let i = 1;
  while (codes.includes(`${code}_${i}`)) {
    i++;
  }

  return `${code}_${i}`;
};

/**
 * Returns an object containing only the key-value pairs where the key is included in the specified array
 * @param data The original data object
 * @param keysToInclude Array of keys to include in the result
 * @returns A filtered object with only the requested keys
 */
export function getDataByKeys(
  data: Record<string, string>,
  keysToInclude: string[]
): Record<string, string> {
  // Create a new object to store the filtered data
  const filteredData: Record<string, string> = {};

  // Iterate through the keys in the original data
  for (const key in data) {
    // Check if the current key is in our keysToInclude array
    if (keysToInclude.includes(key)) {
      // If it is, add this key-value pair to our filtered data
      filteredData[key] = data[key];
    }
  }

  return filteredData;
}

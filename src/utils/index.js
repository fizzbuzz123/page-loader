import path from 'path';

export { default as getErrorMessage } from './get-error-message';
export { default as getContentType } from './get-content-type';
export { default as extractResourcesUrls } from './extract-resources-urls';
export { default as replaceResourcesUrls } from './replace-resources-urls';

export const replaceSymbols = (str) => str.replace(/\W/g, '-');

// make names
export const makeBaseName = (pageUrl) => {
  const withoutProtocol = pageUrl.replace(new RegExp('https?://'), '');
  const withoutEndSlash = withoutProtocol.replace(new RegExp('/$'), '');
  const withoutHtmlExt = withoutEndSlash.replace(new RegExp('.html(,|$)'), '');

  return replaceSymbols(withoutHtmlExt);
};

export const makeHtmlFileName = (pageUrl) => `${makeBaseName(pageUrl)}.html`;

export const makeResourcesFolderName = (pageUrl) => `${makeBaseName(pageUrl)}_files`;

export const makeResourceName = (resourceLink) => {
  const extname = path.extname(resourceLink);
  const trimmedProtocol = resourceLink.replace(new RegExp('https?://'), '');
  const trimmedLeftSymbols = trimmedProtocol.replace(/^\.?\/?/, '');
  const withoutExtname = trimmedLeftSymbols.replace(new RegExp(`${extname}$`), '');

  return `${makeBaseName(withoutExtname)}${extname}`;
};

// make paths
export const makeHtmlFilePath = (pageUrl, outputDir) => path
  .resolve(outputDir, makeHtmlFileName(pageUrl));

export const makeResourcesFolderPath = (pageUrl, outputDir) => path
  .resolve(outputDir, makeResourcesFolderName(pageUrl));

export const makeRelativeResourcePath = (pageUrl, resourceLink) => path
  .join(makeResourcesFolderName(pageUrl), makeResourceName(resourceLink));

// other
export const extractResponseData = (response) => response.data;

import path from 'path';

export const replaceSymbols = (str) => str.replace(/\W/g, '-');

// make names
export const makeBaseName = (pageUrl) => {
  const withoutProtocol = pageUrl.replace(new RegExp('https?://'), '');
  const withoutHtmlExt = withoutProtocol.replace(new RegExp('.html(,|$)'), '');
  return replaceSymbols(withoutHtmlExt);
};

export const makeHtmlFileName = (pageUrl) => `${makeBaseName(pageUrl)}.html`;

export const makeResourcesFolderName = (pageUrl) => `${makeBaseName(pageUrl)}_files`;

export const makeResourceName = (resourceLink) => {
  const extname = path.extname(resourceLink);
  const withoutFirstSlash = resourceLink.replace(/^\/?/, '');
  const withoutExtname = withoutFirstSlash.replace(new RegExp(`${extname}$`), '');

  return `${replaceSymbols(withoutExtname)}${extname}`;
};

// make paths
export const makeHtmlFilePath = (pageUrl, outputDir) => path
  .resolve(outputDir, makeHtmlFileName(pageUrl));

export const makeResourcesFolderPath = (pageUrl, outputDir) => path
  .resolve(outputDir, makeResourcesFolderName(pageUrl));

export const makeResourcePath = (pageUrl, resourceLink, outputDir) => path
  .resolve(makeResourcesFolderPath(pageUrl, outputDir), makeResourceName(resourceLink));

// other
export const extractResponseData = (response) => response.data;

import path from 'path';

export { default as getErrorMessage } from './get-error-message';
export { default as extractResourceUrls } from './extract-resource-urls';

const pipe = (...ops) => ops.reduce((a, b) => (arg) => b(a(arg)));

const removeFirstSlash = (str) => str.replace(/^\//, '');
const removeLastSlash = (str) => str.replace(/\/(,|$)/, '');
const removeExt = (str) => {
  const extname = path.extname(str);
  const extnameRegexp = new RegExp([extname, '(,|$)'].join(''));
  return str.replace(extnameRegexp, '');
};
const removeHtmlExt = (str) => str.replace(/.html(,|$)/, '');
const addExt = (extname) => (str) => [str, extname].join('');
const replaceSymbols = (str) => str.replace(/\W/g, '-');

export const makeBaseName = (pageUrl) => {
  const { hostname, pathname } = new URL(pageUrl);
  const execute = pipe(removeLastSlash, removeHtmlExt, replaceSymbols);
  return execute([hostname, pathname].join(''));
};

export const makeResourceName = (resourceUrl) => {
  let url = resourceUrl;
  if (resourceUrl.startsWith('http')) {
    const { hostname, pathname } = new URL(resourceUrl);
    url = [hostname, pathname].join('');
  }
  const extname = path.extname(url);
  const execute = pipe(
    removeFirstSlash,
    removeExt,
    replaceSymbols,
    addExt(extname),
  );
  return execute(url);
};

export const replaceResourceUrls = (htmlText, resourcesFolderName, resourceUrls) => {
  let result = htmlText;
  resourceUrls.forEach((resourceUrl) => {
    const resourceName = makeResourceName(resourceUrl);
    const resourcePath = `./${resourcesFolderName}/${resourceName}`;
    result = result.replace(new RegExp(resourceUrl, 'g'), resourcePath);
  });
  return result;
};

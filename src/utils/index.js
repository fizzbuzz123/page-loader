import path from 'path';
import cheerio from 'cheerio';
import { resolve as resolveUrl } from 'url';

export { default as getErrorMessage } from './get-error-message';

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
  return [hostname, pathname].join('')
    |> removeLastSlash
    |> removeHtmlExt
    |> replaceSymbols;
};

export const makeResourceName = (resourceUrl) => {
  const { hostname, pathname } = new URL(resourceUrl);
  const url = [hostname, pathname].join('');

  const extname = path.extname(url);
  return url
    |> removeFirstSlash
    |> removeExt
    |> replaceSymbols
    |> addExt(extname);
};

export const getResourceUrlsAndReplacedHtmlText = (
  htmlText, pageUrl, resourcesFolderName, resourcesFolderPath,
) => {
  const mapping = {
    img: 'src',
    link: 'href',
    script: 'src',
  };

  const $ = cheerio.load(htmlText);
  const tags = Object.keys(mapping);
  const selector = tags.join(',');
  const urls = [];

  $(selector)
    .toArray()
    .filter((el) => {
      const url = $(el).attr(mapping[el.name]);
      return Boolean(url);
    })
    .filter((el) => {
      const url = $(el).attr(mapping[el.name]);
      return !url.startsWith(':data');
    })
    .forEach((el) => {
      const attrName = mapping[el.name];
      const url = $(el).attr(attrName);
      const fullUrl = resolveUrl(pageUrl, url);

      const resourceName = makeResourceName(fullUrl);
      const localResourcePath = `./${resourcesFolderName}/${resourceName}`;
      const absoluteResourcePath = path.resolve(resourcesFolderPath, resourceName);

      $(el).attr(attrName, localResourcePath);
      urls.push({ url: fullUrl, dest: absoluteResourcePath });
    });

  const replacedHtmlText = $.html();
  return [urls, replacedHtmlText];
};

import cheerio from 'cheerio';
import _ from 'lodash/fp';

const selectors = {
  IMG: 'img[src]',
  SCRIPT: 'script[src]',
  STYLESHEET: 'link[rel="stylesheet"][href]',
};

const extractResourcesUrls = (htmlText) => {
  const $ = cheerio.load(htmlText);

  const extract = (selector, attr) => {
    const elements = $('html').find(selector);
    return elements.toArray().map((element) => $(element).attr(attr));
  };

  const cssUrls = extract(selectors.STYLESHEET, 'href');
  const imgUrls = extract(selectors.IMG, 'src');
  const scriptUrls = extract(selectors.SCRIPT, 'src');

  return _.flatten([cssUrls, imgUrls, scriptUrls]);
};

export default extractResourcesUrls;

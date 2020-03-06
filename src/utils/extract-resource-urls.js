import cheerio from 'cheerio';

const mapping = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const elementsSelector = 'img[src], script[src], link[rel="stylesheet"][href]';
const extractResourceUrls = (htmlText) => {
  const $ = cheerio.load(htmlText);
  const elements = $(elementsSelector).toArray().filter((el) => {
    if (el.name !== 'img') return true;
    return !$(el).attr('src').startsWith('data:');
  });
  const urls = elements.map((el) => $(el).attr(mapping[el.name]));
  return urls;
};

export default extractResourceUrls;

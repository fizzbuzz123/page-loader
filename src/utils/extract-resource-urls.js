import cheerio from 'cheerio';

const mapping = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const elementsSelector = 'img[src^="http"], script[src], link[rel="stylesheet"][href]';
const extractResourceUrls = (htmlText) => {
  const $ = cheerio.load(htmlText);
  const elements = $(elementsSelector).toArray();
  const urls = elements.map((el) => $(el).attr(mapping[el.name]));
  return urls;
};

export default extractResourceUrls;

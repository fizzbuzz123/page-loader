import cheerio from 'cheerio';

const mapping = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const extractResourceUrls = (htmlText) => {
  const $ = cheerio.load(htmlText);
  const tags = Object.keys(mapping);
  const selector = tags.join(',');
  const urls = $(selector)
    .toArray()
    .map((el) => $(el).attr(mapping[el.name]));
  const validUrls = urls
    .filter(Boolean)
    .filter((url) => !url.startsWith('data:'));

  return validUrls;
};

export default extractResourceUrls;

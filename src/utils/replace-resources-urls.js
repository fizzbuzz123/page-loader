const replaceResourcesUrls = (htmlText, urlsPathMap) => {
  let result = htmlText;
  Object.keys(urlsPathMap).forEach((url) => {
    result = result.replace(new RegExp(url, 'g'), urlsPathMap[url]);
  });
  return result;
};

export default replaceResourcesUrls;

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import {
  makeHtmlFilePath, makeResourcesFolderPath, makeRelativeResourcePath, extractResponseData,
} from './utils';
import extractResourcesUrls from './utils/extract-resources-urls';
import replaceResourcesUrls from './utils/replace-resources-urls';

const { promises: pfs } = fs;

function configureDownloadResources(urls, urlsPathMap, outputDir, origin) {
  const makeFullUrl = (url) => (url.startsWith('/') ? `${origin}${url}` : url);

  const download = (url) => axios
    .get(makeFullUrl(url))
    .then(extractResponseData)
    .then((fileData) => {
      const filePath = path.resolve(outputDir, urlsPathMap[url]);
      return pfs.writeFile(filePath, fileData);
    });

  return () => Promise.all(urls.map(download));
}

function pageLoader(pageUrl, options = {}) {
  const { output: outputDir } = options;
  const { origin } = new URL(pageUrl);

  const makeHtmlFile = (htmlText) => pfs.writeFile(makeHtmlFilePath(pageUrl, outputDir), htmlText);
  const makeResourcesFolder = () => pfs.mkdir(makeResourcesFolderPath(pageUrl, outputDir));

  const makeUrlsPathMap = (urls) => urls
    .reduce((acc, url) => ({ ...acc, [url]: makeRelativeResourcePath(pageUrl, url) }), {});

  function main(htmlText) {
    const resourcesUrls = extractResourcesUrls(htmlText, origin);

    if (!resourcesUrls.length) {
      return makeHtmlFile(htmlText);
    }

    const urlsPathMap = makeUrlsPathMap(resourcesUrls);
    const replacedHtmlText = replaceResourcesUrls(htmlText, urlsPathMap);

    const downloadResources = configureDownloadResources(
      resourcesUrls, urlsPathMap, outputDir, origin,
    );

    return makeHtmlFile(replacedHtmlText)
      .then(makeResourcesFolder)
      .then(downloadResources);
  }

  return axios
    .get(pageUrl)
    .then(extractResponseData)
    .then(main);
}

export default pageLoader;

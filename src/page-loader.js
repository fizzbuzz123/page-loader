import fs from 'fs';
import { resolve as resolveUrl } from 'url';
import path from 'path';
import axios from 'axios';
import Listr from 'listr';
import createDebug from 'debug';
import {
  makeHtmlFilePath,
  makeResourcesFolderPath,
  makeRelativeResourcePath,
  extractResponseData,
  extractResourcesUrls,
  replaceResourcesUrls,
  getContentType,
} from './utils';

const { promises: pfs } = fs;

const debug = createDebug('page-loader');

debug('booting');
const configureDownloadResources = (urls, urlsPathMap, outputDir, origin) => {
  debug('configureDownloadResources');
  debug('urls', urls);
  debug('urlsPathMap', urlsPathMap);
  debug('outputDir', outputDir);
  debug('origin', origin);

  const makeFullUrl = (url) => resolveUrl(origin, url);

  debug('fullUrls', urls.map(makeFullUrl));

  const download = (url) => axios
    .request({
      responseType: 'arraybuffer',
      url: makeFullUrl(url),
      method: 'GET',
      headers: {
        'Content-Type': getContentType(url),
      },
    })
    .then(extractResponseData)
    .then((fileData) => {
      const filePath = path.resolve(outputDir, urlsPathMap[url]);
      return pfs.writeFile(filePath, fileData);
    });

  return () => new Listr(urls.map((url) => ({
    title: `Download ${makeFullUrl(url)}`,
    task: () => download(url),
  })), { concurrent: true });
};

const loadPage = (pageUrl, options = {}) => {
  debug('pageUrl', pageUrl);

  const { output: outputDir } = options;
  const { origin } = new URL(pageUrl);

  debug('outputDir', outputDir);
  debug('origin', origin);

  const makeHtmlFile = (htmlText) => pfs.writeFile(makeHtmlFilePath(pageUrl, outputDir), htmlText);
  const makeResourcesFolder = () => pfs.mkdir(makeResourcesFolderPath(pageUrl, outputDir));

  const makeUrlsPathMap = (urls) => urls
    .reduce((acc, url) => ({ ...acc, [url]: makeRelativeResourcePath(pageUrl, url) }), {});

  const main = (htmlText) => {
    const resourcesUrls = extractResourcesUrls(htmlText, origin);
    debug('resourcesUrls', resourcesUrls);

    if (!resourcesUrls.length) {
      return makeHtmlFile(htmlText);
    }

    const urlsPathMap = makeUrlsPathMap(resourcesUrls);
    const replacedHtmlText = replaceResourcesUrls(htmlText, urlsPathMap);

    debug('urlsPathMap', urlsPathMap);

    const downloadResources = configureDownloadResources(
      resourcesUrls, urlsPathMap, outputDir, origin,
    );

    return new Listr([
      {
        title: 'Creating html file',
        task: () => makeHtmlFile(replacedHtmlText),
      },
      {
        title: 'Creating resource folders',
        task: makeResourcesFolder,
      },
      {
        title: 'Downloading resources',
        task: downloadResources,
      },
    ]).run();
  };

  return axios
    .get(pageUrl)
    .then(extractResponseData)
    .then(main);
};

export default loadPage;

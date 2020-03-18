import fs from 'fs';
import { resolve as resolveUrl } from 'url';
import path from 'path';
import axios from 'axios';
import Listr from 'listr';
import createDebug from 'debug';
import {
  makeBaseName,
  extractResourceUrls,
  replaceResourceUrls,
  getErrorMessage,
  makeResourceName,
} from './utils';

const { promises: pfs } = fs;

const debug = createDebug('page-loader');

debug('booting');
const configureDownloadResources = (pageUrl, resourcesFolderPath, resourceUrls) => {
  const download = (url, destination) => axios
    .get(url, { responseType: 'arraybuffer' })
    .then((response) => response.data)
    .then((fileData) => pfs.writeFile(destination, fileData));

  const downloadTasks = resourceUrls.map((url) => {
    const fullUrl = resolveUrl(pageUrl, url);
    const resourceName = makeResourceName(url);
    const destination = path.join(resourcesFolderPath, resourceName);

    return {
      title: `Download ${fullUrl}`,
      task: () => download(fullUrl, destination),
    };
  });

  return () => new Listr(downloadTasks, { concurrent: true }).run();
};

const loadPage = (pageUrl, outputDir) => {
  const basename = makeBaseName(pageUrl);

  const htmlFileName = [basename, '.html'].join('');
  const resourcesFolderName = [basename, '_files'].join('');

  const htmlFilePath = path.resolve(outputDir, htmlFileName);
  const resourcesFolderPath = path.resolve(outputDir, resourcesFolderName);

  debug('pageUrl', pageUrl);
  debug('basename', basename);
  debug('htmlFileName', htmlFileName);
  debug('htmlFilePath', htmlFilePath);
  debug('resourcesFolderName', resourcesFolderName);
  debug('resourcesFolderPath', resourcesFolderPath);

  return axios
    .get(pageUrl)
    .then((response) => response.data)
    .then((htmlText) => {
      const resourceUrls = extractResourceUrls(htmlText);
      debug('resourceUrls', resourceUrls);

      if (resourceUrls.length === 0) {
        return pfs.writeFile(htmlFilePath, htmlText);
      }

      const replacedHtmlText = replaceResourceUrls(
        htmlText, resourcesFolderName, resourceUrls,
      );
      return pfs.writeFile(htmlFilePath, replacedHtmlText)
        .then(() => pfs.mkdir(resourcesFolderPath))
        .then(() => {
          const downloadResources = configureDownloadResources(
            pageUrl, resourcesFolderPath, resourceUrls,
          );
          return downloadResources();
        });
    })
    .then(() => htmlFileName)
    .catch((error) => {
      throw new Error(getErrorMessage(error));
    });
};

export default loadPage;

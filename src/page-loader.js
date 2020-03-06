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

  return () => new Listr(resourceUrls.map((url) => {
    const fullUrl = resolveUrl(pageUrl, url);
    const resourceName = makeResourceName(url);
    const destination = path.join(resourcesFolderPath, resourceName);
    return {
      title: `Download ${fullUrl}`,
      task: () => download(fullUrl, destination),
    };
  }), { concurrent: true });
};

const loadPage = (pageUrl, outputDir) => {
  const basename = makeBaseName(pageUrl);

  const htmlFileName = [basename, '.html'].join('');
  const resourcesFolderName = [basename, '_files'].join('');

  const htmlFilePath = path.resolve(outputDir, htmlFileName);
  const resourcesFolderPath = path.resolve(outputDir, resourcesFolderName);

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
        return new Listr([{
          title: 'Creating html file',
          task: () => pfs.writeFile(htmlFilePath, htmlText),
        }]).run();
      }

      const replacedHtmlText = replaceResourceUrls(
        htmlText, resourcesFolderName, resourceUrls,
      );
      const downloadResources = configureDownloadResources(
        pageUrl, resourcesFolderPath, resourceUrls,
      );

      return new Listr([
        {
          title: 'Creating html file',
          task: () => pfs.writeFile(htmlFilePath, replacedHtmlText),
        },
        {
          title: 'Creating resource folders',
          task: () => pfs.mkdir(resourcesFolderPath),
        },
        {
          title: 'Downloading resources',
          task: downloadResources,
        },
      ]).run();
    })
    .then(() => htmlFileName)
    .catch((error) => {
      throw new Error(getErrorMessage(error));
    });
};

export default loadPage;

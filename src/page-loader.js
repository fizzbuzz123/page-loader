import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Listr from 'listr';
import createDebug from 'debug';
import {
  makeBaseName,
  getErrorMessage,
  getResourceUrlsAndReplacedHtmlText,
} from './utils';

const { promises: pfs } = fs;

const debug = createDebug('page-loader');

debug('booting');
const downloadResources = (resourceUrls) => {
  const download = async (url, dest) => {
    const fileData = await axios
      .get(url, { responseType: 'arraybuffer' })
      .then((response) => response.data);
    return pfs.writeFile(dest, fileData);
  };

  const downloadTasks = resourceUrls.map(({ url, dest }) => ({
    title: `Download ${url}`,
    task: () => download(url, dest),
  }));

  return new Listr(downloadTasks, { concurrent: true }).run();
};

const loadPage = async (pageUrl, outputDir) => {
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

  try {
    const htmlText = await axios.get(pageUrl).then((response) => response.data);
    const [resourceUrls, replacedHtmlText] = getResourceUrlsAndReplacedHtmlText(
      htmlText, pageUrl, resourcesFolderName, resourcesFolderPath,
    );

    debug('resourceUrls', resourceUrls);

    if (resourceUrls.length === 0) {
      return pfs.writeFile(htmlFilePath, htmlText);
    }

    await pfs.writeFile(htmlFilePath, replacedHtmlText);
    await pfs.mkdir(resourcesFolderPath);
    await downloadResources(resourceUrls);

    return htmlFileName;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default loadPage;

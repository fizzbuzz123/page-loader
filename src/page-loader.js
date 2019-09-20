import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { pageUrlToFileName } from './utils';

const { promises: pfs } = fs;

function pageLoader(pageUrl, { output: outputDir }) {
  const outputFileName = pageUrlToFileName(pageUrl);
  const outputFilePath = path.resolve(outputDir, outputFileName);

  console.log('outputDir', outputDir);

  return axios
    .get(pageUrl)
    .then((response) => response.data)
    .then((htmlText) => pfs.writeFile(outputFilePath, htmlText));
}

export default pageLoader;

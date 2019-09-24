import fs from 'fs';
import _ from 'lodash';
import cheerio from 'cheerio';
// import path from 'path';
import axios from 'axios';
import {
  makeHtmlFilePath, makeResourcesFolderPath, makeResourcePath, extractResponseData,
} from './utils';

const { promises: pfs } = fs;

const selectors = {
  IMG: 'img[src]',
  SCRIPT: 'script[src]',
  STYLESHEET: 'link[rel="stylesheet"][href]',
};

function extractResourcesUrls(htmlText) {
  const $ = cheerio.load(htmlText);

  function extract(selector, attr = 'src') {
    const elements = $('html').find(selector);
    return elements.toArray().map((element) => $(element).attr(attr));
  }

  const cssUrls = extract(selectors.STYLESHEET, 'href');
  const imgUrls = extract(selectors.IMG);
  const scriptUrls = extract(selectors.SCRIPT);

  return _.flatten(cssUrls, imgUrls, scriptUrls);
}

function pageLoader(pageUrl, options = {}) {
  const { output: outputDir } = options;

  // const makeHtmlFile = (htmlText) => pfs
  //   .writeFile(makeHtmlFilePath(pageUrl, outputDir), htmlText)
  //   .then(() => htmlText);

  // const makeResourcesFolder = (htmlText) => pfs
  //   .mkdir(makeResourcesFolderPath(pageUrl, outputDir))
  //   .then(() => htmlText);

  // .then(makeHtmlFile)
  // .then(makeResourcesFolder)

  function main(htmlText) {

    // const $ = cheerio.load(htmlText);

    // get all css urls

    // const cssUrls = extractUrls('link[rel="stylesheet"][href]', 'href');
    // const download = (url) => {
    //   const cssFilePath = makeResourcePath(pageUrl, url, outputDir);
    //   return axios.get(url).then(extractResponseData).then((cssText) => pfs.writeFile(cssFilePath, cssText));
    // };

    // return Promise.all(cssUrls.map(download));
    // const imgUrls = extractUrls('img[src]');
    // const scriptUrls = extractUrls('script[src]');
  }

  // get htmlText
  // get all resources links

  // if has resources links
  //   create resources folder
  //   download all resources and create files
  //   replace all resources links to local paths

  // create html file

  return axios
    .get(pageUrl)
    .then(extractResponseData)
    .then(main);
}

export default pageLoader;

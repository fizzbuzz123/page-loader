import fs from 'fs';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';
import path from 'path';
import os from 'os';
import pageLoader from '../src';
import {
  makeHtmlFilePath, makeResourcesFolderPath, makeRelativeResourcePath,
} from '../src/utils';

const host = 'https://my-site';

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

const replyHtmlFilePath = path.resolve(__dirname, '__fixtures__', 'replies/index.html');
const expectedHtmlFilePath = path.resolve(__dirname, '__fixtures__', 'expected/my-site-index.html');

const expectedCssFilePath = path.resolve(__dirname, '__fixtures__', 'expected/my-site-index_files', 'assets-css-main.css');
const replyCssFilePath = path.resolve(__dirname, '__fixtures__', 'replies/assets/css/main.css');

const expectedImgFilePath = path.resolve(__dirname, '__fixtures__', 'expected/my-site-index_files', 'assets-images-cat.jpg');
const replyImgFilePath = path.resolve(__dirname, '__fixtures__', 'replies/assets/images/cat.jpg');

const replyScriptFilePath = path.resolve(__dirname, '__fixtures__', 'replies/assets/js/main.js');
const expectedScriptFilePath = path.resolve(__dirname, '__fixtures__', 'expected/my-site-index_files', 'assets-js-main.js');

const pageUrl = `${host}/index`;
const cssUrl = '/assets/css/main.css';
const imgUrl = '/assets/images/cat.jpg';
const scriptUrl = '/assets/js/main.js';

const { promises: pfs } = fs;

const tmpDir = os.tmpdir();

describe('Page loader', () => {
  beforeEach(() => {
    nock(host).get('/index').replyWithFile(200, replyHtmlFilePath, { 'Content-Type': 'text/html' });
    nock(host).get('/assets/css/main.css').replyWithFile(200, replyCssFilePath, { 'Content-Type': 'text/plain' });
    nock(host).get('/assets/images/cat.jpg').replyWithFile(200, replyImgFilePath, { 'Content-Type': 'text/plain' });
    nock(host).get('/assets/js/main.js').replyWithFile(200, replyScriptFilePath, { 'Content-Type': 'text/plain' });
  });

  test('should download html', async () => {
    const outputDir = await pfs.mkdtemp(`${tmpDir}${path.sep}`);
    await pageLoader(pageUrl, { output: outputDir });

    const expectedFileContent = await pfs.readFile(expectedHtmlFilePath, 'utf-8');

    const createdFilePath = makeHtmlFilePath(pageUrl, outputDir);
    const createdFileContent = await pfs.readFile(createdFilePath, 'utf-8');

    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should make resources folder', async () => {
    const outputDir = await pfs.mkdtemp(`${tmpDir}${path.sep}`);
    await pageLoader(pageUrl, { output: outputDir });

    const resourcesFolderPath = makeResourcesFolderPath(pageUrl, outputDir);
    const isExists = fs.existsSync(resourcesFolderPath);

    expect(isExists).toBeTruthy();
  });

  test('should download css', async () => {
    const outputDir = await pfs.mkdtemp(`${tmpDir}${path.sep}`);
    await pageLoader(pageUrl, { output: outputDir });

    const cssResourcePath = path.resolve(outputDir, makeRelativeResourcePath(pageUrl, cssUrl));
    const createdFileContent = await pfs.readFile(cssResourcePath, 'utf-8');

    const expectedFileContent = await pfs.readFile(expectedCssFilePath, 'utf-8');
    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should download img', async () => {
    const outputDir = await pfs.mkdtemp(`${tmpDir}${path.sep}`);
    await pageLoader(pageUrl, { output: outputDir });

    const imgResourcePath = path.resolve(outputDir, makeRelativeResourcePath(pageUrl, imgUrl));
    const createdFileContent = await pfs.readFile(imgResourcePath, 'utf-8');

    const expectedFileContent = await pfs.readFile(expectedImgFilePath, 'utf-8');
    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should download script', async () => {
    const outputDir = await pfs.mkdtemp(`${tmpDir}${path.sep}`);
    await pageLoader(pageUrl, { output: outputDir });

    const scriptResourcePath = path
      .resolve(outputDir, makeRelativeResourcePath(pageUrl, scriptUrl));
    const createdFileContent = await pfs.readFile(scriptResourcePath, 'utf-8');

    const expectedFileContent = await pfs.readFile(expectedScriptFilePath, 'utf-8');
    expect(createdFileContent).toEqual(expectedFileContent);
  });
});

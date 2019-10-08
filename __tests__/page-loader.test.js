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
// const host = 'http://localhost';

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

const makeFixturePath = (...args) => path.resolve(__dirname, '__fixtures__', ...args);

const replyHtmlFilePath = makeFixturePath('replies/index.html');
const expectedHtmlFilePath = makeFixturePath('expected/my-site-index.html');

const expectedCssFilePath = makeFixturePath('expected/my-site-index_files', 'assets-css-main.css');
const replyCssFilePath = makeFixturePath('replies/assets/css/main.css');

const expectedImgFilePath1 = makeFixturePath('expected/my-site-index_files', 'assets-images-cat1.jpg');
const replyImgFilePath1 = makeFixturePath('replies/assets/images/cat1.jpg');

const expectedImgFilePath2 = makeFixturePath('expected/my-site-index_files', 'assets-images-cat2.jpg');
const replyImgFilePath2 = makeFixturePath('replies/assets/images/cat2.jpg');

const expectedImgFilePath3 = makeFixturePath('expected/my-site-index_files', 'assets-images-cat3.jpg');
const replyImgFilePath3 = makeFixturePath('replies/assets/images/cat3.jpg');

const replyScriptFilePath = makeFixturePath('replies/assets/js/main.js');
const expectedScriptFilePath = makeFixturePath('expected/my-site-index_files', 'assets-js-main.js');

const pageUrl = `${host}/index`;
const cssUrl = '/assets/css/main.css';
const imgUrl1 = '/assets/images/cat1.jpg';
const imgUrl2 = '/assets/images/cat2.jpg';
const imgUrl3 = '/assets/images/cat3.jpg';
const scriptUrl = '/assets/js/main.js';

const { promises: pfs } = fs;

const tmpDir = os.tmpdir();

describe('Page loader', () => {
  let outputDir = null;
  beforeEach(async () => {
    nock(host).get('/index').replyWithFile(200, replyHtmlFilePath, { 'Content-Type': 'text/html' });
    nock(host).get('/assets/css/main.css').replyWithFile(200, replyCssFilePath, { 'Content-Type': 'text/plain' });
    nock(host).get('/assets/images/cat1.jpg').replyWithFile(200, replyImgFilePath1, { 'Content-Type': 'text/plain' });
    nock(host).get('/assets/images/cat2.jpg').replyWithFile(200, replyImgFilePath2, { 'Content-Type': 'text/plain' });
    nock(host).get('/assets/images/cat3.jpg').replyWithFile(200, replyImgFilePath3, { 'Content-Type': 'text/plain' });
    nock(host).get('/assets/js/main.js').replyWithFile(200, replyScriptFilePath, { 'Content-Type': 'text/plain' });

    outputDir = await pfs.mkdtemp(`${tmpDir}${path.sep}`);
    await pageLoader(pageUrl, { output: outputDir });
  });

  test('should download html', async () => {
    const expectedFileContent = await pfs.readFile(expectedHtmlFilePath, 'utf-8');

    const createdFilePath = makeHtmlFilePath(pageUrl, outputDir);
    const createdFileContent = await pfs.readFile(createdFilePath, 'utf-8');

    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should make resources folder', () => {
    const resourcesFolderPath = makeResourcesFolderPath(pageUrl, outputDir);
    const isExists = fs.existsSync(resourcesFolderPath);

    expect(isExists).toBeTruthy();
  });

  test('should download css', async () => {
    const expectedFileContent = await pfs.readFile(expectedCssFilePath, 'utf-8');
    const cssResourcePath = path.resolve(outputDir, makeRelativeResourcePath(pageUrl, cssUrl));
    const createdFileContent = await pfs.readFile(cssResourcePath, 'utf-8');

    pfs.readFile(expectedCssFilePath, 'utf-8');
    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should download img', async () => {
    const imgResourcePath = path.resolve(outputDir, makeRelativeResourcePath(pageUrl, imgUrl1));

    const createdFileContent = await pfs.readFile(imgResourcePath, 'utf-8');

    const expectedFileContent = await pfs.readFile(expectedImgFilePath1, 'utf-8');
    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should download script', async () => {
    const scriptResourcePath = path
      .resolve(outputDir, makeRelativeResourcePath(pageUrl, scriptUrl));
    const createdFileContent = await pfs.readFile(scriptResourcePath, 'utf-8');

    const expectedFileContent = await pfs.readFile(expectedScriptFilePath, 'utf-8');
    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should throw fs error', async () => {
    nock(host).get('/index').replyWithFile(200, replyHtmlFilePath, { 'Content-Type': 'text/html' });
    expect.assertions(1);
    try {
      await pageLoader(pageUrl, { output: path.resolve(__dirname, 'non-exists-dir') });
    } catch (e) {
      expect(e.code).toEqual('ENOENT');
    }
  });

  test('should throw network error', async () => {
    nock(host).get('/non-exists-url').reply(503);
    expect.assertions(1);
    try {
      await pageLoader(`${host}/non-exists-url`, { output: outputDir });
    } catch (e) {
      expect(e.response.status).toEqual(503);
    }
  });
});

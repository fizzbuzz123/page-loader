import fs from 'fs';
import nock from 'nock';
import path from 'path';
import os from 'os';
import loadPage from '../src';

const host = 'https://my-site';
const pageUrl = `${host}/index`;
const basename = 'my-site-index';
const htmlFileName = [basename, '.html'].join('');
const resourcesFolderName = [basename, '_files'].join('');
const cssFileName = 'assets-css-main.css';
const jsFileName = 'assets-js-main.js';
const img1FileName = 'assets-images-cat1.jpg';

const makeFixturePath = (...args) => path.resolve(__dirname, '__fixtures__', ...args);

const expectedHtmlFilePath = makeFixturePath('expected', htmlFileName);
const replyHtmlFilePath = makeFixturePath('replies/index.html');

const expectedCssFilePath = makeFixturePath('expected/my-site-index_files', cssFileName);
const replyCssFilePath = makeFixturePath('replies/assets/css/main.css');

const expectedImgFilePath1 = makeFixturePath('expected/my-site-index_files', img1FileName);
const replyImgFilePath1 = makeFixturePath('replies/assets/images/cat1.jpg');

const replyImgFilePath2 = makeFixturePath('replies/assets/images/cat2.jpg');

const replyImgFilePath3 = makeFixturePath('replies/assets/images/cat3.jpg');

const replyScriptFilePath = makeFixturePath('replies/assets/js/main.js');
const expectedScriptFilePath = makeFixturePath('expected/my-site-index_files', jsFileName);

const { promises: pfs } = fs;

const tmpDir = os.tmpdir();

describe('Page loader', () => {
  let outputDir = null;
  beforeEach(async () => {
    nock(host).get('/index').replyWithFile(200, replyHtmlFilePath);
    nock(host).get('/assets/css/main.css').replyWithFile(200, replyCssFilePath);
    nock(host).get('/assets/images/cat1.jpg').replyWithFile(200, replyImgFilePath1);
    nock(host).get('/assets/images/cat2.jpg').replyWithFile(200, replyImgFilePath2);
    nock(host).get('/assets/images/cat3.jpg').replyWithFile(200, replyImgFilePath3);
    nock(host).get('/assets/js/main.js').replyWithFile(200, replyScriptFilePath);

    outputDir = await pfs.mkdtemp(`${tmpDir}${path.sep}`);
  });

  test('should download html', async () => {
    await loadPage(pageUrl, outputDir);
    const expectedFileContent = await pfs.readFile(expectedHtmlFilePath, 'utf-8');

    const createdFilePath = path.resolve(outputDir, htmlFileName);
    const createdFileContent = await pfs.readFile(createdFilePath, 'utf-8');

    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should make resources folder', async () => {
    await loadPage(pageUrl, outputDir);
    const resourcesFolderPath = path.resolve(outputDir, resourcesFolderName);
    await pfs.stat(resourcesFolderPath);
  });

  test('should download css', async () => {
    await loadPage(pageUrl, outputDir);
    const expectedFileContent = await pfs.readFile(expectedCssFilePath, 'utf-8');
    const cssResourcePath = path.resolve(outputDir, resourcesFolderName, cssFileName);
    const createdFileContent = await pfs.readFile(cssResourcePath, 'utf-8');

    pfs.readFile(expectedCssFilePath, 'utf-8');
    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should download img', async () => {
    await loadPage(pageUrl, outputDir);
    const imgResourcePath = path.resolve(outputDir, resourcesFolderName, img1FileName);

    const createdFileContent = await pfs.readFile(imgResourcePath, 'utf-8');

    const expectedFileContent = await pfs.readFile(expectedImgFilePath1, 'utf-8');
    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should download js', async () => {
    await loadPage(pageUrl, outputDir);
    const jsResourcePath = path.resolve(outputDir, resourcesFolderName, jsFileName);
    const createdFileContent = await pfs.readFile(jsResourcePath, 'utf-8');

    const expectedFileContent = await pfs.readFile(expectedScriptFilePath, 'utf-8');
    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should throw fs error', async () => {
    nock(host).get('/index').replyWithFile(200, replyHtmlFilePath);
    const expectedErrMessage = `ENOENT: no such file or directory, open '${path.resolve(__dirname, 'non-exists-dir', htmlFileName)}'`;

    const nonExistsDirPath = path.resolve(__dirname, 'non-exists-dir');
    await expect(loadPage(pageUrl, nonExistsDirPath)).rejects.toThrow(expectedErrMessage);
  });

  test('should throw network error', async () => {
    nock(host).get('/url-with-error').reply(503);
    const expectedErrMessage = 'Request failed with status code 503';
    await expect(loadPage(`${host}/url-with-error`, outputDir)).rejects.toThrow(expectedErrMessage);
  });
});

import fs from 'fs';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';
import path from 'path';
import os from 'os';
import pageLoader from '../src';
import {
  makeHtmlFilePath, makeResourcesFolderPath, makeResourcePath,
} from '../src/utils';

const host = 'http://localhost';

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

const expectedHtmlFilePath = path.resolve(__dirname, 'replies/test-site.html');
const pageUrl = '/test-site';

const { promises: pfs } = fs;

const tmpDir = os.tmpdir();

describe('Page loader', () => {
  beforeEach(() => {
    nock(host)
      .get(pageUrl)
      .replyWithFile(200, expectedHtmlFilePath, {
        'Content-Type': 'text/html',
      });
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

  describe('download css', () => {
    const cssLink = '/assets/css/main.css';
    nock(host)
      .get(cssLink)
      .replyWithFile(200, path.resolve(__dirname, 'replies/assets/css/main.css'), {
        'Content-Type': 'text/plain',
      });

    test('should create css file', async () => {
      const outputDir = await pfs.mkdtemp(`${tmpDir}${path.sep}`);
      await pageLoader(pageUrl, { output: outputDir });

      const cssResourcePath = makeResourcePath(pageUrl, cssLink, outputDir);
      const isExists = fs.existsSync(cssResourcePath);

      expect(isExists).toBeTruthy();
    });
  });
});

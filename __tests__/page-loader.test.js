import fs from 'fs';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';
import path from 'path';
import os from 'os';
import pageLoader from '../src';
import { pageUrlToFileName } from '../src/utils';

const host = 'http://localhost';

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

const { promises: pfs } = fs;

const tmpDir = os.tmpdir();

describe('Page loader', () => {
  test('should save a site', async () => {
    const expectedFilePath = path.resolve(__dirname, 'replies/simple-site.io.html');
    const expectedFileContent = await pfs.readFile(expectedFilePath, 'utf-8');

    const pageUrl = '/simple-site.io';
    nock(host)
      .get(pageUrl)
      .replyWithFile(200, expectedFilePath, {
        'Content-Type': 'text/html',
      });

    const outputDir = await pfs.mkdtemp(`${tmpDir}${path.sep}`);
    await pageLoader(pageUrl, { output: outputDir });

    const createdFileName = path.resolve(outputDir, pageUrlToFileName(pageUrl));
    const createdFileContent = await pfs.readFile(createdFileName, 'utf-8');

    expect(createdFileContent).toEqual(expectedFileContent);
  });
});

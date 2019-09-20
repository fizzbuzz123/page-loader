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
  const expectedFilePath = path.resolve(__dirname, 'replies/simple-page.html');
  const pageUrl = '/simple-page';

  beforeEach(() => {
    nock(host)
      .get(pageUrl)
      .replyWithFile(200, expectedFilePath, {
        'Content-Type': 'text/html',
      });
  });

  test('should save a page', async () => {
    const expectedFileContent = await pfs.readFile(expectedFilePath, 'utf-8');
    const outputDir = await pfs.mkdtemp(`${tmpDir}${path.sep}`);
    await pageLoader(pageUrl, { output: outputDir });

    const createdFilePath = path.resolve(outputDir, pageUrlToFileName(pageUrl));
    const createdFileContent = await pfs.readFile(createdFilePath, 'utf-8');

    expect(createdFileContent).toEqual(expectedFileContent);
  });

  test('should throw fs error', async () => {
    const outputDir = 'non-existent-directory';
    const outputFilePath = path.resolve(outputDir, pageUrlToFileName(pageUrl));
    const expectedErrorMessage = `ENOENT: no such file or directory, open '${outputFilePath}'`;
    await expect(pageLoader(pageUrl, { output: outputDir })).rejects.toThrow(expectedErrorMessage);
  });

  test('should throw network error', async () => {
    nock(host).get('/non-existent-page').replyWithError('Network Error');

    const outputDir = await pfs.mkdtemp(`${tmpDir}${path.sep}`);
    await expect(pageLoader('/non-existent-page', { output: outputDir })).rejects.toThrow('Network Error');
  });
});

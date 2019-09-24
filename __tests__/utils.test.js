import {
  extractResponseData,
  makeResourcesFolderPath,
  makeHtmlFileName, makeBaseName,
  makeResourcesFolderName, makeResourceName, replaceSymbols,
  makeResourcePath, makeHtmlFilePath,
} from '../src/utils';

describe('utils', () => {
  test('should extract response data', () => {
    const response = { data: 'string-data' };
    const result = extractResponseData(response);
    expect(result).toBe('string-data');
  });

  test('should replace symbols', () => {
    const result = replaceSymbols('site/url.com');
    expect(result).toBe('site-url-com');
  });

  describe('make base name', () => {
    test('with https protocol', () => {
      const result = makeBaseName('https://hexlet.io/courses');
      expect(result).toBe('hexlet-io-courses');
    });

    test('with http protocol', () => {
      const result = makeBaseName('http://hexlet.io/courses');
      expect(result).toBe('hexlet-io-courses');
    });

    test('without protocol', () => {
      const result = makeBaseName('hexlet.io/courses');
      expect(result).toBe('hexlet-io-courses');
    });

    test('with .html extension', () => {
      const result = makeBaseName('http://shitpoet.tk/move-arrow-keys.html');
      expect(result).toBe('shitpoet-tk-move-arrow-keys');
    });
  });

  describe('make names', () => {
    test('should make html file name', () => {
      const result = makeHtmlFileName('https://hexlet.io/courses');
      expect(result).toBe('hexlet-io-courses.html');
    });

    test('should make resources folder name', () => {
      const result = makeResourcesFolderName('https://hexlet.io/courses');
      expect(result).toBe('hexlet-io-courses_files');
    });

    test('should make resource name', () => {
      const resourceLink = '/assets/application.css';
      const result = makeResourceName(resourceLink);
      expect(result).toBe('assets-application.css');
    });
  });

  describe('make paths', () => {
    const pageUrl = 'https://ru.hexlet.io/courses';
    const outputDir = '/var/tmp';

    test('should make html file path', () => {
      const result = makeHtmlFilePath(pageUrl, outputDir);
      const expected = '/var/tmp/ru-hexlet-io-courses.html';
      expect(result).toBe(expected);
    });

    test('should make resources folder path', () => {
      const result = makeResourcesFolderPath(pageUrl, outputDir);
      const expected = '/var/tmp/ru-hexlet-io-courses_files';
      expect(result).toBe(expected);
    });

    test('should make resource path', () => {
      const resourceLink = '/assets/application.css';
      const result = makeResourcePath(pageUrl, resourceLink, outputDir);
      expect(result).toBe('/var/tmp/ru-hexlet-io-courses_files/assets-application.css');
    });
  });
});

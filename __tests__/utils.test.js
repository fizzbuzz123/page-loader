import { pageUrlToFileName } from '../src/utils';

describe('utils', () => {
  describe('site url to file name', () => {
    test('with https protocol', () => {
      const result = pageUrlToFileName('https://hexlet.io/courses');
      expect(result).toBe('hexlet-io-courses.html');
    });

    test('with http protocol', () => {
      const result = pageUrlToFileName('https://hexlet.io/courses');
      expect(result).toBe('hexlet-io-courses.html');
    });

    test('without protocol', () => {
      const result = pageUrlToFileName('https://hexlet.io/courses');
      expect(result).toBe('hexlet-io-courses.html');
    });

    test('with .html extension', () => {
      const result = pageUrlToFileName('http://shitpoet.tk/move-arrow-keys.html');
      expect(result).toBe('shitpoet-tk-move-arrow-keys.html');
    });
  });
});

#!/usr/bin/env node
import program from 'commander';
import path from 'path';
import pageLoader from '..';
import { version, description } from '../../package.json';
import { makeSpinner, pageUrlToFileName } from '../utils';
import { successMessage } from '../constants';

const log = (text) => console.log(`page-loader: ${text}`);

program
  .version(version)
  .description(description)
  .arguments('<pageUrl>')
  .option('-o, --output <type>', 'the directory where the site will be saved', process.cwd())
  .action((pageUrl, options) => {
    const killSpinner = makeSpinner();
    pageLoader(pageUrl, options)
      .then(() => {
        const downloadedPagePath = path.resolve(options.output, pageUrlToFileName(pageUrl));
        killSpinner();
        log(successMessage);
        log(`page downloaded to ${downloadedPagePath}`);
      })
      .catch(() => {
        log('Something went wrong, try again.');
      });
  });

program.parse(process.argv);

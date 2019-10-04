#!/usr/bin/env node
import program from 'commander';
import pageLoader from '..';
import { version, description } from '../../package.json';
import { makeHtmlFileName, getErrorMessage } from '../utils';

function handleError({ error, pageUrl, options }) {
  const errorMessage = getErrorMessage({ error, pageUrl, options });
  console.error(errorMessage);
  process.exit(1);
}

program
  .version(version)
  .description(description)
  .arguments('<pageUrl>')
  .option('-o, --output <type>', 'the directory where the site will be saved', process.cwd())
  .action((pageUrl, options) => {
    pageLoader(pageUrl, options)
      .then(() => {
        console.log(`Page was downloaded as '${makeHtmlFileName(pageUrl)}'`);
      })
      .catch((error) => {
        handleError({ error, pageUrl, options });
      });
  });

program.parse(process.argv);

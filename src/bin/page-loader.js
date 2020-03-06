#!/usr/bin/env node
import program from 'commander';
import pageLoader from '..';
import { version, description } from '../../package.json';

program
  .version(version)
  .description(description)
  .arguments('<pageUrl>')
  .option('-o, --output <type>', 'the directory where the site will be saved', process.cwd())
  .action((pageUrl, { output }) => {
    pageLoader(pageUrl, output)
      .then((downloadedPageName) => {
        console.log(`Page was downloaded as ${downloadedPageName}`);
      })
      .catch((error) => {
        console.error(error.message);
        process.exit(1);
      });
  });

program.parse(process.argv);

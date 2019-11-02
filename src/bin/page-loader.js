#!/usr/bin/env node
import program from 'commander';
import pageLoader from '..';
import { version, description } from '../../package.json';

function handleError(error) {
  console.error(error.message);
  process.exit(1);
}

program
  .version(version)
  .description(description)
  .arguments('<pageUrl>')
  .option('-o, --output <type>', 'the directory where the site will be saved', process.cwd())
  .action((pageUrl, options) => {
    pageLoader(pageUrl, options)
      .then(console.log)
      .catch(handleError);
  });

program.parse(process.argv);

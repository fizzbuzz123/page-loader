#!/usr/bin/env node
import program from 'commander';
import pageLoader from '..';
import { version, description } from '../../package.json';
import { makeHtmlFileName } from '../utils';

const { log } = console;

program
  .version(version)
  .description(description)
  .arguments('<pageUrl>')
  .option('-o, --output <type>', 'the directory where the site will be saved', process.cwd())
  .action((pageUrl, options) => {
    pageLoader(pageUrl, options)
      .then(() => {
        log(`Page was downloaded as '${makeHtmlFileName(pageUrl)}'`);
      })
      .catch(log);
  });

program.parse(process.argv);

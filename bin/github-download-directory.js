#!/usr/bin/env node

'use strict';

var minimist = require('minimist');

var gdd = require('../');

var args = minimist(process.argv.slice(2));

var ownerAndRepo = args._[0] || '';
var directory = args._[1] || '';
var owner;
var repo;

function cliError() {
  console.error.apply(console, arguments);
  process.exit(1);
}

async function exec() {
  try {
    await gdd.download(owner, repo, directory);
    console.log(`Successfully created "${directory}" in "${process.cwd()}".`);
  } catch (err) {
    cliError(`An error occurred while downloading:`, err);
  }
}

if (!ownerAndRepo) {
  cliError(
    `The first argument must be :owner/:repo (like "gulpjs/gulp") but it was empty.`
  );
}

if (ownerAndRepo.includes('/')) {
  var split = ownerAndRepo.split('/');

  if (split.length > 2) {
    cliError(
      `We encountered more than 1 "/" in the first argument. We were expecting :owner/:repo but you gave "${ownerAndRepo}".`
    );
  }

  owner = split[0];
  repo = split[1];

  if (!owner) {
    cliError(
      `It looks like you specified an empty :owner in :owner/:repo. You gave "${ownerAndRepo}".`
    );
  }

  if (!repo) {
    cliError(
      `It looks like you specified an empty :repo in :owner/:repo. You gave "${ownerAndRepo}".`
    );
  }

  exec();
} else {
  cliError(
    `The first argument must be :owner/:repo (like "gulpjs/gulp") but you gave "${ownerAndRepo}".`
  );
}

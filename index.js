'use strict';

var fs = require('fs');
var { dirname } = require('path');
var { promisify } = require('util');

var ghTree = require('github-trees');
var GithubContent = require('github-content');
var mkdirp = require('fs-mkdirp-stream/mkdirp');

function getFiles(owner, repo, paths) {
  var client = new GithubContent({ owner, repo });

  // Call with client as `this`
  return promisify(client.files).call(client, paths);
}

async function createDirectories(filepath) {
  var dir = dirname(filepath);
  return promisify(mkdirp).call(null, dir);
}

async function writeFile(filepath, contents) {
  return promisify(fs.writeFile).call(null, filepath, contents);
}

async function output(file) {
  await createDirectories(file.path);
  await writeFile(file.path, file.contents);
}

async function download(owner, repo, directory) {
  var { tree } = await ghTree(owner, repo, { recursive: true });

  var paths = tree
    .filter((node) => node.path.startsWith(directory) && node.type === 'blob')
    .map((node) => node.path);

  var files = await getFiles(owner, repo, paths);

  await Promise.all(files.map(output));
}

module.exports = download;

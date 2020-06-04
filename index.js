'use strict';

var fs = require('fs');
var { dirname } = require('path');
var { promisify } = require('util');
var persistentCache = require('persistent-cache');

var ghTree = require('github-trees');
var GithubContent = require('github-content');
var mkdirp = require('fs-mkdirp-stream/mkdirp');

var ONE_HOUR_IN_MS = 1000 * 3600;
var cache;

function getFiles(owner, repo, branch, paths) {
  var client = new GithubContent({ owner, repo, branch });

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

async function cacheGet(prop) {
  const get = promisify(cache.get);
  return get(prop);
}

async function cachePut(prop, value) {
  const put = promisify(cache.put);
  return put(prop, value);
}

async function getTree(owner, repo, options) {
  const cachedTree = await cacheGet('github-tree');
  if (cachedTree) {
    return cachedTree
  }
  const { tree } = await ghTree(owner, repo, { recursive: true, sha: options.sha || 'master' });
  await cachePut('github-tree', tree);
  return tree;
}

async function fetchFiles(owner, repo, directory, options = {}) {
  const tree = await getTree(owner, repo, options);

  var paths = tree
    .filter((node) => node.path.startsWith(directory) && node.type === 'blob')
    .map((node) => node.path);

  return getFiles(owner, repo, options.sha, paths);
}

async function download(owner, repo, directory, options = {}) {
  const cacheOptions = Object.assign( {'duration': ONE_HOUR_IN_MS}, options.cache);
  cache = persistentCache(cacheOptions);
  var files = await fetchFiles(owner, repo, directory, options);
  await Promise.all(files.map(output));
}

module.exports = download;
module.exports.fetchFiles = fetchFiles;
module.exports.output = output;

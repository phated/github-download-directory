'use strict';

var fs = require('fs');
var { dirname } = require('path');
var { promisify } = require('util');

var Keyv = require('keyv');
var ghTree = require('github-trees');
var GithubContent = require('github-content');
var mkdirp = require('fs-mkdirp-stream/mkdirp');

var ONE_HOUR_IN_MS = 1000 * 3600;
var cache;

var defaultCacheOpts = {
  ttl: ONE_HOUR_IN_MS,
  namespace: 'github-download-directory'
};

function getCache(opts) {
  if (!cache) {
    cache = module.exports.cache = new Keyv(opts);
  }

  if (opts.store && cache.opts.store !== opts.store) {
    cache = module.exports.cache = new Keyv(opts);
  }

  return cache
}

function getFiles(owner, repo, branch, paths) {
  // TODO: Should we cache files?
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

async function getTree(owner, repo, options = {}) {
  var cacheOpts = Object.assign({}, defaultCacheOpts, options.cache);
  var cache = getCache(cacheOpts);

  var sha = options.sha || 'master';
  var cacheKey = `${owner}/${repo}#${sha}`;

  var cachedTree = await cache.get(cacheKey);
  if (cachedTree) {
    return cachedTree
  }

  var { tree = [] } = await ghTree(owner, repo, { recursive: true, sha });
  await cache.set(cacheKey, tree);
  return tree;
}

async function fetchFiles(owner, repo, directory, options = {}) {
  var tree = await getTree(owner, repo, options);

  var paths = tree
    .filter((node) => node.path.startsWith(directory) && node.type === 'blob')
    .map((node) => node.path);

  return getFiles(owner, repo, options.sha, paths);
}

async function download(owner, repo, directory, options = {}) {
  var files = await fetchFiles(owner, repo, directory, options);
  await Promise.all(files.map(output));
}

module.exports = download;
module.exports.fetchFiles = fetchFiles;
module.exports.output = output;

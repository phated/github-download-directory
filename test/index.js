'use strict';

var fs = require('fs');
var expect = require('expect');

var FileCache = require('keyv-file').KeyvFile;

var gdd = require('../');

describe('github-download-directory', function() {

  function getPath(file) {
    return file.path;
  }

  function onlyIndex(file) {
    return file.path === 'index.js';
  }

  describe('fetchFiles', function() {

    this.timeout(0);

    it('fetchs the files', async function() {
      var files = await gdd.fetchFiles('phated', 'github-download-directory', '');
      var paths = files.map(getPath);
      // Check a few paths
      expect(paths).toContain('index.js');
      expect(paths).toContain('LICENSE');
      expect(paths).toContain('README.md');
      expect(paths).toContain('package.json');
    });

    it('has a cache from a previous run', async function() {
      expect(gdd.cache).toBeDefined();
    });

    it('uses the cache values if available', async function() {
      var key = 'phated/github-download-directory#master';
      var cachedTree = await gdd.cache.get(key);
      await gdd.cache.set(key, cachedTree.filter(onlyIndex));

      var files = await gdd.fetchFiles('phated', 'github-download-directory', '');
      var paths = files.map(getPath);
      // Check it only contains index.js, which we set
      expect(paths).toEqual(['index.js']);
    });

    it('reuses the cache between runs', async function() {
      var files = await gdd.fetchFiles('phated', 'github-download-directory', '');
      var paths = files.map(getPath);
      // Check it only contains index.js, which we set
      expect(paths).toEqual(['index.js']);
    });

    it('uses cache keys that include the SHA', async function() {
      var files = await gdd.fetchFiles('phated', 'github-download-directory', '', {
        sha: '773c2f0f26fffeaecc1651102da1fd18098309c7'
      });
      var paths = files.map(getPath);
      // Ensure we have a fresh set of files
      expect(paths).toContain('index.js');
      expect(paths).toContain('LICENSE');
      expect(paths).toContain('README.md');
      expect(paths).toContain('package.json');
    });

    it('can reset cache', async function() {
      gdd.cache.clear();
      var key = 'phated/github-download-directory#master';
      var cachedTree = await gdd.cache.get(key);

      expect(cachedTree).toBeUndefined();
    })

    it('filters the directory', async function() {
      var files = await gdd.fetchFiles('phated', 'github-download-directory', 'bin');
      var paths = files.map(getPath);
      // Just the bin file
      expect(paths).toEqual(['bin/github-download-directory.js']);
    });

    it('can set a custom cache', async function() {
      var filename = 'test/.cache.json';

      var files = await gdd.fetchFiles('phated', 'github-download-directory', '', {
        cache: {
          store: new FileCache({ filename }),
        }
      });
      var paths = files.map(getPath);
      // Check a few paths
      expect(paths).toContain('index.js');
      expect(paths).toContain('LICENSE');
      expect(paths).toContain('README.md');
      expect(paths).toContain('package.json');
      // Make sure the file cache exists
      expect(fs.existsSync(filename)).toEqual(true)
    });
  });

});

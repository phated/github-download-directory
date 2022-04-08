# github-download-directory

Download the contents of a given directory from a repository on GitHub.

Only works in node 12+

## Usage

Best used from the command line:

```bash
> github-download-directory gulpjs/gulp docs
```

Or programatic:

```js
var downloader = require('github-download-directory');

downloader.download('gulpjs', 'gulp', 'docs').then(console.log, console.error);
```

You can also construct a downloader instance:

```js
var { Downloader } = require('github-download-directory');

// You can even include custom cache stores compatible with https://www.npmjs.com/package/keyv
var KeyvFile = require('keyv-file').KeyvFile;
var store = new KeyvFile();

var custom = new Downloader({
  cache: { store },
  github: { auth: 'SOME_AUTH_TOKEN' },
});

custom.download('gulpjs', 'gulp', 'docs').then(console.log, console.error);
```

## License

MIT

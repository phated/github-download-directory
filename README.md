# github-download-directory
Download the contents of a given directory from a repository on GitHub.

Only works in node 8+ (because `async/await` is too cool).

## Usage

Best used from the command line:

```bash
> github-download-directory gulpjs/gulp docs
```

Or programatic:

```js
var download = require('github-download-directory');

download('gulpjs', 'gulp', 'docs').then(console.log, console.error);
```

## License

MIT

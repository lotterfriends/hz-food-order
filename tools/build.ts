const shell = require('shelljs');

// args
const args = process.argv.slice(2);
const debug = args.length && args.indexOf('--debug') > -1 || args.indexOf('-d') > -1;

const cwd = process.cwd();
const { join } = require('path');
const pkg = require(join(cwd, 'package.json'));
const fs = require('fs');
const archiver = require('archiver');
const { version } = require('typescript');
const buildTimestamp = Date.now();

function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt('' + Math.floor( Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

shell.config.verbose = debug;

shell.rm('-rf', 'work');
shell.mkdir('-p', 'work');
shell.cp('-r', ['apps', 'libs', 'angular.json', 'decorate-angular-cli.js', 'nx.json', 'package.json', 'package-lock.json', 'tsconfig.base.json', '.env'], 'work');
shell.cd('work/');
shell.exec('npm install --only=production', {silent: !debug});
shell.exec('npx nx build food-order --prod', {silent: !debug});
shell.exec('npx nx build food-order-api --prod', {silent: !debug});

if (debug) {
  shell.exec(`echo "Before: "$(du -hs .)`);
  shell.exec(`echo "Files: "$(find node_modules/ -type f | wc -l)`);
}


shell.rm('-rf', [
  'package.json',
  'package-lock.json',
  'angular.json',
  'decorate-angular-cli.js',
  'nx.json',
  'tsconfig.base.json',
  'apps',
  'libs',
  'node_modules/@types',
  'node_modules/typescript',
  'node_modules/@cypress',
  'node_modules/@jest',
  'node_modules/@nrwl',
  'node_modules/**/Makefile',
  'node_modules/**/README',
  'node_modules/**/README.md',
  'node_modules/**/CHANGELOG',
  'node_modules/**/CHANGELOG.md',
  'node_modules/**/.editorconfig',
  'node_modules/**/.gitmodules',
  'node_modules/**/.gitattributes',
  'node_modules/**/robot.html',
  'node_modules/**/.lint',
  'node_modules/**/Gulpfile.js',
  'node_modules/**/Gruntfile.js',
  'node_modules/**/.tern-project',
  'node_modules/**/.gitattributes',
  'node_modules/**/.editorconfig',
  'node_modules/**/.eslintrc',
  'node_modules/**/.jshintrc',
  'node_modules/**/.npmignore',
  'node_modules/**/.flowconfig',
  'node_modules/**/.documentup.json',
  'node_modules/**/.yarn-metadata.json',
  'node_modules/**/.travis.yml',
  'node_modules/**/thumbs.db',
  'node_modules/**/.tern-port',
  'node_modules/**/.ds_store',
  'node_modules/**/desktop.ini',
  'node_modules/**/npm-debug.log',
  'node_modules/**/.npmrc',
  'node_modules/**/LICENSE.txt',
  'node_modules/**/LICENSE.md',
  'node_modules/**/LICENSE-MIT',
  'node_modules/**/LICENSE-MIT.txt',
  'node_modules/**/LICENSE.BSD',
  'node_modules/**/LICENSE-BSD',
  'node_modules/**/LICENSE-jsbn',
  'node_modules/**/LICENSE',
  'node_modules/**/AUTHORS',
  'node_modules/**/CONTRIBUTORS',
  'node_modules/**/.yarn-integrity',
  'node_modules/**/builderror.log',
  'node_modules/**/*.m',
  'node_modules/**/*.sl',
  'node_modules/**/*.ob',
  'node_modules/**/*.gyp',
  'node_modules/**/*.vcxpro',
  'node_modules/**/*.vcxproj.filter',
  'node_modules/**/*.jst',
  'node_modules/**/*.coffee',
  'node_modules/**/*.ts',
  'node_modules/**/test',
  'node_modules/**/tests',
  'node_modules/**/powered-tests',
  'node_modules/**/docs',
  'node_modules/**/doc',
  'node_modules/**/website',
  'node_modules/**/images',
  'node_modules/**/assets',
  'node_modules/**/example',
  'node_modules/**/examples',
  'node_modules/**/coverage',
  'node_modules/**/node-gyp',
  'node_modules/**/gyp',
  'node_modules/**/.nyc_output'
]);


if (debug) {
  shell.exec(`echo "After: "$(du -hs .)`);
  shell.exec(`echo "Files: "$(find node_modules/ -type f | wc -l)`);
}


shell.ShellString(JSON.stringify({
  version: pkg.version,
  buildTimestamp: buildTimestamp
}, null, 2)).to('version.json');

shell.cd('..');

const archiveName = `${pkg.name}-${pkg.version}-${buildTimestamp}.zip`;
const stream = fs.createWriteStream(archiveName);
const archive = archiver('zip');

stream.on('close', function () {
  if (debug) {
    console.log(`${archiveName} created - size: ${bytesToSize(archive.pointer())}`);
  }
});

archive.on('error', function(err){
    throw err;
});

archive.pipe(stream);

// append files from a sub-directory, putting its contents at the root of archive
archive.directory('work', false);

archive.finalize();

const shell = require('shelljs');

// args
const args = process.argv.slice(2);
const debug = args.length && args.indexOf('--debug') > -1 || args.indexOf('-d') > -1;
const noClientBuild = args.length && args.indexOf('--no-client-build') > -1;
const cleanup = args.length && args.indexOf('--cleanup') > -1;

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
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

shell.config.verbose = debug;

if (cleanup) {
  shell.rm('-rf', 'work');
}

if (!noClientBuild) {
  shell.cd('client');
  shell.exec('npm i', {silent: !debug});
  shell.exec('npm run build -- --prod', {silent: !debug});
  shell.cd('..');
}

shell.mkdir('-p', 'work/client/dist');

shell.cp('-r', ['src', 'package.json', 'tsconfig*', 'nest-cli.json'], 'work');
shell.cp('-r', ['client/dist/*'], 'work/client/dist');
shell.cd('work');
shell.exec('npm install --only=production', {silent: !debug});

shell.exec('npm run build', {silent: !debug});
shell.ls('.');
shell.ShellString(JSON.stringify({
  version: pkg.version,
  buildTimestamp: buildTimestamp
}, null, 2)).to('version.json');

shell.rm('-rf', 'src');
shell.cd('..');

const archiveName = `${pkg.name}-${pkg.version}-${buildTimestamp}.zip`;
const stream = fs.createWriteStream(archiveName);
const archive = archiver('zip');

stream.on('close', function () {
  if (debug) {
    console.log(`${archiveName} created - size: ${bytesToSize(archive.pointer())}`);
  }
  if (cleanup) {
    shell.rm('-rf', 'work');
  }
});

archive.on('error', function(err){
    throw err;
});

archive.pipe(stream);

// append files from a sub-directory, putting its contents at the root of archive
archive.directory('work', false);

archive.finalize();

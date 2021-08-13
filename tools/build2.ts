const shell = require('shelljs');

// args
const args = process.argv.slice(2);
const debug = args.length && args.indexOf('--debug') > -1 || args.indexOf('-d') > -1;
const devBuild = args.length && args.indexOf('--dev-build') > -1 || args.indexOf('-x') > -1;
const zip = args.length && args.indexOf('--zip') > -1 || args.indexOf('-z') > -1;

const cwd = process.cwd();
const { join } = require('path');
const pkg = require(join(cwd, 'package.json'));
const fs = require('fs');

const { version } = require('typescript');
const buildTimestamp = Date.now();

function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt('' + Math.floor( Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

shell.config.verbose = debug;

if (devBuild) {
  const r = shell.exec('ng build --configuration=test');
  if (r.code !== 0) {
    process.exit(1);
  }
} else {
  const r = shell.exec('npx nx build food-order --prod');
  if (r.code !== 0) {
    process.exit(1);
  }
}
const r = shell.exec('npx nx build food-order-api --prod');
if (r.code !== 0) {
  process.exit(1);
}

shell.rm('-rf', 'work');
shell.mkdir('-p', 'work');

shell.cp('-r', 'dist/apps/food-order', 'work')
shell.exec('npx ncc build dist/apps/food-order-api/main.js -o work');

if (zip) {
  const archiver = require('archiver');
  shell.ShellString(JSON.stringify({
    version: pkg.version,
    buildTimestamp: buildTimestamp
  }, null, 2)).to('version.json');
  
  const archiveName = `${pkg.name}-${pkg.version}-${buildTimestamp}.zip`;
  const stream = fs.createWriteStream(archiveName);
  const archive = archiver('zip');
  
  stream.on('close', function () {
    if (debug) {
      console.log(`${archiveName} created - size: ${bytesToSize(archive.pointer())}`);
    }
    shell.mkdir('-p', 'releases/');
    shell.mv(archiveName, 'releases/');
  });
  
  archive.on('error', function(err){
      throw err;
  });
  
  archive.pipe(stream);
  
  // append files from a sub-directory, putting its contents at the root of archive
  archive.directory('work', false);
  
  archive.finalize();
}

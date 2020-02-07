const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const pkg = require('../package.json');

const dirName = `asksin-analyzer-xs-${ pkg.version }-node`;
const target = path.resolve(__dirname, `../../builds/${dirName}`);
const appDist = path.resolve(__dirname, '../dist');
const uiDist = path.resolve(__dirname, '../../htdocs');

execSync(`rm -rf ${target}`);
execSync(`mkdir -p ${target}`);
execSync(`cp -a ${ appDist }/* ${target}`);
execSync(`cp -a ${ uiDist } ${target}/`);
execSync(`cp ${ path.resolve(__dirname, '../../README.md') } ${target}/`);

delete pkg.build;
delete pkg.scripts;
delete pkg.devDependencies;
pkg.main = "server.js";
pkg.bin = {
  'asksin-analyzer-xs': 'cli.js'
};

fs.writeFileSync(target + '/package.json', JSON.stringify(pkg, null, 2));

execSync(`cd ${path.resolve(target, '..')} && tar czf ${dirName}.tar.gz ${dirName}`);

console.log(`${ dirName }.tar.gz created.`);

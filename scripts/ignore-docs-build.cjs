const {execFileSync} = require('node:child_process');
function documentationOnly(paths) {
  return paths.length > 0 && paths.every(path => path.startsWith('docs/') || /^[^/]+\.(md|rst)$/i.test(path));
}
module.exports = {documentationOnly};
if (require.main === module) {
  try {
    const previous = process.env.VERCEL_GIT_PREVIOUS_SHA;
    if (!/^[0-9a-f]{40}$/.test(previous || '')) process.exit(1);
    const files = execFileSync('git',['diff','--name-only','-z',previous,'HEAD','--'],{encoding:'utf8'}).replace(/\0$/,'').split('\0');
    process.exit(documentationOnly(files) ? 0 : 1);
  } catch { process.exit(1); }
}

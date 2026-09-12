import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve('src');
function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => {
    const p=path.join(dir,e.name);
    return e.isDirectory()?walk(p):[p];
  });
}
const files=walk(root).filter(f=>f.endsWith('.js'));
let failed=false;
for (const f of files) {
  const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});
  if(r.status!==0){failed=true; console.error(r.stderr||r.stdout);}
}
if(failed) process.exit(1);
console.log(`Syntax OK: ${files.length} JavaScript files checked.`);

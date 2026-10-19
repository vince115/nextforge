import fs from 'node:fs';
import path from 'node:path';

export const versionManager = {
  read(projectRoot) {
    const pkgPath = path.join(projectRoot, 'package.json');
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  },

  bump(currentVersion, type) {
    let [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (type) {
      case 'major': major++; minor = 0; patch = 0; break;
      case 'minor': minor++; patch = 0; break;
      case 'patch': patch++; break;
      default: throw new Error('Invalid version type');
    }

    return `${major}.${minor}.${patch}`;
  },

  update(projectRoot, newVersion) {
    const pkgPath = path.join(projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.version = newVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
};

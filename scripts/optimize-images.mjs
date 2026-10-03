import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const assetsDir = path.join(root, 'src', 'assets');
const sourceCodeDirs = [path.join(root, 'src')];
const codeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const maxDimension = 1800;
const webpQuality = 72;

function shouldProcess(file) {
  return file.toLowerCase().endsWith('.png');
}

async function walk(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, acc);
    } else if (entry.isFile() && shouldProcess(entry.name)) {
      acc.push(fullPath);
    }
  }
  return acc;
}

async function replaceInCode(convertedMap) {
  async function walkCode(dir, files = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue;
        await walkCode(fullPath, files);
      } else if (entry.isFile() && codeExtensions.has(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const codeFiles = [];
  for (const dir of sourceCodeDirs) {
    await walkCode(dir, codeFiles);
  }

  for (const file of codeFiles) {
    let content = await fs.readFile(file, 'utf8');
    let changed = false;
    for (const [pngName, webpName] of convertedMap) {
      if (content.includes(pngName)) {
        content = content.split(pngName).join(webpName);
        changed = true;
      }
    }
    if (changed) {
      await fs.writeFile(file, content, 'utf8');
    }
  }
}

async function main() {
  const pngFiles = await walk(assetsDir);
  const convertedMap = new Map();

  for (const pngPath of pngFiles) {
    const webpPath = pngPath.replace(/\.png$/i, '.webp');
    const image = sharp(pngPath, { failOn: 'none' });
    const metadata = await image.metadata();
    const resizeOptions =
      metadata.width && metadata.height
        ? { width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true }
        : { width: maxDimension, fit: 'inside', withoutEnlargement: true };

    await image
      .resize(resizeOptions)
      .webp({ quality: webpQuality, effort: 5 })
      .toFile(webpPath);

    const [pngStat, webpStat] = await Promise.all([fs.stat(pngPath), fs.stat(webpPath)]);

    if (webpStat.size < pngStat.size * 0.95) {
      await fs.unlink(pngPath);
      convertedMap.set(path.basename(pngPath), path.basename(webpPath));
    } else {
      await fs.unlink(webpPath);
    }
  }

  await replaceInCode(convertedMap);

  console.log(`Converted ${convertedMap.size} images to webp.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/* eslint-disable */
/* eslint-enable semi, indent */
"use strict";

const path = require('node:path');
const fs = require('node:fs');

const buildDir = path.resolve(process.cwd(), 'dist');
const srcDir = path.resolve(process.cwd(), 'src');

async function recursiveRemoveDirectoryFiles(dir) {
  if(!fs.existsSync(dir)) return;

  for(const filename of (await fs.promises.readdir(dir))) {
    const stats = await fs.promises.stat(path.join(dir, filename));

    if(stats.isDirectory()) {
      await recursiveRemoveDirectoryFiles(path.join(dir, filename));
    } else {
      await fs.promises.unlink(path.join(dir, filename));
    }
  }

  await fs.promises.rmdir(dir);
}


async function recursiveRemoveUnnecessaryFiles(dir) {
  if(!fs.existsSync(dir)) return;

  for(const filename of (await fs.promises.readdir(dir))) {
    const stats = await fs.promises.stat(path.join(dir, filename));
    
    if(stats.isDirectory()) {
      await recursiveRemoveUnnecessaryFiles(path.join(dir, filename));
    } else if(
      /.spec./.test(filename) /* ||
      filename === '_types.js'*/ ||
      filename.endsWith('.tmp') ||
      filename.indexOf('.d.js') > -1 ||
      //   filename === 'test.js' ||
      filename === 'test.d.ts'
    ) {
      await fs.promises.unlink(path.join(dir, filename));
    }
  }

  const dhlSyntaxPath = path.join(dir, 'ksdb', 'dhl', '_syntax.dhl');

  if(fs.existsSync(dhlSyntaxPath)) {
    await fs.promises.unlink(dhlSyntaxPath);
  }
}


// Function to copy a folder deeply using promises
async function copyFolder(src, dest) {
  try {
    // Ensure the destination folder exists, if not, create it
    try {
      await fs.promises.mkdir(dest, { recursive: true });
    } catch (err) {
      console.error(`Error creating directory ${dest}:`, err);
      return;
    }

    // Read all items in the source directory
    const items = await fs.promises.readdir(src);

    // Loop through each item in the source folder
    for (let item of items) {
      const srcPath = path.join(src, item);  // full path to source item
      const destPath = path.join(dest, item);  // full path to destination item

      const stats = await fs.promises.stat(srcPath);

      // If the item is a directory, recursively copy it
      if (stats.isDirectory()) {
        await copyFolder(srcPath, destPath);
      } else if (stats.isFile()) {
        // If the item is a file, copy it
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    console.error(`Error copying folder ${src} to ${dest}:`, err);
  }
}


async function main() {
  // await recursiveRemoveDirectoryFiles(path.join(buildDir, 'types'));
  await recursiveRemoveUnnecessaryFiles(buildDir);
  await fs.promises.unlink(path.join(buildDir, 'test.js'));
  
  if(fs.existsSync(path.join(buildDir, 'test.d.ts'))) {
    await fs.promises.unlink(path.join(buildDir, 'test.d.ts'));
  }

  await copyFolder(path.join(process.cwd(), 'extended'), path.join(buildDir, '._extended'));
  
  if(process.env.NODE_ENV === 'production') {
    await recursiveRemoveDirectoryFiles(path.join(process.cwd(), '.vscode'));
  }
}

main().catch(console.error);
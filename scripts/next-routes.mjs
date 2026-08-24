#!/usr/bin/env node
// node scripts/next-routes.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// ———————————————— CONFIG ————————————————

const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', 'public']);
const SHOW_FILE_TYPES = new Set(['ts', 'tsx', 'js', 'jsx', 'go', 'json', 'md']);
const SPECIAL_PREFIXES = ['page.', 'layout.', 'loading.', 'error.', 'index.'];
const MAX_DEPTH = 10; // Set to Infinity for unlimited depth

// Resolve this script’s __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Choose scan target
const projectRoot = path.join(__dirname, '../../ngo_frontend_ts'); // Adjust this path to your project root

// ———————————————— SCANNER ————————————————

function scanDirectory(dir, prefix = '', isLast = true, depth = 100) {
  if (depth > MAX_DEPTH) {
    console.log(`${prefix}${isLast ? '└── ' : '├── '}${chalk.gray('... (depth limit reached)')}`);
    return;
  }

  try {
    const entries = fs
      .readdirSync(dir)
      .filter(e => !IGNORE_DIRS.has(e))
      .filter(e => !e.startsWith('.'))
      .sort((a, b) => {
        const aPath = path.join(dir, a);
        const bPath = path.join(dir, b);
        const aIsDir = fs.statSync(aPath).isDirectory();
        const bIsDir = fs.statSync(bPath).isDirectory();
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });

    entries.forEach((name, idx) => {
      const fullPath = path.join(dir, name);
      const isDir = fs.statSync(fullPath).isDirectory();
      const isLastEntry = idx === entries.length - 1;

      const branch = isLastEntry ? '└── ' : '├── ';
      const connector = isLastEntry ? '    ' : '│   ';

      if (isDir) {
        console.log(`${prefix}${branch}${chalk.blue(name)}/`);
        scanDirectory(fullPath, prefix + connector, isLastEntry, depth + 1);
      } else {
        const ext = name.split('.').pop();
        if (!SHOW_FILE_TYPES.has(ext)) return;

        const isSpecial = SPECIAL_PREFIXES.some(p => name.startsWith(p));
        const colorFn = isSpecial ? chalk.green : chalk.white;
        console.log(`${prefix}${branch}${colorFn(name)}`);
      }
    });
  } catch (error) {
    console.error(chalk.red(`Error scanning ${dir}:`), error.message);
  }
}

// ———————————————— MAIN ————————————————

console.log(chalk.bold('Project file structure:'));
console.log(`Scanning: ${chalk.cyan(projectRoot)}\n`);

if (fs.existsSync(projectRoot)) {
  console.log(chalk.blue(path.basename(projectRoot) + '/'));
  scanDirectory(projectRoot, '', true, 0);
} else {
  console.error(chalk.red('Directory not found:'), projectRoot);
  console.log(chalk.yellow('Adjust the `projectRoot` path at the top of this script.'));
}

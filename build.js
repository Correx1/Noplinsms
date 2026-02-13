import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = path.resolve(__dirname, 'dist');

console.log('🧹 Cleaning dist directory...');
fs.removeSync(distDir);
fs.ensureDirSync(distDir);

// Copy all necessary files and directories
const itemsToCopy = [
  'index.html',
  'login-staff.html',
  'login-student-parent.html',
  'password-recovery.html',
  'template.html',
  'pages',
  'js',
  'css',
  'assets',
  'data',
  'dummydatas',
  'components',
  'templates'
];

console.log('📦 Copying files to dist/...\n');

itemsToCopy.forEach(item => {
  const src = path.resolve(__dirname, item);
  const dest = path.resolve(distDir, item);
  
  if (fs.existsSync(src)) {
    fs.copySync(src, dest);
    console.log(`  ✓ Copied ${item}`);
  } else {
    console.log(`  ⚠ Skipped ${item} (not found)`);
  }
});

console.log('\n✅ Build complete! All files copied to dist/');
console.log(`📁 Output directory: ${distDir}`);

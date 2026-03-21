import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = path.resolve(__dirname, 'dist');

console.log('🧹 Cleaning dist directory...');
fs.removeSync(distDir);
fs.ensureDirSync(distDir);

// Copy all necessary files and directories EXCEPT css (we'll build that separately)
const itemsToCopy = [
  'index.html',
  'login-staff.html',
  'login-student-parent.html',
  'password-recovery.html',
  'template.html',
  'pages',
  'js',
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

// Build Tailwind CSS directly to dist/css
console.log('\n🎨 Building Tailwind CSS...');
fs.ensureDirSync(path.resolve(distDir, 'css'));

try {
  execSync('npx tailwindcss -i ./css/styles.css -o ./dist/css/styles.css --minify', { stdio: 'inherit' });
  console.log('✓ Tailwind CSS built successfully');
} catch (error) {
  console.error('⚠ Tailwind CSS build failed, copying original CSS...');
  fs.copySync(path.resolve(__dirname, 'css'), path.resolve(distDir, 'css'));
}

// Copy other CSS files if they exist
const cssDir = path.resolve(__dirname, 'css');
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter(f => f !== 'styles.css');
  cssFiles.forEach(file => {
    fs.copySync(path.resolve(cssDir, file), path.resolve(distDir, 'css', file));
    console.log(`  ✓ Copied css/${file}`);
  });
}

console.log('\n✅ Build complete! All files copied to dist/');
console.log(`📁 Output directory: ${distDir}`);

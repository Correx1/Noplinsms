# Quick Reference - Minimal Vite Build Setup

## Commands

### Development

```bash
npm run dev
```

Starts Vite dev server on http://localhost:3000

### Build

```bash
npm run build
```

Copies all files to `dist/` folder

### Preview

```bash
npm run preview
```

Preview production build locally

## Files Created

1. **build.js** - Build script that copies files
2. **vercel.json** - Vercel routing configuration

## Files Modified

1. **package.json** - Updated build script to use `node build.js`

## Deployment

```bash
git add .
git commit -m "Add minimal build setup"
git push
```

Vercel will automatically:

- Run `npm run build`
- Deploy `dist/` folder
- Apply routing from `vercel.json`

## What Changed

- ✅ Build now copies files instead of bundling
- ✅ All HTML pages will work on Vercel
- ✅ No 404 errors
- ✅ Zero code changes to your HTML/CSS/JS

## Troubleshooting

**Build fails?**

- Make sure `fs-extra` is installed: `npm install`

**404 on Vercel?**

- Check `vercel.json` is committed
- Verify `dist/` folder has all files after build

**Dev server not working?**

- Use `npm run dev` (unchanged from before)

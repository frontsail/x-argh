require('esbuild')
  .build({
    entryPoints: ['./src/cdn.js'],
    platform: 'browser',
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: 'dist/x-argh.min.js',
  })
  .catch(() => process.exit(1))

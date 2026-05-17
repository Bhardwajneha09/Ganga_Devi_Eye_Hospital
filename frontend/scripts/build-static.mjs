import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });
await fs.cp(publicDir, dist, { recursive: true });

const css = await fs.readFile(path.join(root, 'src', 'index.css'), 'utf8');
await fs.writeFile(path.join(dist, 'style.css'), css);
await fs.copyFile(path.join(root, 'static', 'app.js'), path.join(dist, 'app.js'));

const apiBaseUrl = process.env.VITE_API_BASE_URL || '';

await fs.writeFile(path.join(dist, 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/ganga-devi-logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ganga Devi Eye Hospital</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div id="root"></div>
    <script>window.__API_BASE_URL__ = ${JSON.stringify(apiBaseUrl)};</script>
    <script type="module" src="/app.js"></script>
  </body>
</html>
`);

console.log('Static site built in frontend/dist');

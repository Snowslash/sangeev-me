import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = fileURLToPath(new URL('../docs/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };

// Serve the emitted artifact, not the source tree. This is a local HTTP preview,
// not a Cloudflare emulator or a rewrite of the estate's navigation destinations.
export async function createPreviewServer(directory = docs) {
  const root = await realpath(directory);
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  const policy = await readFile(path.join(root, '_headers'), 'utf8');
  for (const line of policy.split('\n')) {
    const match = line.match(/^\s+([^:]+):\s*(.+)$/);
    if (match) headers[match[1].trim()] = match[2].trim();
  }
  const notFound = await readFile(path.join(root, '404.html'));
  return createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { ...headers, Allow: 'GET, HEAD' });
      response.end();
      return;
    }
    let body = notFound;
    let status = 404;
    let mime = types['.html'];
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
      if (relative.split('/').some(part => part.startsWith('.') || part.startsWith('_'))) throw new Error('Private path');
      const filename = await realpath(path.resolve(root, relative));
      if (!filename.startsWith(root + path.sep)) throw new Error('Outside artifact');
      body = await readFile(filename);
      mime = types[path.extname(filename)] || 'application/octet-stream';
      status = 200;
    } catch {
      // Missing files, directories and paths outside the artifact are real 404s.
    }
    response.writeHead(status, { ...headers, 'Content-Type': mime, 'Content-Length': body.length });
    response.end(request.method === 'HEAD' ? undefined : body);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4192);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535');
  const server = await createPreviewServer();
  server.listen(port, '127.0.0.1', () => console.log(`Card Desk local preview: http://127.0.0.1:${port}/`));
}

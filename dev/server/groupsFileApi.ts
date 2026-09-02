import type { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';

import type { Plugin } from 'vite';

import { readGroups, writeGroups } from './groupsFile.ts';

/**
 * Minimal webservice, mounted on the vite dev server, that reads and writes
 * `src/groups.ts` directly in the repository.
 *
 * - `GET /api/groups` -> `{ path, groups }`
 * - `PUT /api/groups` -> body `{ groups }` -> `{ path, count }`
 * @returns The vite plugin serving those two routes on the dev server.
 */
export function groupsFileApi(): Plugin {
  let filePath = '';
  return {
    name: 'groups-file-api',
    apply: 'serve',
    configResolved(config) {
      filePath = join(config.root, '..', 'src', 'groups.ts');
    },
    configureServer(server) {
      server.middlewares.use('/api/groups', (request, response) => {
        handle(request, response, filePath).catch((error: unknown) => {
          send(response, 500, { error: String(error) });
        });
      });
    },
  };
}

async function handle(
  request: IncomingMessage,
  response: ServerResponse,
  filePath: string,
): Promise<void> {
  if (request.method === 'GET') {
    send(response, 200, { path: filePath, groups: readGroups(filePath) });
    return;
  }
  if (request.method === 'PUT') {
    const body = JSON.parse(await readBody(request)) as { groups: unknown };
    const count = writeGroups(filePath, body.groups);
    send(response, 200, { path: filePath, count });
    return;
  }
  send(response, 405, { error: `method ${request.method} not allowed` });
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function send(
  response: ServerResponse,
  status: number,
  payload: unknown,
): void {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json');
  response.end(JSON.stringify(payload));
}

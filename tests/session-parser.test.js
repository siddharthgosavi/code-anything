import assert from 'assert';
import { OpenCodeEnvironment } from '../src/lib/opencode.js';

export function testSessionParser() {
  const env = new OpenCodeEnvironment();

  // POSIX ps aux output: header line must NOT become a fake session
  const ps = [
    'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
    'user     12345  0.9  1.2 456789 12345 pts/0  Sl+  14:00   0:05 opencode -s ses_abc123',
    'user     12400  0.1  0.2  98765  5432 pts/1  S+   14:02   0:01 opencode serve --port 4096'
  ].join('\n');
  const posix = env.parseSessions(ps, false);
  assert.strictEqual(posix.length, 2, 'header line must be ignored');
  assert.strictEqual(posix[0].pid, 12345);
  assert.strictEqual(posix[0].sessionId, 'ses_abc123');
  assert.strictEqual(posix[1].sessionId, 'interactive/daemon');
  assert.ok(Number.isInteger(posix[0].pid), 'pid must be numeric');

  // Windows tasklist CSV: INFO noise line must not masquerade as a session
  const csv = '"opencode.exe","6789","Console","1","50,000 K"';
  const win = env.parseSessions(csv, true);
  assert.strictEqual(win.length, 1);
  assert.strictEqual(win[0].pid, 6789);

  const noise = 'INFO: No tasks are running which match the specified criteria.';
  assert.strictEqual(env.parseSessions(noise, true).length, 0);
  assert.strictEqual(env.parseSessions('', false).length, 0);
  assert.strictEqual(env.parseSessions(undefined, true).length, 0);

  console.log('  ✓ ps/tasklist parsers ignore noise, return numeric pids + session ids');
}

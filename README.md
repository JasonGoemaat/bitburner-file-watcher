# Simple file server for bitburner

1. Run `npm install` (or `pnpm install` like me)
2. Run `node watcher.mjs`
3. In Bitburner, go to 'Options' and 'Remote API', set the port to 8123 and click Connect

When connecting, the files on home will be copied to the 'server' directory.

When you change a file in the 'content' directory it will get pushed to home in bitburner
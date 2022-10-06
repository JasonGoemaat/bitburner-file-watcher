# Simple file server for bitburner

1. Run `npm install` (or `pnpm install` like me)
2. Run `node watcher.mjs`
3. In Bitburner, go to 'Options' and 'Remote API', set the port to 8111 and click Connect

When connecting, the files on home will be copied to the 'server' directory and the 
files in the 'content' directory will be pushed to the server.

When you change a file in the 'content' directory it will get pushed to home in bitburner.
When you delete a file in the 'content' directory it will get deleted from home in bitburner.

You can pass the directory you want to use for content, i.e. 

    node watcher.mjs c:\BitBurnerScripts

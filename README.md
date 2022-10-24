# Simple file server for bitburner

1. Run `npm install` (or `pnpm install` like me)
2. Run `node watcher.mjs`
3. In Bitburner, go to 'Options' and 'Remote API', set the port to 8111 and click Connect

When connecting, the files on home will be copied to the 'server' directory and the 
files in the 'content' directory will be pushed to the server.

When you change a file in the 'content' directory it will get pushed to home in bitburner.
When you delete a file in the 'content' directory it will get deleted from home in bitburner.

You can pass the directory you want to use for content (defaults to 'content' directory
in this repo), i.e. 

    node watcher.mjs c:\BitBurnerScripts

## Optional

You can change the default from the 'content' directory by commenting
the second line here (line 16 in watcher.mjs) and uncommenting the first,
changing the path from mine to whereever you want.

    //let CONTENT_DIR = process.argv[2] || `c:\\users\\jason\\dropbox\\bitburner\\bench\\main`
    CONTENT_DIR = process.argv[2] || join(APP_DIR, 'content')
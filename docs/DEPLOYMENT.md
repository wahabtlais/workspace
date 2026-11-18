# Deploying the CodeBrave Prototype

The CodeBrave prototype is a **static single-page application** (React + Vite). It has no back end, no database and no server-side code: all fictional demo data, persona switching, the Demo Center, simulated AI and the interactive learning demo run in the visitor's browser. Deploying it means building a folder of static files and serving it with any web server.

This guide covers a generic Linux server with Caddy or Nginx. It makes no assumptions about a particular server; replace the placeholders with your own values.

---

## 1. What you need

| Requirement | Notes |
|---|---|
| Node.js **20.19+ or 22.12+** (22 LTS recommended) and npm | Needed only to **build**. The running site needs no Node.js. A `.nvmrc` file pins version 22. |
| Git | To fetch the code. |
| A web server: **Caddy** or **Nginx** | Serves the static files. Example configurations are in `deploy/`. |

You can build on the server itself, or build elsewhere and copy the `dist/` folder to the server. The result is the same.

## 2. Get the code

```bash
git clone https://github.com/wahabtlais/workspace.git codebrave
cd codebrave
git checkout prototype/foundation
```

If the repository is private, use an SSH remote or a personal access token with read-only access. Never store tokens inside the project folder.

## 3. Install dependencies

```bash
npm ci
```

`npm ci` installs the exact versions recorded in `package-lock.json`. Use it rather than `npm install` for deployments.

## 4. Build

```bash
npm run build
```

This runs the TypeScript check and then the production build. A warning that a chunk is larger than 500 kB is expected and harmless.

**Output directory: `dist/`**

```
dist/
├── index.html        entry page
├── favicon.svg
├── robots.txt        asks search engines not to index the prototype
└── assets/           JavaScript and CSS with content hashes in their file names
```

To check the build on your own machine before deploying:

```bash
npm run preview        # serves dist/ at http://localhost:4173, with SPA fallback
```

## 5. Install the build on the server

A release-folder layout makes updates and rollbacks instant:

```
/var/www/codebrave/
├── releases/
│   ├── 20261118-1030/     one folder per deployed build (the contents of dist/)
│   └── 20261125-0915/
└── current -> releases/20261125-0915     symbolic link the web server points at
```

```bash
RELEASE=$(date +%Y%m%d-%H%M)
sudo mkdir -p /var/www/codebrave/releases/$RELEASE
sudo cp -r dist/. /var/www/codebrave/releases/$RELEASE/
sudo ln -sfn /var/www/codebrave/releases/$RELEASE /var/www/codebrave/current
```

The web server's user (for example `caddy` or `www-data`) needs read access to these folders.

## 6. Configure the web server

### SPA fallback (required)

The application uses client-side routing. Addresses such as `/school-upskilling/schools/sch-01` or `/curriculum/lessons/cur-web/les-how-the-web-works` do not exist as files. The server must return `index.html` for any path that is not a real file; the application then displays the right page. Without this, direct links and page refreshes on inner pages return "404 Not Found".

### Caddy

Use `deploy/Caddyfile.example` as a template. The essential lines are:

```caddy
prototype.example.org {
	root * /var/www/codebrave/current
	encode zstd gzip
	try_files {path} /index.html
	file_server
}
```

Caddy obtains HTTPS certificates automatically once DNS points to the server. The example also sets long-term caching for `/assets/*`, `no-cache` for pages, a `noindex` header, and includes a commented-out `basic_auth` block for password protection (generate the password hash with `caddy hash-password`). After editing:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### Nginx

Use `deploy/nginx.conf.example` as a template. The essential lines are:

```nginx
root /var/www/codebrave/current;
index index.html;
location / {
    try_files $uri $uri/ /index.html;
}
```

The example also includes caching, gzip, a `noindex` header and commented-out basic authentication. Add HTTPS with your usual method (for example Certbot). After editing:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Behind a reverse proxy

If another proxy already terminates HTTPS in front of the static server, forward all requests to the static server (for example Caddy `reverse_proxy 127.0.0.1:8080`, or Nginx `proxy_pass http://127.0.0.1:8080;`). The SPA fallback must still be configured on the server that serves the files.

### Serving from a sub-path (optional, untested)

The build assumes the site is served from the domain root (`/`), which is the recommended and tested setup. The router reads Vite's base path, so building with

```bash
npx tsc -b && npx vite build --base=/codebrave/
```

prepares the site for `https://example.org/codebrave/`; the web server's fallback for that sub-path must then return `/codebrave/index.html`. Sub-path hosting has not been tested end to end, so check every workspace if you choose it.

## 7. Check the deployment

1. Open `https://<your-domain>/`: the CodeBrave Home page appears with the dark "PROTOTYPE" bar.
2. Open a deep link directly, for example `https://<your-domain>/school-upskilling/schools/sch-01`, and refresh: the school profile must appear (this confirms the SPA fallback).
3. Open the **Demo Center**, switch persona with **Viewing as**, and open `/ai` (AI Workspace).
4. Open the browser's developer console: there should be no errors about missing files.

## 8. Update to a new version

```bash
cd codebrave
git fetch origin
git checkout prototype/foundation
git pull --ff-only
npm ci
npm run build
RELEASE=$(date +%Y%m%d-%H%M)
sudo mkdir -p /var/www/codebrave/releases/$RELEASE
sudo cp -r dist/. /var/www/codebrave/releases/$RELEASE/
sudo ln -sfn /var/www/codebrave/releases/$RELEASE /var/www/codebrave/current
```

No web-server reload is needed: `current` now points to the new files and visitors get the new version on their next page load. Visitors' own demo changes are unaffected, because demo data lives only in their browser tab.

## 9. Roll back

Point `current` back to the previous release:

```bash
ls -1 /var/www/codebrave/releases            # list releases, newest last
sudo ln -sfn /var/www/codebrave/releases/<PREVIOUS_RELEASE> /var/www/codebrave/current
```

To rebuild a specific earlier version instead, check out its commit (`git checkout <commit>`), then repeat the build and install steps. Old release folders can be deleted when no longer needed; keep at least the last two.

## 10. Notes and limitations

- **No secrets are required.** The prototype uses no API keys, environment variables or external services, apart from Google Fonts loaded by the visitor's browser. Do not add `.env` files to the repository.
- **Demo data is per browser tab.** Every visitor starts from the same fictional dataset; changes are not shared between visitors and disappear when the tab is closed. **Reset demo** restores the data at any time.
- **Nothing behind the screens is real.** AI answers, Google Meet links, calendar sync, file processing and offline storage are simulated, and the prototype contains only fictional people and figures. See `docs/CODEBRAVE_PLATFORM_GUIDE.md`, Part VII.
- **Not for real data.** There is no authentication or server-side security. Use password protection (basic authentication) to limit access to invited reviewers, and do not enter real personal information.
- **Search engines.** `robots.txt`, a `noindex` meta tag and the example `X-Robots-Tag` header ask search engines not to index the site.
- **Building on Windows.** The Vite configuration prevents a known problem where differing drive-letter casing in the folder path produced a blank page. Builds on Linux are unaffected.

## 11. Local development

```bash
npm ci
npm run dev           # http://localhost:5180
```

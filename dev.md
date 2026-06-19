e_ts> wails3 dev  
2026/02/28 18:17:08 INFO Changing Working Directory dir=E:\hxy\project-2026\wails3_test_vue_ts/
2026/02/28 18:17:08 INFO Refresh Starting...
task: [windows:common:go:mod:tidy] go mod tidy
task: Task "windows:common:generate:icons" is up to date
task: [windows:common:go:mod:tidy] go mod tidy
task: [windows:common:install:frontend:deps] yarn
task: Task "generate:bindings (BUILD_FLAGS=-buildvcs=false -gcflags=all=\"-l\")" is up to date
yarn install v1.22.22
[1/4] Resolving packages...
success Already up-to-date.
Done in 0.14s.
task: [build:frontend (DEV=true)] npm run build:dev -q

> frontend@0.0.0 build:dev
> vue-tsc && vite build --minify false --mode development

vite v5.4.21 building for development...
transforming...
✓ 38 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html 0.51 kB │ gzip: 0.32 kB
dist/assets/index-I_nkyw5X.css 0.24 kB │ gzip: 0.15 kB
dist/assets/index-Du8QiPhs.js 217.64 kB │ gzip: 49.77 kB
✓ built in 882ms
task: [windows:generate:syso] wails3 generate syso -arch amd64 -icon windows/icon.ico -manifest windows/wails.exe.manifest -info windows/info.json -out ../wails_windows_amd64.syso
task: [windows:build:native] go build -buildvcs=false -gcflags=all="-l" -o "bin/wails3_test_vue_ts.exe"
task: [windows:build:native] powershell Remove-item \*.syso

Need documentation? Run: wails3 docs
♥ If Wails is useful to you or your company, please consider sponsoring the project: wails3 sponsor
task: [windows:run] bin/wails3_test_vue_ts.exe
Feb 28 18:17:15.249 INF Platform Info: Go-WebView2Loader=true WebView2=145.0.3800.82 ID=24H2 Name="Windows 10 Pro" Version="2009 (Build: 26100)" Branding="Windows 11 专业版"
Feb 28 18:17:15.247 INF Build Info: Wails=v3.0.0-alpha.73 Compiler=go1.25.0 GOARCH=amd64 GOOS=windows GOAMD64=v1 -buildmode=exe -compiler=gc -gcflags="all=-l" CGO_ENABLED=0
Feb 28 18:17:15.249 INF AssetServer Info: middleware=true handler=true devServerURL=http://localhost:9245
Feb 28 18:17:15.265 INF Waiting for frontend dev server to start... url=http://localhost:9245
task: [common:install:frontend:deps] yarn
Feb 28 18:17:15.778 INF Retrying...
yarn install v1.22.22
[1/4] Resolving packages...
success Already up-to-date.
Done in 0.13s.
task: [common:dev:frontend] npm run dev -- --port 9245 --strictPort

> frontend@0.0.0 dev
> vite --port 9245 --strictPort

Feb 28 18:17:16.780 INF Retrying...

VITE v5.4.21 ready in 840 ms

➜ Local: http://localhost:9245/
➜ Network: use --host to expose
Feb 28 18:17:17.310 INF Connected to frontend dev server!
2026/02/28 18:17:17 [WebView2] Environment created successfully

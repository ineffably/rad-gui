#!/usr/bin/env node
/*
 * Coldstart harness: consume rad-gui the way an outsider does.
 *
 * Builds the package the way the release workflow does (npm run build, npm pack), installs only
 * that tarball plus off-the-shelf tooling into a scratch project outside the repo, then builds and
 * runs a set of consumer shapes in a headless document. Prints a per-shape report.
 *
 *   npm run coldstart                  build from the working tree, pack, test
 *   npm run coldstart -- --no-build    pack lib/ as committed instead of rebuilding it
 *   npm run coldstart -- --strict      exit 1 when a required shape fails
 *   npm run coldstart -- --clean       delete the scratch directory afterwards
 *   npm run coldstart -- --npm 0.11.0  contrast with that published version (default: latest)
 *   npm run coldstart -- --no-npm      skip the contrast with the published package
 *
 * Needs network access the first time (npm install in the scratch project).
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..');
const FIXTURES = path.join(__dirname, 'fixtures');
const argv = process.argv.slice(2);
const args = new Set(argv);
const BUILD = !args.has('--no-build');
const NPM_SPEC = args.has('--no-npm') ? null : (argv.includes('--npm') && argv[argv.indexOf('--npm') + 1]) || 'latest';

// Tooling a stranger would install, pinned so baselines stay comparable between runs.
const TOOLS = {
  vite: '8.3.1',
  webpack: '5.111.1',
  'webpack-cli': '7.2.3',
  'css-loader': '7.1.5',
  'mini-css-extract-plugin': '2.10.2',
  typescript: '7.0.2',
  jsdom: '30.1.0'
};

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'rad-gui-coldstart-'));
// The scratch project being exercised: the packed branch first, then the published package.
let consumer = path.join(scratch, 'consumer');
const bin = (name) => path.join(consumer, 'node_modules', '.bin', name);

function sh(cmd, cwd, env = {}) {
  const started = Date.now();
  const res = spawnSync(cmd, {
    cwd, shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, ...env, NO_COLOR: '1', FORCE_COLOR: '0' }
  });
  const out = `${res.stdout || ''}${res.stderr || ''}`.trim();
  return { ok: res.status === 0, code: res.status, out, ms: Date.now() - started, cmd: shown(cmd, cwd, env) };
}

function shown(cmd, cwd, env) {
  const prefix = Object.entries(env).map(([k, v]) => `${k}=${v} `).join('');
  return `(cd ${path.relative(scratch, cwd) || '.'} && ${prefix}${cmd.split(consumer + '/').join('')})`;
}

function copyDir(from, to) {
  fs.cpSync(from, to, { recursive: true });
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

function tail(text, lines = 25) {
  const all = text.split('\n');
  return (all.length > lines ? ['...', ...all.slice(-lines)] : all).join('\n');
}

function fail(step, res) {
  console.error(`\ncoldstart: ${step} failed\n${res.cmd}\n${tail(res.out, 60)}`);
  console.error(`scratch kept at ${scratch}`);
  process.exit(2);
}

// ---------------------------------------------------------------- pack

function pack() {
  const packDir = path.join(scratch, 'pack');
  fs.mkdirSync(packDir);
  let source = REPO;
  if (BUILD) {
    // Mirror release.yml (npm run build, then npm pack) without touching the tracked lib/.
    source = path.join(scratch, 'stage');
    fs.mkdirSync(source);
    for (const entry of ['src', 'package.json', 'tsconfig.json', 'webpack.config.js', 'LICENSE.md', 'readme.md']) {
      fs.cpSync(path.join(REPO, entry), path.join(source, entry), { recursive: true });
    }
    fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(source, 'node_modules'), 'dir');
    const built = sh('npx webpack --mode=production', source);
    if (!built.ok) fail('building the package', built);
  }
  const packed = sh(`npm pack --json --pack-destination ${packDir}`, source);
  if (!packed.ok) fail('npm pack', packed);
  const info = JSON.parse(packed.out.slice(packed.out.indexOf('[')))[0];
  return { tarball: path.join(packDir, info.filename), info, cmd: packed.cmd };
}

// ---------------------------------------------------------------- consumer project

function install(radGuiSpec) {
  fs.mkdirSync(consumer);
  writeJson(path.join(consumer, 'package.json'), {
    name: 'coldstart-consumer',
    private: true,
    version: '1.0.0',
    dependencies: { 'rad-gui': radGuiSpec },
    devDependencies: TOOLS
  });
  const res = sh('npm install --no-audit --no-fund --loglevel=error', consumer);
  if (!res.ok) fail('npm install in the scratch project', res);
  for (const dir of fs.readdirSync(FIXTURES)) copyDir(path.join(FIXTURES, dir), path.join(consumer, dir));
  return res;
}

function versions() {
  const pkgVersion = (name) => {
    try {
      return require(path.join(consumer, 'node_modules', name, 'package.json')).version;
    } catch {
      return 'n/a';
    }
  };
  const v = { node: process.version.slice(1), npm: sh('npm --version', consumer).out };
  for (const name of [...Object.keys(TOOLS), 'rolldown']) v[name] = pkgVersion(name);
  return v;
}

// ---------------------------------------------------------------- steps

function step(name, cmd, cwd, { env, diag = false, tools = [] } = {}) {
  const res = sh(cmd, cwd, env);
  return { name, diag, tools, ...res };
}

function withResult(name, res, tools, { expectColdstart = true } = {}) {
  const line = res.out.split('\n').find((l) => l.startsWith('COLDSTART_RESULT '));
  const result = line ? JSON.parse(line.slice('COLDSTART_RESULT '.length)) : null;
  const problems = [];
  if (!result) problems.push('no result printed');
  else {
    problems.push(...result.errors);
    const c = result.coldstart;
    if (!c) {
      if (expectColdstart) problems.push('app did not run to the end (window.__coldstart missing)');
    }
    else {
      if ('fired' in c && c.fired !== 42) problems.push(`onChange did not fire with 42 (got ${JSON.stringify(c.fired)})`);
      if ('value' in c && c.value !== 42) problems.push(`bound value is ${JSON.stringify(c.value)}, expected 42`);
    }
    if (result.roots < 1) problems.push('no .rad-gui.root element in the document');
  }
  const ok = res.ok && problems.length === 0;
  const rest = res.out.split('\n').filter((l) => !l.startsWith('COLDSTART_RESULT ')).join('\n');
  return { name, diag: false, tools, ...res, ok, result, problems, out: ok ? res.out : `${problems.join('\n')}\n${rest}`.trim() };
}

function builtFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith(ext))
    .map((f) => path.join(dir, f));
}

function cssHasRadGui(dir) {
  return builtFiles(dir, '.css').some((f) => fs.readFileSync(f, 'utf8').includes('.rad-gui'));
}

const WEBPACK_TOOLS = ['webpack', 'webpack-cli', 'css-loader', 'mini-css-extract-plugin'];

function webpackBuild(cwd, entry) {
  fs.copyFileSync(path.join(consumer, '_shared', 'webpack.config.cjs'), path.join(cwd, 'webpack.config.cjs'));
  return step('build', `${bin('webpack')} --config webpack.config.cjs`, cwd,
    { env: { COLDSTART_ENTRY: entry }, tools: WEBPACK_TOOLS });
}

function viteBuild(cwd) {
  return step('build', `${bin('vite')} build --logLevel warn`, cwd, { tools: ['vite', 'rolldown'] });
}

function runOutput(cwd, outDir, { name = 'run in jsdom', env = {}, diag = false, expectColdstart = true } = {}) {
  const files = builtFiles(path.join(cwd, outDir), '.js');
  const runner = path.join(consumer, '_shared', 'run-dom.cjs');
  const res = sh(`node ${runner} ${files.map((f) => path.relative(cwd, f)).join(' ')}`, cwd, env);
  return { ...withResult(name, res, ['jsdom'], { expectColdstart }), diag };
}

function bundled(cwd, bundler, entry) {
  const steps = [bundler === 'vite' ? viteBuild(cwd) : webpackBuild(cwd, entry)];
  const outDir = bundler === 'vite' ? 'dist' : 'dist-webpack';
  if (steps[0].ok) steps.push(runOutput(cwd, outDir));
  return { steps, outDir };
}

function tsconfig(dir, file, compilerOptions, files) {
  writeJson(path.join(dir, file), {
    compilerOptions: {
      target: 'ES2022', lib: ['ES2022', 'DOM'], strict: true, noEmit: true, skipLibCheck: true, types: [],
      ...compilerOptions
    },
    files
  });
}

// ---------------------------------------------------------------- shapes

function shapeEsm(bundler) {
  const cwd = path.join(consumer, 'esm');
  return { id: `esm · ${bundler}`, required: true, what: "import { GUI } from 'rad-gui' + import 'rad-gui/lib/rad-gui.css', production bundle",
    ...bundled(cwd, bundler, './index.js'), cwd };
}

function shapeCjs() {
  const cwd = path.join(consumer, 'cjs');
  return { id: 'cjs · webpack', required: true, what: "require('rad-gui') in a bundled app", ...bundled(cwd, 'webpack', './index.js'), cwd };
}

function shapeTs() {
  const cwd = path.join(consumer, 'ts');
  const node16 = path.join(consumer, 'ts-node16');
  fs.mkdirSync(node16);
  fs.copyFileSync(path.join(cwd, 'index.ts'), path.join(node16, 'index.ts'));
  writeJson(path.join(node16, 'package.json'), { name: 'ts-node16', private: true, type: 'module' });

  tsconfig(cwd, 'tsconfig.json', { module: 'ESNext', moduleResolution: 'bundler' }, ['index.ts']);
  tsconfig(cwd, 'tsconfig.gui-only.json', { module: 'ESNext', moduleResolution: 'bundler' }, ['gui-only.ts']);
  tsconfig(cwd, 'tsconfig.libcheck.json', { module: 'ESNext', moduleResolution: 'bundler', skipLibCheck: false }, ['gui-only.ts']);
  tsconfig(node16, 'tsconfig.json', { module: 'node16', moduleResolution: 'node16' }, ['index.ts']);

  const tsc = bin('tsc');
  const steps = [
    step('typecheck (moduleResolution bundler)', `${tsc} -p tsconfig.json`, cwd, { tools: ['typescript'] }),
    step('typecheck (node16, type: module)', `${tsc} -p tsconfig.json`, node16, { tools: ['typescript'] }),
    step('diag: typecheck with skipLibCheck false', `${tsc} -p tsconfig.libcheck.json`, cwd, { diag: true, tools: ['typescript'] })
  ];
  const built = viteBuild(cwd);
  steps.push(built);
  if (built.ok) steps.push(runOutput(cwd, 'dist'));
  return { id: 'ts · tsc + vite', required: true, what: 'imports GUI, compiles against shipped types, then runs', steps, cwd };
}

function shapeHost(bundler, cwd = path.join(consumer, 'host'), id = `host · ${bundler}`) {
  const shape = { id, required: true, what: 'host app with its own code and CSS bundles rad-gui into its production build',
    ...bundled(cwd, bundler, './src/main.js'), cwd };
  shape.metrics = hostMetrics(shape);
  return shape;
}

function withoutMatchMedia(shape) {
  if (shape.steps[0].ok) {
    shape.steps.push(runOutput(shape.cwd, shape.outDir,
      { name: 'diag: run in jsdom without a matchMedia stub', env: { COLDSTART_NO_MATCHMEDIA: '1' }, diag: true }));
  }
  return shape;
}

function shapeHostCjs() {
  const cwd = path.join(consumer, 'host-cjs');
  const shape = { id: 'host-cjs · webpack', required: true,
    what: "CommonJS host app (require + require('rad-gui/lib/rad-gui.css')) in a webpack production build",
    ...bundled(cwd, 'webpack', './src/main.js'), cwd };
  shape.metrics = hostMetrics(shape);
  // Deep requires CommonJS code tends to use; the exports map decides whether they resolve.
  for (const [entry, spec] of [['deep-lib-index.js', 'rad-gui/lib/index.js'], ['deep-lib-index-noext.js', 'rad-gui/lib/index'],
    ['deep-package-json.js', 'rad-gui/package.json']]) {
    const res = sh(`${bin('webpack')} --config webpack.config.cjs --output-path dist-deep`, cwd, { COLDSTART_ENTRY: `./src/${entry}` });
    shape.steps.push({ name: `diag: require('${spec}')`, diag: true, tools: WEBPACK_TOOLS, ...res });
  }
  return shape;
}

function hostMetrics(shape) {
  const run = shape.steps.find((s) => s.name === 'run in jsdom');
  const out = path.join(shape.cwd, shape.outDir);
  return {
    build: shape.steps[0].ok,
    run: !!(run && run.ok),
    cssInOutput: cssHasRadGui(out),
    stylesInjected: !!(run && run.result && run.result.stylesInjected),
    radGlobal: run && run.result ? run.result.radGlobal : 'n/a',
    defaultIsGUI: run && run.result && run.result.coldstart ? run.result.coldstart.defaultIsGUI : 'n/a',
    requireShape: run && run.result && run.result.coldstart ? run.result.coldstart.requireShape : undefined,
    jsBytes: builtFiles(out, '.js').reduce((n, f) => n + fs.statSync(f).size, 0)
  };
}

function shapeNode(kind) {
  const cwd = path.join(consumer, 'node');
  const file = kind === 'esm' ? 'index.mjs' : 'index.cjs';
  const res = sh(`node ${file}`, cwd);
  return { id: `node · ${kind === 'esm' ? 'import()' : 'require()'}`, required: false,
    what: kind === 'esm' ? 'native Node ESM, no bundler: are named exports visible?' : 'plain Node require(), no bundler',
    steps: [withResult('run', res, ['jsdom'])], cwd };
}

// ---------------------------------------------------------------- readme Quick Start

function quickStartBlocks() {
  const readme = fs.readFileSync(path.join(consumer, 'node_modules', 'rad-gui', 'readme.md'), 'utf8').replace(/\r\n/g, '\n');
  const start = readme.search(/^##\s.*Quick Start/m);
  if (start < 0) return null;
  const rest = readme.slice(start + 3);
  const end = rest.search(/^##\s/m);
  const section = end < 0 ? rest : rest.slice(0, end);
  const block = (lang) => {
    const m = section.match(new RegExp('```' + lang + '\\n([\\s\\S]*?)```'));
    return m ? m[1] : null;
  };
  return { javascript: block('javascript'), typescript: block('typescript') };
}

function shapeQuickStart(lang, code) {
  const ext = lang === 'javascript' ? 'js' : 'ts';
  const cwd = path.join(consumer, `quickstart-${ext}`);
  fs.mkdirSync(cwd);
  fs.writeFileSync(path.join(cwd, `main.${ext}`), code);
  fs.writeFileSync(path.join(cwd, 'index.html'),
    `<!doctype html>\n<html><head><title>quickstart</title></head><body><script type="module" src="./main.${ext}"></script></body></html>\n`);
  const steps = [];
  if (ext === 'ts') {
    tsconfig(cwd, 'tsconfig.json', { module: 'ESNext', moduleResolution: 'bundler' }, ['main.ts']);
    steps.push(step('typecheck', `${bin('tsc')} -p tsconfig.json`, cwd, { tools: ['typescript'] }));
  }
  const built = viteBuild(cwd);
  steps.push(built);
  // The snippet has no onChange assertion of ours; it passes when it runs without errors and renders a GUI.
  if (built.ok) steps.push(runOutput(cwd, 'dist', { expectColdstart: false }));
  return { id: `quickstart · ${lang}`, required: false, what: `readme Quick Start ${lang} block, verbatim, in a vite app`, steps, cwd };
}

// ---------------------------------------------------------------- package.json field probes

const PROBES = [
  { id: 'as shipped', patch: () => {} },
  { id: 'sideEffects: false', patch: (p) => { p.sideEffects = false; } },
  { id: 'sideEffects: ["*.css"]', patch: (p) => { p.sideEffects = ['*.css']; } },
  { id: 'module: ./missing.mjs', patch: (p) => { p.module = './missing.mjs'; } }
];

function probes() {
  const rows = [];
  for (const probe of PROBES) {
    for (const bundler of ['vite', 'webpack']) {
      const dir = path.join(consumer, 'probes', `${probe.id.replace(/[^a-z0-9]+/gi, '-')}-${bundler}`);
      copyDir(path.join(FIXTURES, 'host'), dir);
      // The probe gets its own copy of the installed package with one package.json field changed.
      const pkgDir = path.join(dir, 'node_modules', 'rad-gui');
      copyDir(path.join(consumer, 'node_modules', 'rad-gui'), pkgDir);
      const pkgFile = path.join(pkgDir, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
      probe.patch(pkg);
      writeJson(pkgFile, pkg);
      const shape = shapeHost(bundler, dir, `${probe.id} · ${bundler}`);
      const failed = shape.steps.find((s) => !s.ok);
      rows.push({ probe: probe.id, bundler, ...shape.metrics, error: failed ? firstLine(failed.out).replace(/\|/g, '\\|') : '' });
    }
  }
  return rows;
}

// ---------------------------------------------------------------- report

function firstLine(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const line = lines.find((l) => /^(\S+: )?\w*Error\b|error TS\d+/.test(l)) ||
    lines.find((l) => /cannot|not |missing|fail/i.test(l)) || lines[0] || '';
  return line.length > 160 ? line.slice(0, 157) + '...' : line;
}

function shapeStatus(shape) {
  return shape.steps.every((s) => s.ok || s.diag) ? 'PASS' : 'FAIL';
}

function report(ctx) {
  const L = [];
  const v = ctx.versions;
  L.push('# rad-gui coldstart report', '');
  L.push(`package: ${ctx.pack.info.name}@${ctx.pack.info.version} (${ctx.pack.info.entryCount} files, ${ctx.pack.info.size} bytes packed)` +
    ` — ${BUILD ? 'built from the working tree like release.yml' : 'lib/ as committed (--no-build)'}`);
  L.push(`pack: ${ctx.pack.cmd}`);
  L.push(`tools: ${Object.entries(v).map(([k, x]) => `${k} ${x}`).join(', ')}`);
  L.push(`scratch: ${scratch}`, '');

  L.push('## Shapes', '');
  for (const shape of ctx.shapes) {
    const status = shapeStatus(shape);
    L.push(`${status}  ${shape.id}${shape.required ? '' : '  (extra)'} — ${shape.what}`);
    for (const s of shape.steps) {
      const mark = s.ok ? 'ok  ' : s.diag ? 'diag' : 'FAIL';
      const tools = [...new Set(['node', ...s.tools])].map((t) => `${t} ${v[t]}`).join(', ');
      L.push(`      ${mark} ${s.name}: ${s.cmd}  [${tools}]`);
      if (!s.ok) L.push(...tail(s.out, 15).split('\n').map((l) => `             | ${l}`));
    }
    L.push('');
  }

  L.push('## package.json field probes (host app, production build)', '');
  L.push('Each probe copies the installed package and changes one field; "as shipped" is the control.', '');
  L.push('| probe | bundler | build | run | rad-gui CSS in output | styles injected at runtime | window.rad | default import === GUI | JS bytes | error |');
  L.push('|---|---|---|---|---|---|---|---|---|---|');
  for (const r of ctx.probes) {
    L.push(`| ${r.probe} | ${r.bundler} | ${yn(r.build)} | ${yn(r.run)} | ${yn(r.cssInOutput)} | ${yn(r.stylesInjected)} | ${r.radGlobal} | ${r.defaultIsGUI} | ${r.jsBytes} | ${r.error} |`);
  }
  L.push('');

  if (ctx.npm) L.push(...contrast(ctx), '');

  L.push('## What this says', '');
  L.push(...answers(ctx).map((a) => `- ${a}`), '');
  return L.join('\n');
}

function contrast(ctx) {
  const L = [];
  const npmLabel = `npm rad-gui@${ctx.npm.version}`;
  L.push(`## Contrast: this branch vs ${npmLabel} (installed from the registry, same tools)`, '');
  L.push(`| shape | branch | ${npmLabel} | where they differ |`, '|---|---|---|---|');
  const npmById = Object.fromEntries(ctx.npm.shapes.map((s) => [s.id, s]));
  for (const shape of ctx.shapes) {
    const other = npmById[shape.id];
    const a = shapeStatus(shape);
    const b = other ? shapeStatus(other) : 'n/a';
    const diffs = [];
    if (other) {
      shape.steps.forEach((s) => {
        const o = other.steps.find((x) => x.name === s.name);
        if (o && o.ok !== s.ok) diffs.push(`${s.name}: branch ${s.ok ? 'ok' : 'fails'}, npm ${o.ok ? 'ok' : `fails (${firstLine(o.out)})`}`);
      });
    }
    L.push(`| ${shape.id} | ${a} | ${b} | ${diffs.join('; ').replace(/\|/g, '\\|') || (a === b ? 'same' : '')} |`);
  }
  const failing = ctx.npm.shapes.filter((s) => shapeStatus(s) === 'FAIL');
  if (failing.length) {
    L.push('', `### ${npmLabel}: failing steps`, '');
    for (const shape of failing) {
      L.push(`FAIL  ${shape.id}`);
      for (const s of shape.steps.filter((x) => !x.ok && !x.diag)) {
        L.push(`      FAIL ${s.name}: ${s.cmd}`, ...tail(s.out, 8).split('\n').map((l) => `             | ${l}`));
      }
    }
  }
  return L;
}

function yn(b) {
  return b === true ? 'yes' : b === false ? 'no' : String(b);
}

function answers(ctx) {
  const byId = Object.fromEntries(ctx.shapes.map((s) => [s.id, s]));
  const pass = (id) => byId[id] && shapeStatus(byId[id]) === 'PASS';
  const out = [];
  const bundlers = ['esm · webpack', 'esm · vite', 'cjs · webpack', 'host · vite', 'host · webpack', 'host-cjs · webpack'];
  out.push(`Pre-bundled UMD lib/index.js through a bundler: ${bundlers.map((id) => `${id} ${pass(id) ? 'pass' : 'FAIL'}`).join(', ')}.`);
  const nodeEsm = byId['node · import()'];
  const nodeRes = nodeEsm && nodeEsm.steps[0].result;
  out.push(pass('node · import()')
    ? `Native ESM without a bundler gets named exports (${(nodeRes.coldstart.namespaceKeys || []).join(', ')}).`
    : `Native ESM without a bundler: ${firstLine(nodeEsm.steps[0].out)} — the package is CommonJS/UMD only, there is no ESM build.`);
  out.push(`CSS via 'rad-gui/lib/rad-gui.css': esm · webpack ${pass('esm · webpack') ? 'resolves' : 'FAIL'}, esm · vite ${pass('esm · vite') ? 'resolves' : 'FAIL'}.`);

  const probe = (id, bundler) => ctx.probes.find((r) => r.probe === id && r.bundler === bundler);
  const fields = ['build', 'run', 'cssInOutput', 'stylesInjected', 'radGlobal', 'defaultIsGUI'];
  for (const id of PROBES.slice(1).map((p) => p.id)) {
    const diffs = [];
    for (const bundler of ['vite', 'webpack']) {
      const base = probe('as shipped', bundler);
      const row = probe(id, bundler);
      const changed = fields.filter((f) => base[f] !== row[f]).map((f) => `${f} ${yn(base[f])}→${yn(row[f])}`);
      const bytes = row.jsBytes - base.jsBytes;
      if (bytes) changed.push(`JS ${bytes > 0 ? '+' : ''}${bytes} bytes`);
      diffs.push(`${bundler}: ${changed.length ? changed.join(', ') : 'no change'}`);
    }
    out.push(`${id} vs as shipped — ${diffs.join('; ')}.`);
  }
  const cjsHost = byId['host-cjs · webpack'];
  if (cjsHost) {
    const shapeInfo = cjsHost.metrics.requireShape;
    out.push(`CommonJS host (webpack, production): ${pass(cjsHost.id) ? 'pass' : `FAIL — ${firstLine(cjsHost.steps.find((s) => !s.ok).out)}`}` +
      (shapeInfo ? `; require('rad-gui') gives GUI ${shapeInfo.GUI}, default ${shapeInfo.default}${shapeInfo.callable ? ', callable' : ', not callable'}` : '') + '.');
    const deep = cjsHost.steps.filter((s) => s.name.startsWith("diag: require("));
    out.push(`Deep requires: ${deep.map((s) => `${s.name.slice(6)} ${s.ok ? 'resolves' : `fails (${firstLine(s.out)})`}`).join('; ')}.`);
  }
  const bare = byId['host · webpack'].steps.find((s) => s.name.includes('without a matchMedia'));
  if (bare) {
    out.push(bare.ok
      ? 'A headless document without matchMedia (plain jsdom, e.g. a host app\'s Jest tests) works.'
      : `A headless document without matchMedia (plain jsdom, e.g. a host app's Jest tests) breaks: ${firstLine(bare.out)}; the other shapes run with a stub.`);
  }
  for (const lang of ['javascript', 'typescript']) {
    const qs = byId[`quickstart · ${lang}`];
    if (!qs) out.push(`Quick Start ${lang} block not found in the packed readme.`);
    else if (!pass(qs.id)) {
      const bad = qs.steps.find((s) => !s.ok);
      out.push(`Quick Start ${lang} does not work as written: ${bad.name} — ${firstLine(bad.out)}`);
    } else out.push(`Quick Start ${lang} works as written.`);
  }
  return out;
}

// ---------------------------------------------------------------- main

function runShapes() {
  const shapes = [shapeEsm('webpack'), shapeEsm('vite'), shapeCjs(), shapeTs(), shapeHost('vite'),
    withoutMatchMedia(shapeHost('webpack')), shapeHostCjs(), shapeNode('esm'), shapeNode('cjs')];
  const blocks = quickStartBlocks() || {};
  for (const lang of ['javascript', 'typescript']) if (blocks[lang]) shapes.push(shapeQuickStart(lang, blocks[lang]));
  return shapes;
}

function main() {
  console.log(`coldstart: scratch ${scratch}`);
  console.log(`coldstart: ${BUILD ? 'building and packing' : 'packing committed lib/'}...`);
  const packed = pack();
  console.log(`coldstart: installing ${path.basename(packed.tarball)} + tooling (network)...`);
  install(`file:${path.relative(consumer, packed.tarball)}`);
  const ctx = { pack: packed, versions: versions(), shapes: [] };

  console.log('coldstart: building and running shapes...');
  ctx.shapes = runShapes();
  console.log('coldstart: probing package.json fields...');
  ctx.probes = probes();

  if (NPM_SPEC) {
    const branchConsumer = consumer;
    consumer = path.join(scratch, 'consumer-npm');
    console.log(`coldstart: installing rad-gui@${NPM_SPEC} from the npm registry for contrast (network)...`);
    install(`${NPM_SPEC}`);
    const version = require(path.join(consumer, 'node_modules', 'rad-gui', 'package.json')).version;
    ctx.npm = { spec: NPM_SPEC, version, shapes: runShapes() };
    consumer = branchConsumer;
  }

  const text = report(ctx);
  fs.writeFileSync(path.join(scratch, 'report.md'), text + '\n');
  console.log('\n' + text);

  const requiredFailed = ctx.shapes.filter((s) => s.required && shapeStatus(s) === 'FAIL').length;
  console.log(`coldstart: ${requiredFailed} of ${ctx.shapes.filter((s) => s.required).length} required shapes failed; report saved to ${path.join(scratch, 'report.md')}`);
  if (args.has('--clean')) fs.rmSync(scratch, { recursive: true, force: true });
  if (args.has('--strict') && requiredFailed) process.exit(1);
}

main();

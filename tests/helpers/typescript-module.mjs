import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

// Test-only compilation, using the project's pinned TypeScript and real imports.
// No DOM, React mocks or application globals are needed for pure modules/SSR.
export function loadTypeScript(url, globals = {}) {
  const source = readFileSync(url, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
    fileName: url.pathname,
    reportDiagnostics: true,
  });
  const errors = compiled.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
  if (errors.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, {
    getCanonicalFileName: f => f, getCurrentDirectory: () => process.cwd(), getNewLine: () => '\n',
  }));
  const exports = {};
  const require = createRequire(url);
  vm.runInNewContext(compiled.outputText, {
    ...globals,
    exports,
    require(specifier) {
      if (specifier.startsWith('.')) {
        const module = ['.ts', '.tsx'].map(ext => new URL(specifier + ext, url)).find(existsSync);
        if (module) return loadTypeScript(module);
      }
      return require(specifier);
    },
  }, { filename: url.pathname });
  return exports;
}

export const plain = value => JSON.parse(JSON.stringify(value));

export function seededRandom(seed) {
  let state = seed;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
}

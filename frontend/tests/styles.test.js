import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');

function filesIn(dir, extension) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return filesIn(file, extension);
    return file.endsWith(extension) ? [file] : [];
  });
}

describe('stylesheets', () => {
  // The site's security rules (style-src 'self') block inline styles on the live site.
  it('uses no inline styles', () => {
    const files = [path.join(root, 'index.html'), ...filesIn(path.join(root, 'src'), '.jsx')];
    for (const file of files) {
      expect(fs.readFileSync(file, 'utf-8'), file).not.toMatch(/\bstyle=|<style/);
    }
  });

  it('imports every stylesheet from somewhere', () => {
    const code = filesIn(path.join(root, 'src'), '.jsx')
      .map((file) => fs.readFileSync(file, 'utf-8'))
      .join('\n');
    for (const file of filesIn(path.join(root, 'src', 'styles'), '.css')) {
      const name = path.relative(path.join(root, 'src'), file).replace(/\\/g, '/');
      expect(code, name).toContain(`${name}'`);
    }
  });
});

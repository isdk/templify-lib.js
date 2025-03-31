import { vi } from 'vitest';
import { getIgnoreFiles } from './get-ignore-files';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe('getIgnoreFiles', () => {
  const templateDir = '/mock/templateDir';

  it('should return default ignore files when no .gitignore exists', () => {
    (existsSync as any).mockReturnValue(false);

    const result = getIgnoreFiles(templateDir);
    expect(result).toEqual(['.gitignore', '.git']);
  });

  it('should include .gitignore content and default files when .gitignore exists', () => {
    (existsSync as any).mockReturnValue(true);
    (readFileSync as any).mockReturnValue('node_modules\ndist/\n#comment\nbuild/\n');

    const result = getIgnoreFiles(templateDir);
    expect(result).toEqual(['node_modules', 'dist/', 'build/', '.gitignore', '.git']);
  });

  it('should merge options.ignoreFiles with .gitignore content and default files', () => {
    (existsSync as any).mockReturnValue(true);
    (readFileSync as any).mockReturnValue('node_modules\ndist/\n');

    const options = { ignoreFiles: ['logs/', '*.log'] };
    const result = getIgnoreFiles(templateDir, options);
    expect(result).toEqual(['logs/', '*.log', 'node_modules', 'dist/', '.gitignore', '.git']);
  });
});
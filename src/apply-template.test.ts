import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rm, readFile, rename, writeFile } from 'fs/promises';
import path from 'path';
import { StringTemplate } from '@isdk/template-engines';
import { glob, traverseFolder } from '@isdk/util';
import { applyTemplate } from './apply-template';
import { getIgnoreFiles } from './get-ignore-files';

// Mock dependencies
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  rm: vi.fn(),
  writeFile: vi.fn(),
  rename: vi.fn(),
}));

vi.mock('@isdk/util', async (importOriginal) => ({
  ...await importOriginal<typeof import('@isdk/util')>(),
  normalizeIncludeFiles: vi.fn((files)=>files),
  glob: vi.fn(),
  traverseFolder: vi.fn(),
}));

vi.mock('./get-ignore-files', () => ({
  getIgnoreFiles: vi.fn(),
}));

// vi.mock('@isdk/template-engines', () => ({
//   StringTemplate: class MockStringTemplate {
//     static formatIf = vi.fn();
//     static isTemplate = vi.fn();
//     getVariables() {}
//   },

// }));

// Helper functions
const mockFile = (filePath: string|undefined, content: string) => {
  (readFile as any).mockImplementation((file: string) => {
    if (!filePath || file === filePath) return Promise.resolve(content);
    throw new Error(`File not found: ${file}`);
  });
};

const mockGlob = (filePath: string|undefined, patterns: string[], rootDir: string, result: boolean) => {
  (glob as any).mockImplementation((file, patternList, dir) => {
    if ((!filePath || file === filePath) && patternList === patterns && dir === rootDir) return result;
    return false;
  });
};

// Helper function to mock traverseFolder
const mockTraverseFolder = (filePaths: { path: string; isFile: boolean; isDirectory: boolean }[]) => {
  (traverseFolder as any).mockImplementation(async (dir, cb) => {
    for (const { path: filePath, isFile, isDirectory } of filePaths) {
      await cb(filePath, { isFile: () => isFile, isDirectory: () => isDirectory, name: path.basename(filePath) });
    }
  });
};

describe('applyTemplate', () => {
  const templateDir = '/mock/templateDir';
  const options = {
    files: ['**/*.txt'],
    parameters: { name: 'John Doe' },
    clean: ['**/*.bak'],
    dryRun: false,
    templateFormat: 'hf',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should apply template to matching files', async () => {
    const filePath = path.join(templateDir, 'example.txt');
    mockFile(filePath, 'Hello {{name}}');
    mockGlob(filePath, options.files, templateDir, true);

    // Mock traverseFolder to simulate a file
    mockTraverseFolder([{ path: filePath, isFile: true, isDirectory: false }]);

    const result = await applyTemplate(templateDir, options as any);
    expect(result).toBe(1);
    expect(traverseFolder).toHaveBeenCalledWith(templateDir, expect.any(Function));
    expect(readFile).toHaveBeenCalledWith(filePath, 'utf8');
    expect(writeFile).toHaveBeenCalledWith(filePath, 'Hello John Doe', 'utf8');
  });

  it('should delete files matching clean patterns', async () => {
    const filePath = 'example.bak';
    const fullpath =path.join(templateDir, filePath);
    mockGlob(filePath, options.clean, templateDir, true);

    (rm as any).mockResolvedValue(undefined);

    // Mock traverseFolder to simulate a file
    mockTraverseFolder([{ path: filePath, isFile: true, isDirectory: false }]);

    await applyTemplate(templateDir, options as any);

    expect(traverseFolder).toHaveBeenCalledWith(templateDir, expect.any(Function));
    expect(rm).toHaveBeenCalledWith(fullpath, { recursive: true, force: true });
  });

  it('should log actions without making changes in dryRun mode', async () => {
    const filePath = path.join(templateDir, 'example.txt');
    mockFile(filePath, 'Hello {{name}}');
    mockGlob(filePath, options.files, templateDir, true);

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock traverseFolder to simulate a file
    mockTraverseFolder([{ path: filePath, isFile: true, isDirectory: false }]);

    await applyTemplate(templateDir, { ...options, dryRun: true } as any);

    expect(traverseFolder).toHaveBeenCalledWith(templateDir, expect.any(Function));
    expect(writeFile).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(`apply template: ${filePath} done.`);
  });

  it('should skip files matching ignore patterns', async () => {
    const filePath = path.join(templateDir, 'ignored-file.log');
    mockGlob(filePath, [], templateDir, false); // Not in include files
    (getIgnoreFiles as any).mockReturnValue([filePath]);

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock traverseFolder to simulate a file
    mockTraverseFolder([{ path: filePath, isFile: true, isDirectory: false }]);

    await applyTemplate(templateDir, options as any);

    expect(traverseFolder).toHaveBeenCalledWith(templateDir, expect.any(Function));
    expect(consoleLogSpy).toHaveBeenCalledWith(`skip: ${filePath}`);
  });

  it('should handle errors during file deletion', async () => {
    const filePath = 'example.bak';
    const fullPath = path.join(templateDir, filePath);
    mockGlob(filePath, options.clean, templateDir, true);
    const delErr = new Error('Deletion failed');

    (rm as any).mockRejectedValue(delErr);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock traverseFolder to simulate a file
    mockTraverseFolder([{ path: filePath, isFile: true, isDirectory: false }]);

    await applyTemplate(templateDir, options as any);

    expect(traverseFolder).toHaveBeenCalledWith(templateDir, expect.any(Function));
    expect(rm).toHaveBeenCalledWith(fullPath, { recursive: true, force: true });
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error deleting directory: ${fullPath}`);
    expect(consoleErrorSpy).toHaveBeenCalledWith(delErr);
  });

  it('should exit early if no parameters are provided', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock traverseFolder to simulate a file
    mockTraverseFolder([{ path: '/mock/templateDir/example.txt', isFile: true, isDirectory: false }]);

    const result = await applyTemplate(templateDir, { ...options, parameters: {} });
    expect(result).toBeUndefined();

    expect(traverseFolder).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith('no parameters to apply');
    expect(readFile).not.toHaveBeenCalled();
  });

  it('should apply template to matching filename and dirname', async () => {
    const filePath = path.join(templateDir, 'example.txt');
    const options = {
      files: ['**/*.txt'],
      parameters: { name: 'John Doe', dir: 'exampleDir', file: 'exampleFile' },
      clean: ['**/*.bak'],
      dryRun: false,
    };
    mockFile(undefined, 'Hello {{name}}');
    mockGlob(undefined, options.files, templateDir, true);

    // Mock traverseFolder to simulate a file
    mockTraverseFolder([
      { path: filePath, isFile: true, isDirectory: false },
      { path: path.join(templateDir, '{{dir}}'), isFile: false, isDirectory: true },
      { path: path.join(templateDir, '{{dir}}', '{{file}}.txt'), isFile: true, isDirectory: false },
    ]);

    const result = await applyTemplate(templateDir, options as any);
    expect(result).toBe(4);
    expect(traverseFolder).toHaveBeenCalledWith(templateDir, expect.any(Function));
    expect(readFile).toHaveBeenCalledWith(filePath, 'utf8');
    expect(writeFile).toHaveBeenCalledWith(filePath, 'Hello John Doe', 'utf8');
    expect(rename).toHaveBeenCalledTimes(2);
  });
});

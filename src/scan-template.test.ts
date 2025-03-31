import { describe, it, expect, vi } from 'vitest';
import { scanTemplate } from './scan-template';
import path from 'path';
import { readFile } from 'fs/promises';
import { loadConfigFile, saveConfigFile } from './template-config.js';
import { getIgnoreFiles } from './get-ignore-files.js';
import { StringTemplate } from '@isdk/template-engines';
import { traverseFolder } from '@isdk/util';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('./template-config.js', () => ({
  loadConfigFile: vi.fn(),
  saveConfigFile: vi.fn(),
  normalizeIncludeFiles: vi.fn((files)=>files),
  DefaultAllTextFiles: ['*.txt'],
  DefaultTemplifyConfigFileName: 'templify.config.json',
}));

vi.mock('./get-ignore-files.js', () => ({
  getIgnoreFiles: vi.fn(),
}));

vi.mock('@isdk/template-engines', () => ({
  StringTemplate: class MockStringTemplate {
    static isTemplate = vi.fn();
    getVariables() {}
  },
}));

vi.mock('@isdk/util', () => ({
  traverseFolder: vi.fn(),
  glob: vi.fn(()=>true),
  toCapitalCase: vi.fn(),
}));

describe('scanTemplate', () => {
  const templateDir = '/mock/template/directory';
  const templifyConfigFilepath = path.join(templateDir, 'templify.config.json');
  const mockContent = 'mock template content';
  const mockVariables = ['var1', 'var2'];

  beforeEach(() => {
    vi.clearAllMocks();
    (loadConfigFile as any).mockReturnValue({});
    (getIgnoreFiles as any).mockReturnValue([]);
    (StringTemplate.isTemplate as any).mockReturnValue(true);
    (readFile as any).mockResolvedValue(mockContent);
    ((StringTemplate.prototype as any).getVariables) = vi.fn().mockReturnValue(mockVariables);
    (traverseFolder as any).mockImplementation((dir, callback) => {
      // Simulate traversing a directory with one file and one directory
      callback('/mock/template/directory/file.txt', { isDirectory: () => false });
      callback('/mock/template/directory/subdir', { isDirectory: () => true });
    });
  });

  it('should scan template files and update configuration', async () => {
    const options = { files: ['*.txt'], dryRun: false };
    const found = await scanTemplate(templateDir, options);

    expect(loadConfigFile).toHaveBeenCalledWith(templifyConfigFilepath, { externalFile: 'README.md' });
    expect(readFile).toHaveBeenCalledWith(expect.any(String), 'utf8');
    expect(StringTemplate.isTemplate).toHaveBeenCalledWith({ template: mockContent, templateFormat: undefined });
    expect(saveConfigFile).toHaveBeenCalledWith(templifyConfigFilepath, expect.any(Object));
    expect(found).toBeGreaterThan(0);
  });

  it('should not save configuration in dryRun mode', async () => {
    const options = { files: ['*.txt'], dryRun: true };
    const found = await scanTemplate(templateDir, options);

    expect(saveConfigFile).not.toHaveBeenCalled();
    expect(found).toBeGreaterThan(0);
  });

  it('should handle empty template directory', async () => {
    (StringTemplate.isTemplate as any).mockReturnValue(false);
    (traverseFolder as any).mockImplementation(() => {}); // No files or directories
    const found = await scanTemplate(templateDir);

    expect(found).toBe(0);
    expect(saveConfigFile).not.toHaveBeenCalled();
  });

  it('should extract variables and update parameters', async () => {
    const options = { files: ['*.txt'] };
    await scanTemplate(templateDir, options);

    expect((StringTemplate.prototype as any).getVariables).toHaveBeenCalled();
    expect((saveConfigFile as any).mock.calls[0][1].parameters).toHaveProperty('var1');
    expect((saveConfigFile as any).mock.calls[0][1].parameters).toHaveProperty('var2');
  });
});
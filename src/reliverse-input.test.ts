import {existsSync} from 'fs'
import { describe, it, expect, vi } from 'vitest';
import { confirmPrompt, inputPrompt, multiselectPrompt, numberPrompt, selectPrompt } from '@reliverse/prompts';
import {
  getInputDataBySchema,
  generateDefaultDataFromSchema,
  getDataFromInput,
  handleStringPrompt,
  handleNumberPrompt,
  handleBooleanPrompt,
  handleArrayPrompt,
  handleObject,
  handleEnumPrompt,
} from './reliverse-input';
import type { InputSchema } from './input-schema';
import { loadConfigFile } from './template-config';

// Mock dependencies
vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));
vi.mock('@reliverse/prompts', () => ({
  confirmPrompt: vi.fn(),
  inputPrompt: vi.fn(),
  multiselectPrompt: vi.fn(),
  numberPrompt: vi.fn(),
  selectPrompt: vi.fn(),
  startPrompt: vi.fn(),
  endPrompt: vi.fn(),
}))
vi.mock('./template-config', () => ({
  loadConfigFile: vi.fn(),
  saveConfigFile: vi.fn(),
}));

describe('reliverse-input', () => {
  describe('getInputDataBySchema', () => {
    it('should load data from file in non-interactive mode', async () => {
      const mockSchema: InputSchema = { name: 'test', type: 'string' };
      const options = { nonInteractive: true, rootDir: '/mock/path', dataPath: '/mock/path/data.json' };
      const mockData = { test: 'loaded-data' };

      // Mock file existence and content
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(loadConfigFile).mockReturnValue(mockData);

      const result = await getInputDataBySchema(mockSchema, options);
      expect(result).toEqual(mockData);
      expect(loadConfigFile).toHaveBeenCalledWith('/mock/path/data.json');
    });

    it('should generate default data if file does not exist', async () => {
      const mockSchema: InputSchema = { name: 'test', type: 'string', default: 'default-value' };
      const options = { nonInteractive: true, rootDir: '/mock/path', dataPath: '/mock/path/data.json', data: {other: 'data'}};

      // Mock file does not exist
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await getInputDataBySchema(mockSchema, options);
      expect(result).toEqual({ test: 'default-value', other: 'data' });
    });
  });

  describe('generateDefaultDataFromSchema', () => {
    it('should generate default data for string type', () => {
      const schema: InputSchema = { name: 'name', type: 'string', default: 'John Doe' };
      const result = generateDefaultDataFromSchema(schema);
      expect(result).toEqual({ name: 'John Doe' });
    });

    it('should generate default data for nested object', () => {
      const schema: InputSchema = {
        name: 'user',
        type: 'object',
        properties: {
          name: { name: 'name', type: 'string', default: 'Alice' },
          age: { name: 'age', type: 'integer', default: 30 },
        },
      };
      const result = generateDefaultDataFromSchema(schema);
      expect(result).toEqual({ user: { name: 'Alice', age: 30 } });
    });
  });

  describe('getDataFromInput', () => {
    it('should handle string prompt correctly', async () => {
      const schema: InputSchema = { name: 'name', type: 'string', default: 'John' };
      const mockInputPrompt = vi.fn().mockResolvedValue('Alice');
      vi.mocked(inputPrompt).mockImplementation(mockInputPrompt);

      const result = await getDataFromInput(schema);
      expect(result).toBe('Alice');
      expect(mockInputPrompt).toHaveBeenCalledWith(expect.objectContaining({ title: 'name', defaultValue: 'John' }));
    });

    it('should handle number prompt correctly', async () => {
      const schema: InputSchema = { name: 'age', type: 'integer', default: 25 };
      const mockNumberPrompt = vi.fn().mockResolvedValue(30);
      vi.mocked(numberPrompt).mockImplementation(mockNumberPrompt);

      const result = await getDataFromInput(schema);
      expect(result).toBe(30);
      expect(mockNumberPrompt).toHaveBeenCalledWith(expect.objectContaining({ title: 'age', defaultValue: 25 }));
    });

    it('should handle boolean prompt correctly', async () => {
      const schema: InputSchema = { name: 'confirm', type: 'boolean', default: true };
      const mockConfirmPrompt = vi.fn().mockResolvedValue(false);
      vi.mocked(confirmPrompt).mockImplementation(mockConfirmPrompt);

      const result = await getDataFromInput(schema);
      expect(result).toBe(false);
      expect(mockConfirmPrompt).toHaveBeenCalledWith(expect.objectContaining({ title: 'confirm', defaultValue: true }));
    });
  });

  describe('handleArrayPrompt', () => {
    it('should collect array items until user finishes', async () => {
      const schema: InputSchema = {
        name: 'languages',
        type: 'array',
        items: { type: 'string' },
        maxPick: 3,
      };
      const mockInputPrompt = vi.fn()
        .mockResolvedValueOnce('JavaScript')
        .mockResolvedValueOnce('TypeScript')
        .mockResolvedValueOnce('');
      vi.mocked(inputPrompt).mockImplementation(mockInputPrompt);

      const result = await handleArrayPrompt(schema);
      expect(result).toEqual(['JavaScript', 'TypeScript']);
    });
  });

  describe('handleEnumPrompt', () => {
    it('should handle single-select enum prompt', async () => {
      const schema: InputSchema = {
        name: 'language',
        type: 'string',
        enum: ['JavaScript', 'TypeScript', 'Python'],
        default: 'TypeScript',
      };
      const mockSelectPrompt = vi.fn().mockResolvedValue('Python');
      vi.mocked(selectPrompt).mockImplementation(mockSelectPrompt);

      const result = await handleEnumPrompt(schema);
      expect(result).toBe('Python');
    });

    it('should handle multi-select enum prompt', async () => {
      const schema: InputSchema = {
        name: 'languages',
        type: 'array',
        enum: ['JavaScript', 'TypeScript', 'Python'],
        minPick: 1,
        maxPick: 2,
      };
      const mockMultiSelectPrompt = vi.fn().mockResolvedValue(['JavaScript', 'Python']);
      vi.mocked(multiselectPrompt).mockImplementation(mockMultiSelectPrompt);

      const result = await handleEnumPrompt(schema);
      expect(result).toEqual(['JavaScript', 'Python']);
    });
  });
});

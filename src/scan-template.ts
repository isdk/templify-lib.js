import { readFile } from "fs/promises";
import path from 'path';
import { glob, toCapitalCase, traverseFolder } from "@isdk/util";
import { StringTemplate } from "@isdk/template-engines";

import { DefaultAllTextFiles, DefaultTemplifyConfigFileName, TemplateConfig, loadConfigFile, normalizeIncludeFiles, saveConfigFile } from "./template-config.js";
import { getIgnoreFiles } from "./get-ignore-files.js";
import type { InputSchema } from "./input-type.js";

/**
 * Scans the specified template directory to identify template files and extract variable information.
 * It updates the configuration file with the discovered template files and their parameters.
 *
 * @param templateDir - The directory path where the template files are located.
 * @param options - Optional configuration for the scan, including file filters and dry-run mode.
 * @returns A promise that resolves to the number of template files found during the scan.
 *
 * @example
 * ```typescript
 * import { scanTemplate } from '@isdk/templify-lib';
 *
 * async function example() {
 *   const templateDir = '/path/to/template/directory';
 *   const options = {
 *     files: ['*.txt', '*.json'], // Specify file patterns to include
 *     dryRun: true // Enable dry-run mode to prevent saving the configuration
 *   };
 *
 *   const found = await scanTemplate(templateDir, options);
 *   console.log(`Found ${found} template files.`);
 * }
 *
 * example();
 * ```
 */
export async function scanTemplate(templateDir: string, options?: TemplateConfig) {
  // let templateConfig: TemplateConfig = {
  //   files: DefaultAllTextFiles,
  //   parameters: {},
  //   clean: [],
  //   templateFormat: 'json'
  // };
  const templifyConfigFilepath = path.join(templateDir, DefaultTemplifyConfigFileName);
  const tempifyConfig: any = loadConfigFile(templifyConfigFilepath, {externalFile: 'README.md'}) || {};
  const files: string[] = normalizeIncludeFiles(tempifyConfig.files || []);
  const parameters = tempifyConfig.parameters || {};
  const defaultAllTextFiles: string[] = []
  DefaultAllTextFiles.forEach(file => {
    if (!defaultAllTextFiles.includes(file)) {
      defaultAllTextFiles.push(file);
    }
    if (file.startsWith('**')) {
      file = '.' + file
      if (!defaultAllTextFiles.includes(file)) {defaultAllTextFiles.push(file)}
    }
  })
  const searchFiles: string[] = options?.files as any || defaultAllTextFiles;
  const ignoreFiles: string[] = getIgnoreFiles(templateDir, options);
  searchFiles.push(...ignoreFiles.map(s => s[0] === '!' ? s.slice(1) : `!${s}`))
  const templateFormat = tempifyConfig.templateFormat;

  let found = 0;
  await traverseFolder(templateDir, async (filePath, entry) => {
    const isDir = entry.isDirectory();
    if (isDir) {
      const stopped = glob(filePath, ignoreFiles, templateDir);
      if (stopped) return stopped;
    }

    const variableNames = tryGetVariables(entry.name, templateFormat);
    if (variableNames) {
      const filename = path.relative(templateDir, filePath);
      console.log(`scan found template variable on filename: ${filename}`);
      applyVariables(variableNames, parameters);
      if (!files.includes(filename)) {
        files.push(filename);
      }
      found++;
    }

    if (!isDir && glob(filePath, searchFiles, templateDir)) {
      console.log(`scanning ${filePath}`)
      const content = await readFile(filePath, 'utf8');
      const variableNames = tryGetVariables(content, templateFormat);
      if (variableNames) {
        const filename = path.relative(templateDir, filePath);
        console.log(`  found template file: ${filename}`);
        applyVariables(variableNames, parameters);
        if (!files.includes(filename)) {
          files.push(filename);
        }
        found++;
      }
    }
  })

  if (found) {
    console.log(`Scanned. found ${found} template files`);
    tempifyConfig.files = files;
    tempifyConfig.parameters = parameters;
    if (!options?.dryRun) {
      saveConfigFile(templifyConfigFilepath, tempifyConfig);
      console.log(`Saved ${templifyConfigFilepath}`);
    }
  }

  return found
}

function tryGetVariables(content: string, templateFormat: string) {
  let result: string[] | undefined;
  if (StringTemplate.isTemplate({template: content, templateFormat})) {
    const template: any = new StringTemplate(content, {templateFormat});
    if (template.getVariables) {
      const variableNames: string[] = template.getVariables();
      if (Array.isArray(variableNames) && variableNames.length) {
        result = variableNames;
      }
    }
  }
  return result;
}

function applyVariables(newVars: string[], resultParams: Record<string, InputSchema>) {
  for (const variableName of newVars) {
    if (resultParams[variableName] == null) {
      resultParams[variableName] = {
        name: variableName,
        type: 'string',
        title: toCapitalCase(variableName),
        description: `Enter ${variableName} here`,
        default: ''
      };
    }
  }
}

import { readFile } from "fs/promises";
import path from 'path';
import { glob, toCapitalCase, traverseFolder } from "@isdk/util";
import { StringTemplate } from "@isdk/template-engines";

import { DefaultAllTextFiles, DefaultTemplifyConfigFileName, TemplateConfig, loadConfigFile, normalizeIncludeFiles, saveConfigFile } from "./template-config.js";
import { getIgnoreFiles } from "./get-ignore-files.js";

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
  const searchFiles: string[] = options?.files as any || DefaultAllTextFiles;
  const ignoreFiles: string[] = getIgnoreFiles(templateDir, options);
  searchFiles.push(...ignoreFiles.map(s => s[0] === '!' ? s.slice(1) : `!${s}`))

  let found = 0;
  await traverseFolder(templateDir, async (filePath, entry) => {
    if (entry.isDirectory()) {
      const stopped = glob(filePath, ignoreFiles, templateDir);
      return stopped;
    }
    if (glob(filePath, searchFiles, templateDir)) {
      console.log(`scanning ${filePath}`)
      const content = await readFile(filePath, 'utf8');
      if (StringTemplate.isTemplate({template: content, templateFormat: tempifyConfig.templateFormat})) {
        const filename = path.relative(templateDir, filePath);
        console.log(`  found template file: ${filename}`);
        const template: any = new StringTemplate(content, {templateFormat: tempifyConfig.templateFormat});
        if (template.getVariables) {
          const variableNames: string[] = template.getVariables();
          if (Array.isArray(variableNames)) {
            variableNames.forEach((variableName) => {
              if (parameters[variableName] == null) {
                parameters[variableName] = {
                  name: variableName,
                  type: 'string',
                  title: toCapitalCase(variableName),
                  description: `Enter ${variableName} here`,
                  default: ''
                };
              }
            });
          }
        }
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

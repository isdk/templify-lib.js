import { existsSync, readFileSync } from "fs";
import { readFile } from "fs/promises";
import path from 'path';
import { glob, toCapitalCase, traverseFolder } from "@isdk/util";
import { isBinaryFile } from "isbinaryfile";
import { StringTemplate } from "@isdk/template-engines";

import { DefaultAllTextFiles, DefaultTemplifyConfigFileName, TemplateConfig, loadConfigFile, normalizeIncludeFiles, saveConfigFile } from "./template-config.js";
import { getIgnoreFiles } from "./get-ignore-files.js";

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

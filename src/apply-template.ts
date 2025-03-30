import path from 'path';
import { type Dirent } from "fs";
import { readFile, rm, writeFile } from "fs/promises";
import { StringTemplate } from "@isdk/template-engines";
import { glob, traverseFolder } from "@isdk/util";

import { TemplateConfig, normalizeIncludeFiles } from "./template-config.js";
import { getIgnoreFiles } from "./get-ignore-files.js";

export async function applyTemplate(templateDir: string, options: TemplateConfig) {
  const files = normalizeIncludeFiles(options.files || [])
  const data = options.parameters
  if (!data || Object.keys(data).length === 0) {
    console.log('no parameters to apply')
    return
  }

  const cleanFiles = options.clean
  const hasCleanFiles = Array.isArray(cleanFiles) && cleanFiles.length > 0
  const ignoreFiles: string[] = getIgnoreFiles(templateDir, options);

  const templateFormat = options.templateFormat || 'hf'
  await traverseFolder(templateDir, async (filePath, entry: Dirent) => {
    if (hasCleanFiles && glob(filePath, cleanFiles, templateDir)) {
      filePath = path.join(templateDir, filePath)
      console.log(`delete: ${filePath}`)
      if (!options.dryRun) {
        try {
          await rm(filePath, {recursive: true, force: true})
          if (entry.isDirectory()) {
            return true
          }
        } catch (error) {
          console.error(`Error deleting directory: ${filePath}`)
          console.error(error)
          return true
        }
      }
    } else if (entry.isDirectory()) {
      const stopped = glob(filePath, ignoreFiles, templateDir)
      if (stopped) { return stopped }
    } else if (entry.isFile() && glob(filePath, files, templateDir)) {
      const template = await readFile(filePath, 'utf8')
      const content = await StringTemplate.formatIf({template, data, templateFormat})
      if (content && content !== template) {
        if (!options.dryRun) {
          await writeFile(filePath, content, 'utf8')
          console.log(`apply template: ${filePath} saved.`)
        } else {
          // console.log(content)
          console.log(`apply template: ${filePath} done.`)
        }
      } else {
        console.log(`apply template: ${filePath} no change`)
      }
    } else {
      console.log(`skip: ${filePath}`)
    }
  })
  console.log(`Appied. Enjoy your project at ${templateDir}`)
}

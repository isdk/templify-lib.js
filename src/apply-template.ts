import path from 'path';
import { type Dirent } from "fs";
import { readFile, rm, writeFile } from "fs/promises";
import { StringTemplate } from "@isdk/template-engines";
import { glob, traverseFolder } from "@isdk/util";

import { TemplateConfig, normalizeIncludeFiles } from "./template-config.js";
import { getIgnoreFiles } from "./get-ignore-files.js";

/**
 * Applies a template to files within a specified directory based on the provided configuration.
 *
 * This function processes files in the given `templateDir` by applying a template engine to files that match the specified patterns.
 * It supports cleaning up files, ignoring specific files, and applying templates conditionally. The function can also operate in "dry run" mode,
 * where changes are logged but not applied to the file system.
 *
 * @param templateDir - The directory containing the template files to process.
 * @param options - Configuration options for applying the template.
 *
 * @remarks
 * The function performs the following steps:
 * 1. Normalizes the list of files to include based on the `options.files`.
 * 2. Checks if there are parameters available to apply the template. If no parameters exist, the function exits early.
 * 3. Determines which files should be cleaned (deleted) based on the `options.clean` property.
 * 4. Traverses the folder structure starting from `templateDir`, processing each file or directory:
 *    - Deletes files/directories that match the clean patterns.
 *    - Ignores files/directories that match the ignore patterns.
 *    - Applies the template engine to files that match the include patterns.
 * 5. Logs the result of each operation, including deletions, template applications, and skipped files.
 *
 * @example
 * ```typescript
 * import { applyTemplate } from './apply-template';
 *
 * const templateDir = '/path/to/template';
 * const options = {
 *   files: ['*.txt', '*.md'], // Include only .txt and .md files
 *   parameters: { name: 'John Doe', project: 'My Awesome Project' }, // Template variables
 *   clean: ['*.bak'], // Delete all .bak files
 *   dryRun: false, // Set to true to simulate the process without making changes
 *   templateFormat: 'hf' // Template format
 * };
 *
 * await applyTemplate(templateDir, options);
 * // Output:
 * // delete: /path/to/template/example.bak
 * // apply template: /path/to/template/example.txt saved.
 * // skip: /path/to/template/ignored-file.log
 * // Appied. Enjoy your project at /path/to/template
 * ```
 *
 * @throws
 * Throws an error if there is an issue deleting a directory or reading/writing a file.
 */
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
  let found = 0

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
        found++
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
  return found
}

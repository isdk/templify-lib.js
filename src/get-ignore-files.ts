import { existsSync, readFileSync } from "fs";
import path from 'path';
import { type TemplateConfig } from "./template-config";

/**
 * Retrieves a list of files to be ignored based on the provided template directory and optional configuration.
 * If a `.gitignore` file exists in the template directory, its contents are parsed and added to the ignore list.
 * Additionally, `.gitignore` and `.git` are always added to the ignore list.
 *
 * @param templateDir - The directory of the template where the `.gitignore` file is located.
 * @param options - Optional configuration object that may contain an `ignoreFiles` array.
 * @returns An array of file paths or patterns to be ignored.
 *
 * @example
 * ```typescript
 * import { getIgnoreFiles } from './get-ignore-files';
 *
 * const templateDir = '/path/to/template';
 * const options = {
 *   ignoreFiles: ['node_modules', 'dist']
 * };
 *
 * const ignoreFiles = getIgnoreFiles(templateDir, options);
 * console.log(ignoreFiles);
 * // Output might look like:
 * // ['node_modules', 'dist', '.gitignore', '.git', 'build/', '*.log']
 * ```
 */
export function getIgnoreFiles(templateDir: string, options?: TemplateConfig) {
  const ignoreFiles: string[] = options?.ignoreFiles as any || [];
  const gitignoreFilepath = path.join(templateDir, '.gitignore');
  if (existsSync(gitignoreFilepath)) {
    const content = readFileSync(gitignoreFilepath, 'utf8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line !== '' && !line.startsWith('#'));
    ignoreFiles.push(...lines);
  }
  ignoreFiles.push('.gitignore', '.git');
  return ignoreFiles
}

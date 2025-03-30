import { existsSync, readFileSync } from "fs";
import path from 'path';
import { type TemplateConfig } from "./template-config";

export function getIgnoreFiles(templateDir: string, options?: TemplateConfig) {
  const ignoreFiles: string[] = options?.ignoreFiles as any || [];
  const gitignoreFilepath = path.join(templateDir, '.gitignore');
  if (existsSync(gitignoreFilepath)) {
    const content = readFileSync(gitignoreFilepath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim()).map(line => line.trim());
    ignoreFiles.push(...lines);
  }
  ignoreFiles.push('.gitignore', '.git');
  return ignoreFiles
}

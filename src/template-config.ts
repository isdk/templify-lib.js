import { ConfigFile, type LoadConfigFileOptions, type IncludeFiles } from '@isdk/util'
import { InputSchema } from './input-schema'

export {DefaultAllTextFiles, normalizeIncludeFiles} from '@isdk/util'

export const DefaultTemplifyConfigFileName = '.templify.yaml'
export const DefaultDataFileName = 'templify-data'

export interface TemplateConfig {
  files?: string[]|IncludeFiles
  parameters?: Record<string, InputSchema>
  clean?: string[]
  templateFormat?: string
  dryRun?: boolean
  ignoreFiles?: string[]
}

export function saveConfigFile(filename: string, config: any, options?: LoadConfigFileOptions) {
  return ConfigFile.saveSync(filename, config, options)
}

export function loadConfigFile(filename: string, options?: LoadConfigFileOptions) {
  return ConfigFile.loadSync(filename, options)
}

export function existsConfigFile(filename: string) {
  return ConfigFile.existsSync(filename)
}

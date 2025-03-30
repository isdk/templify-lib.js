import { ConfigFile, type LoadConfigFileOptions, type IncludeFiles } from '@isdk/util'

export {DefaultAllTextFiles, normalizeIncludeFiles} from '@isdk/util'

export const DefaultTemplifyConfigFileName = '.templify.yaml'
export const DefaultDataFileName = 'templify-data'

export interface TemplateParameterItem {
  name?: string
  description?: string
  type?: string
  default?: any
  choices?: string[]
}

export interface TemplateConfig {
  files?: string[]|IncludeFiles
  parameters?: Record<string, TemplateParameterItem>
  clean?: string[]
  templateFormat?: string
  dryRun?: boolean
  ignoreFiles?: string[]
}

export function saveConfigFile(filename: string, config: any, options?: LoadConfigFileOptions) {
  return ConfigFile.save(filename, config, options)
}

export function loadConfigFile(filename: string, options?: LoadConfigFileOptions) {
  return ConfigFile.load(filename, options)
}

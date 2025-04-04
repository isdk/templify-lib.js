import path from "path";
import { existsSync } from "fs";
import {
  inputPrompt,
  selectPrompt,
  multiselectPrompt,
  numberPrompt,
  confirmPrompt,
  msg,
  startPrompt,
  endPrompt,
} from "@reliverse/prompts";
import type { PromptOptions } from "@reliverse/prompts";

import { InputSchema } from "./input-schema";
import { loadConfigFile, saveConfigFile } from "./template-config";
import pkg from "../package.json" with { type: "json" };

type PreventWrongTerminalSizeOptions = {
  isDev?: boolean;
  shouldExit?: boolean;
  minWidth?: number;
  minHeight?: number;
  sizeErrorDescription?: string;
};

type StartPromptOptions = PromptOptions & {
  clearConsole?: boolean;
  horizontalLine?: boolean;
  horizontalLineLength?: number;
  packageName?: string;
  packageVersion?: string;
  terminalSizeOptions?: PreventWrongTerminalSizeOptions;
  isDev?: boolean;
  prevent?: {
    unsupportedTTY?: boolean;
    wrongTerminalSize?: boolean;
    windowsHomeDirRoot?: boolean;
  };
};

export interface ProcessSchemaOptions {
  displayInstructions?: boolean;
  title?: string;
  description?: string;
  nonInteractive?: boolean;
  rootDir: string;
  dataPath?: string;
  defaultDataFileName?: string;
  data?: any;
  dryRun?: boolean;
  packageName?: string;
  packageVersion?: string;
}

export const basicStartPromptConfig = {
  titleColor: "cyan",
  borderColor: "dim",
  packageName: pkg.name,
  packageVersion: pkg.version,
} satisfies StartPromptOptions;

export const extendedStartPromptConfig = {
  ...basicStartPromptConfig,
  contentTypography: "italic",
  contentColor: "dim",
} satisfies StartPromptOptions;

export async function getInputDataBySchema(schema: InputSchema, options: ProcessSchemaOptions) {
  let data: any
  const nonInteractive = options.nonInteractive;
  let dataPath: string|undefined;
  if (nonInteractive) {
    dataPath = options.dataPath;
    if (!dataPath) {
      dataPath = options.defaultDataFileName ?? 'templify-data';
    }
    const rootDir = options.rootDir;
    if (!path.isAbsolute(dataPath)) {dataPath = path.join(rootDir, dataPath)}

    if (existsSync(dataPath)) {
      data = loadConfigFile(dataPath);
    } else {
      data = generateDefaultDataFromSchema(schema);
    }

  } else {
    data = await getDataFromInput(schema, options);
  }

  if (options.data) {
    data = {...data, ...options.data};
  }

  if (dataPath && !options.dryRun) {saveConfigFile(dataPath, data);}

  return data
}


// walk through the schema and generate default data for non-interactive mode
export function generateDefaultDataFromSchema(schema: InputSchema, result: any = {}) {
  if (!schema.name) {schema.name = 'unknown'}
  switch (schema.type) {
    case 'string': {
      result[schema.name] = schema.default || '';
    } break;
    case 'integer':
    case 'number': {
      result[schema.name] = schema.default || 0;
    } break;
    case 'boolean': {
      result[schema.name] = schema.default || true;
    } break;
    case 'array': {
      result[schema.name] = schema.default || [];
      if (result[schema.name].length === 0) {
        const itemSchema = schema.items! || {};
        if (!itemSchema.type) {itemSchema.type = 'string'}
        result.push(generateDefaultDataFromSchema(itemSchema));
      }
    } break;
    case 'object': {
      const o = result[schema.name] = {};
      for (const [name, propSchema] of Object.entries(schema.properties || {})) {
        generateDefaultDataFromSchema({...propSchema, name}, o);
      }
    }
  }
  return result;
}

export async function getDataFromInput(schema: InputSchema, options?: Partial<ProcessSchemaOptions>): Promise<any> {
  if (schema.enum) {
    return await handleEnumPrompt(schema, options)
  }

  try {
    switch (schema.type) {
      case 'string':
        return await handleStringPrompt(schema, options);

      case 'number':
      case 'integer':
        return await handleNumberPrompt(schema, options);

      case 'boolean':
        return await handleBooleanPrompt(schema, options);

      case 'array':
        return handleArrayPrompt(schema, options);

      case 'object':
        return handleObject(schema, options);

      default:
        throw new Error(`Unsupported type: ${schema.type}`);
    }
  } catch (error) {
    msg({
      ...options,
      type: 'M_ERROR',
      title: `Error processing ${schema.name}`,
      content: String(error)
    } as any);
    return schema.default;
  }
}

export async function handleObject(schema: InputSchema, options?: Partial<ProcessSchemaOptions>) {
  const obj: Record<string, any> = {};
  const config = {
    ...extendedStartPromptConfig,
    ...options,
    title: schema.title || schema.name,
  }
  await startPrompt(config);
  try {
    for (const [propName, propSchema] of Object.entries(schema.properties || {})) {
      obj[propName] = await getDataFromInput({...propSchema, name: propName}, options);
    }
  } finally {
    await endPrompt(config);
  }
  return obj;
};

export async function handleArrayPrompt(schema: InputSchema, options?: Partial<ProcessSchemaOptions>) {
  const result: any[] = [];
  const maxPick = schema.maxPick || Infinity;
  let i = 0;
  const config = {
    ...extendedStartPromptConfig,
    ...options,
    title: schema.title || schema.name,
  }
  await startPrompt(config);
  try {
    while (i++ < maxPick) {
      const itemType = schema.items as InputSchema || {};
      if (!itemType.type) {
        itemType.type = 'string';
      }
      const value = await getDataFromInput({
        ...itemType,
        title: `Add ${schema.name || itemType.type}[${i}] to array (empty to finish)`
      } as any, options);
      if (value === undefined || value === "") break;
      result.push(value);
    }
    return result;
  } finally {
    await endPrompt(config);
  }
}

export async function handleStringPrompt(schema: InputSchema, options?: Partial<ProcessSchemaOptions>) {
  return await inputPrompt({
    ...options,
    title: schema.title || schema.name,
    defaultValue: schema.default,
    hint: schema.description
  } as any);
}

export async function handleNumberPrompt(schema: InputSchema, options?: Partial<ProcessSchemaOptions>) {
  return await numberPrompt({
    ...options,
    title: schema.title || schema.name!,
    defaultValue: schema.default,
    validate: (value) => {
      const num = Number(value);
      if (isNaN(num)) return 'Invalid number';
      if (schema.type === 'integer' && !Number.isInteger(num)) {
        return 'Must be an integer';
      }
      if (schema.enum && !schema.enum.includes(num)) {
        return `Must be one of: ${schema.enum.join(', ')}`;
      }
      return true;
    }
  });
}

export async function handleBooleanPrompt(schema: InputSchema, options?: Partial<ProcessSchemaOptions>) {
  return await confirmPrompt({
    ...options,
    title: schema.title || schema.name!,
    defaultValue: schema.default
  });
}

export async function handleEnumPrompt(schema: InputSchema, options?: Partial<ProcessSchemaOptions>) {
  const isSingleSelect = (schema.minPick == null && schema.maxPick == null) || (schema.minPick === 1 && schema.maxPick === 1);
  const config: any = {
    ...options,
    title: schema.title || options?.title || schema.name,
    content: schema.description || options?.description,
    options: schema.enum!.map(valueInfo => {
      if (typeof valueInfo !== 'object') {
        valueInfo = {
          value: valueInfo,
          title: String(valueInfo),
        }
      }
      if (!valueInfo.description) {valueInfo.description = valueInfo.value === schema.default ? 'Default' : undefined}
      return ({
      label: valueInfo.title || String(valueInfo.value),
      value: valueInfo.value,
      hint: valueInfo.description,
      })
    }),
  }

  if (isSingleSelect) {
    config.defaultValue = schema.default;
    const selected = await selectPrompt(config);
    return selected;
  }

  const defaultValue = Array.isArray(schema.default) ? schema.default : schema.default != null ? [schema.default] : undefined;
  const selected = await multiselectPrompt({
    ...config,
    defaultValue,
    minSelect: schema.minPick,
    maxSelect: schema.maxPick,
  });
  return schema.uniqueItems === false ? selected : [...new Set(selected)];
}

/*
// 示例使用
const userSchema: InputSchema = {
  name: 'user',
  type: 'object',
  title: 'User Registration',
  properties: {
    personalInfo: {
      name: 'personalInfo',
      type: 'object',
      title: 'Personal Information',
      properties: {
        name: {
          name: 'name',
          type: 'string',
          title: 'Full Name',
          description: 'Your full name',
          default: 'John Doe'
        },
        birthdate: {
          name: 'birthdate',
          type: 'string',
          title: 'Birth Date',
          default: '1990-01-01'
        },
        languages: {
          name: 'languages',
          type: 'array',
          title: 'Programming Languages',
          enum: ['JavaScript', 'TypeScript', 'Python'],
          minPick: 1,
          maxPick: 3
        }
      }
    },
    preferences: {
      name: 'preferences',
      type: 'object',
      title: 'User Preferences',
      properties: {
        darkMode: {
          name: 'darkMode',
          type: 'boolean',
          title: 'Enable Dark Mode',
          default: true
        },
        experienceLevel: {
          name: 'experienceLevel',
          type: 'integer',
          title: 'Experience Level',
          enum: [1, 2, 3],
          default: 2
        }
      }
    }
  }
};

// await startPrompt({...extendedConfig})

// 执行数据收集
getDataFromInput(userSchema, {displayInstructions: true}).then(result => {
  console.log('Final Result:', JSON.stringify(result, null, 2));
});
//*/

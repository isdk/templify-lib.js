[**@isdk/templify-lib**](../README.md)

***

[@isdk/templify-lib](../globals.md) / scanTemplate

# Function: scanTemplate()

> **scanTemplate**(`templateDir`, `options`?): `Promise`\<`number`\>

Defined in: [templify-lib/src/scan-template.ts:36](https://github.com/isdk/templify-lib.js/blob/a4bd00ad1125d7bea4f09fdb1587c7d10c774e22/src/scan-template.ts#L36)

Scans the specified template directory to identify template files and extract variable information.
It updates the configuration file with the discovered template files and their parameters.

## Parameters

### templateDir

`string`

The directory path where the template files are located.

### options?

[`TemplateConfig`](../interfaces/TemplateConfig.md)

Optional configuration for the scan, including file filters and dry-run mode.

## Returns

`Promise`\<`number`\>

A promise that resolves to the number of template files found during the scan.

## Example

```typescript
import { scanTemplate } from '@isdk/templify-lib';

async function example() {
  const templateDir = '/path/to/template/directory';
  const options = {
    files: ['*.txt', '*.json'], // Specify file patterns to include
    dryRun: true // Enable dry-run mode to prevent saving the configuration
  };

  const found = await scanTemplate(templateDir, options);
  console.log(`Found ${found} template files.`);
}

example();
```

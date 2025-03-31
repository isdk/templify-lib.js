[**@isdk/templify-lib**](../README.md)

***

[@isdk/templify-lib](../globals.md) / applyTemplate

# Function: applyTemplate()

> **applyTemplate**(`templateDir`, `options`): `Promise`\<`undefined` \| `number`\>

Defined in: [templify-lib/src/apply-template.ts:55](https://github.com/isdk/templify-lib.js/blob/00a1ac2997e500d54f38cfc631d4a46eca84ffa9/src/apply-template.ts#L55)

Applies a template to files within a specified directory based on the provided configuration.

This function processes files in the given `templateDir` by applying a template engine to files that match the specified patterns.
It supports cleaning up files, ignoring specific files, and applying templates conditionally. The function can also operate in "dry run" mode,
where changes are logged but not applied to the file system.

## Parameters

### templateDir

`string`

The directory containing the template files to process.

### options

[`TemplateConfig`](../interfaces/TemplateConfig.md)

Configuration options for applying the template.

## Returns

`Promise`\<`undefined` \| `number`\>

## Remarks

The function performs the following steps:
1. Normalizes the list of files to include based on the `options.files`.
2. Checks if there are parameters available to apply the template. If no parameters exist, the function exits early.
3. Determines which files should be cleaned (deleted) based on the `options.clean` property.
4. Traverses the folder structure starting from `templateDir`, processing each file or directory:
   - Deletes files/directories that match the clean patterns.
   - Ignores files/directories that match the ignore patterns.
   - Applies the template engine to files that match the include patterns.
5. Logs the result of each operation, including deletions, template applications, and skipped files.

## Example

```typescript
import { applyTemplate } from './apply-template';

const templateDir = '/path/to/template';
const options = {
  files: ['*.txt', '*.md'], // Include only .txt and .md files
  parameters: { name: 'John Doe', project: 'My Awesome Project' }, // Template variables
  clean: ['*.bak'], // Delete all .bak files
  dryRun: false, // Set to true to simulate the process without making changes
  templateFormat: 'hf' // Template format
};

await applyTemplate(templateDir, options);
// Output:
// delete: /path/to/template/example.bak
// apply template: /path/to/template/example.txt saved.
// skip: /path/to/template/ignored-file.log
// Appied. Enjoy your project at /path/to/template
```

## Throws

Throws an error if there is an issue deleting a directory or reading/writing a file.

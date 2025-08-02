[**@isdk/templify-lib**](../README.md)

***

[@isdk/templify-lib](../globals.md) / applyTemplate

# Function: applyTemplate()

> **applyTemplate**(`templateDir`, `options`): `Promise`\<`undefined` \| `number`\>

Defined in: [src/apply-template.ts:66](https://github.com/isdk/templify-lib.js/blob/70f82ca837a8187ba06b8a8f3c7640f3017f6d6d/src/apply-template.ts#L66)

Applies a template to files and directories within a specified directory based on the provided configuration.

This function processes files and directories in the given `templateDir` by applying a template engine to:
- File contents that match the specified patterns.
- Directory names and file names, replacing variables with provided template parameters.

It supports cleaning up files, ignoring specific files/directories, and applying templates conditionally.
The function can also operate in "dry run" mode, where changes are logged but not applied to the file system.

## Parameters

### templateDir

`string`

The directory containing the template files and directories to process.

### options

[`TemplateConfig`](../interfaces/TemplateConfig.md)

Configuration options for applying the template.

## Returns

`Promise`\<`undefined` \| `number`\>

## Remarks

The function performs the following steps:
1. Normalizes the list of files to include based on the `options.files`.
2. Checks if there are parameters available to apply the template. If no parameters exist, the function exits early.
3. Determines which files or directories should be cleaned (deleted) based on the `options.clean` property.
4. Traverses the folder structure starting from `templateDir`, processing each file or directory:
   - Deletes files/directories that match the clean patterns.
   - Ignores files/directories that match the ignore patterns.
   - Applies the template engine to files that match the include patterns.
   - Renames directories and files by replacing variables in their names with values from the template parameters.
5. Logs the result of each operation, including deletions, template applications, renames, and skipped files.

**Directory and File Name Replacement:**
- Directory names and file names can include template variables enclosed in the format supported by the `templateFormat` option.
- Variables in directory and file names will be replaced with corresponding values from `options.parameters`.
- Renaming occurs after traversing the folder structure to ensure all dependent operations are completed first.

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
// rename: /path/to/template/oldName.txt -> /path/to/template/newName.txt
// rename: /path/to/template/oldFolder -> /path/to/template/newFolder
// apply template: /path/to/template/example.txt saved.
// skip: /path/to/template/ignored-file.log
// Applied. Enjoy your project at /path/to/template
```

## Throws

Throws an error if there is an issue deleting a directory, renaming a file/directory, or reading/writing a file.

[**@isdk/templify-lib**](../README.md)

***

[@isdk/templify-lib](../globals.md) / normalizeIncludeFiles

# Function: normalizeIncludeFiles()

> **normalizeIncludeFiles**(`files`?, `defaultFiles`?): `string`[]

Defined in: util/dist/index.d.ts:151

Normalizes a list of file patterns for glob matching.

This function takes either an array of file patterns or an object containing `include` and `exclude` arrays,
and returns a normalized array of file patterns. If no patterns are provided, it defaults to including
all text-based files as defined in `DefaultAllTextFiles`.

## Parameters

### files?

Either an array of file patterns or an object with `include` and `exclude` properties.

`IncludeFiles` | `string`[]

### defaultFiles?

`never`[]

An optional array of default file patterns to use if no include patterns are specified.
                      Defaults to `DefaultAllTextFiles`.

## Returns

`string`[]

A normalized array of file patterns, with excluded patterns prefixed by `!`.

## Example

```typescript
const result = normalizeIncludeFiles({
  include: ['*.ts', '*.js'],
  exclude: ['node_modules/**']
});
console.log(result);
// Output: ['*.ts', '*.js', '!node_modules/**']
```

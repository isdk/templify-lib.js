# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.6.1](https://github.com/isdk/templify-lib.js/compare/v0.6.0...v0.6.1) (2025-08-03)


### Features

* add const DefaultTemplifySchemaName ([ac88ee3](https://github.com/isdk/templify-lib.js/commit/ac88ee319fcbe0d0586d3a29e2502abf3bd79527))
* add existsConfigFile func ([4b962f8](https://github.com/isdk/templify-lib.js/commit/4b962f8f782c205f902516c2f0e2d187456065b6))


### Bug Fixes

* dataPath should check whether in rootDir ([407aeaf](https://github.com/isdk/templify-lib.js/commit/407aeaf33e42287ad80d4753de3f322fbf885f95))
* should load data from schema name ([2021de0](https://github.com/isdk/templify-lib.js/commit/2021de0477eb7d351d355caed33ee96d779c1169))


### Refactor

* add IsDefaultTemplifyDataSymbol and the default schema name templify ([9e12b08](https://github.com/isdk/templify-lib.js/commit/9e12b089ed023480101850db992cb5e56f9fc59a))

## [0.6.0](https://github.com/isdk/templify-lib.js/compare/v0.5.0...v0.6.0) (2025-08-02)


### ⚠ BREAKING CHANGES

* use the new @reliverse/rempts instead of @reliverse/prompts

### Refactor

* use the new @reliverse/rempts instead of @reliverse/prompts ([70f82ca](https://github.com/isdk/templify-lib.js/commit/70f82ca837a8187ba06b8a8f3c7640f3017f6d6d))

## [0.5.0](https://github.com/isdk/templify-lib.js/compare/v0.4.0...v0.5.0) (2025-04-01)


### ⚠ BREAKING CHANGES

* add Directory names and file names to replace variable

### Features

* add Directory names and file names to replace variable ([1d686ff](https://github.com/isdk/templify-lib.js/commit/1d686ffde7ca8f5f9bea8f465f306a124b275165))


### Bug Fixes

* should remove first char "/" in gitignore ([0ec60ef](https://github.com/isdk/templify-lib.js/commit/0ec60efc3fb7af0318ceb185a5ccd665db71ea95))
* should search .dir by default now ([a4bd00a](https://github.com/isdk/templify-lib.js/commit/a4bd00ad1125d7bea4f09fdb1587c7d10c774e22))

## [0.4.0](https://github.com/isdk/templify-lib.js/compare/v0.3.6...v0.4.0) (2025-03-31)


### ⚠ BREAKING CHANGES

* change defaultFiles to []

### Refactor

* change defaultFiles to [] ([9c9e6fa](https://github.com/isdk/templify-lib.js/commit/9c9e6fab88a3640338a82dfbafe2fc64c5e07a38))

## [0.3.6](https://github.com/isdk/templify-lib.js/compare/v0.3.5...v0.3.6) (2025-03-31)


### Bug Fixes

* getInputDataBySchema for nonInteractive should merge options.data ([fbad85c](https://github.com/isdk/templify-lib.js/commit/fbad85c590da544d1cff51f6f632977eefe592bf))
* should skip comment line ([0e78d9e](https://github.com/isdk/templify-lib.js/commit/0e78d9e4c262367b0cc002248fbea3df99f54204))


### Refactor

* follow the @isdk/util ([48c7d6c](https://github.com/isdk/templify-lib.js/commit/48c7d6c3a1d2ab646f694da5f676a5c4e5e551a8))
* only export getInputDataBySchema ([757f435](https://github.com/isdk/templify-lib.js/commit/757f43558fbb958a9193ab49d9b5dbd824350d28))

## [0.3.5](https://github.com/isdk/templify-lib.js/compare/v0.3.4...v0.3.5) (2025-03-31)


### Refactor

* make InputSchema clearer ([2f28ed6](https://github.com/isdk/templify-lib.js/commit/2f28ed63fa1fab14ced4b1f55151d2b7839f83ed))

## [0.3.4](https://github.com/isdk/templify-lib.js/compare/v0.3.3...v0.3.4) (2025-03-30)


### Bug Fixes

* should not stop when deleting raise error on win ([2074257](https://github.com/isdk/templify-lib.js/commit/2074257ae84556236345f69e1a42173a287cae3a))

## [0.3.3](https://github.com/isdk/templify-lib.js/compare/v0.3.2...v0.3.3) (2025-03-30)


### Bug Fixes

* should not stop when deleting raise error on win ([c0f6004](https://github.com/isdk/templify-lib.js/commit/c0f6004b17899f176242398987b532abb576e16b))

## [0.3.2](https://github.com/isdk/templify-lib.js/compare/v0.3.1...v0.3.2) (2025-03-30)


### Bug Fixes

* can not clean files ([8536a8d](https://github.com/isdk/templify-lib.js/commit/8536a8d22a86abe93a71a559c282ac2c3f8e537c))

## [0.3.1](https://github.com/isdk/templify-lib.js/compare/v0.3.0...v0.3.1) (2025-03-30)


### Features

* add getIgnoreFiles func ([7aea430](https://github.com/isdk/templify-lib.js/commit/7aea430dadfbfa5353e77f43e6e7442a0ae9fcce))


### Bug Fixes

* should follow .gitignore and ignoreFiles option ([ec02f05](https://github.com/isdk/templify-lib.js/commit/ec02f05e6f7a37e4b8fe2c2f76d0c014dea6cacf))

## [0.3.0](https://github.com/isdk/templify-lib.js/compare/v0.2.1...v0.3.0) (2025-03-30)


### ⚠ BREAKING CHANGES

* extract lib from templify

### Features

* scan should generate parameters automatically ([840a743](https://github.com/isdk/templify-lib.js/commit/840a7438c7889f042469376a5b72481d11dba01e))


### Bug Fixes

* **build:** entry index only ([2007636](https://github.com/isdk/templify-lib.js/commit/20076368a2ea63f564fe8b3ad9198a87e993363a))
* package.json path ([1dd41f6](https://github.com/isdk/templify-lib.js/commit/1dd41f623bfe3ede94ce6a1aa2bb29a312d91661))
* **ts:** export InputSchema, ProcessSchemaOptions ([4b11bdf](https://github.com/isdk/templify-lib.js/commit/4b11bdfbcc3468955d4e96a54c0792fd53f151f7))


### Refactor

* change dir struct ([6db5d03](https://github.com/isdk/templify-lib.js/commit/6db5d03e410a39aba1c1a0db0cde7d148e3a446f))
* extract lib from templify ([54e5a04](https://github.com/isdk/templify-lib.js/commit/54e5a04f3b2b648087069ac21b5e26809bf3d15e))
* rename index.js to index.ts ([4e6efc3](https://github.com/isdk/templify-lib.js/commit/4e6efc37d423f4a983be918e8703b4077664c03d))
* use the @isdk/util now ([5384a75](https://github.com/isdk/templify-lib.js/commit/5384a754c2bed221294b4fc7b62fbc092ad6978b))

## [0.2.1](https://github.com/isdk/templify.js/compare/v0.2.0...v0.2.1) (2025-03-29)

## 0.2.0 (2025-03-29)


### ⚠ BREAKING CHANGES

* add scan command

### Features

* add apply as default command ([75f358c](https://github.com/isdk/templify.js/commit/75f358cb5ac159eb2b89f0f2fb555778c55fd6f4))
* add dryRun flag ([b5b2369](https://github.com/isdk/templify.js/commit/b5b236995841dfd8051e2b1c04b24c058bd31d47))
* add dryRun option ([f9421b8](https://github.com/isdk/templify.js/commit/f9421b8ab2b42c785cdf6a5c67354e3c31576189))
* add glob ([3122a0c](https://github.com/isdk/templify.js/commit/3122a0c24562353b9c3b926ed9b22ef7daee3403))
* add scan command ([befa574](https://github.com/isdk/templify.js/commit/befa574db25894b7b8471da4bbdba5520308f562))
* add toTemplateFiles, DefaultTemplifyConfigFileName, DefaultDataFileName and DefaultAllTextFiles ([22f41ef](https://github.com/isdk/templify.js/commit/22f41ef43d276d501d6b7ed8a658d7ff550224ce))


### Bug Fixes

* array type not work ([73508db](https://github.com/isdk/templify.js/commit/73508db19776303229432cee30c87a31bf6af930))


### Refactor

* extract defaultAllTextFiles and toTemplateFiles ([c976c08](https://github.com/isdk/templify.js/commit/c976c084d461a4cfede8e6931fb2059b07bceef3))
* pretty code ([c898f51](https://github.com/isdk/templify.js/commit/c898f51bda5936b6fdda54cca109a80ee278987a))

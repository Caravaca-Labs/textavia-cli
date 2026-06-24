/**
 * @fileoverview Public entrypoint for the textavia CLI package.
 */

export * from './global-options.js';
export * from './argv.js';
export * from './config.js';
export * from './input.js';
export * from './output.js';
export * from './execute.js';
export * from './router.js';
export * from './registry-builder.js';
export { buildCliRegistry, loadOptionalPlugin } from './registry-builder.js';
export { runCli } from './router.js';
export {
  buildHelpText,
  buildHelpProgram,
  main,
  CLI_NAME,
  CLI_VERSION,
} from './cli.js';

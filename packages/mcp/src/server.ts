#!/usr/bin/env node
/**
 * @fileoverview Stdio entrypoint for @textavia/mcp.
 */

import { startStdioServer } from './index.js';

startStdioServer().catch((error) => {
  process.stderr.write(
    `Textavia MCP failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});

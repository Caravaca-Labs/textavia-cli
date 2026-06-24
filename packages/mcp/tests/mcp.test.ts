import { createToolRegistry } from '@textavia/core';
import { registerStandardTools } from '@textavia/plugin-standard';
import { describe, expect, it } from 'vitest';
import { buildMcpToolList, executeMcpTool, mcpToolName } from '../src/index.js';

function registry() {
  const reg = createToolRegistry({ cliName: 'textavia-mcp', version: '0.1.0' });
  registerStandardTools(reg);
  return reg;
}

describe('Textavia MCP adapter', () => {
  it('generates stable agent-friendly tool names', () => {
    expect(mcpToolName('encoding.base64.encode')).toBe(
      'textavia.base64_encode',
    );
    expect(mcpToolName('dev.json.format')).toBe('textavia.json_format');
    expect(mcpToolName('text.clean')).toBe('textavia.text_clean');
  });

  it('filters generated tools by enabled category', () => {
    const tools = buildMcpToolList(registry(), {
      enabledCategories: ['encoding'],
    });
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.every((tool) => tool.category === 'encoding')).toBe(true);
  });

  it('executes registry tools through MCP input arguments', async () => {
    const result = await executeMcpTool(
      registry(),
      'case.camel',
      { input: 'hello world' },
      {},
    );
    expect(result.output).toBe('helloWorld');
  });

  it('blocks filesystem input when disabled', async () => {
    await expect(
      executeMcpTool(
        registry(),
        'dev.json.format',
        { file: 'package.json' },
        { allowFilesystem: false },
      ),
    ).rejects.toThrow('filesystem input is disabled');
  });
});

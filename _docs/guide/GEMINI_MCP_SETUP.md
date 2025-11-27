# Gemini MCP Global Configuration

## Overview

The Gemini MCP server is configured globally in Cursor and should be available in all projects. The configuration is located at:

```
~/.cursor/mcp.json
```

## Current Configuration

The Gemini MCP server is configured with:
- **Command**: `npx`
- **Package**: `aistudio-mcp-server`
- **Environment Variable**: `GEMINI_API_KEY` (set in the config)

## Verification

### How to Verify Gemini MCP is Working

1. **Check MCP Tools Availability**
   - In Cursor, you should have access to Gemini MCP tools
   - The tool `mcp_gemini_generate_content` should be available
   - You can test by asking the AI to use Gemini features

2. **Verify Configuration File**
   ```bash
   cat ~/.cursor/mcp.json | jq '.mcpServers.gemini'
   ```
   This should show the Gemini server configuration with the API key.

3. **Test Package Installation**
   ```bash
   npx -y aistudio-mcp-server --help
   ```
   This verifies the package can be installed and run.

## Configuration Details

The global MCP configuration includes:
- **postgres**: Database MCP server
- **github**: GitHub MCP server
- **filesystem**: Filesystem MCP server (scoped to `/home/kim/CG3_Tech/Projects`)
- **gemini**: Gemini MCP server (available globally)

All servers defined in `mcpServers` are available in all Cursor projects. The `activeMcpServer` field is just a UI preference and doesn't limit server availability.

## Troubleshooting

If Gemini MCP is not working in a project:

1. **Restart Cursor** - Sometimes a restart is needed to load MCP servers
2. **Check API Key** - Verify the `GEMINI_API_KEY` in the config is valid
3. **Verify Package** - Ensure `aistudio-mcp-server` can be installed via npx
4. **Check Logs** - Look for MCP server errors in Cursor's developer console

## Notes

- The configuration is global and applies to all Cursor projects
- No workspace-specific configuration is needed
- The Gemini MCP server should work in any project opened in Cursor
- The filesystem MCP server is scoped to `/home/kim/CG3_Tech/Projects` for security


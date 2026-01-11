# AI Development Tools

This document describes the AI-assisted development tools configured for the EmuZ project.

## Context7 MCP Server

[Context7](https://context7.com/) provides up-to-date library documentation directly in your AI assistant's context. Instead of relying on potentially outdated training data, Context7 fetches current documentation and code examples from the source.

### Configuration

The project includes a pre-configured MCP server in `.vscode/mcp.json`:

```json
{
  "servers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

### Usage

#### Basic Usage

Add `use context7` to any prompt to fetch current library documentation:

```
How do I create a custom hook with Zustand? use context7
```

#### Direct Library References

For faster lookups, specify the library ID directly:

```
Implement a FlatList with pull-to-refresh. use library /react-native/react-native
```

#### Common Library IDs for EmuZ

| Library          | Context7 ID                          |
| ---------------- | ------------------------------------ |
| React Native     | `/react-native/react-native`         |
| Electron         | `/electron/electron`                 |
| Zustand          | `/pmndrs/zustand`                    |
| TailwindCSS      | `/tailwindlabs/tailwindcss`          |
| NativeWind       | `/marklawlor/nativewind`             |
| React Navigation | `/react-navigation/react-navigation` |
| Zod              | `/colinhacks/zod`                    |
| Vitest           | `/vitest-dev/vitest`                 |
| SQLite           | `/nicktrav/sqlite`                   |
| i18next          | `/i18next/react-i18next`             |
| electron-vite    | `/alex8088/electron-vite`            |

### Tips for Effective Usage

1. **Be Specific**: Include version numbers when relevant

   ```
   How do I configure React Navigation 7 stack navigator? use context7
   ```

2. **Combine with Project Context**: Reference project files for better results

   ```
   Looking at libs/ui/src/components, create a GameCard component following the same patterns. use library /react-native/react-native
   ```

3. **Multi-Library Queries**: Specify multiple libraries when needed
   ```
   Create a Zustand store that persists data with SQLite. use library /pmndrs/zustand
   ```

## Nx MCP Server

The project also supports [Nx MCP](https://nx.dev/) tools for workspace management. These tools help with:

- Understanding the monorepo structure
- Running generators for new components/libraries
- Viewing project dependencies
- Executing tasks efficiently

### Available Nx Tools

| Tool                 | Description                               |
| -------------------- | ----------------------------------------- |
| `nx_workspace`       | Get workspace structure and configuration |
| `nx_project_details` | Get details for a specific project        |
| `nx_generators`      | List available code generators            |
| `nx_run_generator`   | Run a generator with pre-filled options   |
| `nx_visualize_graph` | Visualize project/task dependencies       |
| `nx_docs`            | Search Nx documentation                   |

## Best Practices

### Writing Effective Prompts

1. **Include File Context**: Reference relevant files

   ```
   Looking at apps/mobile/src/screens/LibraryScreen.tsx, add a search filter feature. use context7
   ```

2. **Specify Patterns**: Mention architectural patterns

   ```
   Create a new service in libs/core following the existing LibraryService pattern. use library /react-native/react-native
   ```

3. **Request Tests**: Include testing requirements
   ```
   Add unit tests for GameService using Vitest. use library /vitest-dev/vitest
   ```

### Code Generation Workflow

1. **Understand First**: Ask for documentation before implementing

   ```
   Explain how React Navigation nested navigators work. use context7
   ```

2. **Generate with Context**: Include project specifics

   ```
   Create a new screen for game details following our navigation patterns. use library /react-navigation/react-navigation
   ```

3. **Iterate**: Refine based on project conventions
   ```
   Update the component to use our existing translation keys from libs/i18n
   ```

## Troubleshooting

### Context7 Not Working

1. **Check Node.js version**: Requires Node.js >= 18

   ```bash
   node --version
   ```

2. **Verify MCP configuration**: Ensure `.vscode/mcp.json` exists

3. **Check network**: Context7 requires internet access

### Rate Limits

For higher rate limits, get a free API key at [context7.com/dashboard](https://context7.com/dashboard) and add it to the configuration:

```json
{
  "servers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "env": {
        "CONTEXT7_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

## Resources

- [Context7 Website](https://context7.com/)
- [Context7 GitHub](https://github.com/upstash/context7)
- [Nx Documentation](https://nx.dev/)
- [MCP Specification](https://modelcontextprotocol.io/)

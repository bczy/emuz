# Contributing to EmuZ

Thank you for your interest in contributing to EmuZ! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- **Node.js**: v22 LTS
- **pnpm**: v9.x
- **Git**: Latest stable version
- **IDE**: VS Code recommended (with ESLint, Prettier extensions)

### AI-Assisted Development (Recommended)

The project is configured with **Claude Code** as the primary AI assistant, with **Context7 MCP** for up-to-date library documentation. Project instructions are in `CLAUDE.md` at the root.

**Setup:**

- Install Claude Code: `npm install -g @anthropic-ai/claude-code`
- Run `claude` in the project root — it will automatically pick up `CLAUDE.md`
- Context7 and Nx MCP servers are pre-configured in `docs/ai-tools.md`

**Usage Tips:**

- Add `use context7` to your prompts to fetch current documentation
- Specify library IDs directly: `use library /react-native/react-native`
- Works with React Native, Electron, Zustand, TailwindCSS, and all project dependencies

### Optional (for mobile development)

- **Xcode**: 15+ (for iOS)
- **Android Studio**: Latest stable (for Android)
- **CocoaPods**: Latest (for iOS dependencies)

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/emuz.git
   cd emuz
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

4. **Build all packages**:

   ```bash
   pnpm nx run-many -t build
   ```

5. **Run the desktop app**:
   ```bash
   pnpm nx serve desktop
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-widget-customization`
- `fix/scan-directory-crash`
- `docs/update-readme`
- `refactor/library-service`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:

```
feat(ui): add game card context menu
fix(scanner): handle symbolic links correctly
docs(readme): update installation instructions
test(core): add LibraryService unit tests
```

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. **Update documentation** — if your PR adds or modifies a public API, update the relevant `README.md` and `docs/api.md` in the same PR. PRs that change APIs without updating docs will be rejected. See [Documentation Guidelines](documentation-guidelines.md).
4. Run tests: `pnpm nx run-many -t test`
5. Run linting: `pnpm nx run-many -t lint`
6. Push your branch and create a PR
7. Fill out the PR template
8. Wait for review

> **Documentation language**: All documentation must be written in English. This applies to READMEs, `docs/`, and public API comments.

## Project Structure

```
emuz/
├── apps/
│   ├── desktop/          # Electron desktop app
│   └── mobile/           # React Native mobile app
├── libs/
│   ├── core/             # Business logic, models, services
│   ├── database/         # SQLite database layer
│   ├── emulators/        # Emulator definitions and detection
│   ├── i18n/             # Internationalization
│   ├── platform/         # Platform-specific adapters
│   └── ui/               # Shared UI components
├── docs/                 # Documentation
└── .github/              # GitHub workflows and templates
```

## Code Style

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Prefer `interface` over `type` for object shapes
- Use explicit return types for public functions

```typescript
// Good
interface GameCardProps {
  game: Game;
  onPress?: (game: Game) => void;
}

export function GameCard({ game, onPress }: GameCardProps): JSX.Element {
  // ...
}

// Avoid
export const GameCard = (props: any) => {
  // ...
};
```

### React

- Use functional components with hooks
- Extract logic into custom hooks
- Keep components focused and composable
- Use proper prop types

```typescript
// Good
function useGameSearch(query: string) {
  const [results, setResults] = useState<Game[]>([]);
  // ...
  return { results, isLoading };
}

// Component
function SearchResults({ query }: { query: string }) {
  const { results, isLoading } = useGameSearch(query);
  // ...
}
```

### CSS/Styling

- Use TailwindCSS utility classes
- Create component variants with `clsx` or similar
- Follow the design system tokens

```tsx
// Good
<button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
  Play
</button>;

// For variants
const buttonVariants = {
  primary: 'bg-emerald-500 hover:bg-emerald-600',
  secondary: 'bg-slate-600 hover:bg-slate-700',
};
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm nx run-many -t test

# Run tests for a specific package
pnpm nx test core
pnpm nx test database

# Run tests with coverage
pnpm nx test core --coverage

# Run tests in watch mode
pnpm nx test core --watch
```

### Writing Tests

We use Vitest for unit tests. Tests should be:

- Focused on one thing
- Independent of each other
- Fast and reliable

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LibraryService', () => {
  let service: LibraryService;
  let mockAdapter: MockDatabaseAdapter;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    service = new LibraryService(mockAdapter);
  });

  describe('getAllGames', () => {
    it('should return all games with pagination', async () => {
      mockAdapter.query.mockResolvedValueOnce([
        /* mock data */
      ]);

      const games = await service.getAllGames({ page: 1, limit: 10 });

      expect(games).toHaveLength(/* expected */);
    });
  });
});
```

### Test Coverage

We aim for:

- **Unit tests**: >80% coverage for services
- **Component tests**: Key UI components
- **E2E tests**: Critical user flows

## Adding New Features

### 1. Models (libs/core/src/models)

Define data structures with Zod validation:

```typescript
import { z } from 'zod';

export const MyModelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  // ...
});

export type MyModel = z.infer<typeof MyModelSchema>;
```

### 2. Database Schema (libs/database/src/schema)

Add table definitions:

```typescript
export const myTable = {
  name: 'my_table',
  columns: {
    id: 'TEXT PRIMARY KEY',
    name: 'TEXT NOT NULL',
    created_at: 'INTEGER NOT NULL',
  },
  indexes: ['name'],
};
```

### 3. Migrations (libs/database/src/migrations)

Create a new migration file:

```typescript
export const migration_002_add_my_table: Migration = {
  version: 2,
  up: async (db) => {
    await db.execute(`
      CREATE TABLE my_table (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  },
  down: async (db) => {
    await db.execute('DROP TABLE my_table');
  },
};
```

### 4. Services (libs/core/src/services)

Create service with interface:

```typescript
export interface IMyService {
  getAll(): Promise<MyModel[]>;
  getById(id: string): Promise<MyModel | null>;
  create(input: CreateMyModelInput): Promise<MyModel>;
}

export class MyService implements IMyService {
  constructor(private db: DatabaseAdapter) {}

  async getAll(): Promise<MyModel[]> {
    const rows = await this.db.query('SELECT * FROM my_table');
    return rows.map(rowToModel);
  }
  // ...
}
```

### 5. UI Components (libs/ui/src/components)

Create component with proper structure:

```
MyComponent/
├── MyComponent.tsx
├── MyComponent.test.tsx (optional)
└── index.ts
```

```typescript
// MyComponent.tsx
export interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className="...">
      {/* ... */}
    </div>
  );
}

// index.ts
export * from './MyComponent';
```

## Internationalization

### Adding Translations

1. Add keys to English locale first (`libs/i18n/src/locales/en/`)
2. Add translations to other locales

```json
// libs/i18n/src/locales/en/common.json
{
  "myFeature": {
    "title": "My Feature",
    "description": "Description of my feature"
  }
}
```

### Using Translations

```tsx
import { useTranslation } from '@emuz/i18n';

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t('myFeature.title')}</h1>;
}
```

## Reporting Issues

### Bug Reports

Include:

1. EmuZ version
2. Operating system and version
3. Steps to reproduce
4. Expected vs actual behavior
5. Screenshots if applicable
6. Error messages/logs

### Feature Requests

Include:

1. Clear description of the feature
2. Use case / why it's needed
3. Possible implementation approach
4. Mockups if applicable

## Questions?

- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bugs and feature requests
- **Pull Request Comments**: For code-specific discussions

Thank you for contributing to EmuZ! 🎮

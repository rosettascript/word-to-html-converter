# Contributing to Word to HTML Converter

Thank you for your interest in contributing to Word to HTML Converter! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Modern browser (Chrome, Firefox, Safari, Edge)
- Node.js 18+ (for development and testing)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rosettascript/word-to-html-converter.git
   cd word-to-html-converter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   npm start
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173` (or the URL shown by the server)

## Development Workflow

### Code Style

- **JavaScript**: Follow ESLint configuration (run `npm run lint` to check)
- **Formatting**: Use Prettier (run `npm run format` to format)
- **Modules**: Use ES6 modules (`import`/`export`)
- **Comments**: Use JSDoc for function documentation

### Project Structure

```
js/
├── core/          # Core processing logic (processor, sanitizer)
├── modes/         # Output mode processors
├── features/      # Optional feature modules
├── ui/            # UI components
└── utils/         # Utility functions
```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code structure
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   # Run linter
   npm run lint
   
   # Run tests
   npm test
   
   # Format code
   npm run format
   ```

4. **Commit your changes**
   - Use clear, descriptive commit messages
   - Follow conventional commit format (optional but recommended):
     - `feat:` for new features
     - `fix:` for bug fixes
     - `docs:` for documentation
     - `style:` for formatting
     - `refactor:` for code refactoring
     - `test:` for tests
     - `chore:` for maintenance

5. **Push and create a Pull Request**
   - Push your branch to your fork
   - Create a PR with a clear description
   - Reference any related issues

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run with coverage
npm test -- --coverage
```

### Writing Tests

- Tests are located alongside source files (e.g., `processor.test.js`)
- Use Vitest for testing
- Test fixtures are in `_docs/tests/fixtures/`
- Aim for good test coverage (target: 80%+)

### Test Structure

```javascript
import { describe, it, expect } from 'vitest';
import { functionToTest } from './module.js';

describe('Module Name', () => {
  it('should do something', () => {
    expect(functionToTest(input)).toBe(expectedOutput);
  });
});
```

## Code Review Process

1. All contributions require a Pull Request
2. PRs will be reviewed for:
   - Code quality and style
   - Test coverage
   - Documentation updates
   - Performance considerations
   - Accessibility compliance

3. Address review feedback promptly
4. Maintainers will merge after approval

## Documentation

### Updating Documentation

- **README.md**: Update for user-facing changes
- **`_docs/`**: Update relevant documentation
- **Changelog**: Add entries to `_docs/changelog/` for significant changes
- **Code Comments**: Add JSDoc comments for new functions

### Documentation Structure

- `README.md` - Quick start and overview
- `_docs/README.md` - Comprehensive documentation index
- `_docs/guide/` - Development guides
- `_docs/changelog/` - Feature updates and changes
- `_docs/prd/` - Product requirements (reference only)

## Feature Requests

1. Check existing issues to avoid duplicates
2. Create an issue describing:
   - The problem or use case
   - Proposed solution (if any)
   - Expected behavior

## Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, version
6. **Screenshots**: If applicable

## Questions?

- Open an issue for questions or discussions
- Check existing documentation in `_docs/`
- Review the PRD in `_docs/prd/` for project requirements

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Maintain a positive and professional environment

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Word to HTML Converter! 🎉


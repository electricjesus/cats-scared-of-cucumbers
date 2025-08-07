# Cucumber Auto Step Generation

This project includes automatic step definition generation with **feature-specific files** to streamline your BDD workflow and maintain clean, organized code.

## Available Scripts

- `npm run auto-generate-steps` - Automatically generates step definitions for any undefined steps in your feature files
- `npm run test:auto` - Runs auto-generation first, then executes all tests  
- `npm test` - Runs cucumber tests normally
- `npm run generate-steps` - Shows cucumber snippets in dry-run mode (for manual copying)
- `npm run migrate-steps` - Helper script to migrate from monolithic to feature-specific step files
- `npm run docs:generate` - Generates documentation stubs for features missing documentation
- `npm run docs:check` - Check documentation coverage and status
- `npm run sync:check` - Check synchronization between features, steps, and docs
- `npm run sync:clean` - Remove orphaned step definitions and documentation  
- `npm run sync:rename <old> <new>` - Rename a feature and all related files
- `npm run watch` - Watch for feature file changes and auto-sync

## How It Works

The auto-generation script now creates **feature-specific step definition files**:
1. Runs your cucumber tests to detect undefined steps
2. Associates each undefined step with its source feature file
3. Automatically creates/updates `<feature_name>.steps.js` files in `features/step_definitions/`
4. Creates placeholder implementations that return 'pending'

## File Structure

For each feature file, you'll get a corresponding step definition file:

```
features/
├── my_feature.feature          → features/step_definitions/my_feature.steps.js
├── user_login.feature          → features/step_definitions/user_login.steps.js
├── api_testing.feature         → features/step_definitions/api_testing.steps.js
└── docs/
    ├── my_feature.md           ← Documentation for each feature
    ├── user_login.md
    └── api_testing.md
```

## Benefits

✅ **Better organization** - Each feature has its own step definitions  
✅ **Easier maintenance** - Find and modify steps related to specific features quickly  
✅ **Reduced conflicts** - Multiple developers can work on different features without merge conflicts  
✅ **Cleaner codebase** - No more monolithic step definition files  
✅ **Automatic generation** - Still no manual step definition creation required

## Usage

1. Write your feature files with new scenarios
2. Run `npm run auto-generate-steps` to generate boilerplate step definitions in feature-specific files
3. Implement the step logic by replacing the `return 'pending';` lines in the appropriate `.steps.js` file
4. Run `npm test` to execute your tests

Or use the combined workflow:
```bash
npm run test:auto
```

This will auto-generate any missing step definitions in the correct feature-specific files and then run your tests, so you never see "undefined step" errors!

## File Synchronization System

The framework now includes comprehensive file synchronization to keep features, step definitions, and documentation in perfect sync.

### Synchronization Features

**🔍 Status Monitoring**
```bash
npm run sync:check
```
- Identifies synchronized features
- Detects orphaned step definitions and documentation
- Shows missing files and synchronization coverage

**🧹 Automatic Cleanup**
```bash
npm run sync:clean
```
- Removes orphaned step definition files
- Cleans up documentation without corresponding features
- Prevents accumulation of unused files

**📝 Safe Renaming**
```bash
npm run sync:rename old_feature_name new_feature_name
```
- Renames feature file and updates content
- Renames corresponding step definition file
- Renames documentation file and updates content
- Maintains perfect synchronization across all related files

**👀 Live Monitoring**
```bash
npm run watch
```
- Watches for feature file changes in real-time
- Automatically generates step definitions for new features
- Creates documentation stubs for new features
- Removes step definitions and docs when features are deleted
- Regenerates step definitions when features are modified

### Common Synchronization Scenarios

**Adding a new feature:**
1. Create `new_feature.feature`
2. If using file watcher (`npm run watch`): Everything auto-syncs
3. If not watching: Run `npm run test:auto && npm run docs:generate`

**Renaming a feature:**
1. Use `npm run sync:rename old_name new_name`
2. Review and update the renamed content as needed

**Deleting a feature:**
1. Delete the `.feature` file
2. If using file watcher: Related files auto-delete
3. If not watching: Run `npm run sync:clean` to remove orphaned files

**After major changes:**
1. Run `npm run sync:check` to verify everything is synchronized
2. Use `npm run sync:clean` if orphaned files are detected

## Documentation Workflow

The project now includes automatic documentation generation:

### Generating Documentation Stubs
```bash
npm run docs:generate
```

This will:
- Create `docs/` folder if it doesn't exist
- Generate `.md` files for any features missing documentation
- Provide a template structure for consistent documentation

### Documentation Structure
Each feature gets comprehensive documentation including:
- Feature overview and business purpose
- Prerequisites and setup requirements  
- Detailed test scenarios with expected outcomes
- Browser compatibility matrix
- Troubleshooting guides
- Future enhancement ideas

### Complete Workflow
1. **Write feature** → `my_feature.feature`
2. **Generate steps** → `npm run test:auto` → `my_feature.steps.js` 
3. **Generate docs** → `npm run docs:generate` → `docs/my_feature.md`
4. **Implement & document** → Complete step logic and fill in documentation
5. **Validate** → Run tests and update docs as needed

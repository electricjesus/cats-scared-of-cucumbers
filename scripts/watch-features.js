#!/usr/bin/env node

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FEATURES_DIR = path.join(__dirname, '..', 'features');
const STEP_DEFINITIONS_DIR = path.join(FEATURES_DIR, 'step_definitions');
const FEATURES_DOCS_DIR = path.join(__dirname, '..', 'docs', 'features');

// Track file operations to handle renames
const fileOperations = new Map();

function startWatcher() {
  console.log('👀 Starting feature file watcher...');
  console.log('📁 Watching:', FEATURES_DIR);
  console.log('🔄 Auto-sync enabled for step definitions and documentation');
  console.log('Press Ctrl+C to stop\n');
  
  // Watch feature files only
  const watcher = chokidar.watch(path.join(FEATURES_DIR, '*.feature'), {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true
  });
  
  watcher
    .on('add', handleFeatureAdded)
    .on('change', handleFeatureChanged)
    .on('unlink', handleFeatureDeleted)
    .on('error', error => console.error('❌ Watcher error:', error));
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping file watcher...');
    watcher.close();
    process.exit(0);
  });
}

function handleFeatureAdded(filePath) {
  const featureName = path.basename(filePath, '.feature');
  console.log(`➕ Feature added: ${featureName}.feature`);
  
  // Generate step definitions and documentation
  setTimeout(() => {
    generateStepDefinitions(featureName);
    generateDocumentation(featureName);
  }, 100); // Small delay to ensure file is fully written
}

function handleFeatureChanged(filePath) {
  const featureName = path.basename(filePath, '.feature');
  console.log(`📝 Feature modified: ${featureName}.feature`);
  
  // Regenerate step definitions for any new undefined steps
  setTimeout(() => {
    generateStepDefinitions(featureName);
  }, 100);
}

function handleFeatureDeleted(filePath) {
  const featureName = path.basename(filePath, '.feature');
  console.log(`🗑️  Feature deleted: ${featureName}.feature`);
  
  // Remove corresponding step definitions and documentation
  removeStepDefinitions(featureName);
  removeDocumentation(featureName);
}

function generateStepDefinitions(featureName) {
  try {
    console.log(`  🔧 Generating step definitions for ${featureName}...`);
    execSync('npm run auto-generate-steps', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe' 
    });
    console.log(`  ✅ Step definitions updated for ${featureName}`);
  } catch (error) {
    console.log(`  ⚠️  Could not generate step definitions for ${featureName}`);
    // Don't show the full error as it might just be pending steps
  }
}

function generateDocumentation(featureName) {
  try {
    console.log(`  📚 Generating documentation for ${featureName}...`);
    execSync('npm run docs:generate', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe' 
    });
    console.log(`  ✅ Documentation created for ${featureName}`);
  } catch (error) {
    console.log(`  ❌ Failed to generate documentation for ${featureName}:`, error.message);
  }
}

function removeStepDefinitions(featureName) {
  const stepDefPath = path.join(STEP_DEFINITIONS_DIR, `${featureName}.steps.js`);
  
  if (fs.existsSync(stepDefPath)) {
    try {
      fs.unlinkSync(stepDefPath);
      console.log(`  🗑️  Removed step definitions: ${featureName}.steps.js`);
    } catch (error) {
      console.log(`  ❌ Failed to remove step definitions for ${featureName}:`, error.message);
    }
  }
}

function removeDocumentation(featureName) {
  const docPath = path.join(FEATURES_DOCS_DIR, `${featureName}.md`);
  
  if (fs.existsSync(docPath)) {
    try {
      fs.unlinkSync(docPath);
      console.log(`  🗑️  Removed documentation: docs/features/${featureName}.md`);
    } catch (error) {
      console.log(`  ❌ Failed to remove documentation for ${featureName}:`, error.message);
    }
  }
}

// Start the watcher
startWatcher();

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const FEATURES_DIR = path.join(__dirname, '..', 'features');
const STEP_DEFINITIONS_DIR = path.join(FEATURES_DIR, 'step_definitions');
const FEATURES_DOCS_DIR = path.join(__dirname, '..', 'docs', 'features');

function syncFeatures() {
  const args = process.argv.slice(2);
  const cleanMode = args.includes('--clean');
  
  if (cleanMode) {
    console.log('🧹 Running cleanup mode - removing orphaned files');
  } else {
    console.log('🔄 Checking feature file synchronization...');
  }
  
  const result = checkSynchronization();
  
  if (cleanMode) {
    performCleanup(result);
  } else {
    reportStatus(result);
  }
}

function checkSynchronization() {
  // Get all feature files
  const featureFiles = fs.existsSync(FEATURES_DIR) 
    ? fs.readdirSync(FEATURES_DIR)
        .filter(file => file.endsWith('.feature'))
        .map(file => path.basename(file, '.feature'))
    : [];
  
  // Get all step definition files
  const stepDefFiles = fs.existsSync(STEP_DEFINITIONS_DIR)
    ? fs.readdirSync(STEP_DEFINITIONS_DIR)
        .filter(file => file.endsWith('.steps.js'))
        .map(file => path.basename(file, '.steps.js'))
    : [];
  
  // Get all feature documentation files
  const docFiles = fs.existsSync(FEATURES_DOCS_DIR)
    ? fs.readdirSync(FEATURES_DOCS_DIR)
        .filter(file => file.endsWith('.md'))
        .map(file => path.basename(file, '.md'))
    : [];
  
  // Find mismatches
  const orphanedStepDefs = stepDefFiles.filter(step => !featureFiles.includes(step));
  const orphanedDocs = docFiles.filter(doc => !featureFiles.includes(doc));
  const missingStepDefs = featureFiles.filter(feature => !stepDefFiles.includes(feature));
  const missingDocs = featureFiles.filter(feature => !docFiles.includes(feature));
  
  return {
    featureFiles,
    stepDefFiles,
    docFiles,
    orphanedStepDefs,
    orphanedDocs,
    missingStepDefs,
    missingDocs
  };
}

function reportStatus(result) {
  const { featureFiles, orphanedStepDefs, orphanedDocs, missingStepDefs, missingDocs } = result;
  
  console.log(`\n📊 Synchronization Status:`);
  console.log(`  Features: ${featureFiles.length} files`);
  
  // Report synchronized files
  const syncedFeatures = featureFiles.filter(feature => 
    !missingStepDefs.includes(feature) && !missingDocs.includes(feature)
  );
  
  if (syncedFeatures.length > 0) {
    console.log('\n✅ Synchronized features:');
    syncedFeatures.forEach(feature => {
      console.log(`  📄 ${feature}.feature ↔️ ${feature}.steps.js ↔️ ${feature}.md`);
    });
  }
  
  // Report issues
  let issuesFound = false;
  
  if (missingStepDefs.length > 0) {
    console.log('\n❌ Missing step definitions:');
    missingStepDefs.forEach(feature => {
      console.log(`  📄 ${feature}.feature → Missing ${feature}.steps.js`);
    });
    issuesFound = true;
  }
  
  if (missingDocs.length > 0) {
    console.log('\n❌ Missing documentation:');
    missingDocs.forEach(feature => {
      console.log(`  📄 ${feature}.feature → Missing docs/features/${feature}.md`);
    });
    issuesFound = true;
  }
  
  if (orphanedStepDefs.length > 0) {
    console.log('\n⚠️  Orphaned step definitions:');
    orphanedStepDefs.forEach(stepDef => {
      console.log(`  🗑️  ${stepDef}.steps.js (no corresponding .feature file)`);
    });
    issuesFound = true;
  }
  
  if (orphanedDocs.length > 0) {
    console.log('\n⚠️  Orphaned documentation:');
    orphanedDocs.forEach(doc => {
      console.log(`  🗑️  docs/features/${doc}.md (no corresponding .feature file)`);
    });
    issuesFound = true;
  }
  
  if (!issuesFound) {
    console.log('\n🎉 All files are synchronized!');
  } else {
    console.log('\n💡 Recommended actions:');
    if (missingStepDefs.length > 0 || missingDocs.length > 0) {
      console.log('  • Run `npm run test:auto` to generate missing step definitions');
      console.log('  • Run `npm run docs:generate` to create missing documentation');
    }
    if (orphanedStepDefs.length > 0 || orphanedDocs.length > 0) {
      console.log('  • Run `npm run sync:clean` to remove orphaned files');
      console.log('  • Or manually review and delete unnecessary files');
    }
  }
}

function performCleanup(result) {
  const { orphanedStepDefs, orphanedDocs } = result;
  let cleaned = 0;
  
  console.log('🧹 Cleaning up orphaned files...\n');
  
  // Remove orphaned step definitions
  for (const stepDef of orphanedStepDefs) {
    const filePath = path.join(STEP_DEFINITIONS_DIR, `${stepDef}.steps.js`);
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Removed orphaned step definition: ${stepDef}.steps.js`);
      cleaned++;
    } catch (error) {
      console.log(`❌ Failed to remove ${stepDef}.steps.js: ${error.message}`);
    }
  }
  
  // Remove orphaned documentation
  for (const doc of orphanedDocs) {
    const filePath = path.join(FEATURES_DOCS_DIR, `${doc}.md`);
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Removed orphaned documentation: docs/features/${doc}.md`);
      cleaned++;
    } catch (error) {
      console.log(`❌ Failed to remove docs/features/${doc}.md: ${error.message}`);
    }
  }
  
  if (cleaned === 0) {
    console.log('✅ No orphaned files found - everything is clean!');
  } else {
    console.log(`\n✅ Cleanup complete! Removed ${cleaned} orphaned file(s).`);
  }
}

// Export functions for use by other scripts
module.exports = {
  checkSynchronization,
  performCleanup,
  reportStatus
};

// Run if called directly
if (require.main === module) {
  syncFeatures();
}

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const FEATURES_DIR = path.join(__dirname, '..', 'features');
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const FEATURES_DOCS_DIR = path.join(DOCS_DIR, 'features');
const FRAMEWORK_DOCS_DIR = path.join(DOCS_DIR, 'framework');

function checkDocumentationStatus() {
  console.log('📋 Documentation Status Report');
  console.log('================================\n');
  
  checkFeatureDocumentation();
  checkFrameworkDocumentation();
  generateSummary();
}

function checkFeatureDocumentation() {
  console.log('🎯 BDD Feature Documentation:');
  
  if (!fs.existsSync(FEATURES_DIR)) {
    console.log('  ❌ Features directory not found');
    return;
  }
  
  const featureFiles = fs.readdirSync(FEATURES_DIR)
    .filter(file => file.endsWith('.feature'))
    .map(file => path.basename(file, '.feature'));
  
  const documentedFeatures = fs.existsSync(FEATURES_DOCS_DIR) 
    ? fs.readdirSync(FEATURES_DOCS_DIR)
        .filter(file => file.endsWith('.md'))
        .map(file => path.basename(file, '.md'))
    : [];
  
  let documented = 0;
  let missing = 0;
  
  console.log('  📊 Feature Documentation Status:');
  
  for (const feature of featureFiles) {
    if (documentedFeatures.includes(feature)) {
      console.log(`    ✅ ${feature}.feature → docs/features/${feature}.md`);
      documented++;
    } else {
      console.log(`    ❌ ${feature}.feature → Missing documentation`);
      missing++;
    }
  }
  
  // Check for orphaned docs
  const orphanedDocs = documentedFeatures.filter(doc => !featureFiles.includes(doc));
  if (orphanedDocs.length > 0) {
    console.log('  ⚠️  Orphaned documentation (no corresponding feature):');
    orphanedDocs.forEach(doc => {
      console.log(`    🗑️  docs/features/${doc}.md`);
    });
  }
  
  console.log(`  📈 Coverage: ${documented}/${featureFiles.length} features documented (${Math.round((documented/featureFiles.length)*100)}%)\n`);
}

function checkFrameworkDocumentation() {
  console.log('🛠️ Framework Documentation:');
  
  const expectedFrameworkDocs = [
    { file: 'AUTO_STEPS.md', description: 'Auto-generation guide', status: 'complete' },
    { file: 'architecture.md', description: 'Framework architecture', status: 'planned' },
    { file: 'browser-automation.md', description: 'Browser testing guide', status: 'planned' },
    { file: 'ci-cd.md', description: 'CI/CD integration', status: 'planned' }
  ];
  
  console.log('  📊 Framework Documentation Status:');
  
  for (const doc of expectedFrameworkDocs) {
    const docPath = path.join(FRAMEWORK_DOCS_DIR, doc.file);
    const exists = fs.existsSync(docPath);
    
    if (exists) {
      const statusIcon = doc.status === 'complete' ? '✅' : '📝';
      console.log(`    ${statusIcon} ${doc.file} - ${doc.description} (${doc.status})`);
    } else {
      console.log(`    ❌ ${doc.file} - ${doc.description} (missing)`);
    }
  }
  
  console.log('');
}

function generateSummary() {
  console.log('📋 Summary & Recommendations:');
  
  // Check main documentation index
  const mainDocsIndex = path.join(DOCS_DIR, 'README.md');
  if (fs.existsSync(mainDocsIndex)) {
    console.log('  ✅ Documentation index exists (docs/README.md)');
  } else {
    console.log('  ❌ Missing documentation index (docs/README.md)');
  }
  
  // Check project README
  const projectReadme = path.join(__dirname, '..', 'README.md');
  if (fs.existsSync(projectReadme)) {
    console.log('  ✅ Project README exists');
  } else {
    console.log('  ❌ Missing project README');
  }
  
  // Check AI instructions
  const aiInstructions = path.join(__dirname, '..', '.instructions.md');
  if (fs.existsSync(aiInstructions)) {
    console.log('  ✅ AI assistant instructions exist');
  } else {
    console.log('  ❌ Missing AI assistant instructions');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('  • Run `npm run docs:generate` to create missing feature documentation');
  console.log('  • Review and complete planned framework documentation');
  console.log('  • Keep documentation updated as features are added/modified');
  console.log('  • Consider adding automated documentation linting');
}

checkDocumentationStatus();

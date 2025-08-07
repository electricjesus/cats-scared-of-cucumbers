#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FEATURES_DIR = path.join(__dirname, '..', 'features');
const STEP_DEFINITIONS_DIR = path.join(FEATURES_DIR, 'step_definitions');
const FEATURES_DOCS_DIR = path.join(__dirname, '..', 'docs', 'features');

function handleFeatureRename() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log('Usage: node rename-feature.js <old-name> <new-name>');
    console.log('Example: node rename-feature.js user_login authentication');
    process.exit(1);
  }
  
  const [oldName, newName] = args;
  
  console.log(`🔄 Renaming feature: ${oldName} → ${newName}`);
  
  // Check if old files exist
  const oldFeaturePath = path.join(FEATURES_DIR, `${oldName}.feature`);
  const oldStepDefPath = path.join(STEP_DEFINITIONS_DIR, `${oldName}.steps.js`);
  const oldDocPath = path.join(FEATURES_DOCS_DIR, `${oldName}.md`);
  
  if (!fs.existsSync(oldFeaturePath)) {
    console.error(`❌ Feature file not found: ${oldName}.feature`);
    process.exit(1);
  }
  
  // Check if new files already exist
  const newFeaturePath = path.join(FEATURES_DIR, `${newName}.feature`);
  const newStepDefPath = path.join(STEP_DEFINITIONS_DIR, `${newName}.steps.js`);
  const newDocPath = path.join(FEATURES_DOCS_DIR, `${newName}.md`);
  
  if (fs.existsSync(newFeaturePath)) {
    console.error(`❌ Target feature file already exists: ${newName}.feature`);
    process.exit(1);
  }
  
  try {
    // Rename feature file
    fs.renameSync(oldFeaturePath, newFeaturePath);
    console.log(`✅ Renamed: ${oldName}.feature → ${newName}.feature`);
    
    // Update feature content if it contains the old name
    updateFeatureContent(newFeaturePath, oldName, newName);
    
    // Rename step definitions file
    if (fs.existsSync(oldStepDefPath)) {
      fs.renameSync(oldStepDefPath, newStepDefPath);
      console.log(`✅ Renamed: ${oldName}.steps.js → ${newName}.steps.js`);
    }
    
    // Rename documentation file
    if (fs.existsSync(oldDocPath)) {
      fs.renameSync(oldDocPath, newDocPath);
      console.log(`✅ Renamed: ${oldName}.md → ${newName}.md`);
      
      // Update documentation content
      updateDocumentationContent(newDocPath, oldName, newName);
    }
    
    console.log(`\n🎉 Feature rename complete!`);
    console.log(`💡 You may want to review and update the feature content and documentation.`);
    
  } catch (error) {
    console.error(`❌ Error during rename:`, error.message);
    process.exit(1);
  }
}

function updateFeatureContent(filePath, oldName, newName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update feature name in content (convert underscores to spaces and capitalize)
    const oldDisplayName = oldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const newDisplayName = newName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    content = content.replace(new RegExp(oldDisplayName, 'g'), newDisplayName);
    
    fs.writeFileSync(filePath, content);
    console.log(`  📝 Updated feature content`);
  } catch (error) {
    console.log(`  ⚠️  Could not update feature content: ${error.message}`);
  }
}

function updateDocumentationContent(filePath, oldName, newName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update feature name in documentation
    const oldDisplayName = oldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const newDisplayName = newName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    content = content.replace(new RegExp(oldDisplayName, 'g'), newDisplayName);
    content = content.replace(new RegExp(oldName, 'g'), newName);
    
    fs.writeFileSync(filePath, content);
    console.log(`  📝 Updated documentation content`);
  } catch (error) {
    console.log(`  ⚠️  Could not update documentation content: ${error.message}`);
  }
}

// Export the function for use by other scripts
module.exports = {
  handleFeatureRename,
  updateFeatureContent,
  updateDocumentationContent
};

// Run if called directly
if (require.main === module) {
  handleFeatureRename();
}

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const FEATURES_DIR = path.join(__dirname, '..', 'features');
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const FEATURES_DOCS_DIR = path.join(DOCS_DIR, 'features');

function generateDocumentationStubs() {
  console.log('📚 Checking for missing feature documentation...');
  
  // Ensure docs directories exist
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
    console.log('📁 Created docs/ directory');
  }
  
  if (!fs.existsSync(FEATURES_DOCS_DIR)) {
    fs.mkdirSync(FEATURES_DOCS_DIR, { recursive: true });
    console.log('📁 Created docs/features/ directory');
  }
  
  // Find all .feature files
  const featureFiles = fs.readdirSync(FEATURES_DIR)
    .filter(file => file.endsWith('.feature'))
    .map(file => path.basename(file, '.feature'));
  
  let generated = 0;
  
  for (const featureName of featureFiles) {
    const docPath = path.join(FEATURES_DOCS_DIR, `${featureName}.md`);
    
    if (!fs.existsSync(docPath)) {
      generateDocStub(featureName, docPath);
      generated++;
    }
  }
  
  if (generated > 0) {
    console.log(`✅ Generated ${generated} feature documentation stub(s)`);
    console.log('💡 Please fill in the feature details in docs/features/');
  } else {
    console.log('✅ All features have documentation');
  }
  
  // List current documentation
  const docFiles = fs.readdirSync(FEATURES_DOCS_DIR).filter(f => f.endsWith('.md'));
  if (docFiles.length > 0) {
    console.log('\n📂 Current feature documentation files:');
    docFiles.forEach(file => {
      console.log(`  - docs/features/${file}`);
    });
  }
}

function generateDocStub(featureName, docPath) {
  const template = `# Feature: ${featureName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

## Overview
[Describe what this feature tests and its business purpose]

## Prerequisites
- Browser requirements: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Test data: [Describe any required test data]
- Environment setup: [Describe setup requirements]

## Test Scenarios

### Scenario: [Scenario Name]
- **Given**: [Initial conditions]
- **When**: [Actions performed]
- **Then**: [Expected outcomes]

**Purpose**: [Explain why this scenario is important]

**Business Value**: [Describe the business value this test provides]

## Implementation Details

### Browser Automation Approach
- [Describe the automation strategy]
- [List key user interactions to test]
- [Mention validation points]

### Expected User Journey
1. [Step 1 of user journey]
2. [Step 2 of user journey]
3. [Continue with remaining steps...]

## Browser Compatibility
- Chrome: ✅ Supported
- Firefox: ✅ Supported  
- Safari: ✅ Supported
- Edge: ✅ Supported

## Troubleshooting

### Common Issues
- [List potential issues and solutions]

### Debug Steps
1. [Debug step 1]
2. [Debug step 2]
3. [Continue with additional debug steps...]

## Future Enhancements
- [List potential improvements]
- [Additional scenarios to consider]
- [Performance or accessibility considerations]
`;

  fs.writeFileSync(docPath, template);
  console.log(`  📄 Generated feature documentation stub: features/${featureName}.md`);
}

generateDocumentationStubs();

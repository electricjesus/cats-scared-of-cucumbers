#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FEATURES_DIR = path.join(__dirname, '..', 'features');
const STEP_DEFINITIONS_DIR = path.join(FEATURES_DIR, 'step_definitions');

function generateStepDefinitions() {
  try {
    console.log('🥒 Checking for undefined step definitions...');
    
    // Run cucumber to get undefined step snippets
    let result;
    let hasUndefinedSteps = false;
    
    try {
      result = execSync('npx cucumber-js', { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..')
      });
    } catch (error) {
      // Cucumber exits with non-zero code when there are undefined steps OR pending steps
      if (error.stdout) {
        result = error.stdout;
        // Check if the error is due to undefined steps (not just pending)
        hasUndefinedSteps = error.stdout.includes('Implement with the following snippet:');
      } else {
        throw error;
      }
    }
    
    // Check if there are any undefined steps
    if (hasUndefinedSteps && result.includes('Implement with the following snippet:')) {
      console.log('📝 Found undefined steps. Generating step definitions...');
      
      // Extract step definition snippets grouped by feature file
      const stepsByFeature = extractStepsByFeature(result);
      
      let totalGenerated = 0;
      
      for (const [featureFile, steps] of Object.entries(stepsByFeature)) {
        if (steps.length > 0) {
          const generated = generateStepsForFeature(featureFile, steps);
          totalGenerated += generated;
        }
      }
      
      if (totalGenerated > 0) {
        console.log(`✅ Generated ${totalGenerated} step definition(s) across ${Object.keys(stepsByFeature).length} feature file(s)`);
        console.log('💡 Don\'t forget to implement the step logic!');
      } else {
        console.log('✅ All step definitions are already defined!');
      }
    } else {
      console.log('✅ All step definitions are already defined!');
      if (result.includes('pending')) {
        console.log('💡 Some steps are pending - you can now implement their logic.');
      }
    }
  } catch (error) {
    console.error('❌ Error running cucumber:', error.message);
    process.exit(1);
  }
}

function extractStepsByFeature(output) {
  const stepsByFeature = {};
  const lines = output.split('\n');
  let currentFeature = null;
  let currentSnippet = '';
  let inSnippet = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for scenario headers to identify the feature file
    const scenarioMatch = line.match(/Scenario: .+ # (.+\.feature):\d+/);
    if (scenarioMatch) {
      currentFeature = scenarioMatch[1];
      if (!stepsByFeature[currentFeature]) {
        stepsByFeature[currentFeature] = [];
      }
    }
    
    // Look for the start of a snippet
    if (line.includes('Implement with the following snippet:')) {
      // Skip to the next non-empty line that contains the actual snippet
      i++;
      while (i < lines.length && lines[i].trim() === '') {
        i++;
      }
      
      // Start collecting the snippet
      if (i < lines.length && currentFeature) {
        currentSnippet = '';
        inSnippet = true;
        
        // Collect all lines until we reach an empty line or another snippet
        while (i < lines.length && inSnippet) {
          const snippetLine = lines[i].trim();
          
          if (snippetLine === '') {
            // End of this snippet
            if (currentSnippet && currentFeature) {
              stepsByFeature[currentFeature].push(currentSnippet.trim());
              currentSnippet = '';
            }
            inSnippet = false;
          } else if (snippetLine.startsWith('Given(') || 
                    snippetLine.startsWith('When(') || 
                    snippetLine.startsWith('Then(')) {
            // Start of a new step definition
            if (currentSnippet && currentFeature) {
              stepsByFeature[currentFeature].push(currentSnippet.trim());
            }
            currentSnippet = snippetLine;
          } else if (inSnippet) {
            // Continue building the current snippet
            if (currentSnippet) {
              currentSnippet += '\n' + snippetLine;
            } else {
              currentSnippet = snippetLine;
            }
          }
          
          i++;
        }
        
        // Don't increment i again in the outer loop
        i--;
      }
    }
  }
  
  // Add the last snippet if we have one
  if (currentSnippet && inSnippet && currentFeature) {
    stepsByFeature[currentFeature].push(currentSnippet.trim());
  }
  
  // Filter out duplicates for each feature
  for (const feature of Object.keys(stepsByFeature)) {
    stepsByFeature[feature] = [...new Set(stepsByFeature[feature])].filter(snippet => snippet.length > 0);
  }
  
  return stepsByFeature;
}

function generateStepsForFeature(featureFilePath, steps) {
  // Extract feature name from path and create step definition file name
  const featureName = path.basename(featureFilePath, '.feature');
  const stepDefFileName = `${featureName}.steps.js`;
  const stepDefFilePath = path.join(STEP_DEFINITIONS_DIR, stepDefFileName);
  
  // Ensure step_definitions directory exists
  if (!fs.existsSync(STEP_DEFINITIONS_DIR)) {
    fs.mkdirSync(STEP_DEFINITIONS_DIR, { recursive: true });
  }
  
  // Read existing step definitions for this feature
  let existingContent = '';
  if (fs.existsSync(stepDefFilePath)) {
    existingContent = fs.readFileSync(stepDefFilePath, 'utf8');
  } else {
    // Create the basic structure if file doesn't exist
    existingContent = `const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');

`;
  }
  
  // Filter out snippets that already exist in the file
  const newSnippets = steps.filter(snippet => {
    // Extract the step matcher (the part inside quotes)
    const match = snippet.match(/(?:Given|When|Then)\('([^']+)'/);
    if (match) {
      const stepMatcher = match[1];
      return !existingContent.includes(`'${stepMatcher}'`);
    }
    return true;
  });
  
  if (newSnippets.length > 0) {
    // Append new step definitions
    const newContent = existingContent + '\n' + newSnippets.join('\n\n') + '\n';
    
    fs.writeFileSync(stepDefFilePath, newContent);
    console.log(`  📄 Generated ${newSnippets.length} step(s) in ${stepDefFileName}`);
    return newSnippets.length;
  } else {
    console.log(`  ✅ All steps for ${featureName} are already defined`);
    return 0;
  }
}

// Run the function
generateStepDefinitions();

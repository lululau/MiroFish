#!/usr/bin/env node
/**
 * Convert Beads issues to Ralph TUI PRD JSON format
 *
 * This script:
 * 1. Extracts all issues from beads using `bd show --json`
 * 2. Converts them to ralph-tui prd.json format
 * 3. Outputs to prd.json file
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Extract acceptance criteria from the description
 * Beads format uses "## 验收标准" followed by "- [ ]" checklist items
 */
function extractAcceptanceCriteria(description) {
  const lines = description.split('\n');
  const criteria = [];
  let inCriteriaSection = false;

  for (const line of lines) {
    if (line.includes('## 验收标准') || line.includes('## Acceptance Criteria')) {
      inCriteriaSection = true;
      continue;
    }

    if (inCriteriaSection) {
      // Check if this is a checklist item
      const match = line.match(/^[\s]*-\s\[\s?\]\s*(.+)$/);
      if (match) {
        criteria.push(match[1].trim());
      } else if (line.trim() === '' || line.match(/^##\s/)) {
        // End of criteria section if we hit empty line or new section
        if (criteria.length > 0) break;
      }
    }
  }

  return criteria;
}

/**
 * Convert a beads issue to a ralph user story
 */
function convertToUserStory(issue) {
  // Extract the US number from ID (e.g., "MiroFish-4xg.1" -> "US-001")
  const match = issue.id.match(/\.(\d+)$/);
  const usNumber = match ? parseInt(match[1]) : 0;
  const usId = `US-${String(usNumber).padStart(3, '0')}`;

  // Extract acceptance criteria from description
  const criteria = extractAcceptanceCriteria(issue.description);

  // If no criteria found, use the entire description (minus user story part)
  const description = issue.description
    .replace(/作为[^\n]+，我需要[^\n]+\.\n*/g, '')
    .replace(/## 验收标准[\s\S]*/g, '')
    .trim();

  return {
    id: usId,
    title: issue.title.replace(/^[A-Z]+-\d+:\s*/, ''), // Remove "US-001:" prefix if exists
    description: description || issue.description,
    acceptanceCriteria: criteria.length > 0
      ? criteria
      : ["Complete the task as described"],
    priority: issue.priority,
    passes: issue.status === 'closed',
    notes: `Original beads ID: ${issue.id}`
  };
}

/**
 * Main conversion function
 */
async function convertBeadsToJSON() {
  console.log('📋 Converting Beads to Ralph TUI PRD JSON format...\n');

  try {
    // Get the epic issue (parent) using bd show --json
    const epicResult = execSync('bd show MiroFish-4xg --json', { encoding: 'utf-8' });
    const epicData = JSON.parse(epicResult);
    const epic = epicData[0];

    if (!epic || !epic.dependents) {
      console.error('❌ No epic or dependent issues found');
      process.exit(1);
    }

    console.log(`📦 Found epic: ${epic.title}`);
    console.log(`📝 Found ${epic.dependents.length} child issues\n`);

    // Convert all dependent issues to user stories
    const userStories = [];
    for (const issue of epic.dependents) {
      const story = convertToUserStory(issue);
      userStories.push(story);
      console.log(`  ✓ Converted ${issue.id} -> ${story.id}: ${story.title}`);
    }

    // Sort by US number
    userStories.sort((a, b) => {
      const aNum = parseInt(a.id.replace('US-', ''));
      const bNum = parseInt(b.id.replace('US-', ''));
      return aNum - bNum;
    });

    // Create the PRD JSON
    const prd = {
      project: 'MiroFish',
      branchName: 'docs/zh-chinese-documentation',
      description: epic.description,
      userStories
    };

    // Write to file
    const outputPath = './prd.json';
    fs.writeFileSync(outputPath, JSON.stringify(prd, null, 2));

    console.log(`\n✅ Successfully converted to ${outputPath}`);
    console.log(`   Project: ${prd.project}`);
    console.log(`   Branch: ${prd.branchName}`);
    console.log(`   Stories: ${prd.userStories.length}\n`);

    console.log('💡 To run with ralph-tui:');
    console.log(`   ralph-tui run --prd ${outputPath}\n`);

  } catch (error) {
    console.error('❌ Error during conversion:', error.message);
    process.exit(1);
  }
}

// Run the conversion
convertBeadsToJSON();

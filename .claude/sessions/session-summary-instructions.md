# Session Summary Instructions

## Purpose

Create comprehensive session summaries to document development work, technical decisions, and lessons learned for future reference and knowledge sharing.

## When to Create Session Summaries

- **After significant feature implementations** (new components, major modifications)
- **After complex debugging sessions** (multiple iterations, challenging problems)
- **After architectural decisions** (context setup, integration patterns)
- **After learning experiences** (new libraries, patterns, workarounds)
- **At end of extended development sessions** (multiple hours of work)

## File Naming Convention

```
YYYY-MM-DD-descriptive-session-name.md
```

**Examples:**
- `2025-01-17-agent-slider-improvements.md`
- `2025-01-20-authentication-refactor.md`
- `2025-01-25-performance-optimization.md`

## Template Structure

```markdown
# [Session Name]
**Date:** YYYY-MM-DD  
**Duration:** [Brief/Extended/Multi-day] session  
**Status:** [Completed/In Progress/Blocked]

## Session Overview

[1-2 sentence summary of what was accomplished]

## Primary Objectives

1. **[Objective 1]**: Brief description
2. **[Objective 2]**: Brief description
3. **[Objective 3]**: Brief description

## Technical Implementations

### 1. [Implementation Name]
- **File Modified**: [Path to main file]
- **Changes**: [Key changes made]
- **Result**: [Outcome achieved]

### 2. [Implementation Name]
- **Challenge**: [Problem encountered]
- **Investigation**: [How problem was diagnosed]
- **Solution**: [Final resolution]
- **Implementation**: [Code example if relevant]

## Technical Challenges & Solutions

### [Challenge Name]
- **Problem**: [Description of issue]
- **Root Cause**: [Why it happened]
- **Solution**: [How it was resolved]

## Files Modified

1. **`[file path]`** - [Description of changes]
2. **`[file path]`** - [Description of changes]

## Key Dependencies Added/Modified

- **[Library/Tool]**: [Purpose and usage]

## User Feedback Integration

- [How user feedback shaped the implementation]
- [Iterations based on feedback]

## Final Result

- ✅ [Achievement 1]
- ✅ [Achievement 2]
- ❌ [Known limitations or incomplete items]

## Lessons Learned

1. **[Topic]**: [Key insight]
2. **[Topic]**: [Key insight]

## Impact

[How this work affects the overall project/codebase]
```

## Content Guidelines

### What to Include

- **Technical decisions and reasoning** behind choices
- **Challenges encountered** and how they were solved
- **Code patterns discovered** or established
- **User feedback** and how it influenced development
- **Failed approaches** and why they didn't work
- **Performance implications** if relevant
- **Security considerations** if applicable
- **Integration patterns** with existing systems

### What to Exclude

- **Reflection analysis** (belongs in separate documents)
- **Personal opinions** without technical basis
- **Sensitive information** (API keys, credentials, internal processes)
- **Excessive implementation details** (focus on key decisions)

## Writing Style

- **Be concise but comprehensive** - include key details without overwhelming
- **Use technical language appropriately** - assume reader has development background
- **Include code examples** for complex implementations
- **Document decisions, not just outcomes** - explain why choices were made
- **Focus on reusable insights** - what would help future developers

## Code Examples

When including code:
- **Keep examples minimal** but complete
- **Include context** (imports, surrounding code if needed)
- **Highlight key changes** with comments when helpful
- **Use proper markdown formatting** with language specification

```typescript
// Example code block
const handleCopyMessage = (content: string) => {
  navigator.clipboard.writeText(content);
  toast(Translator.trans("message_copied", {}, "jsplan", locale));
};
```

## Linking and References

- **Link to related files** when referencing other documentation
- **Reference specific line numbers** when discussing code changes
- **Include relevant issue/PR numbers** if applicable
- **Link to external documentation** for libraries or patterns used

## Review and Maintenance

- **Review summaries** periodically for accuracy
- **Update** if follow-up work changes conclusions
- **Archive or consolidate** very old summaries as needed
- **Use summaries** to inform future architectural decisions

## Storage Location

All session summaries should be stored in:
```
/.claude/sessions/[YYYY-MM-DD-session-name].md
```

This location ensures:
- **Easy discovery** alongside other Claude documentation
- **Version control** tracking of development history
- **Team accessibility** for knowledge sharing
- **Consistent organization** with other project documentation
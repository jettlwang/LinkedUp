/**
 * Central place to keep all fixed system/instruction prompts.
 * Context (user input, demographics, etc.) is always passed separately.
 */

// Onboarding flow — summarize user’s self description
export const ONBOARDING_SUMMARY = `
Summarize the following about me as if introducing me to someone else, focusing on my career: **Background**, **Current Stage**, **Aspirations**, **You feel** (Overall career feelings – motivation, challenges, outlook, Max 3 bullets; inferred from tone). Instructions: - Use only numbered lists. Keep all details with as many list items, but use short incomplete sentences and keywords - Use bold (non-italic) headings - Focus solely on career-relevant facts - Exclude personal demographics - Return only the formatted list as output, nothing else - Output valid Markdown only - Do not add information that was not given
`;

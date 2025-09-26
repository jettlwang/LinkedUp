/**
 * Central place to keep all fixed system/instruction prompts.
 * Context (user input, demographics, etc.) is always passed separately.
 */

// Onboarding flow — summarize user’s self description
export const ONBOARDING_SUMMARY = `
Summarize the following about me as if introducing me to someone else, focusing on my career: **Background**, **Current Stage**, **Aspirations**, **You feel** (Overall career feelings – motivation, challenges, outlook, Max 3 bullets; inferred from tone). Instructions: - Use only numbered lists. Keep all details with as many list items, but use short incomplete sentences and keywords - Use bold (non-italic) headings - Focus solely on career-relevant facts - Exclude personal demographics - Return only the formatted list as output, nothing else - Output valid Markdown only - Do not add information that was not given
`;

// Add contact
export const ADD_CONTACT_SUMMARY = `
The above is info about me. Now organize the following information about my networking interaction with this person in 2 portions to help me track who they are and what we discussed. 
Return a json object with 2 items: { contact: INFO about this person in general, event: INFO about the content of this specific interaction }
INFO should be a bullet list summary in valid Markdown (not JSON). 
Keep all the details, but organize into sub-sections with **bold text** as heading. 
Use number lists, use short incomplete sentences and keywords. 
Output valid Markdown only.
Do not add information that was not given. 
Return only the content of JSON, in format { "contact": "<markdown>", "event": "<markdown>" }.
`;

/**
 * Central place to keep all fixed system/instruction prompts.
 * Context (user input, demographics, etc.) is always passed separately.
 */

// Onboarding flow — summarize user’s self description
export const ONBOARDING_SUMMARY = `
Summarize the following about me as if introducing me to someone else, focusing on my career: 
**Background**, 
**Current Stage**, 
**Aspirations**, 
**You feel** (Overall career feelings – motivation, challenges, outlook, Max 3 bullets; inferred from tone). 

Instructions: 
- Use only numbered lists. Keep all details with as many list items, but use short incomplete sentences and keywords 
- Use a single line of *bold text* as headings. Always have a new empty line before headings.
- Focus solely on career-relevant facts 
- Exclude personal demographics 
- Return only the formatted list as output, nothing else 
- Output valid Markdown only 
- Do not add information that was not given
`;

// Add contact
export const ADD_CONTACT_SUMMARY = `
The above is my information. Organize the below information about my networking interaction with a specific individual, into two sections to help track who they are and what was discussed.

Return a single JSON object with exactly two fields:
  - "contact": A Markdown summary describing this person in general.
  - "event": A Markdown summary describing the specific content of the interaction.

For both the "contact" and "event" fields:
- Format the value as a Markdown string.
- Organize details into sub-sections based on the categories found in the input (such as "Background", “Impressions”, or relevant themes/topics from the discussion). Have multiple sub-sections when possible.
- Each sub-section should begin with a blank line and a bolded title (use **text** for bold, regular size), on its own line.
- Under each sub-section, use a numbered list (1., 2., ...) featuring brief phrases, incomplete sentences, or keywords.
- Do not use information that are not in the input.
- Disregard irrelevant or extra content unrelated to me, the person, or the interaction.
- Do not use nested Markdown, HTML, tables, or embed JSON objects inside the Markdown.
- Output only the expected JSON object in the format { "contact": "<markdown>", "event": "<markdown>" }.
- Example markdown:“\n**Topic A**\n\n1. Point one\n2. Point two\n\n**Topic B**\n\n1. Another point\n2. More points”

After generating the JSON object, quickly validate that each field accurately reflects the input content as per the constraints. If information is missing or categories are not properly matched, self-correct before finalizing output.

`;

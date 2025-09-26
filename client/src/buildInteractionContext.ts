type Tone = 'professional' | 'casual' | 'sincere' | string;

export type SingleInteractionPayload = {
  user: {
    profile_summary: string;           // userProfile.backgroundAiSummary
    tone?: Tone;                       // userProfile.preferences.messageTone
    demographics?: string;             // userProfile.demographics
  };
  contact: {
    name: string;                      // contact.name
    contact_ai_summary: string;        // contact.infoAiSummary
    followUpFrequency?: string;        // contact.preferences.followUpFrequency
    lastReachOutDate?: string;         // contact.lastReachOutDate
  };
  interaction: {
    dateISO: string;                   // event.date
    notesAiSummary: string;            // event.notesAiSummary (no raw)
    tags?: string[];                   // event.tags (optional)
  };
};

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/g;
const URL_RE = /https?:\/\/\S+/gi;

function scrubPII(s: string) {
  return (s || '')
    .replace(EMAIL_RE, '')
    .replace(PHONE_RE, '')
    .replace(URL_RE, '(LinkedIn profile available)');
}

function clamp(s: string, max: number) {
  if (!s) return '';
  const t = s.trim();
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + '…';
}

export function buildInteractionContext(p: SingleInteractionPayload) {
  const userSummary = clamp(scrubPII(p.user.profile_summary), 1200);
  const userDemo = clamp(scrubPII(p.user.demographics || ''), 300);
  const contactSummary = clamp(scrubPII(p.contact.contact_ai_summary), 800);
  const notes = clamp(scrubPII(p.interaction.notesAiSummary || ''), 1200);

  const tagsLine =
    p.interaction.tags && p.interaction.tags.length
      ? `Tags: ${p.interaction.tags.join(', ')}\n`
      : '';

  return [
    `[USER_PROFILE_SUMMARY]`,
    userSummary,
    userDemo ? `Demographics: ${userDemo}` : '',
    '',
    `[CONTACT_BASICS]`,
    `Name: ${p.contact.name}`,
    p.contact.followUpFrequency ? `Follow-up cadence: ${p.contact.followUpFrequency}` : '',
    p.contact.lastReachOutDate ? `Last reach-out: ${p.contact.lastReachOutDate}` : '',
    '',
    `[CONTACT_SUMMARY]`,
    contactSummary,
    '',
    `[INTERACTION_HISTORY]`,
    `[${p.interaction.dateISO}]`,
    `- ${notes}`,
    tagsLine,
    '',
    `[TONE]`,
    p.user.tone || 'professional',
  ]
    .filter(Boolean)
    .join('\n');
}

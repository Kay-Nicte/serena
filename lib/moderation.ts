// Anti-toxicity filter for chat messages and ice breakers
// Blocks insults, slurs, threats, harassment, and explicit content
// Supports Spanish and English

const TOXIC_PATTERNS: RegExp[] = [
  // === SPANISH ===
  // Insults / slurs
  /\bput[ao]\b/i,
  /\bperr[ao]\b/i,
  /\bzorr[ao]\b/i,
  /\bgilipollas?\b/i,
  /\bimbécil(es)?\b/i,
  /\bimbecil(es)?\b/i,
  /\bidiotas?\b/i,
  /\bestúpid[ao]s?\b/i,
  /\bestupid[ao]s?\b/i,
  /\bsubnormal(es)?\b/i,
  /\bretrasad[ao]s?\b/i,
  /\bmongol[ao]?\b/i,
  /\bcabrón(a|es|as)?\b/i,
  /\bcabron(a|es|as)?\b/i,
  /\bhij[ao] de put[ao]\b/i,
  /\bhijueput[ao]\b/i,
  /\bmalparid[ao]\b/i,
  /\bmaric(ón|on|a)\b/i,
  /\bmarica\b/i,
  /\bbollera\b/i,
  /\btortillera\b/i,
  /\bcerda\b/i,
  /\bbasura\b/i,
  /\basco\b.*\bda(s|is)?\b/i,
  /\bme\s+da(s|is)?\s+asco\b/i,
  /\bgorda\s+(de\s+mierda|asquerosa)\b/i,
  /\bfea\s+(de\s+mierda|asquerosa)\b/i,
  /\bmierda\b/i,
  /\bjoder\b/i,
  /\bjódete\b/i,
  /\bjodete\b/i,
  /\bque\s+te\s+(den|jodan|follen)\b/i,
  /\bvete\s+a\s+(la\s+mierda|tomar\s+por\s+culo)\b/i,
  /\bchúpa(me)?la\b/i,
  /\bchupapollas\b/i,
  /\bcoño\b/i,

  // Threats / violence
  /\bte\s+voy\s+a\s+(matar|pegar|partir|reventar)\b/i,
  /\bte\s+mato\b/i,
  /\bojalá\s+te\s+mueras\b/i,
  /\bójala\s+te\s+mueras\b/i,
  /\bmuérete\b/i,
  /\bmuere(te)?\b/i,
  /\bte\s+deseo\s+(la\s+)?muerte\b/i,

  // Harassment
  /\bnadie\s+te\s+(quiere|va\s+a\s+querer)\b/i,
  /\bno\s+vales\s+(nada|para\s+nada)\b/i,
  /\bdas\s+(pena|asco|lástima)\b/i,

  // === ENGLISH ===
  // Insults / slurs
  /\bbitch(es)?\b/i,
  /\bwhore\b/i,
  /\bslut\b/i,
  /\bcunt\b/i,
  /\bfuck\s*(you|off|ing)?\b/i,
  /\bstfu\b/i,
  /\bshit(ty)?\b/i,
  /\bass\s?hole\b/i,
  /\bdick\s?head\b/i,
  /\bmoron\b/i,
  /\bretard(ed)?\b/i,
  /\bidiot\b/i,
  /\bstupid\b/i,
  /\bdumb\s*(ass|fuck)?\b/i,
  /\bugly\s*(bitch|ass|fuck)\b/i,
  /\bfat\s*(ass|bitch|fuck|ugly)\b/i,
  /\bdyke\b/i,
  /\bfagg?ot\b/i,
  /\btranny\b/i,
  /\bn+i+g+[aeg]+[rh]?\b/i,

  // Threats / violence
  /\bi('ll|m\s+going\s+to)\s+kill\s+you\b/i,
  /\bkill\s+your\s*self\b/i,
  /\bkys\b/i,
  /\bgo\s+die\b/i,
  /\bhope\s+you\s+die\b/i,
  /\bi('ll)?\s+find\s+(you|where\s+you\s+live)\b/i,

  // Harassment
  /\bnobody\s+(loves|likes|wants)\s+you\b/i,
  /\byou('re|\s+are)\s+worthless\b/i,
  /\byou\s+deserve\s+to\b/i,

  // Explicit unwanted (unsolicited sexual content)
  /\bsend\s+(me\s+)?nudes\b/i,
  /\benvía(me)?\s+fotos\b/i,
  /\bmanda(me)?\s+fotos\b/i,
  /\benseña(me)?\s+(las\s+)?tetas\b/i,
  /\bpolla\b/i,
  /\bdick\s+pic\b/i,
];

// Normalize text: remove accents, extra spaces
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkToxicity(text: string): { toxic: boolean } {
  const normalized = normalize(text);

  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(normalized) || pattern.test(text)) {
      return { toxic: true };
    }
  }

  return { toxic: false };
}

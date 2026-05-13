export const ASSET_EXTRACTION_PROMPT = `You are analyzing a struggling startup. Extract its core transferable assets.

Return a JSON object with a single key "assets" containing an array of strings from this fixed vocabulary:
["user-data", "payment-infrastructure", "media-upload", "social-graph", "messaging", "scheduling", "search", "marketplace", "b2b-relationships", "consumer-audience", "mobile-app", "api", "content-library", "recommendation-engine", "location-data", "team-productivity"]

Pick 2-4 that best describe what the startup actually has built or accumulated. Return only valid JSON.`

export const PIVOT_GENERATION_PROMPT = (
	description: string,
	failing: string,
	assets: string[],
	patterns: { company: string; fromDomain: string; toDomain: string; outcome: string }[]
) => `You are a brutally honest startup advisor generating pivot suggestions for a failing startup.

STARTUP: ${description}
WHAT'S FAILING: ${failing}
CORE ASSETS: ${assets.join(', ')}

REAL PIVOT INSPIRATION (successful companies that pivoted from similar situations):
${patterns.map((p) => `- ${p.company}: ${p.fromDomain} → ${p.toDomain} (${p.outcome})`).join('\n')}

Generate exactly 5 pivot suggestions, ranked from desperation level 1 (pragmatic) to 5 (unhinged).

Return a JSON object with a "pivots" array. Each pivot must have:
- "title": short punchy name (max 8 words)
- "description": what the startup becomes (2-3 sentences)
- "rationale": why their existing assets make this possible (1 sentence)
- "desperationLevel": integer 1-5
- "advisorType": one of ["GTM", "Product", "Finance", "Growth", "Technical", "Fundraising"]
- "inspiredBy": company name from the patterns above, or null

Make levels 4-5 genuinely creative/absurd but technically feasible given the assets.
Return only valid JSON.`

export const ASSET_EXTRACTION_PROMPT = `You are analyzing a struggling startup. Extract its core transferable assets.

Return a JSON object with a single key "assets" containing an array of strings from this fixed vocabulary:
["user-data", "payment-infrastructure", "media-upload", "social-graph", "messaging", "scheduling", "search", "marketplace", "b2b-relationships", "consumer-audience", "mobile-app", "api", "content-library", "recommendation-engine", "location-data", "team-productivity"]

Pick 2-4 that best describe what the startup actually has built or accumulated. Return only valid JSON.`

export const ROOT_PIVOT_PROMPT = (
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

Generate exactly 6 broad pivot directions, spanning from desperation level 1 (pragmatic) to 5 (unhinged). These are high-level directions that will be explored further.

Return a JSON object with a "pivots" array. Each pivot must have:
- "title": short punchy name (max 8 words)
- "description": what the startup becomes (2-3 sentences)
- "rationale": why their existing assets make this possible (1 sentence)
- "desperationLevel": integer 1-5
- "advisorType": one of ["GTM", "Product", "Finance", "Growth", "Technical", "Fundraising"]
- "inspiredBy": company name from the patterns above, or null

Return only valid JSON.`

export const CHILD_PIVOT_PROMPT = (
	parentTitle: string,
	parentDescription: string,
	startup: string,
	failing: string,
	assets: string[]
) => `You are a startup advisor drilling deeper into one specific pivot direction.

STARTUP: ${startup}
FAILING: ${failing}
ASSETS: ${assets.join(', ')}

PARENT DIRECTION:
"${parentTitle}" — ${parentDescription}

Generate exactly 6 distinct sub-directions that branch from this parent pivot. Each should be specific and differentiated — different target market, implementation approach, or angle on the parent concept. Do not repeat the parent.

Return a JSON object with a "pivots" array. Each pivot must have:
- "title": short punchy name (max 8 words)
- "description": what this specific pivot becomes (2 sentences)
- "rationale": why their assets enable this specific angle (1 sentence)
- "desperationLevel": integer 1-5
- "advisorType": one of ["GTM", "Product", "Finance", "Growth", "Technical", "Fundraising"]

Return only valid JSON.`

export const EVALUATION_PROMPT = (
	startup: string,
	failing: string,
	assets: string[],
	candidates: { id: string; title: string; description: string; level: number }[]
) => `You are the final judge evaluating ${candidates.length} startup pivot ideas from a 3-level exploration tree.

STARTUP: ${startup}
FAILING: ${failing}
ASSETS: ${assets.join(', ')}

All candidates (select exactly 5 IDs):
${candidates.map((c) => `[${c.id}] L${c.level}: "${c.title}" — ${c.description.slice(0, 120)}`).join('\n')}

Select the 5 most promising pivots. Prioritize:
1. Strong leverage of existing assets
2. Market size and feasibility
3. Diversity — pick from different branches of the tree
4. A range of desperation levels

Return only valid JSON: {"selected": ["id1", "id2", "id3", "id4", "id5"]}`

// kept for backward compat — not used in new flow
export const PIVOT_GENERATION_PROMPT = ROOT_PIVOT_PROMPT

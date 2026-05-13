import { ASSET_EXTRACTION_PROMPT, PIVOT_GENERATION_PROMPT } from './prompts'
import type { PivotPattern } from './neo4j'

export interface KimchiConfig {
	apiKey: string
	baseUrl: string
}

export interface Pivot {
	title: string
	description: string
	rationale: string
	desperationLevel: number
	advisorType: string
	inspiredBy: string | null
}

async function callLLM(
	systemPrompt: string,
	userMessage: string,
	model: string,
	config: KimchiConfig
): Promise<string> {
	const res = await fetch(`${config.baseUrl}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.apiKey}`,
		},
		body: JSON.stringify({
			model,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userMessage },
			],
			response_format: { type: 'json_object' },
			temperature: 0.8,
		}),
	})

	if (!res.ok) {
		const err = await res.text()
		throw new Error(`Kimchi API error: ${res.status} ${err}`)
	}

	const data = (await res.json()) as { choices: { message: { content: string } }[] }
	return data.choices[0].message.content
}

export async function extractAssets(
	input: { description: string; failing: string },
	config: KimchiConfig
): Promise<string[]> {
	const content = await callLLM(
		ASSET_EXTRACTION_PROMPT,
		`Startup: ${input.description}\nWhat's failing: ${input.failing}`,
		'gpt-4o-mini',
		config
	)
	const parsed = JSON.parse(content) as { assets: string[] }
	return parsed.assets
}

export async function generatePivots(
	input: {
		description: string
		failing: string
		assets: string[]
		patterns: PivotPattern[]
	},
	config: KimchiConfig
): Promise<Pivot[]> {
	const content = await callLLM(
		'You are a creative startup advisor. Return only valid JSON.',
		PIVOT_GENERATION_PROMPT(input.description, input.failing, input.assets, input.patterns),
		'gpt-4o',
		config
	)
	const parsed = JSON.parse(content) as { pivots: Pivot[] }
	return parsed.pivots.sort((a, b) => a.desperationLevel - b.desperationLevel)
}

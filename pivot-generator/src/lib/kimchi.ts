import { ASSET_EXTRACTION_PROMPT, CHILD_PIVOT_PROMPT, EVALUATION_PROMPT, ROOT_PIVOT_PROMPT } from './prompts'
import type { PivotPattern } from './neo4j'

export interface KimchiConfig {
	apiKey: string
	baseUrl: string
}

export interface PivotNode {
	id: string
	title: string
	description: string
	rationale: string
	desperationLevel: number
	advisorType: string
	inspiredBy: string | null
	level: number
	parentId: string | null
	selected: boolean
}

// keep old Pivot type so any existing references compile
export type Pivot = PivotNode

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
		'kimi-k2.5',
		config
	)
	const parsed = JSON.parse(content) as { assets: string[] }
	return parsed.assets
}

function makeId(): string {
	return Math.random().toString(36).slice(2, 9)
}

export async function generateRootPivots(
	input: { description: string; failing: string; assets: string[]; patterns: PivotPattern[] },
	config: KimchiConfig
): Promise<PivotNode[]> {
	const content = await callLLM(
		'You are a creative startup advisor. Return only valid JSON.',
		ROOT_PIVOT_PROMPT(input.description, input.failing, input.assets, input.patterns),
		'kimi-k2.5',
		config
	)
	const parsed = JSON.parse(content) as {
		pivots: Omit<PivotNode, 'id' | 'level' | 'parentId' | 'selected'>[]
	}
	return parsed.pivots.slice(0, 6).map((p) => ({
		...p,
		id: makeId(),
		level: 1,
		parentId: null,
		selected: false,
	}))
}

export async function generateChildPivots(
	parent: PivotNode,
	input: { description: string; failing: string; assets: string[] },
	config: KimchiConfig
): Promise<PivotNode[]> {
	const content = await callLLM(
		'You are a creative startup advisor drilling into a specific pivot direction. Return only valid JSON.',
		CHILD_PIVOT_PROMPT(
			parent.title,
			parent.description,
			input.description,
			input.failing,
			input.assets
		),
		'kimi-k2.5',
		config
	)
	const parsed = JSON.parse(content) as {
		pivots: Omit<PivotNode, 'id' | 'level' | 'parentId' | 'selected' | 'inspiredBy'>[]
	}
	return parsed.pivots.slice(0, 6).map((p) => ({
		...p,
		inspiredBy: null,
		id: makeId(),
		level: parent.level + 1,
		parentId: parent.id,
		selected: false,
	}))
}

export async function evaluateAndSelect(
	allNodes: PivotNode[],
	input: { description: string; failing: string; assets: string[] },
	config: KimchiConfig
): Promise<string[]> {
	const candidates = allNodes.map((n) => ({
		id: n.id,
		title: n.title,
		description: n.description,
		level: n.level,
	}))

	const content = await callLLM(
		'You are evaluating startup pivot ideas. Return only valid JSON.',
		EVALUATION_PROMPT(input.description, input.failing, input.assets, candidates),
		'kimi-k2.5',
		config
	)
	const parsed = JSON.parse(content) as { selected: string[] }
	const validIds = new Set(allNodes.map((n) => n.id))
	return parsed.selected.filter((id) => validIds.has(id)).slice(0, 5)
}

// legacy — not used in new flow but kept so old import compiles
export async function generatePivots(
	input: {
		description: string
		failing: string
		assets: string[]
		patterns: PivotPattern[]
	},
	config: KimchiConfig
): Promise<PivotNode[]> {
	return generateRootPivots(input, config)
}

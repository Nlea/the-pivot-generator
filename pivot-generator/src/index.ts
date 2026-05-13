import { Hono } from 'hono'
import { extractAssets, evaluateAndSelect, generateChildPivots, generateRootPivots } from './lib/kimchi'
import { findPivotPatterns, storePivotTree } from './lib/neo4j'
import { renderUI } from './ui'

export interface Env {
	NEO4J_URI: string
	NEO4J_USERNAME: string
	NEO4J_PASSWORD: string
	KIMCHI_API_KEY: string
	KIMCHI_BASE_URL: string
}

const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => c.html(renderUI()))

app.post('/pivot', async (c) => {
	const body = await c.req.json<{ description: string; failing: string }>()
	const kimchiConfig = { apiKey: c.env.KIMCHI_API_KEY, baseUrl: c.env.KIMCHI_BASE_URL }
	const neo4jConfig = {
		uri: c.env.NEO4J_URI,
		username: c.env.NEO4J_USERNAME,
		password: c.env.NEO4J_PASSWORD,
	}
	const startup = { description: body.description, failing: body.failing }

	// Extract assets then find historical patterns
	const assets = await extractAssets(startup, kimchiConfig)
	const patterns = await findPivotPatterns(assets, neo4jConfig)

	// Level 1: 6 broad pivot directions
	const level1 = await generateRootPivots({ ...startup, assets, patterns }, kimchiConfig)

	// Level 2: 6 children per level-1 pivot (36 total), run in parallel
	const level2Results = await Promise.allSettled(
		level1.map((parent) => generateChildPivots(parent, { ...startup, assets }, kimchiConfig))
	)
	const level2 = level2Results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))

	// Level 3: 6 children per level-2 pivot (up to 216 total), run in parallel
	const level3Results = await Promise.allSettled(
		level2.map((parent) => generateChildPivots(parent, { ...startup, assets }, kimchiConfig))
	)
	const level3 = level3Results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))

	const allNodes = [...level1, ...level2, ...level3]
	const links = allNodes
		.filter((n) => n.parentId !== null)
		.map((n) => ({ source: n.parentId!, target: n.id }))

	// Evaluate and select top 5 from the full tree
	const selectedIds = await evaluateAndSelect(allNodes, { ...startup, assets }, kimchiConfig)
	const nodes = allNodes.map((n) => ({ ...n, selected: selectedIds.includes(n.id) }))
	const selected = nodes.filter((n) => n.selected)

	// Store the full exploration tree in Neo4j (fire and forget)
	const sessionId = crypto.randomUUID()
	c.executionCtx.waitUntil(storePivotTree(sessionId, body.description, nodes, links, neo4jConfig))

	return c.json({ selected, nodes, links, patterns, totalExplored: allNodes.length })
})

export default app

import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { extractAssets, evaluateAndSelect, generateChildPivots, generateRootPivots } from './lib/kimchi'
import type { PivotNode } from './lib/kimchi'
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

	return streamSSE(c, async (stream) => {
		const send = (event: string, data: unknown) =>
			stream.writeSSE({ event, data: JSON.stringify(data) })

		// Assets + patterns
		const assets = await extractAssets(startup, kimchiConfig)
		await send('assets', { assets })

		const patterns = await findPivotPatterns(assets, neo4jConfig)
		await send('patterns', { patterns })

		// Level 1 — 6 root pivots
		const level1 = await generateRootPivots({ ...startup, assets, patterns }, kimchiConfig)
		for (const node of level1) await send('node', node)

		// Level 2 — 6 children per L1 pivot, parallel; emit each batch as it arrives
		const level2: PivotNode[] = []
		await Promise.all(
			level1.map(async (parent) => {
				try {
					const children = await generateChildPivots(parent, { ...startup, assets }, kimchiConfig)
					for (const node of children) {
						level2.push(node)
						await send('node', node)
					}
				} catch {}
			})
		)

		// Level 3 — 6 children per L2 pivot, parallel; emit each batch as it arrives
		const level3: PivotNode[] = []
		await Promise.all(
			level2.map(async (parent) => {
				try {
					const children = await generateChildPivots(parent, { ...startup, assets }, kimchiConfig)
					for (const node of children) {
						level3.push(node)
						await send('node', node)
					}
				} catch {}
			})
		)

		const allNodes = [...level1, ...level2, ...level3]
		const links = allNodes
			.filter((n) => n.parentId !== null)
			.map((n) => ({ source: n.parentId!, target: n.id }))

		// Evaluate — pick top 5
		const selectedIds = await evaluateAndSelect(allNodes, { ...startup, assets }, kimchiConfig)
		const selectedNodes = allNodes
			.filter((n) => selectedIds.includes(n.id))
			.map((n) => ({ ...n, selected: true }))
		await send('selected', { selectedIds, selectedNodes, patterns })

		await send('done', { totalExplored: allNodes.length })

		// Persist tree to Neo4j in the background
		const sessionId = crypto.randomUUID()
		c.executionCtx.waitUntil(
			storePivotTree(
				sessionId,
				body.description,
				allNodes.map((n) => ({ ...n, selected: selectedIds.includes(n.id) })),
				links,
				neo4jConfig
			)
		)
	})
})

export default app

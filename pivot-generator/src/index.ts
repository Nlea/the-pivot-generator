import { Hono } from 'hono'
import { extractAssets, generatePivots } from './lib/kimchi'
import { findPivotPatterns } from './lib/neo4j'
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

	const assets = await extractAssets(
		{ description: body.description, failing: body.failing },
		{ apiKey: c.env.KIMCHI_API_KEY, baseUrl: c.env.KIMCHI_BASE_URL }
	)

	const patterns = await findPivotPatterns(assets, {
		uri: c.env.NEO4J_URI,
		username: c.env.NEO4J_USERNAME,
		password: c.env.NEO4J_PASSWORD,
	})

	const pivots = await generatePivots(
		{ description: body.description, failing: body.failing, assets, patterns },
		{ apiKey: c.env.KIMCHI_API_KEY, baseUrl: c.env.KIMCHI_BASE_URL }
	)

	return c.json({ pivots })
})

export default app

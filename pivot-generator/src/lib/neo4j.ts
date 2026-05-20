import type { PivotNode } from './kimchi'

export interface Neo4jConfig {
	uri: string
	username: string
	password: string
}

export interface PivotPattern {
	fromDomain: string
	toDomain: string
	company: string
	sharedAssets: string[]
	outcome: string
}

export async function findPivotPatterns(
	assets: string[],
	config: Neo4jConfig
): Promise<PivotPattern[]> {
	const query = `
    MATCH (p:PivotPattern)-[:HAS_ASSET]->(a:AssetType)
    WHERE a.name IN $assets
    WITH p, collect(DISTINCT a.name) AS sharedAssets
    MATCH (p)-[:PIVOTED_FROM]->(from:Domain)
    MATCH (p)-[:PIVOTED_TO]->(to:Domain)
    MATCH (p)-[:RESULTED_IN]->(o:Outcome)
    RETURN p.company AS company,
           from.name AS fromDomain,
           to.name AS toDomain,
           sharedAssets,
           o.description AS outcome
    ORDER BY size(sharedAssets) DESC
    LIMIT 5
  `

	const httpEndpoint = config.uri.replace('neo4j+s://', 'https://').replace('neo4j://', 'http://')

	console.log('Neo4j endpoint:', httpEndpoint)
	try {
		const res = await fetch(`${httpEndpoint}/db/${config.username}/query/v2`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${btoa(`${config.username}:${config.password}`)}`,
			},
			body: JSON.stringify({ statement: query, parameters: { assets } }),
		})

		console.log('Neo4j response status:', res.status)
		if (!res.ok) {
			const body = await res.text()
			console.error('Neo4j query failed:', res.status, body)
			return []
		}

		const raw = await res.text()
		console.log('Neo4j raw response:', raw.slice(0, 500))
		const data = JSON.parse(raw) as { data?: { fields: string[]; values: unknown[][] } }
		if (!data?.data?.fields || !data?.data?.values) {
			console.error('Neo4j unexpected response shape:', JSON.stringify(data).slice(0, 300))
			return []
		}

		const { fields, values } = data.data

		return values.map((row) => {
			const record = Object.fromEntries(fields.map((f: string, i: number) => [f, row[i]]))
			return {
				company: record.company as string,
				fromDomain: record.fromDomain as string,
				toDomain: record.toDomain as string,
				sharedAssets: record.sharedAssets as string[],
				outcome: record.outcome as string,
			}
		})
	} catch (err) {
		console.error('Neo4j findPivotPatterns error:', err)
		return []
	}
}

export async function storePivotTree(
	sessionId: string,
	startup: string,
	nodes: PivotNode[],
	links: { source: string; target: string }[],
	config: Neo4jConfig
): Promise<void> {
	const httpEndpoint = config.uri.replace('neo4j+s://', 'https://').replace('neo4j://', 'http://')
	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Basic ${btoa(`${config.username}:${config.password}`)}`,
	}

	const nodeParams = nodes.map((n) => ({
		id: n.id,
		title: n.title,
		description: n.description,
		level: n.level,
		desperationLevel: n.desperationLevel,
		selected: n.selected,
	}))

	// Create session node + all pivot nodes
	const r1 = await fetch(`${httpEndpoint}/db/${config.username}/query/v2`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			statement: `
        MERGE (s:PivotSession {id: $sessionId})
        SET s.startup = $startup, s.createdAt = timestamp()
        WITH s
        UNWIND $nodes AS n
        CREATE (p:GeneratedPivot {
          id: n.id,
          title: n.title,
          description: n.description,
          level: n.level,
          desperationLevel: n.desperationLevel,
          selected: n.selected,
          sessionId: $sessionId
        })
        CREATE (s)-[:CONTAINS]->(p)
      `,
			parameters: { sessionId, startup, nodes: nodeParams },
		}),
	})
	if (!r1.ok) {
		console.error('storePivotTree nodes failed:', r1.status, await r1.text())
		return
	}
	const d1 = await r1.json() as { errors?: unknown[] }
	if (d1.errors?.length) {
		console.error('storePivotTree nodes errors:', JSON.stringify(d1.errors))
		return
	}
	console.log('storePivotTree: nodes written OK', nodes.length)

	// Create SPAWNED relationships between pivots
	const r2 = await fetch(`${httpEndpoint}/db/${config.username}/query/v2`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			statement: `
        UNWIND $links AS l
        MATCH (parent:GeneratedPivot {id: l.source, sessionId: $sessionId})
        MATCH (child:GeneratedPivot {id: l.target, sessionId: $sessionId})
        CREATE (parent)-[:SPAWNED]->(child)
      `,
			parameters: { sessionId, links },
		}),
	})
	if (!r2.ok) {
		console.error('storePivotTree links failed:', r2.status, await r2.text())
		return
	}
	console.log('storePivotTree: links written OK', links.length)
}

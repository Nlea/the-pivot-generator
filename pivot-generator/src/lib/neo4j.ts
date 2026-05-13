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
	const res = await fetch(`${httpEndpoint}/db/neo4j/query/v2`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Basic ${btoa(`${config.username}:${config.password}`)}`,
		},
		body: JSON.stringify({ query, parameters: { assets } }),
	})

	if (!res.ok) return []

	const data = (await res.json()) as { data: { fields: string[]; values: unknown[][] } }
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
	await fetch(`${httpEndpoint}/db/neo4j/query/v2`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			query: `
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

	// Create SPAWNED relationships between pivots
	await fetch(`${httpEndpoint}/db/neo4j/query/v2`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			query: `
        UNWIND $links AS l
        MATCH (parent:GeneratedPivot {id: l.source, sessionId: $sessionId})
        MATCH (child:GeneratedPivot {id: l.target, sessionId: $sessionId})
        CREATE (parent)-[:SPAWNED]->(child)
      `,
			parameters: { sessionId, links },
		}),
	})
}

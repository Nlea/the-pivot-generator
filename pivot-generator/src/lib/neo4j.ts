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
    MATCH (s:Startup)-[:HAS_ASSET]->(a:AssetType)<-[:HAS_ASSET]-(p:PivotPattern)
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

// ── Constraints (make MERGE safe and atomic) ─────────────────────────────────
CYPHER 25
CREATE CONSTRAINT assetType_name IF NOT EXISTS FOR (a:AssetType) REQUIRE a.name IS UNIQUE;

CYPHER 25
CREATE CONSTRAINT domain_name IF NOT EXISTS FOR (d:Domain) REQUIRE d.name IS UNIQUE;

CYPHER 25
CREATE CONSTRAINT pivotPattern_company IF NOT EXISTS FOR (p:PivotPattern) REQUIRE p.company IS UNIQUE;

// ── Asset Types ───────────────────────────────────────────────────────────────
CYPHER 25
UNWIND [
  'user-data', 'payment-infrastructure', 'media-upload', 'social-graph',
  'messaging', 'scheduling', 'search', 'marketplace', 'b2b-relationships',
  'consumer-audience', 'mobile-app', 'api', 'content-library',
  'recommendation-engine', 'location-data', 'team-productivity'
] AS name
MERGE (:AssetType {name: name});

// ── Domains ───────────────────────────────────────────────────────────────────
CYPHER 25
UNWIND [
  'dating-app', 'video-hosting', 'gaming', 'team-chat', 'photo-sharing',
  'check-in-app', 'podcast-platform', 'microblogging', 'dvd-rental',
  'video-streaming', 'mobile-payments', 'online-payments', 'crypto-exchange',
  'email-client', 'snowboard-shop', 'ecommerce-platform', 'social-activism',
  'deals-marketplace', 'home-sharing', 'air-mattress-rental', 'camera-software',
  'mobile-platform', 'mobile-shopping', 'visual-discovery', 'gps-device',
  'fitness-tracking', 'sms-marketing', 'b2b-saas'
] AS name
MERGE (:Domain {name: name});

// ── Pivot 1: YouTube — dating app → video hosting ─────────────────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'YouTube'})
WITH p
MATCH (from:Domain {name: 'dating-app'})
MATCH (to:Domain {name: 'video-hosting'})
MATCH (a1:AssetType {name: 'media-upload'})
MATCH (a2:AssetType {name: 'user-data'})
MATCH (a3:AssetType {name: 'consumer-audience'})
MERGE (o:Outcome {company: 'YouTube'})
  ON CREATE SET o.description = 'Acquired by Google for $1.65B in 2006, grew to 2B+ users and the world\'s second largest search engine'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 2: Slack — gaming → team chat ───────────────────────────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Slack'})
WITH p
MATCH (from:Domain {name: 'gaming'})
MATCH (to:Domain {name: 'team-chat'})
MATCH (a1:AssetType {name: 'messaging'})
MATCH (a2:AssetType {name: 'team-productivity'})
MATCH (a3:AssetType {name: 'api'})
MERGE (o:Outcome {company: 'Slack'})
  ON CREATE SET o.description = 'Grew to $7B valuation in 5 years, acquired by Salesforce for $27.7B in 2021'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 3: Instagram — check-in app → photo sharing ────────────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Instagram'})
WITH p
MATCH (from:Domain {name: 'check-in-app'})
MATCH (to:Domain {name: 'photo-sharing'})
MATCH (a1:AssetType {name: 'mobile-app'})
MATCH (a2:AssetType {name: 'social-graph'})
MATCH (a3:AssetType {name: 'location-data'})
MERGE (o:Outcome {company: 'Instagram'})
  ON CREATE SET o.description = 'Acquired by Facebook for $1B in 2012 with 13 employees, grew to 1B+ users and $20B+ annual revenue'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 4: Twitter — podcast platform → microblogging ──────────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Twitter'})
WITH p
MATCH (from:Domain {name: 'podcast-platform'})
MATCH (to:Domain {name: 'microblogging'})
MATCH (a1:AssetType {name: 'consumer-audience'})
MATCH (a2:AssetType {name: 'content-library'})
MATCH (a3:AssetType {name: 'api'})
MERGE (o:Outcome {company: 'Twitter'})
  ON CREATE SET o.description = 'Grew to 300M+ users, went public at $24B valuation, acquired by Elon Musk for $44B in 2022'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 5: Netflix — dvd rental → video streaming ──────────────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Netflix'})
WITH p
MATCH (from:Domain {name: 'dvd-rental'})
MATCH (to:Domain {name: 'video-streaming'})
MATCH (a1:AssetType {name: 'content-library'})
MATCH (a2:AssetType {name: 'recommendation-engine'})
MATCH (a3:AssetType {name: 'payment-infrastructure'})
MERGE (o:Outcome {company: 'Netflix'})
  ON CREATE SET o.description = 'Grew to 260M+ subscribers globally, $150B+ market cap, became a major content studio'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 6: PayPal — mobile payments → online payments ──────────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'PayPal'})
WITH p
MATCH (from:Domain {name: 'mobile-payments'})
MATCH (to:Domain {name: 'online-payments'})
MATCH (a1:AssetType {name: 'payment-infrastructure'})
MATCH (a2:AssetType {name: 'user-data'})
MATCH (a3:AssetType {name: 'api'})
MERGE (o:Outcome {company: 'PayPal'})
  ON CREATE SET o.description = 'Acquired by eBay for $1.5B in 2002, spun off in 2015 at $50B valuation, now processes $1T+ annually'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 7: Shopify — snowboard shop → ecommerce platform ───────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Shopify'})
WITH p
MATCH (from:Domain {name: 'snowboard-shop'})
MATCH (to:Domain {name: 'ecommerce-platform'})
MATCH (a1:AssetType {name: 'payment-infrastructure'})
MATCH (a2:AssetType {name: 'b2b-relationships'})
MATCH (a3:AssetType {name: 'api'})
MERGE (o:Outcome {company: 'Shopify'})
  ON CREATE SET o.description = 'Grew to $100B+ market cap, powers 1M+ businesses, processes $200B+ in merchant sales annually'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 8: Groupon — social activism → deals marketplace ───────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Groupon'})
WITH p
MATCH (from:Domain {name: 'social-activism'})
MATCH (to:Domain {name: 'deals-marketplace'})
MATCH (a1:AssetType {name: 'consumer-audience'})
MATCH (a2:AssetType {name: 'b2b-relationships'})
MATCH (a3:AssetType {name: 'marketplace'})
MERGE (o:Outcome {company: 'Groupon'})
  ON CREATE SET o.description = 'Fastest company to reach $1B valuation at the time, IPO at $13B in 2011'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 9: Airbnb — air mattress rental → home sharing ─────────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Airbnb'})
WITH p
MATCH (from:Domain {name: 'air-mattress-rental'})
MATCH (to:Domain {name: 'home-sharing'})
MATCH (a1:AssetType {name: 'marketplace'})
MATCH (a2:AssetType {name: 'payment-infrastructure'})
MATCH (a3:AssetType {name: 'user-data'})
MERGE (o:Outcome {company: 'Airbnb'})
  ON CREATE SET o.description = 'IPO at $100B+ in 2020, disrupted hotels globally with 4M+ hosts in 220 countries'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 10: Flickr — gaming → photo sharing ────────────────────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Flickr'})
WITH p
MATCH (from:Domain {name: 'gaming'})
MATCH (to:Domain {name: 'photo-sharing'})
MATCH (a1:AssetType {name: 'media-upload'})
MATCH (a2:AssetType {name: 'social-graph'})
MATCH (a3:AssetType {name: 'user-data'})
MERGE (o:Outcome {company: 'Flickr'})
  ON CREATE SET o.description = 'Acquired by Yahoo for ~$35M in 2005, pioneered social photo sharing and tagging on the web'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 11: Pinterest — mobile shopping → visual discovery ──────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Pinterest'})
WITH p
MATCH (from:Domain {name: 'mobile-shopping'})
MATCH (to:Domain {name: 'visual-discovery'})
MATCH (a1:AssetType {name: 'media-upload'})
MATCH (a2:AssetType {name: 'recommendation-engine'})
MATCH (a3:AssetType {name: 'social-graph'})
MERGE (o:Outcome {company: 'Pinterest'})
  ON CREATE SET o.description = 'IPO at $10B in 2019, grew to 450M+ monthly active users, major commerce discovery platform'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 12: Android — camera software → mobile platform ────────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Android'})
WITH p
MATCH (from:Domain {name: 'camera-software'})
MATCH (to:Domain {name: 'mobile-platform'})
MATCH (a1:AssetType {name: 'api'})
MATCH (a2:AssetType {name: 'mobile-app'})
MATCH (a3:AssetType {name: 'b2b-relationships'})
MERGE (o:Outcome {company: 'Android'})
  ON CREATE SET o.description = 'Acquired by Google for $50M in 2005, became the world\'s most used mobile OS with 3B+ active devices'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 13: Strava — gps device → fitness tracking ─────────────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Strava'})
WITH p
MATCH (from:Domain {name: 'gps-device'})
MATCH (to:Domain {name: 'fitness-tracking'})
MATCH (a1:AssetType {name: 'location-data'})
MATCH (a2:AssetType {name: 'mobile-app'})
MATCH (a3:AssetType {name: 'social-graph'})
MERGE (o:Outcome {company: 'Strava'})
  ON CREATE SET o.description = 'Grew to 100M+ athletes in 190 countries, valued at $1.5B, the definitive social network for athletes'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

// ── Pivot 14: Twilio — sms marketing → b2b saas ──────────────────────────────
CYPHER 25
MERGE (p:PivotPattern {company: 'Twilio'})
WITH p
MATCH (from:Domain {name: 'sms-marketing'})
MATCH (to:Domain {name: 'b2b-saas'})
MATCH (a1:AssetType {name: 'api'})
MATCH (a2:AssetType {name: 'messaging'})
MATCH (a3:AssetType {name: 'b2b-relationships'})
MERGE (o:Outcome {company: 'Twilio'})
  ON CREATE SET o.description = 'IPO at $1.2B in 2016, grew to $10B+ revenue powering communications for 300K+ businesses'
MERGE (p)-[:PIVOTED_FROM]->(from)
MERGE (p)-[:PIVOTED_TO]->(to)
MERGE (p)-[:HAS_ASSET]->(a1)
MERGE (p)-[:HAS_ASSET]->(a2)
MERGE (p)-[:HAS_ASSET]->(a3)
MERGE (p)-[:RESULTED_IN]->(o);

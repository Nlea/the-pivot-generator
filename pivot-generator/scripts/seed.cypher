// Clear existing data
MATCH (n) DETACH DELETE n;

// Asset types
MERGE (a1:AssetType {name: 'media-upload'})
MERGE (a2:AssetType {name: 'social-graph'})
MERGE (a3:AssetType {name: 'consumer-audience'})
MERGE (a4:AssetType {name: 'messaging'})
MERGE (a5:AssetType {name: 'b2b-relationships'})
MERGE (a6:AssetType {name: 'location-data'})
MERGE (a7:AssetType {name: 'scheduling'})
MERGE (a8:AssetType {name: 'payment-infrastructure'})
MERGE (a9:AssetType {name: 'mobile-app'})
MERGE (a10:AssetType {name: 'api'})
MERGE (a11:AssetType {name: 'marketplace'})
MERGE (a12:AssetType {name: 'team-productivity'})
MERGE (a13:AssetType {name: 'content-library'})
MERGE (a14:AssetType {name: 'recommendation-engine'})
MERGE (a15:AssetType {name: 'user-data'})
MERGE (a16:AssetType {name: 'search'});

// Domains
MERGE (d1:Domain {name: 'dating-app'})
MERGE (d2:Domain {name: 'video-hosting'})
MERGE (d3:Domain {name: 'gaming'})
MERGE (d4:Domain {name: 'team-chat'})
MERGE (d5:Domain {name: 'photo-sharing'})
MERGE (d6:Domain {name: 'check-in-app'})
MERGE (d7:Domain {name: 'podcast-platform'})
MERGE (d8:Domain {name: 'microblogging'})
MERGE (d9:Domain {name: 'dvd-rental'})
MERGE (d10:Domain {name: 'video-streaming'})
MERGE (d11:Domain {name: 'payments'})
MERGE (d12:Domain {name: 'crypto-exchange'})
MERGE (d13:Domain {name: 'ride-sharing'})
MERGE (d14:Domain {name: 'food-delivery'})
MERGE (d15:Domain {name: 'erp-software'})
MERGE (d16:Domain {name: 'crm'})
MERGE (d17:Domain {name: 'search-engine'})
MERGE (d18:Domain {name: 'ecommerce'})
MERGE (d19:Domain {name: 'internal-tool'})
MERGE (d20:Domain {name: 'b2b-saas'})
MERGE (d21:Domain {name: 'social-network'})
MERGE (d22:Domain {name: 'cloud-storage'})
MERGE (d23:Domain {name: 'music-streaming'})
MERGE (d24:Domain {name: 'email-client');

// Pivot Patterns
// YouTube: dating → video hosting
MERGE (p1:PivotPattern {company: 'YouTube'})
CREATE (p1)-[:PIVOTED_FROM]->(d1)
CREATE (p1)-[:PIVOTED_TO]->(d2)
CREATE (p1)-[:HAS_ASSET]->(a1)
CREATE (p1)-[:HAS_ASSET]->(a3)
CREATE (p1)-[:RESULTED_IN]->(:Outcome {description: 'Became the worlds largest video platform, acquired by Google for $1.65B'});

// Slack: gaming → team chat
MERGE (p2:PivotPattern {company: 'Slack'})
CREATE (p2)-[:PIVOTED_FROM]->(d3)
CREATE (p2)-[:PIVOTED_TO]->(d4)
CREATE (p2)-[:HAS_ASSET]->(a4)
CREATE (p2)-[:HAS_ASSET]->(a12)
CREATE (p2)-[:RESULTED_IN]->(:Outcome {description: 'Became the leading workplace chat tool, acquired by Salesforce for $27.7B'});

// Instagram: check-in → photo sharing
MERGE (p3:PivotPattern {company: 'Instagram'})
CREATE (p3)-[:PIVOTED_FROM]->(d6)
CREATE (p3)-[:PIVOTED_TO]->(d5)
CREATE (p3)-[:HAS_ASSET]->(a1)
CREATE (p3)-[:HAS_ASSET]->(a6)
CREATE (p3)-[:HAS_ASSET]->(a9)
CREATE (p3)-[:RESULTED_IN]->(:Outcome {description: 'Acquired by Facebook for $1B just 18 months after pivot'});

// Twitter: podcasting → microblogging
MERGE (p4:PivotPattern {company: 'Twitter'})
CREATE (p4)-[:PIVOTED_FROM]->(d7)
CREATE (p4)-[:PIVOTED_TO]->(d8)
CREATE (p4)-[:HAS_ASSET]->(a3)
CREATE (p4)-[:HAS_ASSET]->(a4)
CREATE (p4)-[:RESULTED_IN]->(:Outcome {description: 'IPO at $24B in 2013, became global real-time information network'});

// Netflix: DVD rental → streaming
MERGE (p5:PivotPattern {company: 'Netflix'})
CREATE (p5)-[:PIVOTED_FROM]->(d9)
CREATE (p5)-[:PIVOTED_TO]->(d10)
CREATE (p5)-[:HAS_ASSET]->(a13)
CREATE (p5)-[:HAS_ASSET]->(a14)
CREATE (p5)-[:HAS_ASSET]->(a8)
CREATE (p5)-[:RESULTED_IN]->(:Outcome {description: 'Became $250B streaming giant, disrupted entire entertainment industry'});

// PayPal: cryptography software → payments
MERGE (p6:PivotPattern {company: 'PayPal'})
CREATE (p6)-[:PIVOTED_FROM]->(d19)
CREATE (p6)-[:PIVOTED_TO]->(d11)
CREATE (p6)-[:HAS_ASSET]->(a10)
CREATE (p6)-[:HAS_ASSET]->(a8)
CREATE (p6)-[:RESULTED_IN]->(:Outcome {description: 'IPO then acquired by eBay for $1.5B, now $80B+ standalone company'});

// Coinbase: Y Combinator app → crypto exchange
MERGE (p7:PivotPattern {company: 'Shopify'})
CREATE (p7)-[:PIVOTED_FROM]->(d18)
CREATE (p7)-[:PIVOTED_TO]->(d20)
CREATE (p7)-[:HAS_ASSET]->(a8)
CREATE (p7)-[:HAS_ASSET]->(a11)
CREATE (p7)-[:HAS_ASSET]->(a10)
CREATE (p7)-[:RESULTED_IN]->(:Outcome {description: 'Became $100B+ ecommerce platform powering 10% of US ecommerce'});

// Uber: black car booking → ride-sharing marketplace
MERGE (p8:PivotPattern {company: 'Uber'})
CREATE (p8)-[:PIVOTED_FROM]->(d13)
CREATE (p8)-[:PIVOTED_TO]->(d14)
CREATE (p8)-[:HAS_ASSET]->(a6)
CREATE (p8)-[:HAS_ASSET]->(a9)
CREATE (p8)-[:HAS_ASSET]->(a11)
CREATE (p8)-[:RESULTED_IN]->(:Outcome {description: 'Expanded from rides to $100B+ logistics and delivery empire'});

// Flickr: gaming → photo sharing
MERGE (p9:PivotPattern {company: 'Flickr'})
CREATE (p9)-[:PIVOTED_FROM]->(d3)
CREATE (p9)-[:PIVOTED_TO]->(d5)
CREATE (p9)-[:HAS_ASSET]->(a1)
CREATE (p9)-[:HAS_ASSET]->(a2)
CREATE (p9)-[:RESULTED_IN]->(:Outcome {description: 'Acquired by Yahoo for $35M, pioneered social photo sharing'});

// Salesforce: traditional ERP → cloud CRM
MERGE (p10:PivotPattern {company: 'Salesforce'})
CREATE (p10)-[:PIVOTED_FROM]->(d15)
CREATE (p10)-[:PIVOTED_TO]->(d16)
CREATE (p10)-[:HAS_ASSET]->(a5)
CREATE (p10)-[:HAS_ASSET]->(a10)
CREATE (p10)-[:HAS_ASSET]->(a15)
CREATE (p10)-[:RESULTED_IN]->(:Outcome {description: 'Created the SaaS model, now $200B+ CRM market leader'});

// Groupon: activism platform → deals
MERGE (p11:PivotPattern {company: 'Groupon'})
CREATE (p11)-[:PIVOTED_FROM]->(d21)
CREATE (p11)-[:PIVOTED_TO]->(d18)
CREATE (p11)-[:HAS_ASSET]->(a3)
CREATE (p11)-[:HAS_ASSET]->(a4)
CREATE (p11)-[:RESULTED_IN]->(:Outcome {description: 'Fastest company to $1B revenue, IPO valued at $12.7B'});

// Dropbox: email attachments → cloud storage
MERGE (p12:PivotPattern {company: 'Dropbox'})
CREATE (p12)-[:PIVOTED_FROM]->(d24)
CREATE (p12)-[:PIVOTED_TO]->(d22)
CREATE (p12)-[:HAS_ASSET]->(a1)
CREATE (p12)-[:HAS_ASSET]->(a10)
CREATE (p12)-[:RESULTED_IN]->(:Outcome {description: 'IPO at $9.2B, 700M+ registered users worldwide'});

// Spotify: P2P music → licensed streaming
MERGE (p13:PivotPattern {company: 'Spotify'})
CREATE (p13)-[:PIVOTED_FROM]->(d23)
CREATE (p13)-[:PIVOTED_TO]->(d23)
CREATE (p13)-[:HAS_ASSET]->(a13)
CREATE (p13)-[:HAS_ASSET]->(a14)
CREATE (p13)-[:HAS_ASSET]->(a15)
CREATE (p13)-[:RESULTED_IN]->(:Outcome {description: 'IPO at $26B, 600M+ users, dominant music and podcast platform'});

// Notion: internal tool → B2B SaaS
MERGE (p14:PivotPattern {company: 'Notion'})
CREATE (p14)-[:PIVOTED_FROM]->(d19)
CREATE (p14)-[:PIVOTED_TO]->(d20)
CREATE (p14)-[:HAS_ASSET]->(a12)
CREATE (p14)-[:HAS_ASSET]->(a13)
CREATE (p14)-[:RESULTED_IN]->(:Outcome {description: 'Reached $10B valuation, 30M+ users across 4M+ teams'});

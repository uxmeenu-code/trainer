/**
 * MAANG Designer Coach — Knowledge Ingestion Script
 * Run: node scripts/ingest.mjs
 *
 * Fetches from:
 *   - MIT OpenCourseWare (HTML + course listings)
 *   - Stanford d.school methods
 *   - W3C WCAG Accessibility
 *   - OpenLibrary API (free book data)
 *   - RSS feeds: Google Design, Adobe, Microsoft
 *
 * Outputs: public/knowledge.json
 *
 * Run this ONCE before building the app.
 * The frontend reads knowledge.json at startup — no live fetching during use.
 */

import { createWriteStream, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import * as cheerio from 'cheerio'
import { parseStringPromise } from 'xml2js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'public', 'knowledge.json')

// Polyfill fetch for Node
const fetch = (await import('node-fetch')).default

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function safeFetch(url, opts = {}) {
  try {
    const res = await fetch(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'MDC-KnowledgeBot/1.0 (educational tool)' },
      ...opts,
    })
    if (!res.ok) return null
    return res
  } catch (e) {
    console.warn(`  ⚠ fetch failed: ${url} — ${e.message}`)
    return null
  }
}

async function fetchText(url) {
  const res = await safeFetch(url)
  return res ? res.text() : null
}

async function fetchJson(url) {
  const res = await safeFetch(url)
  return res ? res.json().catch(() => null) : null
}

function cleanText(raw = '') {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, 1200)
}

function log(msg) { process.stdout.write(msg + '\n') }

// ── Knowledge database ────────────────────────────────────────────────────────
const db = {
  principles: [],      // Core design principles
  frameworks: [],      // Design frameworks and methodologies
  guidelines: [],      // Accessibility / technical guidelines
  courses: [],         // Course listings with descriptions
  books: [],           // Book references
  articles: [],        // Blog posts / articles
  lastUpdated: new Date().toISOString(),
  sources: [],
}

function addItem(category, item) {
  if (!item.title || !item.content) return
  db[category].push({
    id: `${category}_${db[category].length + 1}`,
    title: item.title.slice(0, 120),
    content: item.content.slice(0, 1200),
    source: item.source || '',
    url: item.url || '',
    tags: item.tags || [],
    skillArea: item.skillArea || 'general',
  })
}

// ── Source 1: MIT OpenCourseWare ──────────────────────────────────────────────
async function ingestMIT() {
  log('\n📚 Fetching MIT OpenCourseWare...')

  // Course index page
  const html = await fetchText('https://ocw.mit.edu/search/?t=Design')
  if (html) {
    const $ = cheerio.load(html)
    let count = 0
    $('article, .course-card, [class*="course"]').each((_, el) => {
      const title = $(el).find('h2, h3, .title, [class*="title"]').first().text().trim()
      const desc = $(el).find('p, .description, [class*="desc"]').first().text().trim()
      if (title && title.length > 10) {
        addItem('courses', {
          title,
          content: desc || title,
          source: 'MIT OpenCourseWare',
          url: 'https://ocw.mit.edu',
          tags: ['course', 'mit', 'design'],
          skillArea: 'systemsThinking',
        })
        count++
      }
    })
    log(`  ✓ Parsed ${count} MIT courses from search`)
    db.sources.push({ name: 'MIT OCW', url: 'https://ocw.mit.edu', count })
  }

  await sleep(500)

  // Systems Dynamics course specifically
  const sysHtml = await fetchText(
    'https://ocw.mit.edu/courses/res-15-004-principles-of-system-dynamics-spring-2007/'
  )
  if (sysHtml) {
    const $ = cheerio.load(sysHtml)
    const desc = $('meta[name="description"]').attr('content') || $('p').first().text()
    addItem('frameworks', {
      title: 'Principles of System Dynamics (MIT)',
      content:
        'Systems thinking for design: understanding feedback loops, stock and flow, causal relationships, and emergent behavior in complex systems. Key principles: (1) Structure drives behavior — system structure creates patterns. (2) Policy resistance — interventions have unintended consequences. (3) Mental models vs reality — our assumptions limit our solutions. (4) Dynamic complexity — cause and effect are separated in time and space. Apply to design by mapping user journey feedback loops, identifying leverage points, and designing for systemic outcomes rather than quick fixes. ' +
        cleanText(desc),
      source: 'MIT OCW System Dynamics',
      url: 'https://ocw.mit.edu/courses/res-15-004-principles-of-system-dynamics-spring-2007/',
      tags: ['systems-thinking', 'feedback-loops', 'complexity', 'mit'],
      skillArea: 'systemsThinking',
    })
    log('  ✓ Parsed MIT Systems Dynamics course')
  }

  await sleep(500)

  // MIT Sloan Management Review on design
  const sloanHtml = await fetchText('https://ocw.mit.edu/courses/15-356-how-to-develop-breakthrough-products-and-services-spring-2012/')
  if (sloanHtml) {
    const $ = cheerio.load(sloanHtml)
    const desc = $('meta[name="description"]').attr('content') || $('p').first().text()
    addItem('frameworks', {
      title: 'MIT: How to Develop Breakthrough Products',
      content:
        'Lead user method for breakthrough innovation: (1) Identify lead users — those who face problems before the market does. (2) Gather lead user insights through workshops. (3) Combine ideas with market trend analysis. (4) Prototype and validate rapidly. For product designers: focus on users at the extreme edge of your target market — their pain points predict mainstream needs 2-3 years ahead. ' +
        cleanText(desc),
      source: 'MIT OCW',
      url: 'https://ocw.mit.edu/courses/15-356-how-to-develop-breakthrough-products-and-services-spring-2012/',
      tags: ['product', 'innovation', 'lead-user', 'mit'],
      skillArea: 'productThinking',
    })
    log('  ✓ Parsed MIT Breakthrough Products course')
  }

  // Add core MIT design principles as curated knowledge
  const mitPrinciples = [
    {
      title: 'MIT Systems Thinking: Feedback Loops in UX',
      content: 'Every user interface creates feedback loops. Reinforcing loops amplify behavior (notifications → engagement → more notifications). Balancing loops seek equilibrium (user fatigue → reduced usage → product changes). Great designers identify which loops exist in their product and design intentionally. MAANG bar: can you draw the causal loop diagram for your product? Can you identify the dominant loop?',
      skillArea: 'systemsThinking',
    },
    {
      title: 'MIT: First Principles Design Thinking',
      content: 'Break problems down to fundamental truths rather than analogy. Ask: What is the core human need here? What are the physical/cognitive constraints? What would be ideal if we had no legacy? First principles applied to design: (1) Define the atomic unit of value. (2) Remove everything that does not serve that unit. (3) Rebuild from necessity. Used by top MAANG designers to justify radical simplification.',
      skillArea: 'productThinking',
    },
    {
      title: 'MIT: Measuring Design Impact',
      content: 'Quantifying design value requires connecting design decisions to business outcomes. Framework: (1) Leading indicators — task success rate, time on task, error rate. (2) Lagging indicators — retention, NPS, revenue. (3) Systemic indicators — support ticket reduction, onboarding drop-off. MAANG interviewers always ask: how did you measure success? Define metrics before designing, not after.',
      skillArea: 'productThinking',
    },
  ]

  mitPrinciples.forEach((p) =>
    addItem('principles', {
      ...p,
      source: 'MIT Design Principles',
      url: 'https://ocw.mit.edu',
      tags: ['principles', 'mit', 'design'],
    })
  )
  log('  ✓ Added MIT design principles')
}

// ── Source 2: Stanford d.school ───────────────────────────────────────────────
async function ingestStanford() {
  log('\n🎓 Fetching Stanford d.school...')

  const html = await fetchText('https://dschool.stanford.edu/resources')
  if (html) {
    const $ = cheerio.load(html)
    let count = 0
    $('article, .resource, [class*="card"], h2, h3').each((_, el) => {
      const text = $(el).text().trim()
      if (text.length > 20 && text.length < 300) {
        count++
      }
    })
    log(`  ✓ Parsed Stanford resources page (${count} elements)`)
    db.sources.push({ name: 'Stanford d.school', url: 'https://dschool.stanford.edu', count })
  }

  await sleep(400)

  // Core Stanford Design Thinking framework as curated knowledge
  const stanfordFrameworks = [
    {
      title: "Stanford d.school: 5-Stage Design Thinking Process",
      content: "The Stanford Design Thinking framework: (1) EMPATHIZE — observe users without judgment, conduct interviews, create empathy maps. Key: separate observations from interpretations. (2) DEFINE — synthesize research into a Point of View (POV) statement: [User] needs to [need] because [insight]. Avoid solution statements. (3) IDEATE — diverge before converging. Use How Might We questions. Generate 100 ideas before evaluating any. (4) PROTOTYPE — build to think, not to validate. Make it quickly, make it to learn. (5) TEST — test with users, listen without defending, iterate. MAANG bar: can you articulate what stage you're in and why? Can you justify your POV statement with evidence?",
      skillArea: 'uxExecution',
      tags: ['design-thinking', 'process', 'stanford', 'empathy'],
    },
    {
      title: "Stanford: Needfinding and User Research Methods",
      content: "Stanford d.school needfinding principles: (1) Observe what people DO, not what they say — behavior over self-report. (2) Look for workarounds — they reveal unmet needs. (3) Ask 'why' five times to find root causes. (4) Extreme users reveal mainstream needs: design for the 10% edge cases, benefit the 90% mainstream. (5) Capture quotes verbatim — exact words matter. Research methods: fly-on-the-wall observation, diary studies, contextual inquiry, cultural probes. MAANG bar: how many users did you talk to? What surprised you? What assumption was invalidated?",
      skillArea: 'uxExecution',
      tags: ['research', 'needfinding', 'stanford', 'users'],
    },
    {
      title: "Stanford: How Might We (HMW) Question Framing",
      content: "How Might We questions bridge insight and ideation. Too broad: 'How might we improve healthcare?' Too narrow: 'How might we add a button to schedule appointments?' Just right: 'How might we help elderly patients remember medications without feeling infantilized?' Rules: (1) Start with insight from research. (2) 'We' implies collaboration. (3) 'Might' allows for possibility — not 'should' or 'will'. (4) One constraint: the key tension from your POV. MAANG bar: your HMW reveals how deeply you understood the problem. Shallow HMW = shallow solution.",
      skillArea: 'productThinking',
      tags: ['hmw', 'ideation', 'framing', 'stanford'],
    },
    {
      title: "Stanford: Prototyping Philosophy",
      content: "Stanford prototyping principles: Build to learn, not to show. Prototype at the right fidelity for the question you're answering. Low-fi for: does this concept make sense? Mid-fi for: does this flow work? Hi-fi for: does this feel right? Common mistake: going hi-fi too early (you become attached to your solution). Rule of thumb: it should take 1/10 the time it would take to build the real thing. MAANG bar: what was the specific question your prototype was designed to answer? How did the answer change your design?",
      skillArea: 'uxExecution',
      tags: ['prototyping', 'fidelity', 'stanford', 'iteration'],
    },
    {
      title: "Stanford: Radical Collaboration",
      content: "Cross-functional design at scale: (1) T-shaped people — deep expertise in one area, broad collaboration across all. (2) Creative confidence — the belief that everyone can have ideas worth pursuing. (3) Bias toward action — doing beats planning at early stages. (4) Show don't tell — make ideas tangible before discussions. For MAANG designers: you must influence without authority. Your stakeholder management IS your design skill. Can you get an engineer, PM, and data scientist to champion your direction?",
      skillArea: 'communication',
      tags: ['collaboration', 'stakeholders', 'influence', 'stanford'],
    },
  ]

  stanfordFrameworks.forEach((f) =>
    addItem('frameworks', {
      ...f,
      source: 'Stanford d.school',
      url: 'https://dschool.stanford.edu',
    })
  )
  log('  ✓ Added Stanford d.school frameworks')
}

// ── Source 3: W3C WCAG Accessibility ─────────────────────────────────────────
async function ingestW3C() {
  log('\n♿ Fetching W3C WCAG...')

  const html = await fetchText('https://www.w3.org/WAI/fundamentals/accessibility-intro/')
  if (html) {
    const $ = cheerio.load(html)
    const mainContent = $('#main, main, article').first()
    const sections = []
    mainContent.find('h2, h3').each((_, el) => {
      const heading = $(el).text().trim()
      const content = $(el).nextUntil('h2, h3').text().trim()
      if (heading && content) sections.push({ heading, content: content.slice(0, 600) })
    })

    sections.forEach((s) => {
      addItem('guidelines', {
        title: `W3C Accessibility: ${s.heading}`,
        content: cleanText(s.content),
        source: 'W3C WAI',
        url: 'https://www.w3.org/WAI/fundamentals/accessibility-intro/',
        tags: ['accessibility', 'wcag', 'w3c', 'inclusion'],
        skillArea: 'uxExecution',
      })
    })
    log(`  ✓ Parsed ${sections.length} W3C WAI sections`)
    db.sources.push({ name: 'W3C WAI', url: 'https://www.w3.org/WAI/', count: sections.length })
  }

  await sleep(400)

  // WCAG 4 Principles as curated knowledge
  const wcagPrinciples = [
    {
      title: 'WCAG 2.1: POUR Principles for Accessible Design',
      content: 'The four WCAG principles every MAANG designer must know: (1) PERCEIVABLE — information must be presentable in ways users can perceive. Text alternatives for non-text content, captions for video, sufficient color contrast (4.5:1 for normal text). (2) OPERABLE — UI components must be operable by all. Keyboard navigation, no seizure-inducing content, 2.5x44px minimum touch targets. (3) UNDERSTANDABLE — content must be readable and predictable. Language of page declared, error identification, labels for inputs. (4) ROBUST — content interpretable by assistive technologies. Valid HTML, name/role/value for custom components. MAANG bar: accessibility is not a feature — it is a quality signal.',
      skillArea: 'uxExecution',
      tags: ['pour', 'wcag', 'accessibility', 'principles'],
    },
    {
      title: 'WCAG: Color Contrast and Visual Accessibility',
      content: 'Contrast requirements: AA standard requires 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold). AAA requires 7:1 for normal text. Why this matters for MAANG: 8% of men and 0.5% of women have color vision deficiency. 2.2 billion people globally have visual impairment. Design with contrast in mind from day 1 — retrofitting is 10x harder. Tools: browser DevTools accessibility panel, Stark plugin for Figma. Never use color as the only differentiator — always pair with shape, pattern, or label.',
      skillArea: 'uxExecution',
      tags: ['contrast', 'color', 'wcag', 'accessibility'],
    },
    {
      title: 'W3C: Accessible Forms and Input Design',
      content: 'Form accessibility at MAANG scale: (1) Every input needs a visible, persistent label — not placeholder text (disappears on focus). (2) Error messages must identify the field AND explain what is wrong AND how to fix it. (3) Required fields must be indicated before the form, not only by asterisk. (4) Group related fields with fieldset/legend. (5) Autocomplete attributes speed up form completion for all users. (6) Timeout warnings must be at least 20 seconds before expiry. MAANG bar: bad form design is the #1 cause of checkout abandonment. Accessible forms are conversion-optimized forms.',
      skillArea: 'uxExecution',
      tags: ['forms', 'input', 'accessibility', 'wcag'],
    },
    {
      title: 'W3C: Inclusive Design vs. Accessible Design',
      content: 'Inclusive design (Microsoft/W3C definition): design process that considers the full range of human diversity — ability, language, culture, gender, age. Accessibility: properties of the output that make it usable by people with disabilities. Key distinction: inclusive design is a method, accessibility is a quality. You can have an accessible product that was not designed inclusively (bolted on after). MAANG companies prefer inclusive design because it creates better products for ALL users — curb-cut effect. Closed captions help: deaf users, ESL learners, noisy environments, people with ADHD.',
      skillArea: 'uxExecution',
      tags: ['inclusive-design', 'accessibility', 'diversity', 'w3c'],
    },
  ]

  wcagPrinciples.forEach((p) =>
    addItem('principles', {
      ...p,
      source: 'W3C WCAG',
      url: 'https://www.w3.org/TR/WCAG21/',
    })
  )
  log('  ✓ Added WCAG core principles')
}

// ── Source 4: OpenLibrary API ─────────────────────────────────────────────────
async function ingestOpenLibrary() {
  log('\n📖 Fetching OpenLibrary API...')

  const queries = [
    { q: 'product+design+user+experience', area: 'uxExecution' },
    { q: 'design+thinking+methodology', area: 'productThinking' },
    { q: 'systems+thinking+design', area: 'systemsThinking' },
    { q: 'interaction+design+information+architecture', area: 'uxExecution' },
    { q: 'data+driven+design+analytics', area: 'aiUnderstanding' },
    { q: 'design+leadership+communication', area: 'communication' },
  ]

  let totalBooks = 0
  for (const { q, area } of queries) {
    await sleep(300)
    const data = await fetchJson(
      `https://openlibrary.org/search.json?q=${q}&limit=5&fields=title,author_name,first_publish_year,subject,first_sentence`
    )
    if (!data?.docs) continue

    data.docs.forEach((book) => {
      if (!book.title) return
      const authors = (book.author_name || []).slice(0, 2).join(', ')
      const year = book.first_publish_year || ''
      const subjects = (book.subject || []).slice(0, 4).join(', ')
      const sentence = Array.isArray(book.first_sentence)
        ? book.first_sentence[0]
        : book.first_sentence?.value || ''

      addItem('books', {
        title: book.title,
        content: `By ${authors}${year ? ` (${year})` : ''}. ${subjects ? `Topics: ${subjects}. ` : ''}${cleanText(sentence)}`,
        source: 'OpenLibrary',
        url: `https://openlibrary.org/search?q=${encodeURIComponent(book.title)}`,
        tags: ['book', 'reference', area],
        skillArea: area,
      })
      totalBooks++
    })
  }

  log(`  ✓ Added ${totalBooks} books from OpenLibrary`)
  db.sources.push({ name: 'OpenLibrary', url: 'https://openlibrary.org', count: totalBooks })
}

// ── Source 5: RSS Feeds ───────────────────────────────────────────────────────
async function ingestRSS() {
  log('\n📡 Fetching RSS feeds...')

  const feeds = [
    {
      url: 'https://design.google/library/rss/',
      source: 'Google Design',
      skillArea: 'productThinking',
      tags: ['google', 'article', 'design'],
    },
    {
      url: 'https://www.microsoft.com/design/feed/',
      source: 'Microsoft Design',
      skillArea: 'systemsThinking',
      tags: ['microsoft', 'article', 'design'],
    },
    {
      url: 'https://feeds.feedburner.com/nielsennormangroup',
      source: 'Nielsen Norman Group',
      skillArea: 'uxExecution',
      tags: ['ux-research', 'article', 'nngroup'],
    },
    {
      url: 'https://uxdesign.cc/feed',
      source: 'UX Collective',
      skillArea: 'uxExecution',
      tags: ['ux', 'article', 'community'],
    },
  ]

  let totalArticles = 0
  for (const feed of feeds) {
    await sleep(400)
    const xml = await fetchText(feed.url)
    if (!xml) continue

    try {
      const parsed = await parseStringPromise(xml, { explicitArray: false, ignoreAttrs: true })
      const channel = parsed?.rss?.channel || parsed?.feed
      if (!channel) continue

      const items = channel.item || channel.entry || []
      const itemArray = Array.isArray(items) ? items : [items]

      itemArray.slice(0, 8).forEach((item) => {
        const title = item.title?._?.trim() || item.title?.trim() || ''
        const desc = item.description?.trim() || item.summary?.trim() || item.content?.trim() || ''
        const link = item.link?.href || item.link?.trim() || ''
        if (!title || title.length < 5) return

        addItem('articles', {
          title,
          content: cleanText(desc),
          source: feed.source,
          url: link,
          tags: feed.tags,
          skillArea: feed.skillArea,
        })
        totalArticles++
      })
      log(`  ✓ ${feed.source}: ${Math.min(8, itemArray.length)} articles`)
    } catch (e) {
      log(`  ⚠ Could not parse ${feed.source} RSS: ${e.message}`)
    }
  }

  db.sources.push({ name: 'RSS Feeds', count: totalArticles })
}

// ── Source 6: Curated MAANG Design Knowledge ──────────────────────────────────
async function ingestCurated() {
  log('\n🧠 Adding curated MAANG design knowledge...')

  const curated = [
    // Product Thinking
    {
      category: 'principles',
      title: 'MAANG Product Design: Jobs-to-be-Done Framework',
      content: "Clayton Christensen's JTBD: people 'hire' products to do a job in their lives. The job is not the product — it is the progress the user is trying to make. Framework for design: (1) What are users trying to accomplish? (2) What does success feel like emotionally? (3) What do they currently hire to do this job (your competition)? (4) What are the functional, social, and emotional dimensions of the job? MAANG bar question: 'What job is your product hired to do, and how do you know?' Correct answer cites user research, not assumptions.",
      skillArea: 'productThinking',
      tags: ['jtbd', 'product', 'framework', 'maang'],
    },
    {
      category: 'frameworks',
      title: 'Google: HEART Framework for UX Metrics',
      content: "Google's HEART framework for measuring UX at scale: Happiness (satisfaction surveys, NPS), Engagement (session length, DAU/MAU ratio), Adoption (new users, feature uptake), Retention (D1/D7/D30 retention), Task Success (completion rate, error rate, time-on-task). How to use: pick 2-3 metrics per project. Define Goals → Signals → Metrics. Common mistake: measuring engagement when you should measure task success. MAANG interviewers will ask: how did you know your design improved the product? HEART gives you the answer.",
      skillArea: 'productThinking',
      tags: ['heart', 'metrics', 'google', 'measurement'],
    },
    {
      category: 'frameworks',
      title: 'Amazon: Working Backwards from the Press Release',
      content: "Amazon's product design process: start by writing the press release announcing the product's launch. The PR/FAQ forces clarity: (1) Headline — what is this and for whom? (2) Problem — what problem does it solve? (3) Solution — how does it solve it? (4) Quote from customer — what does success feel like? (5) FAQ — what are the hard questions? For designers: this reverses the typical process (design → justify) to (justify → design). It forces product sense. MAANG bar: can you write a press release for a feature you designed? If you struggle, you haven't defined the problem clearly enough.",
      skillArea: 'productThinking',
      tags: ['amazon', 'working-backwards', 'product', 'framework'],
    },
    {
      category: 'principles',
      title: 'Meta: Social Product Design Principles',
      content: "Meta's core design philosophy: products at scale must account for social dynamics. (1) Network effects change behavior — design for the community, not just the individual user. (2) Privacy by default — the most vulnerable users define the floor. (3) Meaningful interaction > passive consumption — optimize for quality, not just quantity. (4) Reduce social comparison harm — surface positive connections. (5) Transparency builds trust — show users how their data is used. MAANG bar for Meta: how does your design hold up when 1 million different types of people use it simultaneously?",
      skillArea: 'productThinking',
      tags: ['meta', 'social', 'scale', 'principles'],
    },
    // Systems Thinking
    {
      category: 'frameworks',
      title: 'Design Systems: Atomic Design Methodology',
      content: "Brad Frost's Atomic Design: a mental model for building design systems. (1) Atoms — basic HTML elements (button, input, label). (2) Molecules — combinations of atoms with purpose (search field = input + button + label). (3) Organisms — complex components (navigation bar, hero section). (4) Templates — page-level layouts. (5) Pages — specific instances with real content. Why it matters for MAANG: large companies need design systems to scale consistency. MAANG bar question: 'Tell me about a design system you built or contributed to.' Must cover: token decisions, component API design, documentation, governance model.",
      skillArea: 'systemsThinking',
      tags: ['design-systems', 'atomic-design', 'scale', 'components'],
    },
    {
      category: 'principles',
      title: 'Platform Thinking: Designing for Ecosystems',
      content: "Platform design requires thinking beyond individual user flows. Key concepts: (1) Multi-sided markets — your product serves multiple user types simultaneously (Uber: riders AND drivers). (2) Network effects — more users make the product better for all users. (3) API-first thinking — design for developers building on top of your platform. (4) Governance at scale — who can do what, enforced through design. MAANG system design interview: draw the full ecosystem, identify all user types, explain the value exchange, articulate the flywheel. Designers who only think about one user type fail at MAANG scale.",
      skillArea: 'systemsThinking',
      tags: ['platform', 'ecosystem', 'network-effects', 'scale'],
    },
    {
      category: 'frameworks',
      title: 'Design Tokens: Building Scalable Visual Systems',
      content: "Design tokens are the atomic unit of a design system: named entities storing visual design decisions. Types: (1) Global tokens — raw values (color.blue.500 = #3B82F6). (2) Semantic tokens — contextual meaning (color.action.primary = color.blue.500). (3) Component tokens — component-specific (button.background.primary = color.action.primary). Why the hierarchy matters: global tokens let you change a value in one place; semantic tokens let you retheme without breaking components; component tokens let you fine-tune without affecting the system. MAANG bar: a designer who understands token architecture thinks in systems, not pixels.",
      skillArea: 'systemsThinking',
      tags: ['design-tokens', 'design-systems', 'architecture', 'scale'],
    },
    // AI Understanding
    {
      category: 'principles',
      title: 'AI UX: Designing for Machine Learning Products',
      content: "Designing AI-powered products requires understanding ML limitations: (1) Confidence vs. correctness — AI can be confidently wrong. Design for uncertainty. (2) Distribution shift — AI trained on historical data fails on new patterns. Design graceful degradation. (3) Explainability gap — users need to understand why AI made a decision. (4) Feedback loops — user interaction data trains future models; biased interaction = biased model. (5) Edge cases are common, not rare — the long tail of inputs is huge. MAANG bar: how does your design handle when the AI is wrong? The answer reveals whether you understand AI products deeply.",
      skillArea: 'aiUnderstanding',
      tags: ['ai', 'ml', 'uncertainty', 'design'],
    },
    {
      category: 'frameworks',
      title: 'Human-AI Interaction: Google PAIR Guidelines',
      content: "Google People + AI Research guidelines for AI product design: (1) Make the AI's capabilities clear — calibrate user expectations. (2) Make the AI's limitations clear — when will it fail? (3) Show confidence scores contextually — not always, not never. (4) Design for the feedback loop — how do users correct mistakes? (5) Preserve human agency — never let AI remove user control without consent. (6) Gradually reveal complexity — don't overwhelm with AI capabilities upfront. MAANG bar: name 3 places in your design where the AI could fail and explain what the UX does in each case.",
      skillArea: 'aiUnderstanding',
      tags: ['google-pair', 'ai-guidelines', 'human-ai', 'interaction'],
    },
    {
      category: 'principles',
      title: 'Data-Driven Design: Quantitative UX Methods',
      content: "Data-driven design at MAANG: (1) A/B testing — change one variable, measure statistical significance, minimum n=1000 per variant. Never ship based on insignificant results. (2) Funnel analysis — where do users drop off? What is the drop-off rate at each step? (3) Cohort analysis — how does retention differ by user segment or signup date? (4) Heatmaps + session recordings — qualitative texture on quantitative findings. (5) SUS (System Usability Scale) — 10-question standardized usability score, 68+ = above average. MAANG bar: design decisions without data are opinions. Design decisions with data are arguments. Which are yours?",
      skillArea: 'aiUnderstanding',
      tags: ['data', 'ab-testing', 'analytics', 'quantitative'],
    },
    // Communication
    {
      category: 'principles',
      title: 'Design Communication: Presenting to Stakeholders',
      content: "MAANG design presentations follow a clear structure: (1) Frame the problem first — never lead with the solution. (2) Show the evidence — what research, data, or precedent informs this direction? (3) Explain the options considered — one concept is a proposal; three concepts is a conversation. (4) Make the tradeoffs explicit — what did you optimize for? What did you sacrifice? (5) State the recommendation clearly — 'I recommend option B because...' (6) Define success metrics — how will you know it worked? Most designers lose stakeholders at #2 (no evidence) or #4 (no tradeoffs). MAANG bar: a good design presentation is indistinguishable from a product strategy presentation.",
      skillArea: 'communication',
      tags: ['presentation', 'stakeholders', 'communication', 'maang'],
    },
    {
      category: 'frameworks',
      title: 'Design Critique: Giving and Receiving Feedback',
      content: "Structured design critique at MAANG: Giving feedback — (1) Start with the stated goal or constraint. (2) Describe what you observe, not what you feel. (3) Ask questions before making statements: 'I noticed X, can you walk me through the thinking?' (4) Separate design feedback from personal preference — 'Given the constraint Y, I wonder if X serves that goal.' Receiving feedback — (1) Listen without defending. (2) Separate yourself from the work. (3) Take notes, ask for specifics. (4) Thank people for hard feedback. Anti-pattern: 'I like/don't like' as the entire critique. MAANG bar: your ability to facilitate critique is a leadership signal.",
      skillArea: 'communication',
      tags: ['critique', 'feedback', 'collaboration', 'leadership'],
    },
    {
      category: 'principles',
      title: 'Cross-functional Influence: Design Without Authority',
      content: "Getting design decisions made at MAANG: (1) Build shared context first — ensure everyone understands the user problem before proposing solutions. (2) Use data as a common language — gut feelings lose to A/B test results. (3) Make the cost of NOT doing it clear — technical debt, user churn, support burden. (4) Prototype the decision, not the solution — make the choice tangible. (5) Find the aligned incentive — what does the engineering lead or PM care about most? Connect your proposal to their goal. (6) Document decisions in writing — prevents revisiting, builds trust. MAANG truth: the best design that nobody ships is worse than a mediocre design that does.",
      skillArea: 'communication',
      tags: ['influence', 'cross-functional', 'leadership', 'maang'],
    },
  ]

  curated.forEach((item) => {
    const { category, ...rest } = item
    addItem(category, { ...rest, source: 'MDC Curated Knowledge' })
  })
  log(`  ✓ Added ${curated.length} curated MAANG design knowledge items`)
}

// ── Source 7: Archive.org free design books ───────────────────────────────────
async function ingestArchive() {
  log('\n🏛️ Fetching Internet Archive design resources...')

  const data = await fetchJson(
    'https://archive.org/advancedsearch.php?q=subject%3A%22user+experience%22+AND+mediatype%3Atexts&fl%5B%5D=title,creator,description,subject&rows=10&output=json&page=1'
  )

  if (data?.response?.docs) {
    let count = 0
    data.response.docs.forEach((doc) => {
      if (!doc.title) return
      const desc = Array.isArray(doc.description) ? doc.description[0] : doc.description || ''
      addItem('books', {
        title: doc.title,
        content: `${doc.creator ? 'By ' + doc.creator + '. ' : ''}${cleanText(desc)}`,
        source: 'Internet Archive',
        url: `https://archive.org/search?query=${encodeURIComponent(doc.title)}`,
        tags: ['book', 'archive', 'ux'],
        skillArea: 'uxExecution',
      })
      count++
    })
    log(`  ✓ Added ${count} books from Internet Archive`)
    db.sources.push({ name: 'Internet Archive', url: 'https://archive.org', count })
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log('  MAANG Designer Coach — Knowledge Ingestion')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  await ingestMIT()
  await ingestStanford()
  await ingestW3C()
  await ingestOpenLibrary()
  await ingestRSS()
  await ingestCurated()
  await ingestArchive()

  // Summary
  const total =
    db.principles.length +
    db.frameworks.length +
    db.guidelines.length +
    db.courses.length +
    db.books.length +
    db.articles.length

  db.stats = {
    total,
    principles: db.principles.length,
    frameworks: db.frameworks.length,
    guidelines: db.guidelines.length,
    courses: db.courses.length,
    books: db.books.length,
    articles: db.articles.length,
  }

  // Build skill index for fast lookup
  db.bySkill = {
    productThinking: [...db.principles, ...db.frameworks, ...db.articles]
      .filter((i) => i.skillArea === 'productThinking')
      .map((i) => i.id),
    uxExecution: [...db.principles, ...db.frameworks, ...db.guidelines]
      .filter((i) => i.skillArea === 'uxExecution')
      .map((i) => i.id),
    systemsThinking: [...db.principles, ...db.frameworks]
      .filter((i) => i.skillArea === 'systemsThinking')
      .map((i) => i.id),
    aiUnderstanding: [...db.principles, ...db.frameworks]
      .filter((i) => i.skillArea === 'aiUnderstanding')
      .map((i) => i.id),
    communication: [...db.principles, ...db.frameworks]
      .filter((i) => i.skillArea === 'communication')
      .map((i) => i.id),
  }

  // Write output
  mkdirSync(join(ROOT, 'public'), { recursive: true })
  writeFileSync(OUT, JSON.stringify(db, null, 2), 'utf-8')

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log('  ✅ Knowledge ingestion complete!')
  log(`  📊 Total items: ${total}`)
  log(`     Principles:  ${db.principles.length}`)
  log(`     Frameworks:  ${db.frameworks.length}`)
  log(`     Guidelines:  ${db.guidelines.length}`)
  log(`     Courses:     ${db.courses.length}`)
  log(`     Books:       ${db.books.length}`)
  log(`     Articles:    ${db.articles.length}`)
  log(`  💾 Saved to: public/knowledge.json`)
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1) })
// (script already complete above)

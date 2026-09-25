const fs = require('fs');
const path = require('path');

const srcRoot = '/tmp/agency-agents-upstream';
const targetRoot = path.resolve(__dirname, '../agents/agency');

const colorMap = {
  cyan: '#00FFFF',
  blue: '#3498DB',
  green: '#2ECC71',
  red: '#E74C3C',
  purple: '#9B59B6',
  orange: '#F39C12',
  teal: '#008080',
  indigo: '#6366F1',
  pink: '#E84393',
  gold: '#EAB308',
  amber: '#F59E0B',
  'neon-green': '#10B981',
  'neon-cyan': '#06B6D4',
  'metallic-blue': '#3B82F6',
  yellow: '#EAB308',
  violet: '#8B5CF6',
  rose: '#F43F5E',
  lime: '#84CC16',
  gray: '#6B7280',
  fuchsia: '#D946EF',
  slate: '#64748B',
  navy: '#000080'
};

function resolveColor(c) {
  if (!c) return '#6B7280';
  const clean = c.trim().replace(/^["']|["']$/g, '').toLowerCase();
  if (colorMap[clean]) return colorMap[clean];
  if (/^#[0-9a-f]{6}$/i.test(clean)) return clean.toUpperCase();
  if (/^[0-9a-f]{6}$/i.test(clean)) return ('#' + clean).toUpperCase();
  return '#6B7280';
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Read divisions.json from source
const divisionsSource = JSON.parse(fs.readFileSync(path.join(srcRoot, 'divisions.json'), 'utf8'));
const divisionsCatalog = {
  _note: 'Agency Agents catalog for OpenCode, organized by division',
  divisions: {}
};

for (const [divKey, divMeta] of Object.entries(divisionsSource.divisions || {})) {
  divisionsCatalog.divisions[divKey] = {
    ...divMeta,
    agents: []
  };
}

let convertedCount = 0;

for (const divKey of Object.keys(divisionsCatalog.divisions)) {
  const divSrcDir = path.join(srcRoot, divKey);
  if (!fs.existsSync(divSrcDir)) continue;

  const divTargetDir = path.join(targetRoot, divKey);
  fs.mkdirSync(divTargetDir, { recursive: true });

  function processDir(p) {
    for (const item of fs.readdirSync(p, { withFileTypes: true })) {
      const fullPath = path.join(p, item.name);
      if (item.isDirectory()) {
        processDir(fullPath);
      } else if (item.name.endsWith('.md')) {
        const rawContent = fs.readFileSync(fullPath, 'utf8');
        const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---([\s\S]*)$/);
        if (!match) continue;

        const fmText = match[1];
        let body = match[2].trim();

        const nameMatch = fmText.match(/^name:\s*(.+)$/m);
        const descMatch = fmText.match(/^description:\s*(.+)$/m);
        const colorMatch = fmText.match(/^color:\s*(.+)$/m);
        const emojiMatch = fmText.match(/^emoji:\s*(.+)$/m);
        const vibeMatch = fmText.match(/^vibe:\s*(.+)$/m);

        const name = nameMatch ? nameMatch[1].trim().replace(/^["']|["']$/g, '') : item.name.replace('.md', '');
        const desc = descMatch ? descMatch[1].trim().replace(/^["']|["']$/g, '') : '';
        const color = resolveColor(colorMatch ? colorMatch[1] : '');
        const emoji = emojiMatch ? emojiMatch[1].trim().replace(/^["']|["']$/g, '') : '';
        const vibe = vibeMatch ? vibeMatch[1].trim().replace(/^["']|["']$/g, '') : '';
        const slug = slugify(name);

        // Add Graphify awareness to engineering, architecture, and testing agents
        if (['engineering', 'testing', 'security'].includes(divKey) && !body.includes('graphify')) {
          body += '\n\n## 🗺️ Codebase Navigation with Graphify\n- Check if `graphify-out/graph.json` exists before running broad grep or file scans.\n- Run `graphify query "<symbol>"` via terminal to inspect precise AST dependency subgraphs and call flows.\n- Review `graphify-out/GRAPH_REPORT.md` for architecture clusters and community summaries.';
        }

        const lines = [
          '---',
          `name: ${JSON.stringify(name)}`,
          `description: ${JSON.stringify(desc)}`,
          'mode: subagent',
          `color: ${JSON.stringify(color)}`
        ];

        if (emoji) lines.push(`emoji: ${JSON.stringify(emoji)}`);
        if (vibe) lines.push(`vibe: ${JSON.stringify(vibe)}`);
        lines.push('---', '', body, '');

        const targetFile = path.join(divTargetDir, `${slug}.md`);
        fs.writeFileSync(targetFile, lines.join('\n'), 'utf8');

        divisionsCatalog.divisions[divKey].agents.push({
          name,
          slug,
          description: desc,
          color,
          emoji,
          vibe,
          division: divKey,
          file: `agents/agency/${divKey}/${slug}.md`
        });

        convertedCount++;
      }
    }
  }

  processDir(divSrcDir);
}

fs.writeFileSync(path.join(targetRoot, 'divisions.json'), JSON.stringify(divisionsCatalog, null, 2), 'utf8');

console.log(`Successfully converted ${convertedCount} agents into ${targetRoot}`);

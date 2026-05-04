import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type SqlValue = string | number | null;

function splitSqlTuple(tuple: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < tuple.length; i++) {
    const ch = tuple[i] ?? '';
    if (ch === "'") {
      const next = tuple[i + 1];
      if (inQuote && next === "'") {
        cur += "'";
        i++;
        continue;
      }
      inQuote = !inQuote;
      continue;
    }
    if (!inQuote && ch === ',') {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.length) out.push(cur.trim());
  return out;
}

function parseSqlValue(raw: string): SqlValue {
  const v = raw.trim();
  if (!v || v.toLowerCase() === 'null') return null;
  // Strip explicit casts like ::jsonb
  const noCast = v.replace(/::[a-zA-Z0-9_]+/g, '').trim();
  // JSON blobs in quotes (e.g. ["a","b"])
  if (noCast.startsWith('[') || noCast.startsWith('{')) return noCast;
  const n = Number(noCast);
  if (!Number.isNaN(n) && /^-?\d+(\.\d+)?$/.test(noCast)) return n;
  return noCast;
}

function extractTuples(sql: string, table: string): string[] {
  const marker = `insert into public.${table}`;
  const start = sql.toLowerCase().indexOf(marker);
  if (start === -1) return [];
  const slice = sql.slice(start);
  const lower = slice.toLowerCase();
  const endOnConflict = lower.indexOf('on conflict');
  const endSemicolon = lower.indexOf(';');
  const end =
    endOnConflict !== -1 && endSemicolon !== -1
      ? Math.min(endOnConflict, endSemicolon)
      : endOnConflict !== -1
        ? endOnConflict
        : endSemicolon !== -1
          ? endSemicolon
          : -1;
  const block = end === -1 ? slice : slice.slice(0, end);
  const valuesIdx = block.toLowerCase().indexOf('values');
  if (valuesIdx === -1) return [];
  const values = block.slice(valuesIdx + 'values'.length);

  // Match top-level (...) groups (not perfect SQL, but matches our seeds format)
  const tuples: string[] = [];
  let depth = 0;
  let inQuote = false;
  let buf = '';
  for (let i = 0; i < values.length; i++) {
    const ch = values[i] ?? '';
    const next = values[i + 1];
    if (ch === "'") {
      if (inQuote && next === "'") {
        buf += "''";
        i++;
        continue;
      }
      inQuote = !inQuote;
    }
    if (!inQuote) {
      if (ch === '(') {
        if (depth === 0) {
          // Only treat as tuple start if the next non-whitespace is a quote.
          let j = i + 1;
          while (j < values.length && /\s/.test(values[j] ?? '')) j++;
          if ((values[j] ?? '') !== "'") {
            continue;
          }
          buf = '';
        }
        depth++;
        continue;
      }
      if (ch === ')') {
        depth--;
        if (depth === 0) {
          tuples.push(buf.trim());
          buf = '';
        }
        continue;
      }
    }
    if (depth > 0) buf += ch;
  }
  return tuples;
}

function stripLineComments(sql: string): string {
  let out = '';
  let inQuote = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i] ?? '';
    const next = sql[i + 1];
    if (ch === "'") {
      const nn = sql[i + 1];
      if (inQuote && nn === "'") {
        out += "''";
        i++;
        continue;
      }
      inQuote = !inQuote;
      out += ch;
      continue;
    }
    if (!inQuote && ch === '-' && next === '-') {
      // skip until newline
      while (i < sql.length && sql[i] !== '\n') i++;
      out += '\n';
      continue;
    }
    out += ch;
  }
  return out;
}

function findFirstUnquoted(haystack: string, needle: string): number {
  let inQuote = false;
  for (let i = 0; i < haystack.length; i++) {
    const ch = haystack[i] ?? '';
    const next = haystack[i + 1];
    if (ch === "'") {
      if (inQuote && next === "'") {
        i++;
        continue;
      }
      inQuote = !inQuote;
      continue;
    }
    if (!inQuote && ch === needle) return i;
  }
  return -1;
}

async function main() {
  // Seed from the canonical Supabase seeds so MySQL matches app content.
  // Re-runnable via upsert to avoid duplicates.

  const seedsPath = path.resolve(__dirname, '../../supabase/seeds.sql');
  const sql = stripLineComments(fs.readFileSync(seedsPath, 'utf8'));

  // Courses
  const courseTuples = extractTuples(sql, 'courses');
  for (const t of courseTuples) {
    const parts = splitSqlTuple(t).map(parseSqlValue);
    const [id, title, titleAr, description, descriptionAr, topic, icon, color, sortOrder, coinReward] =
      parts as SqlValue[];
    await prisma.course.upsert({
      where: { id: String(id) },
      update: {
        title: String(title),
        titleAr: titleAr ? String(titleAr) : null,
        description: description ? String(description) : null,
        descriptionAr: descriptionAr ? String(descriptionAr) : null,
        topic: String(topic),
        icon: icon ? String(icon) : null,
        color: color ? String(color) : null,
        sortOrder: Number(sortOrder ?? 0),
        coinReward: Number(coinReward ?? 0),
      },
      create: {
        id: String(id),
        title: String(title),
        titleAr: titleAr ? String(titleAr) : null,
        description: description ? String(description) : null,
        descriptionAr: descriptionAr ? String(descriptionAr) : null,
        topic: String(topic),
        icon: icon ? String(icon) : null,
        color: color ? String(color) : null,
        sortOrder: Number(sortOrder ?? 0),
        coinReward: Number(coinReward ?? 0),
      },
    });
  }

  // Lessons
  const lessonTuples = extractTuples(sql, 'lessons');
  for (const t of lessonTuples) {
    const parts = splitSqlTuple(t).map(parseSqlValue);
    const [id, courseId, title, titleAr, summary, summaryAr, durationMinutes, sortOrder] =
      parts as SqlValue[];
    await prisma.lesson.upsert({
      where: { id: String(id) },
      update: {
        courseId: String(courseId),
        title: String(title),
        titleAr: titleAr ? String(titleAr) : null,
        summary: summary ? String(summary) : null,
        summaryAr: summaryAr ? String(summaryAr) : null,
        durationMinutes: Number(durationMinutes ?? 0),
        sortOrder: Number(sortOrder ?? 0),
      },
      create: {
        id: String(id),
        courseId: String(courseId),
        title: String(title),
        titleAr: titleAr ? String(titleAr) : null,
        summary: summary ? String(summary) : null,
        summaryAr: summaryAr ? String(summaryAr) : null,
        durationMinutes: Number(durationMinutes ?? 0),
        sortOrder: Number(sortOrder ?? 0),
      },
    });
  }

  // Videos
  const videoTuples = extractTuples(sql, 'videos');
  for (const t of videoTuples) {
    const parts = splitSqlTuple(t).map(parseSqlValue);
    const [id, lessonId, title, titleAr, url, thumbnail, durationSeconds, sortOrder] =
      parts as SqlValue[];
    await prisma.video.upsert({
      where: { id: String(id) },
      update: {
        lessonId: String(lessonId),
        title: String(title),
        titleAr: titleAr ? String(titleAr) : null,
        url: String(url),
        thumbnail: thumbnail ? String(thumbnail) : null,
        durationSeconds: Number(durationSeconds ?? 0),
        sortOrder: Number(sortOrder ?? 0),
      },
      create: {
        id: String(id),
        lessonId: String(lessonId),
        title: String(title),
        titleAr: titleAr ? String(titleAr) : null,
        url: String(url),
        thumbnail: thumbnail ? String(thumbnail) : null,
        durationSeconds: Number(durationSeconds ?? 0),
        sortOrder: Number(sortOrder ?? 0),
      },
    });
  }

  // Quizzes
  const quizTuples = extractTuples(sql, 'quizzes');
  for (const t of quizTuples) {
    const parts = splitSqlTuple(t).map(parseSqlValue);
    const [id, title, titleAr, description, descriptionAr, category, difficulty, coinReward] =
      parts as SqlValue[];
    await prisma.quiz.upsert({
      where: { id: String(id) },
      update: {
        title: String(title),
        titleAr: titleAr ? String(titleAr) : null,
        description: description ? String(description) : null,
        descriptionAr: descriptionAr ? String(descriptionAr) : null,
        category: String(category),
        difficulty: String(difficulty),
        coinReward: Number(coinReward ?? 0),
      },
      create: {
        id: String(id),
        title: String(title),
        titleAr: titleAr ? String(titleAr) : null,
        description: description ? String(description) : null,
        descriptionAr: descriptionAr ? String(descriptionAr) : null,
        category: String(category),
        difficulty: String(difficulty),
        coinReward: Number(coinReward ?? 0),
      },
    });
  }

  // Questions (English + Arabic): parse the questions VALUES block by accumulating
  // multi-line tuples, then reuse splitSqlTuple/parseSqlValue.
  const qMarker = 'insert into public.questions';
  const qStart = sql.toLowerCase().indexOf(qMarker);
  if (qStart !== -1) {
    const qSlice = sql.slice(qStart);
    const qEnd = findFirstUnquoted(qSlice, ';');
    const qBlock = qEnd === -1 ? qSlice : qSlice.slice(0, qEnd);
    const valuesIdx = qBlock.toLowerCase().indexOf('values');
    const qValues = valuesIdx === -1 ? '' : qBlock.slice(valuesIdx + 'values'.length);

    const seenQuizIds = new Set(
      (await prisma.quiz.findMany({ select: { id: true } })).map((q) => q.id)
    );

    const tuples: string[] = [];
    let acc = '';
    for (const rawLine of qValues.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;
      if (!acc) {
        if (/^\('q-[^']+'/.test(line)) {
          acc = line;
        }
      } else {
        acc += ' ' + line;
      }

      if (acc && (line.endsWith('),') || line.endsWith(')'))) {
        const cleaned = acc.replace(/,$/, '').trim();
        if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
          tuples.push(cleaned.slice(1, -1));
        }
        acc = '';
      }
    }

    for (const t of tuples) {
      const parts = splitSqlTuple(t).map(parseSqlValue);
      const [
        id,
        quizId,
        question,
        questionAr,
        optionsRaw,
        optionsArRaw,
        correctIndex,
        explanation,
        explanationAr,
        sortOrder,
      ] = parts as SqlValue[];

      const quizIdStr = String(quizId ?? '');
      if (!seenQuizIds.has(quizIdStr)) continue;

      const options = optionsRaw ? JSON.parse(String(optionsRaw)) : [];
      const optionsAr = optionsArRaw ? JSON.parse(String(optionsArRaw)) : [];

      await prisma.question.upsert({
        where: { id: String(id) },
        update: {
          quizId: quizIdStr,
          question: String(question ?? ''),
          questionAr: questionAr ? String(questionAr) : null,
          options,
          optionsAr,
          correctIndex: Number(correctIndex ?? 0),
          explanation: explanation ? String(explanation) : null,
          explanationAr: explanationAr ? String(explanationAr) : null,
          sortOrder: Number(sortOrder ?? 0),
        },
        create: {
          id: String(id),
          quizId: quizIdStr,
          question: String(question ?? ''),
          questionAr: questionAr ? String(questionAr) : null,
          options,
          optionsAr,
          correctIndex: Number(correctIndex ?? 0),
          explanation: explanation ? String(explanation) : null,
          explanationAr: explanationAr ? String(explanationAr) : null,
          sortOrder: Number(sortOrder ?? 0),
        },
      });
    }
  }

  // Stock prices
  const stockTuples = extractTuples(sql, 'stock_prices');
  if (stockTuples.length) {
    for (const t of stockTuples) {
      const parts = splitSqlTuple(t).map(parseSqlValue);
      const [symbol, price] = parts as SqlValue[];
      await prisma.stockPrice.upsert({
        where: { symbol: String(symbol) },
        update: { price: new Prisma.Decimal(Number(price ?? 0)), updatedAt: new Date() },
        create: {
          symbol: String(symbol),
          price: new Prisma.Decimal(Number(price ?? 0)),
          updatedAt: new Date(),
        },
      });
    }
  } else {
    // Fallback: initial 5 symbols (if seeds.sql doesn't include stock_prices)
    const stocks = [
      { symbol: 'COMI', price: 78.5 },
      { symbol: 'ETEL', price: 24.3 },
      { symbol: 'HRHO', price: 18.6 },
      { symbol: 'TMGH', price: 12.8 },
      { symbol: 'SWDY', price: 34.1 },
    ] as const;
    for (const s of stocks) {
      await prisma.stockPrice.upsert({
        where: { symbol: s.symbol },
        update: { price: new Prisma.Decimal(s.price), updatedAt: new Date() },
        create: { symbol: s.symbol, price: new Prisma.Decimal(s.price), updatedAt: new Date() },
      });
    }
  }

  // Demo users for leaderboard (password: 123456)
  const demoPasswordHash = await bcrypt.hash('123456', 10);
  const demoUsers = [
    { email: 'demo1@fin-game.local', displayName: 'Demo Player 1', coins: 1200, xp: 1800 },
    { email: 'demo2@fin-game.local', displayName: 'Demo Player 2', coins: 950, xp: 1400 },
    { email: 'demo3@fin-game.local', displayName: 'Demo Player 3', coins: 700, xp: 900 },
  ] as const;
  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        displayName: u.displayName,
        coins: u.coins,
        xp: u.xp,
        passwordHash: demoPasswordHash,
      },
      create: {
        email: u.email,
        passwordHash: demoPasswordHash,
        displayName: u.displayName,
        coins: u.coins,
        xp: u.xp,
      },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import fs from 'fs';
import path from 'path';

/**
 * Strips single-line and multi-line comments from JSON string while respecting string literals.
 */
export function stripJsonComments(jsonString) {
  let insideString = false;
  let stringChar = '';
  let isEscaped = false;
  let result = '';

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];
    const nextChar = jsonString[i + 1];

    if (insideString) {
      result += char;
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === stringChar) {
        insideString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      insideString = true;
      stringChar = char;
      result += char;
      continue;
    }

    // Check for single-line comment //
    if (char === '/' && nextChar === '/') {
      while (i < jsonString.length && jsonString[i] !== '\n' && jsonString[i] !== '\r') {
        i++;
      }
      if (i < jsonString.length) {
        result += jsonString[i];
      }
      continue;
    }

    // Check for multi-line comment /* */
    if (char === '/' && nextChar === '*') {
      i += 2;
      while (i < jsonString.length - 1 && !(jsonString[i] === '*' && jsonString[i + 1] === '/')) {
        i++;
      }
      i++; // skip closing '/'
      continue;
    }

    result += char;
  }

  return result;
}

/**
 * Removes trailing commas from JSON objects and arrays.
 */
export function stripTrailingCommas(jsonString) {
  return jsonString.replace(/,\s*([}\]])/g, '$1');
}

/**
 * Parses JSONC (JSON with comments and trailing commas).
 */
export function parseJsonc(content) {
  if (typeof content !== 'string') return {};
  const cleaned = stripTrailingCommas(stripJsonComments(content)).trim();
  if (!cleaned) return {};
  return JSON.parse(cleaned);
}

/**
 * Safely reads JSON or JSONC file, returning default value if not found.
 */
export function safeReadJson(filePath, defaultValue = null) {
  try {
    if (!fs.existsSync(filePath)) {
      return { data: defaultValue, exists: false, raw: '' };
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = parseJsonc(raw);
    return { data, exists: true, raw };
  } catch (err) {
    return { data: defaultValue, exists: true, raw: '', error: err.message };
  }
}

/**
 * Safely writes JSON file with atomic backup and directory creation.
 */
export function safeWriteJson(filePath, data, { backup = true, space = 2 } = {}) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (backup && fs.existsSync(filePath)) {
    const backupPath = `${filePath}.bak`;
    fs.copyFileSync(filePath, backupPath);
  }

  const content = JSON.stringify(data, null, space) + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

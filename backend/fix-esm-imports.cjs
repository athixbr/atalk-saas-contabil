#!/usr/bin/env node

/**
 * Comprehensive ESM postbuild fixer
 * Runs after TypeScript compiles to fix ESM compatibility issues:
 * 1. Add .js extensions to relative imports/exports (resolving directories to /index.js)
 * 2. Add __dirname/__filename shims (using import.meta.url)
 * 3. Add createRequire shim for files using require()
 * 4. Convert module.exports to export default
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');

let stats = {
  jsExtensions: 0,
  dirnameShims: 0,
  requireShims: 0,
  moduleExports: 0,
  cjsNamedImports: 0,
  filesProcessed: 0,
};

// CJS packages that do NOT support named exports in ESM
// These need: import { X } from "pkg" => import __pkg from "pkg"; const { X } = __pkg;
const CJS_NO_NAMED_EXPORTS = new Set([
  'lodash',
  'jsonwebtoken',
  'bcryptjs',
  'crypto-js',
  'mustache',
  'cors',
  'sharp',
  'request',
  'sequelize',
  'redis',
  'mysql2',
  'pg',
  'sqlite3',
  'express',
  'multer',
  'axios',
  'bull',
  'node-cron',
]);

/**
 * Resolve an import path: if it's a directory with index.js, return /index.js
 * Otherwise return .js
 */
function resolveImportExtension(importPath, currentFile) {
  const currentDir = path.dirname(currentFile);
  const resolvedPath = path.resolve(currentDir, importPath);

  // Check if the path is a directory with index.js
  try {
    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
      if (fs.existsSync(path.join(resolvedPath, 'index.js'))) {
        return importPath + '/index.js';
      }
    }
  } catch (e) {
    // ignore
  }

  // Check if file.js exists
  if (fs.existsSync(resolvedPath + '.js')) {
    return importPath + '.js';
  }

  // Default: assume .js
  return importPath + '.js';
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    const relPath = filePath.replace(DIST_DIR, '');

    // ============================================
    // 1. Add .js extensions to relative imports
    // ============================================
    
    // Pattern: import/export ... from "./path"
    const importFromRegex = /^(\s*(?:import|export)\s+(?:[^;]*?\s+)?from\s+['"])(\.\.?\/[^"']*?)(["'])/gm;
    let match;
    const replacements = [];
    
    while ((match = importFromRegex.exec(content)) !== null) {
      const importPath = match[2];
      if (!importPath.endsWith('.js') && !importPath.endsWith('.json') && !importPath.endsWith('.cjs') && !importPath.endsWith('.mjs')) {
        const resolved = resolveImportExtension(importPath, filePath);
        replacements.push({
          original: match[0],
          fixed: `${match[1]}${resolved}${match[3]}`
        });
      }
    }
    
    // Side-effect imports: import "./path"
    const sideEffectRegex = /^(\s*import\s+['"])(\.\.?\/[^"']*?)(["']\s*;?\s*$)/gm;
    while ((match = sideEffectRegex.exec(content)) !== null) {
      const importPath = match[2];
      if (!importPath.endsWith('.js') && !importPath.endsWith('.json') && !importPath.endsWith('.cjs') && !importPath.endsWith('.mjs')) {
        const resolved = resolveImportExtension(importPath, filePath);
        replacements.push({
          original: match[0],
          fixed: `${match[1]}${resolved}${match[3]}`
        });
      }
    }

    // Dynamic imports: import("./path") or await import("./path")
    const dynamicImportRegex = /((?:await\s+)?import\s*\(\s*['"])(\.\.?\/[^"']*?)(['"])/gm;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      const importPath = match[2];
      if (!importPath.endsWith('.js') && !importPath.endsWith('.json') && !importPath.endsWith('.cjs') && !importPath.endsWith('.mjs')) {
        const resolved = resolveImportExtension(importPath, filePath);
        replacements.push({
          original: match[0],
          fixed: `${match[1]}${resolved}${match[3]}`
        });
      }
    }

    // npm packages with subpaths that need .js
    const npmSubpathRegex = /^(\s*(?:import|export)\s+(?:[^;]*?\s+)?from\s+['"])((crypto-js|@whiskeysockets\/baileys)\/[^"']+)(["'])/gm;
    while ((match = npmSubpathRegex.exec(content)) !== null) {
      const importPath = match[2];
      if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
        replacements.push({
          original: match[0],
          fixed: `${match[1]}${importPath}.js${match[4]}`
        });
      }
    }

    for (const r of replacements) {
      content = content.replace(r.original, r.fixed);
      modified = true;
      stats.jsExtensions++;
    }

    // ============================================
    // 1b. Fix CJS packages that don't support named exports in ESM
    // Transform: import { X, Y } from "lodash"  =>  import __cjs_lodash from "lodash"; const { X, Y } = __cjs_lodash;
    // If multiple named imports from same package, merge into one import + multiple const destructures
    // Transform: import * as _ from "lodash"     =>  import _ from "lodash";
    // ============================================
    
    // Collect all named imports per CJS package: { "lodash": [ { names: "isEmpty, isNil", indent: "", lineText: "..." }, ... ] }
    const cjsNamedByPkg = {};
    const cjsNamedRegex = /^(\s*)import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["']\s*;?\s*$/gm;
    let cjsMatch;
    
    while ((cjsMatch = cjsNamedRegex.exec(content)) !== null) {
      const indent = cjsMatch[1];
      const names = cjsMatch[2].trim();
      const pkg = cjsMatch[3];
      
      if (CJS_NO_NAMED_EXPORTS.has(pkg)) {
        if (!cjsNamedByPkg[pkg]) cjsNamedByPkg[pkg] = [];
        cjsNamedByPkg[pkg].push({ names, indent, lineText: cjsMatch[0] });
      }
    }
    
    // For each CJS package with named imports, replace first occurrence with import + destructure,
    // and subsequent occurrences with just the destructure (no duplicate import)
    for (const [pkg, entries] of Object.entries(cjsNamedByPkg)) {
      const safeName = '__cjs_' + pkg.replace(/[^a-zA-Z0-9]/g, '_');
      
      for (let i = 0; i < entries.length; i++) {
        const { names, indent, lineText } = entries[i];
        let replacement;
        if (i === 0) {
          // First occurrence: add the default import + destructure
          replacement = `${indent}import ${safeName} from "${pkg}";\n${indent}const { ${names} } = ${safeName};`;
        } else {
          // Subsequent: just the destructure (import already exists)
          replacement = `${indent}const { ${names} } = ${safeName};`;
        }
        content = content.replace(lineText, replacement);
        modified = true;
        stats.cjsNamedImports++;
      }
    }
    
    // Namespace imports: import * as X from "pkg"  
    const cjsStarRegex = /^(\s*)import\s+\*\s+as\s+(\w+)\s+from\s+["']([^"']+)["']\s*;?\s*$/gm;
    while ((cjsMatch = cjsStarRegex.exec(content)) !== null) {
      const indent = cjsMatch[1];
      const alias = cjsMatch[2];
      const pkg = cjsMatch[3];
      
      if (CJS_NO_NAMED_EXPORTS.has(pkg)) {
        // Check if we already have a default import for this package from named imports
        const safeName = '__cjs_' + pkg.replace(/[^a-zA-Z0-9]/g, '_');
        const alreadyImported = cjsNamedByPkg[pkg] && cjsNamedByPkg[pkg].length > 0;
        
        let replacement;
        if (alreadyImported) {
          // Already imported as safeName, just alias it
          replacement = `${indent}const ${alias} = ${safeName};`;
        } else {
          replacement = `${indent}import ${alias} from "${pkg}";`;
        }
        content = content.replace(cjsMatch[0], replacement);
        modified = true;
        stats.cjsNamedImports++;
      }
    }

    // ============================================
    // 2. Detect needs for shims
    // ============================================
    
    const needsDirname = /\b__dirname\b|\b__filename\b/.test(content);
    const needsRequire = /\brequire\s*\(/.test(content);
    const hasModuleExports = /\bmodule\.exports\b/.test(content);

    // ============================================
    // 3. Convert module.exports to export default
    // ============================================
    if (hasModuleExports) {
      content = content.replace(/^(\s*)module\.exports\s*=\s*/gm, '$1export default ');
      modified = true;
      stats.moduleExports++;
    }

    // ============================================
    // 4. Add shims at the top of the file
    // ============================================
    const shims = [];

    if (needsRequire && !content.includes('createRequire')) {
      shims.push("import { createRequire as __createRequire } from 'module';");
      shims.push("const require = __createRequire(import.meta.url);");
      stats.requireShims++;
    }

    if (needsDirname && !content.includes('fileURLToPath')) {
      shims.push("import { fileURLToPath as __fileURLToPath } from 'url';");
      shims.push("import { dirname as __dirnameFn } from 'path';");
      shims.push("const __filename = __fileURLToPath(import.meta.url);");
      shims.push("const __dirname = __dirnameFn(__filename);");
      stats.dirnameShims++;
    }

    if (shims.length > 0) {
      // Insert shims after any existing imports at the top
      const lines = content.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('import ')) {
          lastImportIndex = i;
        } else if (line !== '' && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*') && !line.startsWith('"use strict"')) {
          break;
        }
      }

      const insertIndex = lastImportIndex + 1;
      lines.splice(insertIndex, 0, '', ...shims, '');
      content = lines.join('\n');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }

    stats.filesProcessed++;
    return modified;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.js')) {
        fixFile(filePath);
      }
    });
  } catch (error) {
    console.error(`Error walking ${dir}:`, error.message);
  }
}

console.log('🔧 Fixing ESM compatibility in dist folder...\n');

if (fs.existsSync(DIST_DIR)) {
  walkDir(DIST_DIR);
  console.log(`\n✅ ESM fixes complete!`);
  console.log(`   Files processed: ${stats.filesProcessed}`);
  console.log(`   .js extensions added: ${stats.jsExtensions}`);
  console.log(`   CJS named imports fixed: ${stats.cjsNamedImports}`);
  console.log(`   __dirname shims added: ${stats.dirnameShims}`);
  console.log(`   createRequire shims added: ${stats.requireShims}`);
  console.log(`   module.exports converted: ${stats.moduleExports}`);
  console.log('');
} else {
  console.log('❌ dist folder not found. Run npm run build first.\n');
  process.exit(1);
}

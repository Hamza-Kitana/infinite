import fs from "fs";
import path from "path";

const root = process.cwd();
const srcDir = path.join(root, "src");

function resolveImport(fromFile, spec) {
  if (!spec.startsWith("@/")) return null;
  const rel = spec.slice(2);
  const base = path.join(srcDir, rel);
  const tries = [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, "index.tsx"),
    path.join(base, "index.ts"),
  ];
  return tries.find((t) => fs.existsSync(t)) ?? null;
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (name === "node_modules" || name === "dist") continue;
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(full);
  }
  return out;
}

const files = walk(srcDir);
const missing = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const re = /from\s+["'](@\/[^"']+)["']/g;
  let m;
  while ((m = re.exec(text))) {
    if (!resolveImport(file, m[1])) {
      missing.push({ file: path.relative(root, file), import: m[1] });
    }
  }
}

console.log(`Scanned ${files.length} source files`);
if (missing.length === 0) {
  console.log("All @/ imports resolve OK");
} else {
  console.log(`Missing imports: ${missing.length}`);
  for (const x of missing.slice(0, 30)) {
    console.log(`  ${x.file} -> ${x.import}`);
  }
  process.exit(1);
}

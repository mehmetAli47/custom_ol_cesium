import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const rootPkgPath = path.join(repoRoot, "package.json");
const distDir = path.join(repoRoot, "dist-lib");
const distPkgPath = path.join(distDir, "package.json");

if (!fs.existsSync(distDir)) {
  throw new Error("dist-lib not found. Run build:lib first.");
}

const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf8"));

const distPkg = {
  name: rootPkg.name,
  version: rootPkg.version,
  type: rootPkg.type ?? "module",
  main: "./index.js",
  types: "./types/index.d.ts",
  exports: {
    ".": {
      types: "./types/index.d.ts",
      import: "./index.js",
    },
  },
  peerDependencies: rootPkg.peerDependencies ?? {},
};

fs.writeFileSync(distPkgPath, JSON.stringify(distPkg, null, 2) + "\n", "utf8");

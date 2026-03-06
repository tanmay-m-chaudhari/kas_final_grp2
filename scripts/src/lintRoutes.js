const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

async function lintRoutes() {
  const routeFiles = await glob("../../src/routes/*.js", { cwd: __dirname });
  const issues = [];

  for (const file of routeFiles) {
    const content = fs.readFileSync(path.resolve(__dirname, file), "utf-8");
    if (!content.includes("router.use") && !content.includes("router.get") && !content.includes("router.post")) {
      issues.push(`${file}: no route handlers found`);
    }
    if (content.includes("console.log")) {
      issues.push(`${file}: contains console.log statements`);
    }
  }

  if (issues.length > 0) {
    process.stderr.write(issues.join("\n") + "\n");
    process.exit(1);
  }
}

lintRoutes().catch(process.exit);

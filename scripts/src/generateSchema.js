const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

async function generateSchema() {
  const routeFiles = await glob("../../src/routes/*.js", { cwd: __dirname });
  const schema = { openapi: "3.0.0", info: { title: "LogStream API", version: "1.0.0" }, paths: {} };

  for (const file of routeFiles) {
    const routeName = path.basename(file, ".js");
    schema.paths[`/${routeName}`] = {
      get: { summary: `${routeName} endpoint`, responses: { 200: { description: "OK" } } },
    };
  }

  const outPath = path.join(__dirname, "../../api-schema.yaml");
  fs.writeFileSync(outPath, yaml.dump(schema));
}

generateSchema().catch(process.exit);

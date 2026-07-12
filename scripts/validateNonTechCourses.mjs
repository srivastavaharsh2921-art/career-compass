import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../frontend/data/nonTechCourses.generated.js", import.meta.url),
  "utf8"
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const {
  nonTechCourses,
  validateNonTechCourses
} = await import(moduleUrl);

const result = validateNonTechCourses(nonTechCourses);

if (!result.valid) {
  console.error("Non-tech course validation failed:");
  result.errors.forEach((error) => {
    console.error(`- ${error}`);
  });
  process.exit(1);
}

console.log(`Successfully validated ${result.courseCount} non-tech courses.`);

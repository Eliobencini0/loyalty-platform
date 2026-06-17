/**
 * Reads design/design-tokens.json and generates src/tokens.css
 * Run: node packages/ui/scripts/generate-tokens.js
 */
const fs = require("fs");
const path = require("path");

const tokensPath = path.resolve(__dirname, "../../../design/design-tokens.json");
const outputPath = path.resolve(__dirname, "../src/tokens.css");

const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf-8"));

const lines = ["/* Auto-generated from design/design-tokens.json — do not edit manually */", ":root {"];

// Colors
for (const [group, shades] of Object.entries(tokens.color)) {
  if (typeof shades === "string") {
    lines.push(`  --color-${group}: ${shades};`);
  } else {
    for (const [shade, value] of Object.entries(shades)) {
      lines.push(`  --color-${group}-${shade}: ${value};`);
    }
  }
}

// Semantic tokens (resolve references)
function resolve(ref) {
  const match = ref.match(/^\{(.+)\}$/);
  if (!match) return ref;
  return `var(--${match[1].replace(/\./g, "-")})`;
}

lines.push("");
lines.push("  /* Semantic */");
for (const [category, values] of Object.entries(tokens.semantic)) {
  for (const [key, value] of Object.entries(values)) {
    lines.push(`  --${category}-${key}: ${resolve(value)};`);
  }
}

// Typography
lines.push("");
lines.push("  /* Typography */");
for (const [key, value] of Object.entries(tokens.typography.fontFamily)) {
  lines.push(`  --font-${key}: ${value};`);
}
for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
  lines.push(`  --text-${key}: ${value};`);
}
for (const [key, value] of Object.entries(tokens.typography.fontWeight)) {
  lines.push(`  --weight-${key}: ${value};`);
}
for (const [key, value] of Object.entries(tokens.typography.lineHeight)) {
  lines.push(`  --leading-${key}: ${value};`);
}

// Spacing
lines.push("");
lines.push("  /* Spacing */");
for (const [key, value] of Object.entries(tokens.spacing)) {
  lines.push(`  --space-${key}: ${value};`);
}

// Border radius
lines.push("");
lines.push("  /* Border Radius */");
for (const [key, value] of Object.entries(tokens.borderRadius)) {
  lines.push(`  --radius-${key}: ${value};`);
}

// Shadows
lines.push("");
lines.push("  /* Shadows */");
for (const [key, value] of Object.entries(tokens.shadow)) {
  lines.push(`  --shadow-${key}: ${value};`);
}

// Motion
lines.push("");
lines.push("  /* Motion */");
for (const [key, value] of Object.entries(tokens.motion.duration)) {
  lines.push(`  --duration-${key}: ${value};`);
}
for (const [key, value] of Object.entries(tokens.motion.easing)) {
  lines.push(`  --easing-${key}: ${value};`);
}

// Icons
lines.push("");
lines.push("  /* Icons */");
lines.push(`  --icon-size: ${tokens.icons.defaultSize};`);
lines.push(`  --icon-size-compact: ${tokens.icons.compactSize};`);
lines.push(`  --icon-stroke: ${tokens.icons.strokeWidth};`);

lines.push("}");
lines.push("");

fs.writeFileSync(outputPath, lines.join("\n"));
console.log(`Generated ${outputPath}`);

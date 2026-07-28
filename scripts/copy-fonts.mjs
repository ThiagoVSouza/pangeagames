import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const families = [
  ["noto-sans", "Noto Sans"],
  ["noto-sans-sc", "Noto Sans SC"],
  ["noto-sans-tc", "Noto Sans TC"],
  ["noto-sans-jp", "Noto Sans JP"],
  ["noto-sans-kr", "Noto Sans KR"],
  ["noto-sans-thai", "Noto Sans Thai"],
];
const weights = ["400", "700"];
const outputRoot = path.resolve("public/assets/fonts");

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const imports = [];
for (const [packageName] of families) {
  const packageRoot = path.resolve("node_modules/@fontsource", packageName);
  const familyOutput = path.join(outputRoot, packageName);
  const filesOutput = path.join(familyOutput, "files");
  await mkdir(filesOutput, { recursive: true });

  for (const weight of weights) {
    const cssSource = path.join(packageRoot, `${weight}.css`);
    let css = await readFile(cssSource, "utf8");
    css = css.replace(/, url\(\.\/files\/[^)]+\.woff\) format\('woff'\)/g, "");
    await writeFile(path.join(familyOutput, `${weight}.css`), css, "utf8");
    imports.push(`@import url("./${packageName}/${weight}.css");`);

    const matches = [...css.matchAll(/url\(\.\/files\/([^)]+\.woff2)\)/g)];
    for (const match of matches) {
      const filename = match[1];
      await cp(path.join(packageRoot, "files", filename), path.join(filesOutput, filename));
    }
  }
}

await writeFile(path.join(outputRoot, "fonts.css"), `${imports.join("\n")}\n`, "utf8");

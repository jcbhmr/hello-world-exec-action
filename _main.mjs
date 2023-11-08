import { dirname, join } from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
const pkg = await readFile(
  new URL(import.meta.resolve("./Cargo.toml")),
  "utf8"
);
const name = pkg.match(/name = ["'](.+)["']/)[1];
const version = pkg.match(/version = ["'](.+)["']/)[1];
let file;
if (dirname(process.argv[1]).startsWith(process.cwd())) {
  file = join(dirname(process.argv[1]), "target", "debug", name);
} else {
  const DEST = join(process.env.RUNNER_TOOL_CACHE, name, version, process.arch);
  if (!existsSync(DEST)) {
    const target = {
      "win32,x64": "x86_64-pc-windows-msvc",
      "darwin,x64": "x86_64-apple-darwin",
      "linux,x64": "x86_64-unknown-linux-gnu",
    }[[process.platform, process.arch].toString()];
    const ext = process.platform === "windows" ? "zip" : "tar.gz";
    const filename = `${name}-${target}.${ext}`;
    const response = await fetch(
      `https://github.com/${process.env.GITHUB_ACTION_REPOSITORY}/releases/download/${version}/${filename}`
    );
    const SRC = join(DEST, filename);
    await pipeline(response.body, createWriteStream(SRC));
    let subprocess2;
    if (process.platform === "windows" && filename.endsWith(".zip")) {
      subprocess2 = spawn(
        `Expand-Archive -LiteralPath $Env:SRC -DestinationPath $Env:DEST`,
        { shell: "powershell", env: { ...process.env, SRC, DEST } }
      );
    } else {
      subprocess2 = spawn("tar", ["-xzf", SRC, "-C", DEST]);
    }
    await once(subprocess2, "exit");
  }
  file = join(DEST, name);
}
const subprocess3 = spawn(file, {
  stdio: "inherit",
  env: { ...process.env, file },
});
await once(subprocess3, "spawn");
subprocess3.on("exit", (x) => process.exit(x));

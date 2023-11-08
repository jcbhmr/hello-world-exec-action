import { dirname, join } from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir } from "node:fs/promises";
const name = "main";
const version = "1.0.0";
console.log(process.argv[1]);
const localName = process.platform === "windows" ? `${name}.exe` : name;
let file;
if (dirname(process.argv[1]).startsWith(process.cwd())) {
  file = join(dirname(process.argv[1]), "target", "debug", localName);
} else {
  const target = {
    "win32,x64": "x86_64-pc-windows-msvc",
    "darwin,x64": "x86_64-apple-darwin",
    "linux,x64": "x86_64-unknown-linux-gnu",
  }[[process.platform, process.arch].toString()];
  const remoteName =
    process.platform === "windows"
      ? `${name}-${target}.exe`
      : `${name}-${target}`;
  file = join(dirname(process.argv[1]), "target", "release", localName);
  await mkdir(bin, { recursive: true });
  const response = await fetch(
    `https://github.com/${process.env.GITHUB_ACTION_REPOSITORY}/releases/download/v${version}/${remoteName}`
  );
  await pipeline(response.body, createWriteStream(file));
}
const subprocess = spawn(file, {
  stdio: "inherit",
  env: { ...process.env, file },
});
await once(subprocess, "spawn");
subprocess.on("exit", (x) => process.exit(x));

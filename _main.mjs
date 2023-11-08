import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const name = "main";
const release = "v1.0.0";
const binName = process.platform === "windows" ? `${name}.exe` : name;
let file;
if (dirname(process.argv[1]).startsWith(process.cwd())) {
  file = join(dirname(process.argv[1]), "target", "debug", binName);
} else {
  file = join(dirname(process.argv[1]), "target", "release", binName);
  const target = {
    "win32,x64": "x86_64-pc-windows-msvc",
    "darwin,x64": "x86_64-apple-darwin",
    "linux,x64": "x86_64-unknown-linux-gnu",
  }[[process.platform, process.arch].toString()];
  const response = await fetch(
    `https://github.com/${process.env.GITHUB_ACTION_REPOSITORY}/releases/download/${release}/${target}.zip`
  );
  assert(response.ok, `${response.status} ${response.url}`);
  await mkdir(dirname(file), { recursive: true });
  await pipeline(response.body, createWriteStream(file));
  await chmod(file, 0o755);
}
const subprocess = spawn(file, { stdio: "inherit" });
const [exitCode] = await once(subprocess, "exit");
process.exitCode = exitCode;

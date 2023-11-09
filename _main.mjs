import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, chmod } from "node:fs/promises";
import assert from "node:assert/strict";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
const name = "main";
const release = "v1.0.1";
const exe = process.platform === "windows" ? ".exe" : "";
let file;
if (dirname(process.argv[1]).startsWith(process.cwd())) {
  file = join(dirname(process.argv[1]), "target", "debug", name + exe);
} else {
  const target = {
    "win32,x64": "x86_64-pc-windows-msvc",
    "darwin,x64": "x86_64-apple-darwin",
    "linux,x64": "x86_64-unknown-linux-gnu",
  }[[process.platform, process.arch].toString()];
  file = join(dirname(process.argv[1]), "target", "release", name + exe);
  await mkdir(dirname(file), { recursive: true });
  const response = await fetch(
    `https://github.com/${process.env.GITHUB_ACTION_REPOSITORY}/releases/download/${release}/${name}-${target}${exe}`
  );
  assert(response.ok, `${response.status} ${response.url}`);
  await pipeline(response.body, createWriteStream(file));
  await chmod(file, 0o755);
}
const subprocess = spawn(file, { stdio: "inherit" });
process.exitCode = (await once(subprocess, "exit"))[0];

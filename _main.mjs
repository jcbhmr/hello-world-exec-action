import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
const name = "main";
const target = {
  "win32,x64": "x86_64-pc-windows-msvc",
  "darwin,x64": "x86_64-apple-darwin",
  "linux,x64": "x86_64-unknown-linux-gnu",
}[[process.platform, process.arch].toString()];
const exe = process.platform === "windows" ? ".exe" : "";
console.log(
  join(dirname(process.argv[1]), "target", target, "release", name + exe),
  join(dirname(process.argv[1]), "target", "debug", name + exe),
  existsSync(
    join(dirname(process.argv[1]), "target", target, "release", name + exe)
  ),
  existsSync(join(dirname(process.argv[1]), "target", "debug", name + exe))
);
const file = [
  join(dirname(process.argv[1]), "target", target, "release", name + exe),
  join(dirname(process.argv[1]), "target", "debug", name + exe),
].find((f) => existsSync(f));
const subprocess = spawn(file, { stdio: "inherit" });
process.exitCode = (await once(subprocess, "exit"))[0];

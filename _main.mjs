import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { copyFile } from "node:fs/promises";
import { createGunzip } from "node:zlib";
const name = "main";
const target = {
  "win32,x64": "x86_64-pc-windows-msvc",
  "darwin,x64": "x86_64-apple-darwin",
  "linux,x64": "x86_64-unknown-linux-gnu",
}[[process.platform, process.arch].toString()];
const exe = process.platform === "win32" ? ".exe" : "";
const __dirname = dirname(process.argv[1]);
let file;
if (dirname(process.argv[1]).startsWith(process.cwd())) {
  file = join(dirname(process.argv[1]), "target", "debug", name + exe);
} else {
  file = join(
    dirname(process.argv[1]),
    "target",
    target,
    "release",
    name + exe
  );
  const gz = join(dirname(file), name + exe + ".gz");
  await copyFile(file, gz);
  await pipeline(createReadStream(gz), createGunzip(), createWriteStream(file));
}
const subprocess = spawn(file, { stdio: "inherit" });
process.exitCode = (await once(subprocess, "exit"))[0];

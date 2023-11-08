import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir } from "node:fs/promises";
const name = "main";
const tag = "v1.0.0";
const binName = process.platform === "windows" ? `${name}.exe` : name;
let file;
if (dirname(process.argv[1]).startsWith(process.cwd())) {
  file = join(dirname(process.argv[1]), "target", "debug", binName);
} else {
  const target = {
    "win32,x64": "x86_64-pc-windows-msvc",
    "darwin,x64": "x86_64-apple-darwin",
    "linux,x64": "x86_64-unknown-linux-gnu",
  }[[process.platform, process.arch].toString()];
  const url = `https://github.com/${process.env.GITHUB_ACTION_REPOSITORY}/releases/download/${tag}/${target}.zip`;
  file = join(dirname(process.argv[1]), "target", "release", binName);
  await mkdir(dirname(file), { recursive: true });
  const subprocess1 = spawn(
    `curl -fsSL "$url" | unzip -d "$dir"`,
    { shell: "bash", env: { ...process.env, url, bin: dirname(file) } },
  );
  await once(subprocess1, "exit");
}
const subprocess2 = spawn(file, { stdio: "inherit" });
await once(subprocess2, "spawn");
subprocess2.on("exit", (x) => process.exit(x));

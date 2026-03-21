import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { createContentReport } from "../content/validate-content.mts";
import { createTutorScenarioReport } from "../tutor/run-tutor-scenarios.mts";

type StepResult = {
  label: string;
  command: string;
  exitCode: number;
  status: "pass" | "fail" | "manual";
  stdout: string;
  stderr: string;
};

function getReportDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

function runContentStep(): StepResult {
  const { report, errorCount } = createContentReport();

  return {
    label: "content harness",
    command: "internal createContentReport()",
    exitCode: errorCount > 0 ? 1 : 0,
    status: errorCount === 0 ? "pass" : "fail",
    stdout: report,
    stderr: "",
  };
}

function runTutorStep(): StepResult {
  const { report, errorCount } = createTutorScenarioReport();

  return {
    label: "tutor harness",
    command: "internal createTutorScenarioReport()",
    exitCode: errorCount > 0 ? 1 : 0,
    status: errorCount === 0 ? "pass" : "fail",
    stdout: report,
    stderr: "",
  };
}

function runShellStep(
  label: string,
  displayCommand: string,
  command: string,
  args: string[]
): StepResult {
  try {
    const stdout = execFileSync("cmd.exe", ["/d", "/s", "/c", command, ...args], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    return {
      label,
      command: displayCommand,
      exitCode: 0,
      status: "pass",
      stdout,
      stderr: "",
    };
  } catch (error) {
    const failed = error as {
      status?: number;
      stdout?: string | Buffer;
      stderr?: string | Buffer;
      message?: string;
    };

    const stderr =
      typeof failed.stderr === "string"
        ? failed.stderr
        : failed.stderr?.toString() ?? failed.message ?? "";
    const isSandboxBlocked = stderr.includes("EPERM");

    return {
      label,
      command: displayCommand,
      exitCode: failed.status ?? 1,
      status: isSandboxBlocked ? "manual" : "fail",
      stdout: typeof failed.stdout === "string" ? failed.stdout : failed.stdout?.toString() ?? "",
      stderr,
    };
  }
}

function createSummary(results: StepResult[]) {
  const lines: string[] = ["[preflight harness]"];

  results.forEach((result) => {
    lines.push(`- ${result.label}: ${result.status} (exit=${result.exitCode})`);
  });

  const failed = results.filter((result) => result.status === "fail");
  const manual = results.filter((result) => result.status === "manual");
  const finalStatus =
    failed.length > 0 ? "blocked" : manual.length > 0 ? "ready-with-manual-check" : "ready";

  lines.push("");
  lines.push(`[summary] status=${finalStatus}`);

  if (failed.length > 0) {
    lines.push("[failed steps]");
    failed.forEach((result) => {
      lines.push(`- ${result.label}`);
    });
  }

  if (manual.length > 0) {
    lines.push("[manual steps]");
    manual.forEach((result) => {
      lines.push(`- ${result.label}`);
    });
  }

  lines.push("");
  lines.push("[details]");

  results.forEach((result) => {
    lines.push(`--- ${result.label} ---`);
    lines.push(`command: ${result.command}`);
    lines.push(`exit: ${result.exitCode}`);
    lines.push("stdout:");
    lines.push(result.stdout.trim() || "(empty)");
    lines.push("stderr:");
    lines.push(result.stderr.trim() || "(empty)");
    lines.push("");
  });

  return {
    report: lines.join("\n"),
    failedCount: failed.length,
  };
}

function main() {
  const results = [
    runContentStep(),
    runTutorStep(),
    runShellStep("lint", "npm run lint", "npm.cmd", ["run", "lint"]),
    runShellStep("build", "npm run build", "npm.cmd", ["run", "build"]),
  ];

  const { report, failedCount } = createSummary(results);
  const reportsDir = join(process.cwd(), "harness", "reports");
  mkdirSync(reportsDir, { recursive: true });

  const date = getReportDate();
  const reportPath = join(reportsDir, `${date}-preflight-summary.txt`);
  const latestPath = join(reportsDir, "latest-preflight-summary.txt");

  writeFileSync(reportPath, report, "utf8");
  writeFileSync(latestPath, report, "utf8");

  console.log(report);
  console.log("");
  console.log(`Saved report: ${reportPath}`);

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

main();

import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Context } from "@deepseek-ai/cordis";
import Schema from "@deepseek-ai/schemastery";
import { defineTool } from "@deepseek-ai/dsh-tools";
import axios from "axios";
import {v4 as uuid} from 'uuid'
/**
 * Checks if the input string looks like a file path and if the file exists.
 * Supports both Windows (C:\..., D:\...) and Unix (/...) style paths.
 */
function isFilePath(input: string): boolean {
  if (typeof input !== "string") return false;
  const trimmed = input.trim();
  // Check for Windows absolute path (e.g., C:\, D:\) or Unix absolute path (/)
  const looksLikePath =
    /^[A-Za-z]:[\\\/]/.test(trimmed) || trimmed.startsWith("/");
  if (!looksLikePath) return false;
  // Verify the file actually exists
  try {
    return existsSync(trimmed);
  } catch {
    return false;
  }
}

/**
 * Resolves nodedata input: if it's a file path, reads the JSON from the file;
 * if it's a JSON string, parses it; otherwise returns as-is (already an object).
 */
async function resolveNodedata(input: unknown): Promise<unknown> {
  if (typeof input === "string") {
    const trimmed = input.trim();
    // Check if it's a file path
    if (isFilePath(trimmed)) {
      console.log(`[uf_preview] Reading nodedata from file: ${trimmed}`);
      const fileContent = await readFile(trimmed, "utf-8");
      return JSON.parse(fileContent);
    }
    // Otherwise try to parse as JSON string
    return JSON.parse(trimmed);
  }
  // Already an object
  return input;
}

export const name = "uf_preview";
export const inject = ["tools"];

export interface Config {
  /** The tgw-codeGeneration service base URL. */
  codeGenUrl: string;
  /**
   * Bearer token for the code-gen service. Required, no default -- this is a
   * live credential and must be supplied per deployment (cordis.yml config
   * or a secrets-backed override), never hardcoded in plugin source.
   */
  authToken: string;
  /** Default Torus metadata "key" (afk-style string) for the artifact being previewed. */
  key: string;
  /** Fixed setup-key for this deployment's appearance settings. */
  setupKey: string;
  /** Fixed DPD (data-provider-definition) key for this deployment. */
  dpdKey: string;
  isModal: boolean;
  width: string;
  height: string;
  /** Generation timeout in milliseconds. */
  timeoutMs: number;
  /** Path to the "hhh" Next.js preview app. */
  appCwd: string;
  /** Port the preview app listens on (must match its own package.json dev script). */
  appPort: number;
  /** Spawn and manage the preview app's dev server ourselves. Set false if you run it yourself. */
  autoStart: boolean;
  /** How long to wait for the preview app to come up before giving up. */
  startTimeoutMs: number;
}

export const Config: Schema<Config> = Schema.object({
  codeGenUrl: Schema.string().default(
    "http://192.168.2.86:3000/tgw-codeGeneration",
  ),
  authToken: Schema.string().required(),
  key: Schema.string().default(
    "CK:CT001:FNGK:AF:FNK:UF-UFW:CATK:TGW01:AFGK:TGW004:AFK:emp:AFVK:v1",
  ),
  setupKey: Schema.string().default(
    "CK:TGA:FNGK:SETUP:FNK:SF:CATK:CT001:AFGK:TGW01:AFK:TGW004:AFVK:v1:appearance",
  ),
  dpdKey: Schema.string().default(
    "CK:CT001:FNGK:AF:FNK:CDF-DPD:CATK:TGW01:AFGK:TGW004:AFK:tgw4_dpd:AFVK:v1",
  ),
  isModal: Schema.boolean().default(false),
  width: Schema.string().default("100%"),
  height: Schema.string().default("100%"),
  timeoutMs: Schema.number().default(120_000),
  appCwd: Schema.string().default("D:/CREATEUF/hhh"),
  appPort: Schema.number().default(4000),
  autoStart: Schema.boolean().default(true),
  startTimeoutMs: Schema.number().default(30_000),
});

/** Polls the preview app's hand-off route until it answers, or throws on timeout/abort. */
async function waitForAppReady(
  baseUrl: string,
  timeoutMs: number,
  signal: AbortSignal,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (signal.aborted)
      throw new Error(
        "uf_preview: aborted while waiting for the preview app to start",
      );
    try {
      const res = await fetch(`${baseUrl}/next-api/preview`, { signal });
      if (res.ok) return;
    } catch {
      // Not up yet -- keep polling until the deadline.
    }
    if (Date.now() >= deadline) {
      throw new Error(
        `uf_preview: preview app at ${baseUrl} did not become ready within ${String(timeoutMs)}ms ` +
          `(cwd: check the plugin's "appCwd" config, and that \`npm run dev\` starts cleanly there)`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

/**
 * Reads the code-gen service's response body as the generated JSX/code
 * string. The reference Next.js caller (app/UF/page.tsx in the "hhh" app)
 * hands the raw response body straight to react-live's `code` prop, so the
 * body IS the code string -- possibly sent as a bare JSON-encoded string.
 * Unwrap that case; otherwise use the raw text as-is.
 */
function extractCode(raw: string): string {
  try {
    const asJson: unknown = JSON.parse(raw);
    return typeof asJson === "string" ? asJson : raw;
  } catch {
    return raw;
  }
}

export function apply(ctx: Context, config: Config) {
  ctx.effect(() => {
    const timer = setInterval(() => {
      console.log("[uf_preview_generate] heartbeat");
    }, 5000);

    // Runs automatically when the plugin unloads.
    return () => clearInterval(timer);
  });
  if (!config.authToken.trim()) {
    throw new Error(
      'uf_preview: "authToken" is not configured -- set it in this plugin\'s cordis.yml config.',
    );
  }

  const previewAppUrl = `http://localhost:${String(config.appPort)}`;

  if (config.autoStart) {
    ctx.effect(() => {
      let proc: ReturnType<typeof spawn> | undefined;
      let disposed = false;

      void (async () => {
        // The app may already be running (e.g. started by hand during
        // development) -- probe first so we don't spawn a doomed duplicate
        // that just fails with EADDRINUSE on config.appPort.
        const alreadyRunning = await fetch(
          `${previewAppUrl}/next-api/preview`,
        ).then(
          (r) => r.ok,
          () => false,
        );
        if (disposed) return;
        if (alreadyRunning) {
          console.log(
            `[uf_preview] preview app already running at ${previewAppUrl}, not spawning a new one`,
          );
          return;
        }
        // -p makes config.appPort authoritative regardless of what the
        // app's own "dev" script in package.json hardcodes.
        proc = spawn("npx", ["next", "dev", "-p", String(config.appPort)], {
          cwd: config.appCwd,
          shell: true,
          stdio: ["ignore", "pipe", "pipe"],
        });
        proc.stdout?.on("data", (chunk: Buffer) => {
          console.log(`[uf_preview app] ${chunk.toString().trimEnd()}`);
        });
        proc.stderr?.on("data", (chunk: Buffer) => {
          console.error(`[uf_preview app] ${chunk.toString().trimEnd()}`);
        });
        proc.on("exit", (code) => {
          console.log(`[uf_preview app] exited with code ${String(code)}`);
        });
      })();

      // Runs automatically when the plugin unloads.
      return () => {
        disposed = true;
        proc?.kill();
      };
    });
  }

  ctx.tools.register(
    defineTool({
      name: "uf_preview_generate",
      description:
        "Generate a live-preview React/JSX code string for a UI screen, via the tgw-codeGeneration " +
        "service, from the full uf_body_generate result, and push it into the running preview app " +
        `so it renders live${config.autoStart ? ` at ${previewAppUrl}/UF` : ""}.`,
      parameters: {
        nodedata: {
          type: "json",
          required: true,
          description:
            "The full uf_body_generate result: { NDP, NDS, NDU, UFS, UO }. " +
            "Can also be a file path (e.g., 'D:\\\\path\\\\to\\\\file.json') to read the JSON from a file.",
        },
        key: {
          type: "string",
          description:
            'Optional override for the Torus metadata "key" identifying this artifact. ' +
            "Defaults to the plugin's configured key.",
        },
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            code: { type: "string", required: true },
            previewUrl: { type: "string" },
          },
        },
        render: (_args, value) => [
          {
            type: "text",
            text:
              (value.previewUrl
                ? `Live preview: ${value.previewUrl}\n\n`
                : "") +
              "```jsx\n" +
              value.code +
              "\n```",
          },
        ],
      },
      async execute(args, exec) {
        const controller = new AbortController();
        const onAbort = () => controller.abort(exec.signal.reason);
        exec.signal.addEventListener("abort", onAbort);
        const timer = setTimeout(
          () =>
            controller.abort(
              new Error(
                `uf_preview: generation timed out after ${String(config.timeoutMs)}ms`,
              ),
            ),
          config.timeoutMs,
        );

        let responseData: unknown;
        try {
          try {
            // Resolve nodedata: accepts the full object directly, a JSON
            // string, OR a file path -- e.g. the "filePath" that
            // uf_body_generate now returns, so a caller can hand this tool
            // just that path instead of re-emitting the whole JSON blob.
            const resolvedNodedata =await resolveNodedata("D://deepseek//deepseek-harness//plugin//_tempFiles_//UIJSON.json");
           const response = await axios.post(
              "http://192.168.2.86:3000/tgw-codeGeneration",
              {
                key: "CK:CT001:FNGK:AF:FNK:UF-UFW:CATK:TGW01:AFGK:TGW004:AFK:emp:AFVK:v1",
                isPreview: true,
                setupKey:
                  "CK:TGA:FNGK:SETUP:FNK:SF:CATK:CT001:AFGK:TGW01:AFK:TGW004:AFVK:v1:appearance",
                dpdKey:
                  "CK:CT001:FNGK:AF:FNK:CDF-DPD:CATK:TGW01:AFGK:TGW004:AFK:tgw4_dpd:AFVK:v1",
                isModal: false,
                width: "100%",
                height: "100%",
                nodedata: resolvedNodedata,
              },
              {
                headers: {
                  Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpiWVBDelF0dy1jQmFUc1VDQWczdTJVWldjYyJ9.eyJhdWQiOiJmYzI2YjIzZC1mNjVkLTQwM2UtYWI5Zi0wZDViNThjYmM1ZjUiLCJleHAiOjE3ODkzOTA2MzMsImlhdCI6MTc4OTM4NzAzMywiaXNzIjoiaHR0cDovLzE5Mi4xNjguMi4xNzg6OTAxMSIsInN1YiI6IjkzNWM5ZWU2LWNiMjQtNDZlNC1hYTM1LTk4MDNlZjAxZmYzOCIsImp0aSI6ImUzMjIwMzIzLTVlZGMtNDUzZi04Nzc2LTcxOGI0OTFkNjI0NiIsImF1dGhlbnRpY2F0aW9uVHlwZSI6IlJFRlJFU0hfVE9LRU4iLCJ0dHkiOiJhdCIsInJvbGVzIjpbIlVJIl0sImF1dGhfdGltZSI6MTc4OTM2MjA4Niwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyIsImFwcGxpY2F0aW9uSWQiOiJmYzI2YjIzZC1mNjVkLTQwM2UtYWI5Zi0wZDViNThjYmM1ZjUiLCJ0aWQiOiIyNWU0NTA4YS0wMTJjLTQ0NTEtOGQxNi1mODc1N2MyMTk4NzMiLCJzaWQiOiIwN2Q5YjdkNC1iNDRkLTQ1YTEtYjY2NC0wNzA0ZWYyMjgzN2UiLCJsb2dpbklkIjoiaGFyaSIsInR5cGUiOiJjIiwiY2xpZW50IjoiQ1QwMDEiLCJndHkiOlsicGFzc3dvcmQiLCJyZWZyZXNoX3Rva2VuIl19.lS_Va4xJdlwyATiPLaNwjlFseVcK_T2li1eFWEn1HBA1hdPyTufaNM-MR9l1MNKB0oBr5_fnJhwWpD8oROmkuBjHzSoeUpndD6qqQnU5RFqCvLW7eNL9EI8cQzc1O4XbNJYKnYM0NEou1T36lQIiTv_dqDmjtji4T6uIy33VVeDOYuZWOiaro3FD6Ic5UpGGZ7N4WpI1MxKpSUZAJFXRREd98d-fDzTAsOomFcOJi98YvbOSExnuBi28yRdkiHUrCdllNmJ2C4PLMAW7B84ehuyAGMj9GfS2SyktIYY-4jBsXK2kU2-fA1OLwr-D_P7kZaMxw6F_RQM3yyCOX4_acg`,
                },
              },
            );
            responseData = response.data;
          } catch (cause) {
            // axios throws for both network failure and a non-2xx response;
            // isAxiosError + .response tells them apart so the message names
            // what actually happened instead of always blaming reachability.
            if (axios.isAxiosError(cause) && cause.response) {
              throw new Error(
                `uf_preview: code-gen service at ${config.codeGenUrl} responded ` +
                  `${String(cause.response.status)} ${cause.response.statusText}`,
              );
            }
            const message =
              cause instanceof Error ? cause.message : String(cause);
            throw new Error(
              `uf_preview: could not reach the code-gen service at ${config.codeGenUrl}: ${message}`,
            );
          }
        } finally {
          clearTimeout(timer);
          exec.signal.removeEventListener("abort", onAbort);
        }

        // axios already JSON-decodes a JSON response body, so a bare-string
        // body arrives here as a string with no further unwrapping needed;
        // extractCode's JSON.parse-unwrap only matters for a double-encoded
        // string. Anything else (e.g. an object) is stringified defensively.
        const code =
          typeof responseData === "string"
            ? extractCode(responseData)
            : JSON.stringify(responseData);

        if (!config.autoStart) {
          return { code };
        }

        // await waitForAppReady(previewAppUrl, config.startTimeoutMs, exec.signal);
        const tempuuid: string = uuid();
        const pushResponse = await fetch(`${previewAppUrl}/next-api/preview/${tempuuid}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code,uuid:tempuuid }),
          signal: exec.signal,
        });
        if (!pushResponse.ok) {
          throw new Error(
            `uf_preview: generated code but failed to push it to the preview app ` +
              `(${String(pushResponse.status)} ${pushResponse.statusText})`,
          );
        }

        return { code, previewUrl: `${previewAppUrl}/UF/${tempuuid}` };
      },
    }),
  );
}

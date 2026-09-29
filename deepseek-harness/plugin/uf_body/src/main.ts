import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Context } from "@deepseek-ai/cordis";
import Schema from "@deepseek-ai/schemastery";
import { defineTool } from "@deepseek-ai/dsh-tools";
import type { GenerateJsonRequest, InputNode } from "./types.ts";
import { validateRequest } from "./validate-input.ts";
import { computeLayout } from "./layout/auto-layout.ts";
import { walkTree } from "./builders/walk-tree.ts";
import { buildNdp } from "./builders/ndp.builder.ts";
import { buildNds } from "./builders/nds.builder.ts";
import { buildNdu } from "./builders/ndu.builder.ts";
import { buildUfs } from "./builders/ufs.builder.ts";
import { buildUo } from "./builders/uo.builder.ts";

export const name = "uf_body";
export const inject = ["tools"];

export interface Config {
  /** Tenant/environment codes for UO's "afk" key. Environment-specific: override per deployment. */
  afkClientCode: string;
  afkCategoryCode: string;
  afkGroupCode: string;
  /** Directory each generated result is written to as its own JSON file. */
  tempDir: string;
}

export const Config: Schema<Config> = Schema.object({
  afkClientCode: Schema.string().default("CT001"),
  afkCategoryCode: Schema.string().default("TGW01"),
  afkGroupCode: Schema.string().default("TGW004"),
  tempDir: Schema.string().default("D:/deepseek/deepseek-harness/plugin/_tempFiles_"),
});

export interface GenerateJsonResult {
  NDP: unknown;
  NDS: unknown;
  NDU: unknown;
  UFS: unknown;
  UO: unknown;
}

/**
 * The A0 (`uf_skeleton`) plugin generates the node-tree skeleton; this
 * derives the five downstream artifacts (NDP/NDS/NDU/UFS/UO) from it -- the
 * "body". Pure/deterministic tree transformation, no local model involved.
 */
function generate(body: unknown, afk: Config): GenerateJsonResult {
  const root: InputNode = validateRequest(body);

  const layout = computeLayout(root);
  const walked = walkTree(root, layout);
  const walkedForUfs = walkTree(root, layout, { sortChildrenByGrid: true });

  const artifactName = resolveArtifactName(
    root,
    body as GenerateJsonRequest & { artifactName?: string },
  );

  return {
    NDP: buildNdp(walked),
    NDS: buildNds(walked),
    NDU: buildNdu(walked, layout),
    UFS: buildUfs(walkedForUfs),
    UO: buildUo(root, { artifactName, ...afk }),
  };
}

function resolveArtifactName(
  root: InputNode,
  request: GenerateJsonRequest & { artifactName?: string },
): string {
  if (request.artifactName && typeof request.artifactName === "string") {
    return request.artifactName;
  }
  const firstTopLevel = root.children?.[0];
  return firstTopLevel?.nodeName || "screen";
}

export function apply(ctx: Context, config: Config) {
  ctx.effect(() => {
    const timer = setInterval(() => {
      console.log("[uf_body_generate] heartbeat");
    }, 5000);

    // Runs automatically when the plugin unloads.
    return () => clearInterval(timer);
  });
  ctx.tools.register(
    defineTool({
      name: "uf_body_generate",
      description:
        "Derive the NDP/NDS/NDU/UFS/UO artifact bundle from a UI node-tree skeleton " +
        "(e.g. the output of uf_skeleton_generate). Pure structural transformation -- " +
        "no model call, deterministic layout and template expansion.",
      parameters: {
        nodeTree: {
          type: "json",
          required: true,
          description:
            "Array containing exactly one root node: " +
            '{ "nodeId": "root", "nodeType": "Canvas", ... }, matching uf_skeleton_generate\'s output shape.',
        },
        artifactName: {
          type: "string",
          description:
            "Optional artifact/screen name. Defaults to the first top-level node's nodeName.",
        },
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            NDP: { type: "json", required: true },
            NDS: { type: "json", required: true },
            NDU: { type: "json", required: true },
            UFS: { type: "json", required: true },
            UO: { type: "json", required: true },
            filePath: { type: "string", required: true },
          },
        },
        render: (_args, value) => [
          {
            type: "text",
            text: `Written to ${value.filePath}\n\n` + JSON.stringify(value, null, 2),
          },
        ],
      },
      async execute(args) {
        let ddd: any = [];
        if (typeof args.nodeTree == "string") {
          ddd = JSON.parse(args.nodeTree);
        } else {
          ddd = args.nodeTree;
        }
        const body: GenerateJsonRequest & { artifactName?: string } = {
          nodeTree: ddd,
          artifactName: args.artifactName,
        };
        const response = generate(body, config);

        // Each call gets its own file (not one shared/overwritten path) so
        // multiple screens generated in a row don't clobber each other, and
        // a caller such as uf_preview_generate can be handed just this path
        // instead of re-emitting the whole (often large) JSON blob as an argument.
        mkdirSync(config.tempDir, { recursive: true });
        const filePath = join(config.tempDir, `UIJSON.json`);
       
        writeFileSync(filePath, JSON.stringify(response, null, 2));

        return { ...response, filePath };
      },
    }),
  );
}

// ============ TYPE DEFINITIONS ============

interface Position {
  x: number;
  y: number;
}

interface InputNode {
  type: "inputNode";
  id: string;
  name: string;
  position: Position;
}

interface OutputNode {
  type: "outputNode";
  id: string;
  name: string;
  position: Position;
}

interface InputDefinition {
  id: string;
  name: string;
  field: string;
}

interface OutputDefinition {
  id: string;
  name: string;
  field: string;
  defaultValue?: string;
}

interface Rule {
  _id: string;
  [key: string]: string;
}

interface DecisionTableContent {
  hitPolicy: "first" | "collect" | "any" | "priority";
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  rules: Rule[];
}

interface DecisionTableNode {
  type: "decisionTableNode";
  id: string;
  name: string;
  position: Position;
  content: DecisionTableContent;
}

type RuleNode = InputNode | OutputNode | DecisionTableNode;

type InputData = Record<string, unknown>;
type OutputValue = string | string[];
type OutputResult = Record<string, OutputValue>;
type VariableContext = Record<string, string>;

// ============ DECISION TABLE EVALUATOR ============

class DecisionTableEvaluator {
  private decisionTableNode: DecisionTableNode | undefined;
  private variableContext: VariableContext;

  constructor(
    private ruleConfig: RuleNode[],
    variableContext: VariableContext = {}
  ) {
    // Ensure ruleConfig is an array
    if (!Array.isArray(this.ruleConfig)) {
      throw new Error(
        `Invalid ruleConfig: expected an array but received ${typeof this.ruleConfig}`
      );
    }
    this.decisionTableNode = this.findDecisionTableNode();
    this.variableContext = variableContext;
  }

  private findDecisionTableNode(): DecisionTableNode | undefined {
    return this.ruleConfig.find(
      (node): node is DecisionTableNode => node.type === "decisionTableNode"
    );
  }

  /**
   * Parse rule value - handles:
   * - JSON-stringified arrays: "[\"A\",\"B\"]" -> ["A", "B"]
   * - Single quoted strings: "\"Value\"" -> "Value"
   * - Comma-separated quoted strings: "\"A\",\"B\"" -> ["A", "B"]
   * - Bracket notation arrays: "[45,23423]" -> ["45", "23423"]
   * - Variable placeholders: "$UID" -> resolved value
   */
  private parseRuleValue(
    value: string | undefined | null
  ): string | string[] | undefined | null {
    if (typeof value !== "string" || value === "") {
      return value;
    }

    // First, try to parse as JSON if it looks like a JSON array or object
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // Apply variable resolution to each item
          return parsed.map(item => this.resolveVariable(String(item)));
        }
      } catch (e) {
        // If JSON parsing fails, fall through to manual parsing below
      }
    }

    // Check if it's a bracket notation array like [45,23423] or ["value1","value2"]
    // This handles cases where JSON.parse failed
    if (value.startsWith('[') && value.endsWith(']')) {
      const innerContent = value.slice(1, -1).trim();
      if (innerContent === "") {
        return [];
      }

      // Split by comma and process each item
      const items = innerContent.split(',').map(item => {
        const trimmed = item.trim();
        // Remove quotes if present
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          return this.resolveVariable(trimmed.slice(1, -1));
        }
        return this.resolveVariable(trimmed);
      });

      return items;
    }

    // Check if it's a comma-separated list of quoted values
    const multiValuePattern = /^"[^"]*"(?:,"[^"]*")+$/;
    if (multiValuePattern.test(value)) {
      // Extract all quoted values
      const matches = value.match(/"([^"]*)"/g);
      if (matches) {
        return matches.map((m) => this.resolveVariable(m.slice(1, -1)));
      }
    }

    // Single quoted value
    if (value.startsWith('"') && value.endsWith('"')) {
      return this.resolveVariable(value.slice(1, -1));
    }

    return this.resolveVariable(value);
  }

  /**
   * Detect a leading conditional operator in a rule cell.
   * Returns { operator, operand } or null if the cell is a plain value.
   * NOTE: two-char operators are checked before single-char ones so that
   * ">=" is not mistaken for ">".
   */
  private parseOperator(
    ruleValue: string
  ): { operator: string; operand: string } | null {
    const trimmed = ruleValue.trim();
    const operators = ["!=", ">=", "<=", "==", ">", "<"]; // order matters
    for (const op of operators) {
      if (trimmed.startsWith(op)) {
        return { operator: op, operand: trimmed.slice(op.length).trim() };
      }
    }
    return null;
  }

  /**
   * Evaluate a conditional operator against the data value.
   * Numeric comparison is used for > >= < <= when both sides parse as numbers,
   * otherwise it falls back to string comparison.
   * The operand supports surrounding single/double quotes and $variable
   * resolution, matching the rest of the parser.
   */
  private evaluateOperator(
    operator: string,
    dataValue: unknown,
    operand: string
  ): boolean {
    // Strip surrounding quotes ('..' or "..") then resolve $variables
    let rhs = operand.trim();
    if (
      (rhs.startsWith("'") && rhs.endsWith("'")) ||
      (rhs.startsWith('"') && rhs.endsWith('"'))
    ) {
      rhs = rhs.slice(1, -1);
    }
    rhs = this.resolveVariable(rhs);

    const lhs =
      dataValue === undefined || dataValue === null ? "" : String(dataValue);

    switch (operator) {
      case "==":
        return lhs === rhs;
      case "!=":
        return lhs !== rhs;
      case ">":
      case ">=":
      case "<":
      case "<=": {
        const ln = Number(lhs);
        const rn = Number(rhs);
        const numeric = lhs !== "" && rhs !== "" && !isNaN(ln) && !isNaN(rn);
        const a: number | string = numeric ? ln : lhs;
        const b: number | string = numeric ? rn : rhs;
        if (operator === ">") return a > b;
        if (operator === ">=") return a >= b;
        if (operator === "<") return a < b;
        return a <= b; // "<="
      }
      default:
        return false;
    }
  }

  /**
   * Resolve variable placeholders like $UID and nested patterns like $($usercode)
   */
  private resolveVariable(value: string): string {
    let result = value;

    // First pass: Handle nested variables like $($usercode)
    const nestedPattern = /\$\(\$(\w+)\)/g;
    result = result.replace(nestedPattern, (match, innerVarName) => {
      // First resolve the inner variable (e.g., usercode -> "27")
      const innerValue = this.variableContext[innerVarName];

      if (innerValue !== undefined) {
        // Then use that value as a key to resolve again (e.g., "27" -> value at key "27")
        const finalValue = this.variableContext[innerValue];
        return finalValue ?? match; // Return match if not found
      }

      return match; // Return match if inner variable not found
    });

    // Second pass: Handle simple variables like $usercode
    const simplePattern = /\$(\w+)/g;
    result = result.replace(simplePattern, (match, varName) => {
      const resolvedValue = this.variableContext[varName];
      return resolvedValue ?? match;
    });

    return result;
  }

  /**
   * Check if a rule should be skipped (has all empty output values)
   * Checks all fields except _id and input fields
   */
  private shouldSkipRule(
    rule: Rule,
    inputDefs: InputDefinition[],
    outputDefs: OutputDefinition[]
  ): boolean {
    // Get all input IDs to exclude them from the check
    const inputIds = new Set(inputDefs.map((input) => input.id));

    // Get all output IDs
    const outputIds = outputDefs.map((output) => output.id);

    // Check if ALL output field values in the rule are empty
    const allOutputsEmpty = outputIds.every((outputId) => {
      const value = rule[outputId];
      return value === undefined || value === "" || value === null;
    });

    return allOutputsEmpty;
  }

  /**
   * Resolve a dot-notation path like "usertable.name" against an object.
   * Falls back to treating the whole field as a flat key if path traversal yields undefined.
   */
  private getValueByPath(obj: Record<string, unknown>, path: string): unknown {
    if (!path.includes(".")) return obj[path];
    const parts = path.split(".");
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== "object") return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }

  /**
   * Deep equality check for plain objects/arrays/primitives
   */
  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) =>
      this.deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    );
  }

  /**
   * Check if a single rule matches the input data
   */
  private doesRuleMatch(
    rule: Rule,
    data: InputData,
    inputDefs: InputDefinition[]
  ): boolean {
    for (const input of inputDefs) {
      const ruleValue = rule[input.id];

      // Resolve input field if it starts with $
      let dataValue: unknown;
      if (input.field.startsWith('$')) {
        // Extract variable name (remove $)
        const varName = input.field.substring(1);
        dataValue = this.variableContext[varName];
      } else {
        dataValue = this.getValueByPath(data as Record<string, unknown>, input.field);
        // Fall back to variableContext if field not found in inputData
        if (dataValue === undefined) {
          dataValue = this.getValueByPath(this.variableContext, input.field);
        }
      }

      // Empty rule value = wildcard (matches anything)
      if (ruleValue === undefined || ruleValue === "" || ruleValue === null) {
        continue;
      }

      // --- Conditional operators (!=, ==, >=, <=, >, <) ---
      // These only apply to input cells. If the cell starts with one of the
      // supported operators, evaluate it and short-circuit for this input.
      if (typeof ruleValue === "string") {
        const opExpr = this.parseOperator(ruleValue);
        if (opExpr) {
          if (!this.evaluateOperator(opExpr.operator, dataValue, opExpr.operand)) {
            return false;
          }
          continue; // operator handled this input, move to next
        }
      }
      // --- END conditional operators ---

      // Handle JSON object condition: deep-compare rule object against data value
      if (typeof ruleValue === "string" && ruleValue.trim().startsWith("{")) {
        try {
          const parsedRuleObj = JSON.parse(ruleValue);
          if (typeof parsedRuleObj === "object" && !Array.isArray(parsedRuleObj)) {
            if (!this.deepEqual(parsedRuleObj, dataValue)) {
              return false;
            }
            continue;
          }
        } catch {
          // Not valid JSON object — fall through to standard comparison
        }
      }

      const parsedRuleValue = this.parseRuleValue(ruleValue);

      // Handle array comparison (IN operator: check if data value is in rule array)
      if (Array.isArray(parsedRuleValue)) {
        // Convert dataValue to string for comparison
        const dataValueStr = String(dataValue);
        // Check if data value exists in the rule's array
        if (!parsedRuleValue.includes(dataValueStr)) {
          return false; // Data value not in array, rule doesn't match
        }
        // Data value found in array, continue to next input
      } else {
        // EQUALS operator: check if data value equals rule string
        if (parsedRuleValue !== String(dataValue)) {
          return false; // Values don't match, rule doesn't match
        }
        // Values match, continue to next input
      }
    }
    return true;
  }

  /**
   * Build output result from a matched rule
   * ONLY returns non-empty values from the rule, does NOT use default values
   */
  private buildResult(
    matchedRule: Rule | null,
    outputDefs: OutputDefinition[]
  ): OutputResult {
    const result: OutputResult = {};

    for (const output of outputDefs) {
      let rawValue: string | undefined = matchedRule?.[output.id];

      // Skip if the rule value is empty - DO NOT use default values
      if (rawValue === undefined || rawValue === "" || rawValue === null) {
        continue;
      }

      // Parse and add to result only if non-empty
      const parsedValue = this.parseRuleValue(rawValue);
      if (
        parsedValue !== undefined &&
        parsedValue !== null &&
        parsedValue !== ""
      ) {
        result[output.field] = parsedValue;
      }
    }

    return result;
  }

  /**
   * Evaluate the decision table against input data
   */
  public evaluate(inputData: InputData): OutputResult | OutputResult[] {
    if (!this.decisionTableNode) {
      throw new Error("No decision table node found in rule configuration");
    }

    const { hitPolicy, inputs, outputs, rules } =
      this.decisionTableNode.content;

    switch (hitPolicy) {
      case "first":
        for (const rule of rules) {
          // Skip rules with all empty outputs
          if (this.shouldSkipRule(rule, inputs, outputs)) {
            continue;
          }

          if (this.doesRuleMatch(rule, inputData, inputs)) {
            return this.buildResult(rule, outputs);
          }
        }
        return this.buildResult(null, outputs);

      case "collect":
        const results: OutputResult[] = [];
        for (const rule of rules) {
          // Skip rules with all empty outputs
          if (this.shouldSkipRule(rule, inputs, outputs)) {
            continue;
          }

          if (this.doesRuleMatch(rule, inputData, inputs)) {
            results.push(this.buildResult(rule, outputs));
          }
        }
        return results.length > 0 ? results : [this.buildResult(null, outputs)];

      case "any":
        for (const rule of rules) {
          // Skip rules with all empty outputs
          if (this.shouldSkipRule(rule, inputs, outputs)) {
            continue;
          }

          if (this.doesRuleMatch(rule, inputData, inputs)) {
            return this.buildResult(rule, outputs);
          }
        }
        return this.buildResult(null, outputs);

      default:
        throw new Error(`Unsupported hit policy: ${hitPolicy}`);
    }
  }

  /**
   * Update variable context
   */
  public setVariableContext(context: VariableContext): void {
    this.variableContext = { ...this.variableContext, ...context };
  }

  /**
   * Evaluate the decision table and return boolean
   * Returns true if any rule matches the input data, false otherwise
   */
  public evaluateBoolean(inputData: InputData): boolean {
    if (!this.decisionTableNode) {
      throw new Error("No decision table node found in rule configuration");
    }

    const { inputs, outputs, rules } = this.decisionTableNode.content;

    // Check if any rule matches (skip rules with all empty outputs)
    for (const rule of rules) {
      // Skip rules with all empty outputs
      if (this.shouldSkipRule(rule, inputs, outputs)) {
        continue;
      }

      // Check if this rule matches the input data
      if (this.doesRuleMatch(rule, inputData, inputs)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Evaluate the decision table and return the actual boolean output value
   * Returns the boolean value from the matched rule's output field
   * Returns false if no rule matches
   */
  public evaluateBooleanResult(inputData: InputData): boolean {
    if (!this.decisionTableNode) {
      throw new Error("No decision table node found in rule configuration");
    }

    const { inputs, outputs, rules } = this.decisionTableNode.content;

    for (const rule of rules) {
      // Skip rules with all empty outputs
      if (this.shouldSkipRule(rule, inputs, outputs)) {
        continue;
      }

      // Check if this rule matches the input data
      if (this.doesRuleMatch(rule, inputData, inputs)) {
        // Build the result from matched rule
        const result:any = this.buildResult(rule, outputs);

        // Get the first output value and convert to boolean
        const outputKeys = Object.keys(result);
        if (outputKeys.length > 0) {
          const outputValue = result[outputKeys[0]];
          // Handle string "true"/"false"
          if (typeof outputValue === "string") {
            if('Show' in result)
            {
              return result.Show==true || result.Show=='true'?true : false
            }
            return outputValue.toLowerCase() === "true";
          }
          // Handle array - return true if non-empty
          if (Array.isArray(outputValue)) {
            return outputValue.length > 0;
          }
          return Boolean(outputValue);
        }
        // No output value defined, default to true (rule matched)
        return true;
      }
    }

    // No rule matched
    return false;
  }
}

// ============ STANDALONE FUNCTIONS ============

export function eventDecisionTable(
inputData: any,
  variableContext: VariableContext = {}
): boolean {
  if(inputData?.conditionalKey && inputData?.conditionalValue)
  {
    const actualValue = variableContext[inputData?.conditionalKey];
    const conditionalValue = inputData?.conditionalValue;

    // Support array or comma-separated values
    let valuesToCheck: string[];
    if (Array.isArray(conditionalValue)) {
      valuesToCheck = conditionalValue;
    } else if (typeof conditionalValue === 'string' && conditionalValue.includes(',')) {
      valuesToCheck = conditionalValue.split(',').map((v: string) => v.trim());
    } else {
      valuesToCheck = [conditionalValue];
    }

    // Check if actual value matches any of the conditional values
    if (valuesToCheck.includes(actualValue))
      return false
  }else if(!inputData?.conditionalKey && !inputData?.conditionalValue)
  {
    return false
  }
  return true
}

function deepMerge(target:any, source:any) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object"
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// =======getAftfactLevelRule========
export async function getAftfactLevelRule(rule: any, sessionData: any = {},mergeObj:any={}) {
  // Support combined format: { rule: { nodes, edges, ... }, sessionData: { ... } }
  let actualRule = rule;
  let actualSessionData = sessionData;
  if (rule && typeof rule === "object" && rule.rule && rule.sessionData) {
    actualRule = rule.rule;
    actualSessionData = rule.sessionData;
  }
  if (!actualRule?.nodes) return {};
  // Force collect hit policy to get all matching rules
  const collectRuleConfig: RuleNode[] = actualRule.nodes.map((node: RuleNode) => {
    if (node.type === "decisionTableNode") {
      return {
        ...node,
        content: { ...(node as DecisionTableNode).content, hitPolicy: "collect" as const },
      };
    }
    return node;
  });

  // Collect all [groupName, controlName] pairs referenced in any rule row
  // (regardless of whether the condition matches) to determine itsHaveArtifact
  const artifactControlSet = new Set<string>();
  for (const node of actualRule.nodes) {
    if (node.type === "decisionTableNode") {
      const { outputs, rules: tableRules } = (node as DecisionTableNode).content;
      const groupNameOutput = outputs.find((o: OutputDefinition) => o.field === "groupName");
      const controlNameOutput = outputs.find((o: OutputDefinition) => o.field === "controlName");
      if (groupNameOutput && controlNameOutput) {
        for (const tableRule of tableRules) {
          const rawGroup = tableRule[groupNameOutput.id];
          const rawControl = tableRule[controlNameOutput.id];
          if (rawGroup && rawControl) {
            // Strip surrounding quotes (values are stored as `"value"`)
            const group = rawGroup.replace(/^"|"$/g, "");
            const control = rawControl.replace(/^"|"$/g, "");
            if (group && control) {
              artifactControlSet.add(`${group}::${control}`);
            }
          }
        }
      }
    }
  }

  const evaluator = new DecisionTableEvaluator(collectRuleConfig, actualSessionData);
  const result = evaluator.evaluate(actualSessionData);
  const allResults = Array.isArray(result) ? result : [result];
  // Build nested: { [groupName]: { [controlName]: { show, order? } } }
  const output: Record<string, Record<string, { show: boolean; order?: number }>> = {};

  for (const r of allResults) {
    if (Object.keys(r).length === 0) continue;

    const groupName = r["groupName"] as string;
    const controlName = r["controlName"] as string;
    const showRaw = r["show"] as string;
    const orderRaw = r["order"] as string | undefined;

    if (!groupName || !controlName) continue;

    const show = String(showRaw).toLowerCase() === "true";
    const orderNum = Number(orderRaw);
    const entry: { show: boolean; order: number; from:string } = { show, order: isNaN(orderNum) ? 0 : orderNum,from:"artifactrule" };

    if (!output[groupName]) output[groupName] = {};
    output[groupName][controlName] = entry;
  }

  const merged = deepMerge(mergeObj, output);

  // Annotate every control with itsHaveArtifact:
  // true if the control is referenced in any rule row definition, false otherwise
  for (const groupName of Object.keys(merged)) {
    const group = merged[groupName];
    if (group && typeof group === "object") {
      for (const controlName of Object.keys(group)) {
        group[controlName].itsHaveArtifact =
          artifactControlSet.has(`${groupName}::${controlName}`);
      }
    }
  }

  return merged;
}

// ============ group dynamic actions ============
export function evaluateDecisionForDynamicActions(
  ruleConfig: RuleNode[],
  inputData: InputData
): Record<string, unknown>[] {
  if (!ruleConfig || ruleConfig.length === 0) {
    return [];
  }

  // Force collect hit policy to get all matching rules
  const collectRuleConfig = ruleConfig.map((node) => {
    if (node.type === "decisionTableNode") {
      return { ...node, content: { ...node.content, hitPolicy: "collect" as const } };
    }
    return node;
  });

  const evaluator = new DecisionTableEvaluator(
    collectRuleConfig,
    inputData as VariableContext
  );

  const result = evaluator.evaluate(inputData);
  const allResults = Array.isArray(result) ? result : [result];
  // Parse any JSON-string output values and filter out empty results
  return allResults
    .filter((r) => Object.keys(r).length > 0)
    .map((singleResult) => {
      const parsedResult: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(singleResult)) {
        if (typeof value === "string") {
          try {
            parsedResult[key] = JSON.parse(value);
          } catch {
            parsedResult[key] = value;
          }
        } else {
          parsedResult[key] = value;
        }
      }
      return parsedResult;
    });
}

export default function evaluateDecisionTable(
  ruleConfig: RuleNode[],
  inputData: InputData,
  variableContext: VariableContext = {}
): OutputResult | OutputResult[] {
  const evaluator = new DecisionTableEvaluator(ruleConfig, variableContext);

  return evaluator.evaluate(inputData);
}

/**
 * Evaluate decision table and return boolean result
 * Returns true if any rule matches the input data, false otherwise
 */
export function evaluateDecisionTableBoolean(
  ruleConfig: RuleNode[],
  inputData: InputData,
  variableContext: VariableContext = {}
): boolean {
  if(ruleConfig?.length==0){
    return true
  }
  const evaluator = new DecisionTableEvaluator(ruleConfig, variableContext);
  return evaluator.evaluateBooleanResult(inputData);
}

/**
 * Evaluate decision table and return the actual boolean output value from matched rule
 * Returns the boolean value defined in the rule's output field
 * Returns true if ruleConfig is empty
 * Returns false if no rule matches
 */
export function evaluateDecisionTableBooleanResult(
  ruleConfig: RuleNode[],
  inputData: InputData,
  variableContext: VariableContext = {}
): boolean {
  
  if (ruleConfig?.length === 0) {
    return true;
  }
  const evaluator = new DecisionTableEvaluator(ruleConfig, variableContext);
  const result = evaluator.evaluateBooleanResult(inputData);
  return result;
}
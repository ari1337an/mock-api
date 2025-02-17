/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from "@faker-js/faker";

type FakerTemplate = Record<string, unknown>;

function parseValue(value: string): unknown {
  try {
    // Handle object literals that are stringified
    if (value.trim().startsWith("{") && value.trim().endsWith("}")) {
      const objectStr = value.trim();
      // Parse the object literal while preserving date strings
      const parsed = Function(`return ${objectStr}`)();

      // Convert any ISO date strings in objects
      if (typeof parsed === "object" && parsed !== null) {
        Object.keys(parsed).forEach((key) => {
          if (
            typeof parsed[key] === "string" &&
            parsed[key].includes("T00:00:00.000Z")
          ) {
            parsed[key] = new Date(parsed[key]);
          }
        });
      }

      return parsed;
    }

    // Handle ISO date strings in objects
    if (typeof value === "string" && value.includes("T00:00:00.000Z")) {
      return new Date(value);
    }

    // Try parsing as JSON
    const parsed = JSON.parse(value);

    // Convert any ISO date strings in objects
    if (typeof parsed === "object" && parsed !== null) {
      Object.keys(parsed).forEach((key) => {
        if (
          typeof parsed[key] === "string" &&
          parsed[key].includes("T00:00:00.000Z")
        ) {
          parsed[key] = new Date(parsed[key]);
        }
      });
    }

    return parsed;
  } catch {
    // If not valid JSON, return as string
    return value;
  }
}

function parseMethodCall(methodString: string): {
  path: string[];
  args: unknown[];
} {
  const match = methodString.match(/^([^(]+)(?:\((.*)\))?$/);
  if (!match) return { path: [methodString], args: [] };

  const [, pathString, argsString] = match;
  if (!argsString) return { path: pathString.split("."), args: [] };

  const args: unknown[] = [];
  let currentArg = "";
  let depth = 0;
  let inQuote = false;

  // Parse arguments character by character
  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];

    // Handle quotes
    if (char === '"' && argsString[i - 1] !== "\\") {
      inQuote = !inQuote;
    }

    // Track object/array depth
    if (!inQuote) {
      if (char === "{" || char === "[") depth++;
      if (char === "}" || char === "]") depth--;
    }

    // Handle argument separation
    if (char === "," && depth === 0 && !inQuote) {
      args.push(parseValue(currentArg.trim()));
      currentArg = "";
      continue;
    }

    currentArg += char;
  }

  if (currentArg.trim()) {
    args.push(parseValue(currentArg.trim()));
  }

  return { path: pathString.split("."), args };
}

export function processFakerTemplate(template: FakerTemplate): FakerTemplate {
  const result: FakerTemplate = {};

  for (const [key, value] of Object.entries(template)) {
    // Skip processing the "id" field as it's handled by generateData
    if (key === "id") {
      continue;
    }

    if (typeof value === "string" && value.startsWith("$")) {
      try {
        const methodString = value.substring(1);
        const { path, args } = parseMethodCall(methodString);

        // Traverse the faker object to get the desired method
        let fakerModule: any = faker;
        for (let i = 0; i < path.length - 1; i++) {
          fakerModule = fakerModule[path[i]];
          if (!fakerModule) {
            throw new Error(
              `Invalid faker path: ${path.slice(0, i + 1).join(".")}`
            );
          }
        }

        const methodName = path[path.length - 1];
        const method = fakerModule[methodName];

        if (typeof method !== "function") {
          throw new Error(`Invalid faker method: ${path.join(".")}`);
        }

        // Call the method with arguments
        result[key] = args.length ? method(...args) : method();
      } catch (error) {
        console.warn(`Failed to process faker path: ${value}`, error);
        result[key] = value;
      }
    } else if (typeof value === "object" && value !== null) {
      // Handle nested objects
      result[key] = processFakerTemplate(value as FakerTemplate);
    } else {
      result[key] = value;
    }
  }

  return result;
}

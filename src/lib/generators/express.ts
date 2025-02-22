import { toPascalCase } from "@/utils/string";

export function generateExpressCode(
  projectName: string,
  resourceName: string,
  version: string,
  template: Record<string, unknown>
): string {
  return `
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage
const ${resourceName}DB = new Map();

// Validation middleware
const validate${toPascalCase(resourceName)} = (req, res, next) => {
  const data = req.body;
  ${generateValidation(template)}
  next();
};

// CRUD Routes
router.post('/${version}/${resourceName}', validate${toPascalCase(resourceName)}, (req, res) => {
  const id = uuidv4();
  const new${toPascalCase(resourceName)} = { id, ...req.body };
  ${resourceName}DB.set(id, new${toPascalCase(resourceName)});
  res.status(201).json(new${toPascalCase(resourceName)});
});

router.get('/${version}/${resourceName}', (req, res) => {
  res.json(Array.from(${resourceName}DB.values()));
});

router.get('/${version}/${resourceName}/:id', (req, res) => {
  const item = ${resourceName}DB.get(req.params.id);
  if (!item) {
    return res.status(404).json({ message: '${resourceName} not found' });
  }
  res.json(item);
});

router.put('/${version}/${resourceName}/:id', validate${toPascalCase(resourceName)}, (req, res) => {
  if (!${resourceName}DB.has(req.params.id)) {
    return res.status(404).json({ message: '${resourceName} not found' });
  }
  const updated${toPascalCase(resourceName)} = { id: req.params.id, ...req.body };
  ${resourceName}DB.set(req.params.id, updated${toPascalCase(resourceName)});
  res.json(updated${toPascalCase(resourceName)});
});

router.delete('/${version}/${resourceName}/:id', (req, res) => {
  if (!${resourceName}DB.has(req.params.id)) {
    return res.status(404).json({ message: '${resourceName} not found' });
  }
  ${resourceName}DB.delete(req.params.id);
  res.status(204).send();
});

module.exports = router;
`;
}

function generateValidation(template: Record<string, unknown>): string {
  const checks = Object.entries(template).map(([key, value]) => {
    if (typeof value === 'string' && value.startsWith('$')) {
      return `  if (!data.${key}) return res.status(400).json({ message: '${key} is required' });`;
    }
    return '';
  }).filter(Boolean);

  return checks.join('\n');
} 
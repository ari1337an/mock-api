import { FAKER_MODULES, FIELD_TYPES } from "@/constants/fakerModules";
import type { TemplateField } from "@/types/template";
import { motion } from "framer-motion";
import { Tooltip } from "@/components/common/Tooltip";

interface FieldBuilderProps {
  fields: TemplateField[];
  onUpdate: (field: TemplateField, updates: Partial<TemplateField>) => void;
  onRemove: (field: TemplateField) => void;
  onAddNestedField: (parentField: TemplateField) => void;
  depth?: number;
}

export function FieldBuilder({ 
  fields,
  onUpdate,
  onRemove,
  onAddNestedField,
  depth = 0 
}: FieldBuilderProps) {
  const handleTypeChange = (field: TemplateField, type: "simple" | "object" | "array") => {
    const updates: Partial<TemplateField> = { type };
    if (type === "object") {
      updates.fields = [];
      updates.module = undefined;
      updates.method = undefined;
    } else if (type === "array") {
      updates.arrayType = "simple";
      updates.count = 3;
      updates.items = { key: "", type: "simple" };
      updates.module = undefined;
      updates.method = undefined;
    }
    onUpdate(field, updates);
  };

  const getMethodOptions = (moduleKey: string | undefined) => {
    if (!moduleKey) return [];
    const fakerModule = FAKER_MODULES[moduleKey as keyof typeof FAKER_MODULES];
    if (!fakerModule || !fakerModule.methods) return [];
    return Object.entries(fakerModule.methods);
  };

  const FieldTypeIcon = ({ type }: { type: string }) => {
    const icons = {
      simple: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      object: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      array: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    };

    return (
      <div className="text-gray-400">
        {icons[type as keyof typeof icons]}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`space-y-4 ${depth > 0 ? 'ml-8 pl-4 border-l border-gray-800' : ''}`}
        >
          <motion.div
            className="flex gap-4 items-start bg-gray-900/30 p-4 rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-300"
          >
            <div className="p-2 bg-gray-800 rounded-lg">
              <FieldTypeIcon type={field.type} />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => onUpdate(field, { key: e.target.value })}
                  placeholder="Field name"
                  className="w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 p-2"
                />
              </div>

              <div className="flex-1">
                <select
                  value={field.type}
                  onChange={(e) => handleTypeChange(field, e.target.value as "simple" | "object" | "array")}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 p-2"
                >
                  {FIELD_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {field.type === "simple" && (
                <>
                  <div className="flex-1">
                    <select
                      value={field.module || ""}
                      onChange={(e) => onUpdate(field, { module: e.target.value, method: "" })}
                      className="w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 p-2"
                    >
                      <option value="">Select Category</option>
                      {Object.entries(FAKER_MODULES).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <select
                      value={field.method || ""}
                      onChange={(e) => onUpdate(field, { method: e.target.value })}
                      className="w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 p-2"
                      disabled={!field.module}
                    >
                      <option value="">Select Type</option>
                      {getMethodOptions(field.module).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {field.type === "array" && (
                <>
                  <div className="flex-1">
                    <select
                      value={field.arrayType || "simple"}
                      onChange={(e) => onUpdate(field, { 
                        arrayType: e.target.value as "simple" | "object",
                        items: { 
                          key: "", 
                          type: e.target.value as "simple" | "object",
                          fields: e.target.value === "object" ? [] : undefined
                        }
                      })}
                      className="w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 p-2"
                    >
                      <option value="simple">Simple Values</option>
                      <option value="object">Objects</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={field.count || 3}
                      onChange={(e) => onUpdate(field, { count: parseInt(e.target.value) })}
                      min={1}
                      max={10}
                      className="w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 p-2"
                    />
                  </div>
                </>
              )}
            </div>

            <Tooltip content="Remove field">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 rounded-lg transition-colors duration-200"
                onClick={() => onRemove(field)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            </Tooltip>
          </motion.div>

          {field.type === "object" && field.fields && (
            <div className="space-y-4">
              <FieldBuilder
                fields={field.fields}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onAddNestedField={onAddNestedField}
                depth={depth + 1}
              />
              <button
                type="button"
                onClick={() => onAddNestedField(field)}
                className="ml-8 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700"
              >
                Add Nested Field
              </button>
            </div>
          )}

          {field.type === "array" && field.items && (
            <div className="ml-8 mt-2">
              <div className="text-sm text-gray-400 mb-2">
                Array Item Template ({field.arrayType === "simple" ? "Simple Values" : "Objects"}):
              </div>
              {field.arrayType === "simple" ? (
                <FieldBuilder
                  fields={[field.items]}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onAddNestedField={onAddNestedField}
                  depth={depth + 1}
                />
              ) : (
                <>
                  <FieldBuilder
                    fields={field.items.fields || []}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onAddNestedField={onAddNestedField}
                    depth={depth + 1}
                  />
                  <button
                    type="button"
                    onClick={() => field.items?.fields && onAddNestedField(field)}
                    className="ml-8 mt-2 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700"
                  >
                    Add Object Field
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
} 
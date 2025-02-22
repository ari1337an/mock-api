import { FAKER_MODULES, FIELD_TYPES } from "@/constants/fakerModules";
import type { TemplateField } from "@/types/template";

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

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={index} className={`space-y-4 ${depth > 0 ? 'ml-8' : ''}`}>
          <div className="flex gap-4 items-start bg-gray-800 p-4 rounded-md">
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
                    {field.module && Object.entries(FAKER_MODULES[field.module as keyof typeof FAKER_MODULES].methods).map(([key, label]) => (
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

            <button
              type="button"
              onClick={() => onRemove(field)}
              className="px-3 py-2 text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>

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
        </div>
      ))}
    </div>
  );
} 
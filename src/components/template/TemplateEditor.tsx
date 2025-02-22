import { FieldBuilder } from "./FieldBuilder";
import type { TemplateField } from "@/types/template";
import { generateTemplate } from "@/utils/templateUtils";

interface TemplateEditorProps {
  mode: "visual" | "manual";
  template: string;
  fields: TemplateField[];
  onAddField: () => void;
  onAddNestedField: (parentField: TemplateField) => void;
  onTemplateChange: (value: string) => void;
  onUpdateField: (field: TemplateField, updates: Partial<TemplateField>) => void;
  onRemoveField: (field: TemplateField) => void;
  onModeChange: (mode: "visual" | "manual") => void;
}

export function TemplateEditor({
  mode,
  template,
  fields,
  onAddField,
  onAddNestedField,
  onTemplateChange,
  onUpdateField,
  onRemoveField,
  onModeChange,
}: TemplateEditorProps) {
  const previewTemplate = mode === "visual" 
    ? JSON.stringify(generateTemplate(fields), null, 2)
    : JSON.stringify(JSON.parse(template || "{}"), null, 2);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-300">
          Data Template Builder
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onModeChange("visual")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              mode === "visual"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Visual Builder
          </button>
          <button
            type="button"
            onClick={() => onModeChange("manual")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              mode === "manual"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Manual JSON
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <>
          <FieldBuilder
            fields={fields}
            onUpdate={onUpdateField}
            onRemove={onRemoveField}
            onAddNestedField={onAddNestedField}
          />
          <button
            type="button"
            onClick={onAddField}
            className="w-full py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700"
          >
            Add Field
          </button>
        </>
      ) : (
        <div className="space-y-2">
          <textarea
            value={template}
            onChange={(e) => onTemplateChange(e.target.value)}
            className="w-full h-96 rounded-md border border-gray-600 bg-gray-700 text-gray-100 font-mono text-sm p-4"
            placeholder={`{
  "username": "$internet.userName",
  "details": {
    "firstName": "$name.firstName",
    "lastName": "$name.lastName"
  }
}`}
          />
        </div>
      )}

      {/* Template Preview */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Template Preview
        </label>
        <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto">
          <code className="text-sm text-gray-100">
            {previewTemplate}
          </code>
        </pre>
      </div>
    </div>
  );
} 
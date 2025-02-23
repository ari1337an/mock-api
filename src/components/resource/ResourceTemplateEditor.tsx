"use client";

import { useState, useEffect, useRef } from "react";
import { TemplateEditor } from "@/components/template/TemplateEditor";
import type { TemplateField } from "@/types/template";
import { generateTemplate } from "@/utils/templateUtils";

interface ResourceTemplateEditorProps {
  template: Record<string, unknown>;
  onUpdate: (template: Record<string, unknown>) => Promise<void>;
}

function parseTemplateToFields(template: Record<string, unknown>): TemplateField[] {
  return Object.entries(template).map(([key, value]) => {
    if (typeof value === "string" && value.startsWith("$")) {
      const [module, method] = value.slice(1).split(".");
      return { key, type: "simple", module, method };
    }
    if (Array.isArray(value)) {
      // Handle array type
      const firstItem = value[0];
      if (typeof firstItem === "string" && firstItem.startsWith("$")) {
        const [module, method] = firstItem.slice(1).split(".");
        return {
          key,
          type: "array",
          arrayType: "simple",
          count: value.length,
          items: { key: "", type: "simple", module, method }
        };
      }
      if (typeof firstItem === "object" && firstItem !== null) {
        return {
          key,
          type: "array",
          arrayType: "object",
          count: value.length,
          items: { key: "", type: "object", fields: parseTemplateToFields(firstItem as Record<string, unknown>) }
        };
      }
    }
    if (typeof value === "object" && value !== null) {
      // Handle object type
      return {
        key,
        type: "object",
        fields: parseTemplateToFields(value as Record<string, unknown>)
      };
    }
    return { key, type: "simple" };
  });
}

export function ResourceTemplateEditor({ template, onUpdate }: ResourceTemplateEditorProps) {
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editorState, setEditorState] = useState({
    mode: "visual",
    template: JSON.stringify(template, null, 2),
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Use ref to track initial load
  const isInitialized = useRef(false);

  // Initialize fields only once on mount
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const templateFields = parseTemplateToFields(template);
        setFields(templateFields);
        isInitialized.current = true;
      } catch (error) {
        console.error("Error parsing template:", error);
      }
    }
  }, [template]);

  // Sync fields with manual template when switching modes
  useEffect(() => {
    if (editorState.mode === "manual") {
      const template = JSON.stringify(generateTemplate(fields), null, 2);
      setEditorState(prev => ({ ...prev, template }));
    }
  }, [editorState.mode, fields]);

  const handleUpdateField = (field: TemplateField, updates: Partial<TemplateField>) => {
    const updateFieldInArray = (fieldsArray: TemplateField[]): TemplateField[] => {
      return fieldsArray.map(f => {
        if (f === field) {
          return { ...f, ...updates };
        }
        if (f.type === "object" && f.fields) {
          return { ...f, fields: updateFieldInArray(f.fields) };
        }
        if (f.type === "array" && f.items) {
          if (f.items === field) {
            return { ...f, items: { ...f.items, ...updates } };
          }
          if (f.items.fields) {
            return { ...f, items: { ...f.items, fields: updateFieldInArray(f.items.fields) } };
          }
        }
        return f;
      });
    };

    const updatedFields = updateFieldInArray(fields);
    setFields(updatedFields);
    handleSave(generateTemplate(updatedFields));
  };

  const handleTemplateChange = async (value: string) => {
    try {
      const parsed = JSON.parse(value);
      setEditorState({ ...editorState, template: value });
      handleSave(parsed);
      setError(null);
    } catch {
      setError("Invalid JSON format");
    }
  };

  const handleSave = async (newTemplate: Record<string, unknown>) => {
    try {
      setIsSaving(true);
      await onUpdate(newTemplate);
      setError(null);
    } catch (error) {
      console.error("Error saving template:", error);
      setError("Failed to update template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-100">Data Template Builder</h2>
        <button
          onClick={() => handleSave(generateTemplate(fields))}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md text-white ${
            isSaving 
              ? "bg-blue-500 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      
      <TemplateEditor
        mode={editorState.mode as "visual" | "manual"}
        template={editorState.template}
        fields={fields}
        onAddField={() => setFields([...fields, { key: "", type: "simple" }])}
        onUpdateField={handleUpdateField}
        onRemoveField={(fieldToRemove) => {
          setFields(fields.filter(f => f !== fieldToRemove));
        }}
        onAddNestedField={(parentField) => {
          const updateFieldInArray = (fieldsArray: TemplateField[]): TemplateField[] => {
            return fieldsArray.map(f => {
              if (f === parentField) {
                return {
                  ...f,
                  fields: [...(f.fields || []), { key: "", type: "simple" }]
                };
              }
              if (f.type === "object" && f.fields) {
                return { ...f, fields: updateFieldInArray(f.fields) };
              }
              return f;
            });
          };
          setFields(updateFieldInArray(fields));
        }}
        onTemplateChange={handleTemplateChange}
        onModeChange={(mode) => setEditorState({ ...editorState, mode })}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
} 
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
    mode: "visual" as "visual" | "manual",
    template: JSON.stringify(template, null, 2),
    manualTemplate: JSON.stringify(template, null, 2),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
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

  // Handle mode switching
  const handleModeChange = (newMode: "visual" | "manual") => {
    try {
      if (newMode === "manual") {
        // When switching to manual, update the manual template with current fields
        const template = JSON.stringify(generateTemplate(fields), null, 2);
        setEditorState(prev => ({ 
          ...prev, 
          mode: newMode,
          manualTemplate: template 
        }));
      } else {
        // When switching to visual, parse the manual template to fields
        const parsed = JSON.parse(editorState.manualTemplate);
        const newFields = parseTemplateToFields(parsed);
        setFields(newFields);
        setEditorState(prev => ({ ...prev, mode: newMode }));
      }
      setError(null);
    } catch (error) {
      console.error("Error switching mode:", error);
      setError("Invalid JSON format");
    }
  };

  const handleTemplateChange = (value: string) => {
    // Update the template without validation
    setEditorState(prev => ({ ...prev, manualTemplate: value }));
    setIsDirty(true);
    
    // Optional: Try to validate after a delay
    try {
      JSON.parse(value);
      setError(null);
    } catch {
      setError("Invalid JSON format");
    }
  };

  const handleSave = async () => {
    try {
      // Validate JSON only when saving
      const newTemplate = editorState.mode === "visual" 
        ? generateTemplate(fields)
        : JSON.parse(editorState.manualTemplate); // This will throw if invalid
      
      setIsSaving(true);
      await onUpdate(newTemplate);
      setIsDirty(false);
      setError(null);
    } catch (error) {
      console.error("Error saving template:", error);
      setError("Failed to update template: Invalid JSON format");
    } finally {
      setIsSaving(false);
    }
  };

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
    setIsDirty(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-100">Data Template Builder</h2>
        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className={`px-4 py-2 rounded-md text-white ${
            !isDirty 
              ? "bg-gray-600 cursor-not-allowed"
              : isSaving 
                ? "bg-blue-500 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSaving ? "Saving..." : isDirty ? "Save Changes" : "Saved"}
        </button>
      </div>
      
      <TemplateEditor
        mode={editorState.mode}
        template={editorState.manualTemplate}
        fields={fields}
        onAddField={() => {
          setFields([...fields, { key: "", type: "simple" }]);
          setIsDirty(true);
        }}
        onUpdateField={handleUpdateField}
        onRemoveField={(fieldToRemove) => {
          setFields(fields.filter(f => f !== fieldToRemove));
          setIsDirty(true);
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
          setIsDirty(true);
        }}
        onTemplateChange={handleTemplateChange}
        onModeChange={handleModeChange}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
} 
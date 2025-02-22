"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ResourceNameInput } from "@/components/resource/ResourceNameInput";
import { VersionInput } from "@/components/resource/VersionInput";
import { TemplateEditor } from "@/components/template/TemplateEditor";
import { generateTemplate } from "@/utils/templateUtils";
import { createResource } from "@/server/actions/resources";
import type { TemplateField } from "@/types/template";
import { EditorStateSchema, type EditorState } from "@/schemas/template";

interface NewResourceFormProps {
  projectId: string;
}

export default function NewResourceForm({ projectId }: NewResourceFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [version, setVersion] = useState("v1");
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    mode: "visual",
    template: "{}",
  });

  // Sync fields with manual template when switching modes
  useEffect(() => {
    if (editorState.mode === "manual" && fields.length > 0) {
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

    setFields(updateFieldInArray(fields));
  };

  const handleRemoveField = (fieldToRemove: TemplateField) => {
    const removeFieldFromArray = (fieldsArray: TemplateField[]): TemplateField[] => {
      return fieldsArray.filter(f => {
        if (f === fieldToRemove) return false;
        if (f.type === "object" && f.fields) {
          f.fields = removeFieldFromArray(f.fields);
        }
        if (f.type === "array" && f.items && f.items.fields) {
          f.items.fields = removeFieldFromArray(f.items.fields);
        }
        return true;
      });
    };

    setFields(removeFieldFromArray(fields));
  };

  const handleAddNestedField = (parentField: TemplateField) => {
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
  };

  const handleModeChange = (mode: "visual" | "manual") => {
    try {
      const newState = { mode, template: editorState.template };
      EditorStateSchema.parse(newState);
      setEditorState(newState);
    } catch (error) {
      console.error(error);
      setError("Invalid editor state");
    }
  };

  const handleTemplateChange = (value: string) => {
    try {
      JSON.parse(value); // Validate JSON
      const newState = { ...editorState, template: value };
      EditorStateSchema.parse(newState);
      setEditorState(newState);
      setError(null);
    } catch {
      setError("Invalid JSON format");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const template = editorState.mode === "visual" 
        ? generateTemplate(fields)
        : JSON.parse(editorState.template);
      
      await createResource(projectId, {
        name,
        endpoint: `${version}/${name}`,
        template,
      });
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error(error);
      setError("Failed to create resource. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">
        Create New Resource
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ResourceNameInput name={name} onChange={setName} />
        <VersionInput version={version} onChange={setVersion} />
        <TemplateEditor
          mode={editorState.mode}
          template={editorState.template}
          fields={fields}
          onAddField={() => setFields([...fields, { key: "", type: "simple" }])}
          onUpdateField={handleUpdateField}
          onRemoveField={handleRemoveField}
          onAddNestedField={handleAddNestedField}
          onTemplateChange={handleTemplateChange}
          onModeChange={handleModeChange}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push(`/projects/${projectId}`)}
            className="flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Resource
          </button>
        </div>
      </form>
    </div>
  );
}

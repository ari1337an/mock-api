"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createResource } from "@/server/actions/resources";

// Enhanced template field structure to support nesting
interface TemplateField {
  key: string;
  type: "simple" | "object" | "array";
  arrayType?: "simple" | "object"; // New field to specify array type
  module?: string;
  method?: string;
  params?: string[];
  fields?: TemplateField[]; // For nested objects
  items?: TemplateField;    // For array items
  count?: number; // Number of items to generate
}

// Define available faker modules and their methods
const FAKER_MODULES = {
  internet: {
    label: "Internet",
    methods: {
      userName: "Username",
      email: "Email Address",
      password: "Password",
      url: "URL",
      ip: "IP Address",
      avatar: "Avatar URL",
    },
  },
  name: {
    label: "Person",
    methods: {
      firstName: "First Name",
      lastName: "Last Name",
      fullName: "Full Name",
      jobTitle: "Job Title",
    },
  },
  number: {
    label: "Numbers",
    methods: {
      int: "Integer",
      float: "Decimal Number",
    },
  },
  date: {
    label: "Dates",
    methods: {
      past: "Past Date",
      future: "Future Date",
      recent: "Recent Date",
    },
  },
  lorem: {
    label: "Text",
    methods: {
      word: "Single Word",
      words: "Multiple Words",
      sentence: "Sentence",
      paragraph: "Paragraph",
    },
  },
  // Add more modules as needed
};

const FIELD_TYPES = [
  { value: "simple", label: "Simple Value" },
  { value: "object", label: "Object" },
  { value: "array", label: "Array" },
];

interface NewResourceFormProps {
  projectId: string;
}

interface FieldBuilderProps {
  field: TemplateField;
  onUpdate: (updates: Partial<TemplateField>) => void;
  onRemove: () => void;
  depth?: number;
}

function FieldBuilder({ field, onUpdate, onRemove, depth = 0 }: FieldBuilderProps) {
  const handleTypeChange = (type: "simple" | "object" | "array") => {
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
    onUpdate(updates);
  };

  return (
    <div className={`flex gap-4 items-start bg-gray-800 p-4 rounded-md ${depth > 0 ? 'ml-8' : ''}`}>
      <div className="flex-1">
        <input
          type="text"
          value={field.key}
          onChange={(e) => onUpdate({ key: e.target.value })}
          placeholder="Field name"
          className="w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 p-2"
        />
      </div>

      <div className="flex-1">
        <select
          value={field.type}
          onChange={(e) => handleTypeChange(e.target.value as "simple" | "object" | "array")}
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
              onChange={(e) => onUpdate({ module: e.target.value, method: "" })}
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
              onChange={(e) => onUpdate({ method: e.target.value })}
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
              onChange={(e) => onUpdate({ 
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
              onChange={(e) => onUpdate({ count: parseInt(e.target.value) })}
              min={1}
              max={10}
              className="w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 p-2"
            />
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="px-3 py-2 text-red-400 hover:text-red-300"
      >
        Remove
      </button>
    </div>
  );
}

interface TemplateValue {
  [key: string]: string | TemplateValue | TemplateValue[];
}

interface EditorMode {
  mode: "visual" | "manual";
  template: string;
}

export default function NewResourceForm({ projectId }: NewResourceFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [version, setVersion] = useState("v1");
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorMode>({
    mode: "visual",
    template: "{}",
  });

  // Function to convert string to slug
  const toSlug = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove non-word chars
      .replace(/[\s_-]+/g, "-") // Replace spaces and _ with -
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing -
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sluggedName = toSlug(e.target.value);
    setName(sluggedName);
  };

  const addField = (parentFields?: TemplateField[]) => {
    const newField: TemplateField = { key: "", type: "simple" };
    if (parentFields) {
      parentFields.push(newField);
      setFields([...fields]);
    } else {
      setFields([...fields, newField]);
    }
  };

  const updateField = (field: TemplateField, updates: Partial<TemplateField>) => {
    Object.assign(field, updates);
    setFields([...fields]);
  };

  const removeField = (fieldToRemove: TemplateField, parentFields?: TemplateField[]) => {
    if (parentFields) {
      const index = parentFields.indexOf(fieldToRemove);
      if (index !== -1) {
        parentFields.splice(index, 1);
        setFields([...fields]);
      }
    } else {
      setFields(fields.filter(f => f !== fieldToRemove));
    }
  };

  const generateTemplate = (templateFields: TemplateField[] = fields): Record<string, any> => {
    return templateFields.reduce((acc: Record<string, any>, field) => {
      if (!field.key) return acc;

      if (field.type === "simple" && field.module && field.method) {
        acc[field.key] = `$${field.module}.${field.method}`;
      } else if (field.type === "object" && field.fields) {
        acc[field.key] = generateTemplate(field.fields);
      } else if (field.type === "array" && field.items) {
        const count = field.count || 3;
        
        if (field.arrayType === "simple" && field.items.module && field.items.method) {
          // Create a proper array using Array constructor and map
          acc[field.key] = Array.from(
            { length: count }, 
            () => `$${field.items!.module}.${field.items!.method}`
          );
        } else if (field.arrayType === "object" && field.items.fields) {
          // Create array of objects
          acc[field.key] = Array.from(
            { length: count }, 
            () => generateTemplate(field.items!.fields || [])
          );
        }
      }
      return acc;
    }, {});
  };

  const renderFields = (templateFields: TemplateField[] = fields, depth = 0) => {
    return (
      <div className="space-y-4">
        {templateFields.map((field, index) => (
          <div key={index}>
            <FieldBuilder
              field={field}
              onUpdate={(updates) => updateField(field, updates)}
              onRemove={() => removeField(field, depth > 0 ? templateFields : undefined)}
              depth={depth}
            />
            
            {field.type === "object" && field.fields && (
              <div className="mt-2">
                {renderFields(field.fields, depth + 1)}
                <button
                  type="button"
                  onClick={() => field.fields && addField(field.fields)}
                  className="ml-8 mt-2 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700"
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
                    field={field.items}
                    onUpdate={(updates) => updateField(field.items!, updates)}
                    onRemove={() => {}}
                    depth={depth + 1}
                  />
                ) : (
                  <>
                    {renderFields(field.items.fields || [], depth + 1)}
                    <button
                      type="button"
                      onClick={() => field.items?.fields && addField(field.items.fields)}
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
  };

  const handleTemplateChange = (value: string) => {
    try {
      JSON.parse(value);
      setEditorState({ ...editorState, template: value });
      setError(null);
    } catch (_) { // Use underscore to indicate intentionally unused variable
      setError("Invalid JSON format");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const template = editorState.mode === "visual" 
        ? generateTemplate()
        : JSON.parse(editorState.template);
      
      const endpoint = `${version}/${name}`;
      await createResource(projectId, {
        name,
        endpoint,
        template,
      });
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error(error);
      setError("Failed to create resource. Please try again.");
    }
  };

  useEffect(() => {
    if (editorState.mode === "visual") {
      const template = generateTemplate();
      setEditorState(prev => ({ ...prev, template: JSON.stringify(template, null, 2) }));
    }
  }, [fields]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">
        Create New Resource
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Resource Name
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            placeholder="users-posts"
            required
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            title="Lowercase letters, numbers, and hyphens only. Must start and end with a letter or number."
          />
          <p className="mt-1 text-sm text-gray-400">
            Use lowercase letters, numbers, and hyphens only (e.g.,
            &quot;blog-posts&quot;, &quot;users&quot;, &quot;api-keys&quot;)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            API Version
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-gray-800 text-gray-400 sm:text-sm">
              api/
            </span>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="flex-1 block w-full rounded-none rounded-r-md border border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="v1"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Example: v1, v2, beta, etc.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-300">
              Data Template Builder
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditorState({ ...editorState, mode: "visual" })}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  editorState.mode === "visual"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Visual Builder
              </button>
              <button
                type="button"
                onClick={() => setEditorState({ 
                  mode: "manual", 
                  template: JSON.stringify(generateTemplate(), null, 2)
                })}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  editorState.mode === "manual"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Manual JSON
              </button>
            </div>
          </div>

          {editorState.mode === "visual" ? (
            <>
              {renderFields()}
              <button
                type="button"
                onClick={() => addField()}
                className="w-full py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700"
              >
                Add Field
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <textarea
                value={editorState.template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full h-96 rounded-md border border-gray-600 bg-gray-700 text-gray-100 font-mono text-sm p-4"
                placeholder={`{
  "username": "$internet.userName",
  "details": {
    "firstName": "$name.firstName",
    "lastName": "$name.lastName"
  },
  "numbers": [
    "$phone.number",
    "$phone.number",
    "$phone.number"
  ]
}`}
              />
              <p className="text-sm text-gray-400">
                Use $module.method syntax for dynamic values (e.g., $internet.userName, $name.firstName)
              </p>
            </div>
          )}

          {fields.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Template Preview
              </label>
              <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto">
                <code className="text-sm text-gray-100">
                  {JSON.stringify(generateTemplate(), null, 2)}
                </code>
              </pre>
            </div>
          )}
        </div>

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

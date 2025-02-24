"use client";

import { FieldBuilder } from "./FieldBuilder";
import type { TemplateField } from "@/types/template";
import { generateTemplate } from "@/utils/templateUtils";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidJSON, setIsValidJSON] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState("");

  const handlePreviewGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const newPreview = mode === "visual" 
        ? JSON.stringify(generateTemplate(fields), null, 2)
        : JSON.stringify(JSON.parse(template || "{}"), null, 2);
      setPreviewTemplate(newPreview);
      setIsValidJSON(true);
    } catch (err) {
      console.error('Failed to generate preview:', err);
      setIsValidJSON(false);
    } finally {
      setIsGenerating(false);
    }
  }, [mode, template, fields]);

  useEffect(() => {
    handlePreviewGenerate();
  }, [handlePreviewGenerate]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreviewOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setIsPreviewOpen(!isPreviewOpen);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPreviewOpen]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <label className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Data Template Builder
        </label>
        <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
          <button
            type="button"
            onClick={() => onModeChange("visual")}
            className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
              mode === "visual"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Visual Builder
          </button>
          <button
            type="button"
            onClick={() => onModeChange("manual")}
            className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
              mode === "manual"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Manual JSON
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden backdrop-blur-sm">
        <div className="p-6">
          {mode === "visual" ? (
            <div className="space-y-6">
              <FieldBuilder
                fields={fields}
                onUpdate={onUpdateField}
                onRemove={onRemoveField}
                onAddNestedField={onAddNestedField}
              />
              <button
                type="button"
                onClick={onAddField}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
              >
                Add New Field
              </button>
            </div>
          ) : (
            <textarea
              value={template}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="w-full h-96 rounded-lg border border-gray-800 bg-gray-900/50 text-gray-100 font-mono text-sm p-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300"
              placeholder={`{
  "username": "$internet.username",
  "details": {
    "firstName": "$name.firstName",
    "lastName": "$name.lastName"
  }
}`}
              spellCheck="false"
            />
          )}
        </div>

        {/* Preview Section */}
        <div className="border-t border-gray-800">
          <div className="flex items-center justify-between px-6 py-4 bg-gray-900/30">
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
            >
              <span>Preview</span>
              <motion.svg
                animate={{ rotate: isPreviewOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <div className="flex items-center gap-3">
              {isGenerating && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 text-blue-400"
                >
                  <svg className="animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </motion.div>
              )}
              {!isValidJSON && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  Invalid JSON
                </span>
              )}
            </div>
          </div>
          <AnimatePresence>
            {isPreviewOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <pre className={`p-6 overflow-x-auto bg-gray-900/80 ${!isValidJSON ? 'border-l-2 border-red-500' : ''}`}>
                  <code className="text-sm text-gray-100">
                    {previewTemplate}
                  </code>
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 
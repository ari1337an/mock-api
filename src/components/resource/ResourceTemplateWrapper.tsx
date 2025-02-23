"use client";

import { ResourceTemplateEditor } from "./ResourceTemplateEditor";
import { updateResourceTemplate } from "@/server/actions/resources";
import type { TemplateObject } from "@/server/actions/resources";

interface ResourceTemplateWrapperProps {
  resourceId: string;
  template: Record<string, unknown>;
}

export function ResourceTemplateWrapper({ resourceId, template }: ResourceTemplateWrapperProps) {
  const handleUpdate = async (newTemplate: Record<string, unknown>) => {
    try {
      await updateResourceTemplate(resourceId, newTemplate as TemplateObject);
    } catch (error) {
      console.error("Failed to update template:", error);
    }
  };

  return (
    <ResourceTemplateEditor
      template={template}
      onUpdate={handleUpdate}
    />
  );
} 
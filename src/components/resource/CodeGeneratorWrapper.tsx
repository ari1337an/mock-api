'use client';

import dynamic from 'next/dynamic';

const CodeGeneratorClient = dynamic(
  () => import('./CodeGenerator').then(mod => mod.CodeGenerator),
  { ssr: false }
);

export function CodeGeneratorWrapper(props: React.ComponentProps<typeof CodeGeneratorClient>) {
  return <CodeGeneratorClient {...props} />;
} 
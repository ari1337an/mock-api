export function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {content}
      </div>
    </div>
  );
} 
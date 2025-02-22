interface VersionInputProps {
  version: string;
  onChange: (value: string) => void;
}

export function VersionInput({ version, onChange }: VersionInputProps) {
  return (
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
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 block w-full rounded-none rounded-r-md border border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          placeholder="v1"
          required
        />
      </div>
    </div>
  );
} 
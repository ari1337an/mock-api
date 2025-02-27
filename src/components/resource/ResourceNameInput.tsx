interface ResourceNameInputProps {
  name: string;
  onChange: (value: string) => void;
}

export function ResourceNameInput({ name, onChange }: ResourceNameInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300">
        Resource Name
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        placeholder="users-posts"
        required
        pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
        title="Lowercase letters, numbers, and hyphens only. Must start and end with a letter or number."
      />
      <p className="mt-1 text-sm text-gray-400">
        Use lowercase letters, numbers, and hyphens only
      </p>
    </div>
  );
} 
import { useOutputDirectory } from "../../hooks/useOutputDirectory";

export function OutputDirectory() {
  const { outputDirectory, pickDirectory } = useOutputDirectory();

  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
        Output Directory
      </label>
      <button
        onClick={pickDirectory}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg
                   bg-white/[0.06] border border-white/[0.1] text-left
                   hover:bg-white/[0.1] hover:border-white/[0.16] transition-all duration-200"
      >
        <svg
          className="w-4 h-4 text-white/40 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
          />
        </svg>
        {outputDirectory ? (
          <span className="text-sm text-white/70 truncate">
            {outputDirectory.split(/[/\\]/).slice(-2).join("/")}
          </span>
        ) : (
          <span className="text-sm text-white/30">Choose folder...</span>
        )}
      </button>
    </div>
  );
}

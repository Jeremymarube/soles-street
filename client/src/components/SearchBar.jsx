"use client";

const SearchBar = ({ value, onChange }) => (
  <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Search</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Nike Air Force 1"
      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
    />
  </label>
);

export default SearchBar;


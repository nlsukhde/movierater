// SearchBar.tsx
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  return (
    <section className="">
      <div className="flex gap-4">
        <div className="relative flex-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search movies..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearch();
              }
            }}
            className="pl-12 bg-transparent text-white placeholder-gray-400 focus:ring-0 border-none"
          />
        </div>
        <Button
          onClick={onSearch}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-2xl px-6"
        >
          Search
        </Button>
      </div>
    </section>
  );
}

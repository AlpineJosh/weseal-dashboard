import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useImmer } from "use-immer";

import { Input } from "@repo/ui/components/control";

interface SearchableListboxProps<T> {
  onSelect: (item: T) => void;
  useQuery: (query: string) => UseTRPCQueryResult<T[], unknown>;
  item: (item: T) => React.ReactNode;
  empty: React.ReactNode;
  loading: React.ReactNode;
  placeholder?: string;
}

export const SearchableListbox = <T,>({
  onSelect,
  useQuery,
  item,
  empty,
  loading,
  placeholder,
}: SearchableListboxProps<T>) => {
  const [query, setQuery] = useImmer("");
  const { data, isLoading } = useQuery(query);

  return (
    <>
      <div className="border-b border-border p-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? "Search..."}
        />
      </div>
      <ul className="flex-1 overflow-y-auto">
        {data ? (
          data.map((t, index) => (
            <li key={index}>
              <button
                className="flex w-full flex-row border-b p-2 text-left last:border-none"
                type="button"
                onClick={() => onSelect(t)}
              >
                {item(t)}
              </button>
            </li>
          ))
        ) : (
          <div>{isLoading ? loading : empty}</div>
        )}
      </ul>
    </>
  );
};

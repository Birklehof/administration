import Link from "next/link";
import Icon from "./Icon";

interface SearchBarProps {
  searchValue: string;
  setSearchValue: (text: string) => void;
  filters?: FilterInputs[];
  backLink?: string;
}

interface FilterInputs {
  filerValue: string;
  setFilterValue: (text: string) => void;
  filterOptions?: { value: string; label: string }[];
}

export default function SearchBar({
  searchValue,
  setSearchValue,
  filters,
  backLink,
}: SearchBarProps) {
  return (
    <div className="searchbox">
      <div className="input-elements-container">
        {backLink && (
          <Link href={backLink} className="btn btn-ghost btn-circle btn-sm">
            <Icon name="ArrowLeftIcon" />
          </Link>
        )}
        <input
          type="text"
          placeholder="Suchen..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {filters && (
          <div className="dropdown dropdown-bottom dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-circle btn-ghost btn-sm"
              aria-label="Filtern"
            >
              <Icon name="AdjustmentsIcon" />
            </label>

            <div
              tabIndex={0}
              className="dropdown-content menu p-3 shadow bg-base-100 rounded-box flex flex-col gap-3"
            >
              {filters?.map((filter) => (
                <select
                  className="select select-bordered select-sm grow"
                  onChange={(e) => filter.setFilterValue(e.target.value)}
                  value={filter.filerValue}
                >
                  {filter.filterOptions?.map((option) => (
                    <option value={option.value}>{option.label}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

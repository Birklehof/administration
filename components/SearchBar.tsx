import Link from 'next/link';
import Icon from './Icon';

interface SearchBarProps {
  searchValue?: string;
  setSearchValue?: (text: string) => void;
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
    <div className="search-bar">
      <div className="form-control flex grow flex-row justify-center gap-2">
        <div className="flex grow">
          {backLink ? (
            <Link href={backLink} className="btn-ghost btn-square btn-sm btn">
              <Icon name="ArrowLeftIcon" />
            </Link>
          ) : (
            <label
              htmlFor="main-menu"
              className="btn-ghost btn-square btn-sm btn lg:invisible"
            >
              <Icon name="MenuIcon" />
            </label>
          )}
        </div>
        <div className="form-control flex w-full max-w-xl grow flex-row justify-between gap-2">
          {setSearchValue && (
            <input
              className="input-bordered input rounded-box input-sm w-10 grow"
              type="text"
              placeholder="Suchen ..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          )}
          {filters && (
            <div className="dropdown-bottom dropdown-end dropdown">
              <label
                tabIndex={0}
                className="btn-ghost btn-square btn-sm btn"
                aria-label="Filtern"
              >
                <Icon name="AdjustmentsIcon" />
              </label>

              <div
                tabIndex={0}
                className="dropdown-content menu rounded-box flex flex-col gap-3 bg-base-100 p-3 shadow"
              >
                {filters?.map((filter) => (
                  <select
                    key={filter.filterOptions?.toString()}
                    className="select-bordered select select-sm grow"
                    onChange={(e) => filter.setFilterValue(e.target.value)}
                    value={filter.filerValue}
                  >
                    {filter.filterOptions?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex grow">
          {/* The button is only here so that the search bar is centered */}
          {backLink ? (
            <Link href={backLink} className="btn-ghost btn-square btn-sm btn invisible hidden sm:block">
              <Icon name="ArrowLeftIcon" />
            </Link>
          ) : (
            <label
              htmlFor="main-menu"
              className="btn-ghost btn-square btn-sm btn invisible hidden sm:block"
            >
              <Icon name="MenuIcon" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

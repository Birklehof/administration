import { ReactNode } from "react";

interface ListItemProps {
  number?: number;
  mainContent: string;
  secondaryContent?: string;
  badges?: string[];
  children?: ReactNode | undefined;
}

export default function ListItem({
  number,
  mainContent,
  secondaryContent,
  badges,
  children,
}: ListItemProps) {
  return (
    <div className="card max-w-xl shadow-md bg-base-100 rounded-box flex flex-col justify-start w-full gap-0 text-lg p-1 pl-3">
      <div className="flex flex-row items-center">
        {number != undefined && (
          <>
            <span className="opacity-60">
              {"0".repeat(3 - number.toString().length)}
            </span>
            <span className="pr-1">{number}</span>
          </>
        )}
        <span className="whitespace-nowrap overflow-hidden pr-1">
          <span className="overflow-hidden text-ellipsis font-semibold">
            {mainContent}
          </span>
        </span>
        {secondaryContent && (
          <span className="whitespace-nowrap overflow-hidden">
            <span className="overflow-hidden text-ellipsis">
              {secondaryContent}
            </span>
          </span>
        )}
        <div className="flex-grow" />
        {children}
      </div>
      {(badges?.length || 0) > 0 && (
        <div className="flex flex-row gap-1 pb-1">
          {badges?.map((badge) => (
            <span key={badge} className="badge badge-outline badge-success">
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

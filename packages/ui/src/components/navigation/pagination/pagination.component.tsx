import React from "react";

import type { ButtonProps } from "@repo/ui/components/element";
import { faArrowLeftLong, faArrowRightLong } from "@repo/pro-solid-svg-icons";
import { Button, Icon } from "@repo/ui/components/element";
import { cn } from "@repo/ui/lib/class-merge";
import { renderChildren } from "@repo/ui/lib/helpers";

type PaginationProps = React.ComponentPropsWithRef<"nav"> & {
  currentPage: number;
  totalPages: number;
} & (
    | {
        onPageChange: (page: number) => void;
        href: undefined;
      }
    | {
        href: (page: number) => string;
        onPageChange: undefined;
      }
  );

const Pagination = ({
  "aria-label": ariaLabel = "Page navigation",
  className,
  currentPage,
  totalPages,
  href,
  onPageChange,
  ...props
}: PaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const startPages = pages.slice(0, 1);
  const endPages = pages.slice(-1);
  const middlePages = pages.slice(
    Math.max(currentPage - 3, 1),
    Math.min(currentPage + 2, totalPages - 1),
  );

  const hasStartGap = startPages[startPages.length - 1] + 1 < middlePages[0];
  const hasEndGap =
    middlePages.length === 0 ||
    middlePages[middlePages.length - 1] + 1 < endPages[0];

  return (
    <nav
      aria-label={ariaLabel}
      {...props}
      className={cn(className, "flex gap-x-2")}
    >
      <PaginationButton
        isDisabled={currentPage === 1}
        aria-label="Previous page"
        href={href ? href(currentPage - 1) : undefined}
        onPress={onPageChange ? () => onPageChange(currentPage - 1) : undefined}
      >
        <Icon icon={faArrowLeftLong} />
        Previous
      </PaginationButton>
      {startPages.map((page) => (
        <PaginationButton
          key={page}
          aria-label={`Page ${page}`}
          current={page === currentPage}
          href={href ? href(page) : undefined}
          onPress={onPageChange ? () => onPageChange(page) : undefined}
        >
          {page}
        </PaginationButton>
      ))}
      {hasStartGap && <PaginationGap />}
      {middlePages.map((page) => (
        <PaginationButton
          key={page}
          aria-label={`Page ${page}`}
          href={href ? href(page) : undefined}
          onPress={onPageChange ? () => onPageChange(page) : undefined}
          current={page === currentPage}
        >
          {page}
        </PaginationButton>
      ))}
      {hasEndGap && <PaginationGap />}
      {endPages.map((page) => (
        <PaginationButton
          key={page}
          aria-label={`Page ${page}`}
          href={href ? href(page) : undefined}
          onPress={onPageChange ? () => onPageChange(page) : undefined}
          current={page === currentPage}
        >
          {page}
        </PaginationButton>
      ))}
      <PaginationButton
        isDisabled={currentPage === totalPages}
        aria-label="Next page"
        href={href ? href(currentPage + 1) : undefined}
        onPress={onPageChange ? () => onPageChange(currentPage + 1) : undefined}
      >
        Next
        <Icon icon={faArrowRightLong} className="size-4" />
      </PaginationButton>
    </nav>
  );
};

type PaginationButtonProps = ButtonProps & {
  current?: boolean;
};

const PaginationButton = ({
  className,
  children,
  current = false,
  ...props
}: PaginationButtonProps) => {
  return (
    <Button
      {...props}
      aria-current={current ? "page" : undefined}
      className={cn(
        "min-w-[2.25rem] before:absolute before:-inset-px before:rounded-lg",
        current && "before:bg-content/5",
        className,
      )}
    >
      {children}
    </Button>
  );
};

const PaginationGap = () => (
  <span
    aria-hidden="true"
    className={cn(
      "w-[2.25rem] select-none text-center text-sm/6 font-semibold text-content",
    )}
  >
    &hellip;
  </span>
);

export { Pagination };
export type { PaginationProps };

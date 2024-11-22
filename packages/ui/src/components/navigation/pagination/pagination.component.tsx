import React from "react";

import type { ButtonProps } from "@repo/ui/components/element";
import {
  faChevronLeft,
  faChevronRight,
  faChevronsLeft,
  faChevronsRight,
} from "@repo/pro-solid-svg-icons";
import { Button, Icon } from "@repo/ui/components/element";
import { cn } from "@repo/ui/lib/class-merge";

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

  let startGap = false,
    endGap = false,
    startPages: number[] = [],
    endPages: number[] = [],
    middlePages: number[] = [];

  if (pages.length <= 4) {
    startPages = pages;
  } else {
    startPages = pages.slice(0, 1);
    endPages = pages.slice(-1);
    middlePages = pages.slice(
      Math.max(currentPage - 2, 1),
      Math.min(currentPage + 1, totalPages - 1),
    );

    startGap = startPages.length + 1 < (middlePages[0] ?? 0);
    endGap =
      middlePages.length === 0 ||
      (middlePages[middlePages.length - 1] ?? totalPages) + 1 <
        (endPages[0] ?? totalPages);
  }

  return (
    <nav
      aria-label={ariaLabel}
      {...props}
      className={cn(className, "flex gap-x-1")}
    >
      <PaginationButton
        isDisabled={currentPage === 1}
        aria-label="First page"
        href={href ? href(1) : undefined}
        onPress={onPageChange ? () => onPageChange(1) : undefined}
      >
        <Icon icon={faChevronsLeft} />
      </PaginationButton>
      <PaginationButton
        isDisabled={currentPage === 1}
        aria-label="Previous page"
        href={href ? href(currentPage - 1) : undefined}
        onPress={onPageChange ? () => onPageChange(currentPage - 1) : undefined}
      >
        <Icon icon={faChevronLeft} />
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
      {startGap && <PaginationGap />}
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
      {endGap && <PaginationGap />}
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
        <Icon icon={faChevronRight} className="size-4" />
      </PaginationButton>
      <PaginationButton
        isDisabled={currentPage === totalPages}
        aria-label="Last page"
        href={href ? href(totalPages) : undefined}
        onPress={onPageChange ? () => onPageChange(totalPages) : undefined}
      >
        <Icon icon={faChevronsRight} className="size-4" />
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
      variant="plain"
      color="primary"
      aria-current={current ? "page" : undefined}
      className={cn(
        "min-w-[2.25rem] before:absolute before:-inset-px before:rounded-lg",
        current && "before:bg-color/10",
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
      "w-[1.25rem] select-none text-center text-sm/6 font-semibold text-primary",
    )}
  >
    &hellip;
  </span>
);

export { Pagination };
export type { PaginationProps };

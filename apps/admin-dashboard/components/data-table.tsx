"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SearchIcon,
} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  /** Search box; filters rows where `row.original[searchAccessor]` contains the query (case-insensitive). */
  searchPlaceholder?: string;
  searchAccessor?: keyof TData;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  onRowClick,
  searchPlaceholder,
  searchAccessor,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const searchEnabled = Boolean(searchPlaceholder && searchAccessor);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!searchAccessor) return true;
      const needle = String(filterValue ?? "")
        .toLowerCase()
        .trim();
      if (!needle) return true;
      const hay = String(row.original[searchAccessor] ?? "").toLowerCase();
      return hay.includes(needle);
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    state: {
      sorting,
      globalFilter,
    },
  });

  useEffect(() => {
    if (!searchEnabled) return;
    table.setPageIndex(0);
  }, [globalFilter, searchEnabled]); // eslint-disable-line react-hooks/exhaustive-deps -- reset page when query changes; `table` from latest render

  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = data.length;

  return (
    <div className="space-y-4">
      {searchPlaceholder ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
              aria-label={searchPlaceholder}
            />
          </div>
          {searchEnabled && globalFilter.trim() ? (
            <p className="text-sm text-muted-foreground tabular-nums">
              {filteredCount === 0
                ? "Mos keladigan yozuv yo'q"
                : `${filteredCount} ta mos keldi (jami ${totalCount})`}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sortDirection === "asc" ? (
                            <ChevronUpIcon className="size-4" />
                          ) : sortDirection === "desc" ? (
                            <ChevronDownIcon className="size-4" />
                          ) : (
                            <ChevronsUpDownIcon className="size-4 opacity-50" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Ma&apos;lumot topilmadi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} ta yozuvdan{" "}
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            ko&apos;rsatilmoqda
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="size-4" />
              Oldingi
            </Button>
            <span className="text-sm">
              {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Keyingi
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

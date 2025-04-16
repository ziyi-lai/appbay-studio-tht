import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserDialog } from "@/components/layout/user-dialog";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onUserCreated?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onUserCreated,
}: DataTableProps<TData, TValue>) {


  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedRole, setSelectedRole] = React.useState<"all" | "admin" | "user">("all");
  const [selectedDateFilter, setSelectedDateFilter] = React.useState<
    "all" | "last7" | "last30" | "lastYear"
  >("all");


  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: totalPages,
  });

  // Helper to calculate date threshold filters
  const getDateThreshold = (filter: "last7" | "last30" | "lastYear"): string => {
    const now = new Date();
    let threshold: Date;
    switch (filter) {
      case "last7":
        threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last30":
        threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        threshold = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
    return threshold.toISOString();
  };

  return (
    <div className="p-12">
      <h1 className="font-bold text-2xl">USER MANAGEMENT</h1>

      {/* Toolbar Section */}
      <div className="flex justify-between items-center py-4">
        <div className="flex gap-2">
          {/* Searchbar Input */}
          <Input
            placeholder="Filter user names..."
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          {/* Role Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Role
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={selectedRole === "all"}
                onCheckedChange={(value) => {
                  if (value) {
                    setSelectedRole("all");
                    table.getColumn("role")?.setFilterValue("");
                  }
                }}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedRole === "admin"}
                onCheckedChange={(value) => {
                  if (value) {
                    setSelectedRole("admin");
                    table.getColumn("role")?.setFilterValue("admin");
                  }
                }}
              >
                Admin
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedRole === "user"}
                onCheckedChange={(value) => {
                  if (value) {
                    setSelectedRole("user");
                    table.getColumn("role")?.setFilterValue("user");
                  }
                }}
              >
                User
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Joined Date Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Joined Date</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={selectedDateFilter === "all"}
                onCheckedChange={(value) => {
                  if (value) {
                    setSelectedDateFilter("all");
                    table.getColumn("joinedAt")?.setFilterValue("");
                  }
                }}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedDateFilter === "last7"}
                onCheckedChange={(value) => {
                  if (value) {
                    setSelectedDateFilter("last7");
                    table.getColumn("joinedAt")?.setFilterValue(getDateThreshold("last7"));
                  }
                }}
              >
                Last 7 Days
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedDateFilter === "last30"}
                onCheckedChange={(value) => {
                  if (value) {
                    setSelectedDateFilter("last30");
                    table.getColumn("joinedAt")?.setFilterValue(getDateThreshold("last30"));
                  }
                }}
              >
                Last 30 Days
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedDateFilter === "lastYear"}
                onCheckedChange={(value) => {
                  if (value) {
                    setSelectedDateFilter("lastYear");
                    table.getColumn("joinedAt")?.setFilterValue(getDateThreshold("lastYear"));
                  }
                }}
              >
                Last Year
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Columns Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Toolbar Section */}
        <div className="flex gap-2">
          {/* TODO: Export user records */}
          <Button variant="outline" size="sm">
            Export
          </Button>
          <UserDialog mode="create" onUserCreated={onUserCreated} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {!header.isPlaceholder &&
                      flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        {/* Left: Selection summary */}
        <div className="flex-1 text-sm text-muted-foreground w-1/3">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        {/* Center: Pagination buttons */}
        <div className="flex gap-1 w-1/3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>

        {/* Right: Rows per page dropdown */}
        <div className="w-1/3 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Rows per page: {pageSize}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[10, 25, 50, 100].map((pageSizeOption) => (
                <DropdownMenuCheckboxItem
                  key={pageSizeOption}
                  checked={pageSize === pageSizeOption}
                  onCheckedChange={(value) => {
                    if (value) onPageSizeChange(pageSizeOption);
                  }}
                >
                  {pageSizeOption}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

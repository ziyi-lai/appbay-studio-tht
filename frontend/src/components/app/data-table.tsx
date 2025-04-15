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
import { UserDialog } from "@/components/layout/user-dialog";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  // Existing table states
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // Hide selected Column(s) from data table
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  // Select row of records
  const [rowSelection, setRowSelection] = React.useState({});
  // Filter Role
  const [selectedRole, setSelectedRole] = React.useState<"all" | "admin" | "user">("all");
  // Filter Joined Date
  const [selectedDateFilter, setSelectedDateFilter] = React.useState<
    "all" | "last7" | "last30" | "lastYear"
  >("all");
  const [combinedFilter, setCombinedFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  const getDateThreshold = (filter: "last7" | "last30" | "lastYear"): string => {
    const now = new Date();
    let threshold: Date;
    if (filter === "last7") {
      threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filter === "last30") {
      threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else { // lastYear
      threshold = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
    return threshold.toISOString();
  };

  return (
    <div className="p-12">
      <h1 className="font-bold text-2xl">USER MANAGEMENT</h1>
      <div className="flex justify-between items-center py-4">
        <div className="flex gap-2">
          {/* Email filter input */}
          <Input
            placeholder="Filter names and emails..."
            value={combinedFilter}
            onChange={(event) => {
              const value = event.target.value;
              setCombinedFilter(value);
              table.getColumn("email")?.setFilterValue(value);
              table.getColumn("name")?.setFilterValue(value);
            }}
            className="max-w-sm"
          />
          {/* Role Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Role
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* "All" option resets the role filter */}
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
              {/* Filter by "admin" */}
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
              {/* Filter by "user" */}
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
          {/* Joined Date Filter Dropdown */}
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
                    // Clear the filter for joinedAt column
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
                    // Set the filter value to the threshold ISO string for last 7 days
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
          {/* Columns Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(
                  (column) => column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2">
          {/* Button for export data */}
          <Button 
            variant="outline"
            size="sm"
          >
            Export
          </Button>
          {/* Button for creating new user */}
          <UserDialog
            triggerLabel="Create New User">
          </UserDialog>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
      {/* Pagination Controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
        {/* Rows per Page Dropdown */}
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
                  if (value) {
                    onPageSizeChange(pageSizeOption);
                  }
                }}
              >
                {pageSizeOption}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// src/pages/UserPage.tsx
import React, { useEffect, useState } from 'react';
import { getColumns } from "./columns";
import { DataTable } from "./data-table";
import { User } from "@/types/User";
import userService from '@/services/userService';
import withLoading from "@/hoc/withLoading";

// Wrap DataTable with the HOC. The resulting component now requires an "isLoading" prop.
const DataTableWithLoading = withLoading<User, unknown, {}>(DataTable);

const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchUserData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const data = await userService.fetchUsers(currentPage, pageSize);
      setUsers(data.records);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [currentPage, pageSize]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleUserCreated = () => {
    fetchUserData();
  };

  return (
    <div className="container mx-auto h-full">
      <DataTableWithLoading
        isLoading={loading} 
        columns={getColumns(handleUserCreated)}
        data={users}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};

export default UserPage;
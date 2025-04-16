// user-page.tsx
import React from "react";
import { useUserContext } from "@/contexts/UserContext";
import { getColumns } from "@/components/app/columns";
import { DataTable } from "@/components/app/data-table";
import { User } from "@/types/User";
import withLoading from "@/hoc/withLoading";

const DataTableWithLoading = withLoading<User, unknown, {}>(DataTable);

const UserPage: React.FC = () => {
  const { state, dispatch, fetchUsers } = useUserContext();
  const { users, loading, currentPage, pageSize, totalPages } = state;

  const handlePageChange = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: newPageSize });
    dispatch({ type: 'SET_PAGE', payload: 1 });
  };

  const handleUserCreated = () => {
    fetchUsers();
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
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};

export default UserPage;
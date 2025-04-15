import React, { useEffect, useState } from 'react';
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { User } from "@/types/User"
import userService from '@/services/userService';
import { Checkbox } from '@radix-ui/react-checkbox';


const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    userService.fetchUsers()
      .then((data) => {
        setUsers(data.records);
        setLoading(false);
      })
      .catch ((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={users} />
    </div>
  )
}

export default UserPage;
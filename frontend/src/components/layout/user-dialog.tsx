// src/components/UserDialog.tsx
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { userSchema, type User } from "@/types/User";
import userService from "@/services/userService";

interface UserDialogProps {
  mode: "create" | "update";
  initialData?: User;
  onUserCreated?: (user: User) => void;
}

export function UserDialog({
  mode,
  initialData,
  onUserCreated
}: UserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user" | "">("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; role?: string }>({});
  const [open, setOpen] = useState(false);

  // Auto-fill in update mode
  useEffect(() => {
    if (mode === "update" && initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setRole(initialData.role);
    }
  }, [mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const validatedData = userSchema.omit({ id: true, createdAt: true }).parse({ name, email, role });

      let user: User;
      if (mode === "create") {
        user = await userService.createUser(validatedData);
      } else {
        user = await userService.updateUser(initialData!.id, validatedData); // ensure initialData is defined
      }

      if (onUserCreated) {
        onUserCreated(user);
      }

      if (mode === "create") {
        setName("");
        setEmail("");
        setRole("");
      }
      setOpen(false);
    } catch (error: any) {
      console.error("Validation error:", error);
      const fieldErrors: { name?: string; email?: string; role?: string } = {};
      error.errors.forEach((err: any) => {
        const key = err.path[0] as "name" | "email" | "role";
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          {mode === "create" ? "Create User" : "Update User"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create User" : "Update User"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Enter the details below to create a new user."
              : "Update the user details below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  type="text"
                  value={name}
                  placeholder="Enter name"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="Enter email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <div className="col-span-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Select Role"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setRole("admin")}>
                      Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setRole("user")}>
                      User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{mode === "create" ? "Create" : "Update"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

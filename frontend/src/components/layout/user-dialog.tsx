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
import clsx from 'clsx';
import { toast } from "sonner";

interface UserDialogProps {
  mode: "create" | "update";
  initialData?: User;
  onUserCreated?: () => void;
}

export function UserDialog({
  mode,
  initialData,
  onUserCreated
}: UserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("admin");
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

    // Validate input using the schema (omit id and createdAt since they're set by the server)
    const result = userSchema
      .omit({ id: true, createdAt: true })
      .safeParse({ name, email, role });

    if (!result.success) {
      // Extract error messages from Zod and set them in state.
      const fieldErrors: { name?: string; email?: string; role?: string } = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as "name" | "email" | "role";
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const validatedData = result.data;
    try {
      let user: User;
      if (mode === "create") {
        user = await userService.createUser(validatedData);
      } else {
        if (!initialData?.id) {
          throw new Error("Missing user ID for update.");
        }
        user = await userService.updateUser(initialData!.id, validatedData);
      }
      const toastTitle = mode === "create" ? "User has been created" : "User has been updated";
      toast(toastTitle, {
        description: `${user.name}(${user.role}) - ${user.email}`,
      });

      if (onUserCreated) {
        onUserCreated();
      }

      // Reset form if in create mode.
      if (mode === "create") {
        setName("");
        setEmail("");
        setRole("admin");
      }
      setOpen(false);
      setName("");
      setEmail("");
      setRole("admin");
    } catch (error: any) {
      console.error("Submission error:", error);
      // Optionally, handle backend errors here as needed.
      // For example, you might extract a general error message and display it.
      setErrors({ name: "An error occurred during submission." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={mode === "create" ? "default" : "outline"} 
          size="sm" 
          className={clsx({
            "justify-start text-left w-full border-none px-2 py-2 font-normal h-8 rounded-sm": mode === "update"
          })}
        >
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
              <Label htmlFor="name" className="text-right ">Name</Label>
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
                      {role.charAt(0).toUpperCase() + role.slice(1)}
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

import React, { useEffect, useState } from "react";
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
import clsx from "clsx";
import { toast } from "sonner";

interface UserDialogProps {
  mode: "create" | "update";
  initialData?: User;
  onUserCreated?: () => void;
}

export function UserDialog({ mode, initialData, onUserCreated }: UserDialogProps) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("admin");
  const [errors, setErrors] = useState<{ name?: string; email?: string; role?: string }>({});
  const [open, setOpen] = useState(false);

  // Auto-fill form with record data
  useEffect(() => {
    if (mode === "update" && initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setRole(initialData.role);
    }
  }, [mode, initialData]);

  // Clear form
  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("admin");
  };

  // Form submit handler with Zod validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = userSchema.omit({ id: true, createdAt: true }).safeParse({ name, email, role });
    if (!result.success) {
      // Build error messages from Zod error paths
      const fieldErrors: { name?: string; email?: string; role?: string } = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as "name" | "email" | "role";
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      let user: User;
      if (mode === "create") {
        user = await userService.createUser(result.data);
      } else {
        if (!initialData?.id) throw new Error("Missing user ID for update.");
        user = await userService.updateUser(initialData.id, result.data);
      }

      toast(mode === "create" ? "User has been created" : "User has been updated", {
        description: `${user.name}(${user.role}) - ${user.email}`,
      });

      onUserCreated?.();
      resetForm();
      setOpen(false);
    } catch (error: any) {
      const errorMessage = error.response.data.error[0].message;
      console.log(errorMessage)
      if (errorMessage) {
        toast(mode === "create" ? "Fail to create" : "Fail to update", {
          description: errorMessage
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={mode === "create" ? "default" : "outline"}
          size="sm"
          className={clsx({
            "justify-start text-left w-full border-none px-2 py-2 font-normal h-8 rounded-sm": mode === "update",
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
            {/* Name Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  type="text"
                  value={name}
                  placeholder="Enter name"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="Enter email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Role Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <div className="col-span-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setRole("admin")}>Admin</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setRole("user")}>User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
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

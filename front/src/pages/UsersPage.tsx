import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClient } from "@/services/api";
import { components } from "@/types/api.d";

type User = components["schemas"]["Consumer"];

const availableRoles = ["ROLE_ADMIN", "ROLE_USER"];

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"ROLE_ADMIN" | "ROLE_USER">(
    "ROLE_USER",
  );

  useEffect(() => {
    const fetchUsers = async () => {
      const client = await getClient();
      const response = await client.api_consumers_get_collection();
      if (response.data) {
        // @ts-ignore
        setUsers(response.data as User[]);
      }
    };
    fetchUsers();
  }, []);

  const handleCreateNewUser = () => {
    setCurrentUser(null);
    setNewEmail("");
    setNewName("");
    setNewRole("ROLE_USER");
    setIsFormDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setNewEmail(user.contactEmail || "");
    setNewName(user.name || "");
    // @ts-ignore
    setNewRole(user.roles[0] || "ROLE_USER");
    setIsFormDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (currentUser) {
      const client = await getClient();
      await client.api_consumers_id_delete({
        id: String(currentUser.id),
      });
      setUsers(users.filter((usr) => usr.id !== currentUser.id));
      setIsDeleteDialogOpen(false);
      setCurrentUser(null);
    }
  };

  const handleSubmitForm = async () => {
    const client = await getClient();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        contactEmail: newEmail,
        name: newName,
        roles: [newRole],
      };
      // @ts-ignore
      await client.api_consumers_id_patch(
        {
          id: String(currentUser.id),
        },
        updatedUser,
      );
      setUsers(
        users.map((usr) => (usr.id === currentUser.id ? updatedUser : usr)),
      );
    } else {
      const newUser = {
        contactEmail: newEmail,
        name: newName,
        roles: [newRole],
      };
      const response = await client.api_consumers_post(null, newUser, null);
      // @ts-ignore
      setUsers([...users, response.data]);
    }
    setIsFormDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Users Management</h2>
        <Button onClick={handleCreateNewUser}>Create New User</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.contactEmail}</TableCell>
              <TableCell>{user.roles ? user.roles[0] : ""}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditUser(user)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUser(user)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentUser ? "Edit User" : "Create New User"}
            </DialogTitle>
            <DialogDescription>
              {currentUser
                ? "Edit the details of this user account."
                : "Create a new user account with assigned roles and permissions."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userName" className="text-right">
                Name
              </Label>
              <Input
                id="userName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userEmail" className="text-right">
                Email
              </Label>
              <Input
                id="userEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userRole" className="text-right">
                Role
              </Label>
              <Select
                value={newRole}
                onValueChange={(value) =>
                  setNewRole(value as "ROLE_ADMIN" | "ROLE_USER")
                }
              >
                <SelectTrigger id="userRole" className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitForm}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              user account for{" "}
              <span className="font-semibold">{currentUser?.name}</span> (
              {currentUser?.contactEmail}).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

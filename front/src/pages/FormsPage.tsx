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
import { Link } from "react-router-dom";
import { getClient } from "@/services/api";
import { components } from "@/types/api.d";

type FormDefinition = components["schemas"]["FormDefinition"];

export const FormsPage: React.FC = () => {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormDefinition | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      const client = await getClient();
      const response = await client.api_form_definitions_get_collection();
      if (response.data) {
        // @ts-ignore 
        setForms(response.data as FormDefinition[]);
      }
    };
    fetchForms();
  }, []);

  const handleDeleteForm = (form: FormDefinition) => {
    setFormToDelete(form);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (formToDelete) {
      const client = await getClient();
      await client.api_form_definitions_id_delete({
        id: String(formToDelete.id),
      });
      setForms(forms.filter((f) => f.id !== formToDelete.id));
      setIsDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Forms Management</h2>
        <Link to="/forms/create">
          <Button>Create New Form</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Webhook URL</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id}>
              <TableCell className="font-medium">{form.code}</TableCell>
              <TableCell>{form.webhookUrl}</TableCell>
              <TableCell className="text-right">
                <Link to={`/forms/${form.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteForm(form)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              form <span className="font-semibold">{formToDelete?.code}</span>{" "}
              and all its associated data.
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

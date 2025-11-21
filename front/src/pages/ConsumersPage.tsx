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

type Consumer = components["schemas"]["Consumer"];
type FormDefinition = components["schemas"]["FormDefinition"];

export const ConsumersPage: React.FC = () => {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentConsumer, setCurrentConsumer] = useState<Consumer | null>(null);

  const [newFormId, setNewFormId] = useState<string | undefined>(undefined);
  const [newAllowedHosts, setNewAllowedHosts] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");

  const [selectedFormFilter, setSelectedFormFilter] = useState<string>("all");

  useEffect(() => {
    const fetchConsumers = async () => {
      const client = await getClient();
      const response = await client.api_consumers_get_collection();
      if (response.data) {
        setConsumers(response.data as Consumer[]);
      }
    };

    const fetchForms = async () => {
      const client = await getClient();
      const response = await client.api_form_definitions_get_collection();
      if (response.data) {
        setForms(response.data as FormDefinition[]);
      }
    };

    fetchConsumers();
    fetchForms();
  }, []);

  const filteredConsumers = consumers.filter(
    (consumer) =>
      selectedFormFilter === "all" ||
      consumer.id === Number(selectedFormFilter),
  );

  const handleCreateNewConsumer = () => {
    setCurrentConsumer(null);
    setNewFormId(undefined);
    setNewAllowedHosts("");
    setNewContactEmail("");
    setIsFormDialogOpen(true);
  };

  const handleEditConsumer = (consumer: Consumer) => {
    setCurrentConsumer(consumer);
    setNewFormId(String(consumer.id));
    setNewAllowedHosts(consumer.allowedOrigins?.join(",") || "");
    setNewContactEmail(consumer.contactEmail || "");
    setIsFormDialogOpen(true);
  };

  const handleDeleteConsumer = (consumer: Consumer) => {
    setCurrentConsumer(consumer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (currentConsumer) {
      const client = await getClient();
      await client.api_consumers_id_delete({
        id: String(currentConsumer.id),
      });
      setConsumers(consumers.filter((con) => con.id !== currentConsumer.id));
      setIsDeleteDialogOpen(false);
      setCurrentConsumer(null);
    }
  };

  const handleSubmitForm = async () => {
    const client = await getClient();
    if (currentConsumer) {
      // Edit existing consumer
      const updatedConsumer = {
        ...currentConsumer,
        formId: newFormId,
        allowedOrigins: newAllowedHosts.split(","),
        contactEmail: newContactEmail,
      };
      await client.api_consumers_id_patch(
        {
          id: String(currentConsumer.id),
        },
        updatedConsumer,
      );
      setConsumers(
        consumers.map((con) =>
          con.id === currentConsumer.id ? updatedConsumer : con,
        ),
      );
    } else {
      // Create new consumer
      const newConsumer = {
        formId: newFormId,
        allowedOrigins: newAllowedHosts.split(","),
        contactEmail: newContactEmail,
      };
      const response = await client.api_consumers_post(null, newConsumer, null);
      // @ts-ignore
      setConsumers([...consumers, response.data]);
    }
    setIsFormDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Consumers Management</h2>
        <Button onClick={handleCreateNewConsumer}>Create New Consumer</Button>
      </div>

      {/* Filter by Form */}
      <div className="flex items-center space-x-2">
        <Label htmlFor="consumerFormFilter">Filter by Form:</Label>
        <Select
          value={selectedFormFilter}
          onValueChange={setSelectedFormFilter}
        >
          <SelectTrigger id="consumerFormFilter" className="w-[180px]">
            <SelectValue placeholder="All Forms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            {forms.map((form) => (
              <SelectItem key={form.id} value={String(form.id)}>
                {form.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Form</TableHead>
            <TableHead>Allowed Hosts</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredConsumers.map((consumer) => (
            <TableRow key={consumer.id}>
              <TableCell className="font-medium">
                {forms.find((f) => f.id === consumer.id)?.code}
              </TableCell>
              <TableCell>{consumer.allowedOrigins?.join(", ")}</TableCell>
              <TableCell>{consumer.contactEmail}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditConsumer(consumer)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteConsumer(consumer)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Consumer Create/Edit Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentConsumer ? "Edit Consumer" : "Create New Consumer"}
            </DialogTitle>
            <DialogDescription>
              {currentConsumer
                ? "Edit the details of this API consumer."
                : "Create a new consumer to link forms to external services."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="formId" className="text-right">
                Associated Form
              </Label>
              <Select
                // @ts-ignore
                value={newFormId}
                onValueChange={setNewFormId}
              >
                <SelectTrigger id="formId" className="col-span-3">
                  <SelectValue placeholder="Select a form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((form) => (
                    <SelectItem key={form.id} value={String(form.id)}>
                      {form.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="allowedHosts" className="text-right">
                Allowed Hosts
              </Label>
              <Input
                id="allowedHosts"
                value={newAllowedHosts}
                onChange={(e) => setNewAllowedHosts(e.target.value)}
                className="col-span-3"
                placeholder="e.g., example.com, *.another.org"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactEmail" className="text-right">
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="col-span-3"
              />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              consumer for{" "}
              <span className="font-semibold">
                {
                  // @ts-ignore
                  forms.find((f) => f.id === currentConsumer?.formId)?.code
                }
              </span>{" "}
              ({currentConsumer?.contactEmail}).
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

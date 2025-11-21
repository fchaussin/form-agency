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
import { Textarea } from "@/components/ui/textarea";
import { getClient } from "@/services/api";
import { components } from "@/types/api.d";
import { Trash2 } from "lucide-react";

type FieldTypeRead = components["schemas"]["FieldType-field_type.read"];
type FieldTypeWrite = components["schemas"]["FieldType-field_type.write"];

export const FieldTypesPage: React.FC = () => {
  const [fieldTypes, setFieldTypes] = useState<FieldTypeRead[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentFieldType, setCurrentFieldType] = useState<FieldTypeRead | null>(
    null,
  );

  // Form state
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [dataType, setDataType] = useState<FieldTypeWrite["dataType"]>("string");
  const [component, setComponent] = useState("");
  const [assets, setAssets] = useState("");
  const [initHook, setInitHook] = useState("");
  const [configurationSchema, setConfigurationSchema] = useState("");
  const [defaultConfiguration, setDefaultConfiguration] = useState("");
  const [presentationType, setPresentationType] =
    useState<FieldTypeWrite["presentationType"]>("text");
  const [presentationConfiguration, setPresentationConfiguration] = useState("");

  useEffect(() => {
    const fetchFieldTypes = async () => {
      const client = await getClient();
      const response = await client.api_field_types_get_collection();
      if (response.data) {
        setFieldTypes(response.data as FieldTypeRead[]);
      }
    };
    fetchFieldTypes();
  }, []);

  const resetForm = () => {
    setSlug("");
    setLabel("");
    setIcon("");
    setDescription("");
    setDataType("string");
    setComponent("");
    setAssets("");
    setInitHook("");
    setConfigurationSchema("");
    setDefaultConfiguration("");
    setPresentationType("text");
    setPresentationConfiguration("");
  };

  const handleCreateNewFieldType = () => {
    setCurrentFieldType(null);
    resetForm();
    setIsFormDialogOpen(true);
  };

  const handleEditFieldType = (fieldType: FieldTypeRead) => {
    setCurrentFieldType(fieldType);
    setSlug(fieldType.slug);
    setLabel(fieldType.label);
    setIcon(fieldType.icon || "");
    setDescription(fieldType.description || "");
    setDataType(fieldType.dataType);
    setComponent(fieldType.component);
    setAssets(fieldType.assets?.join(",\n") || "");
    setInitHook(fieldType.initHook || "");
    setConfigurationSchema(fieldType.configurationSchema?.join(",\n") || "");
    setDefaultConfiguration(fieldType.defaultConfiguration?.join(",\n") || "");
    setPresentationType(fieldType.presentationType);
    setPresentationConfiguration(
      fieldType.presentationConfiguration?.join(",\n") || "",
    );
    setIsFormDialogOpen(true);
  };

  const handleDeleteFieldType = (fieldType: FieldTypeRead) => {
    setCurrentFieldType(fieldType);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (currentFieldType && currentFieldType.id) {
      const client = await getClient();
      await client.api_field_types_id_delete({
        id: String(currentFieldType.id),
      });
      setFieldTypes(fieldTypes.filter((ft) => ft.id !== currentFieldType.id));
      setIsDeleteDialogOpen(false);
      setCurrentFieldType(null);
    }
  };

  const handleSubmitForm = async () => {
    const client = await getClient();

    const payload: FieldTypeWrite = {
      slug,
      label,
      icon: icon || null,
      description: description || null,
      dataType,
      component,
      assets: assets ? assets.split(/[, \n]+/).filter(Boolean) : null,
      initHook: initHook || null,
      configurationSchema: configurationSchema
        ? configurationSchema.split(/[, \n]+/).filter(Boolean)
        : [],
      defaultConfiguration: defaultConfiguration
        ? defaultConfiguration.split(/[, \n]+/).filter(Boolean)
        : [],
      presentationType,
      presentationConfiguration: presentationConfiguration
        ? presentationConfiguration.split(/[, \n]+/).filter(Boolean)
        : [],
    };

    if (currentFieldType && currentFieldType.id) {
      const response = await client.api_field_types_id_put(
        { id: String(currentFieldType.id) },
        payload,
      );
      if (response.data) {
        setFieldTypes(
          fieldTypes.map((ft) =>
            ft.id === currentFieldType.id ? response.data : ft,
          ),
        );
      }
    } else {
      const response = await client.api_field_types_post(null, payload, null);
      if (response.data) {
        setFieldTypes([...fieldTypes, response.data]);
      }
    }
    setIsFormDialogOpen(false);
    setCurrentFieldType(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Field Types Management</h2>
        <Button onClick={handleCreateNewFieldType}>
          Create New Field Type
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Label</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Data Type</TableHead>
            <TableHead>Component</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fieldTypes.map((fieldType) => (
            <TableRow key={fieldType.id}>
              <TableCell className="font-medium">{fieldType.label}</TableCell>
              <TableCell>{fieldType.slug}</TableCell>
              <TableCell>{fieldType.dataType}</TableCell>
              <TableCell>{fieldType.component}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditFieldType(fieldType)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteFieldType(fieldType)}
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[825px]">
          <DialogHeader>
            <DialogTitle>
              {currentFieldType ? "Edit Field Type" : "Create New Field Type"}
            </DialogTitle>
            <DialogDescription>
              {currentFieldType
                ? "Edit the details of the field type."
                : "Create a new field type for use in forms."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Label
              </Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="col-span-3"
              />
            </div>
            {/* ... other fields ... */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataType" className="text-right">
                Data Type
              </Label>
              <Select
                value={dataType}
                onValueChange={(v) => setDataType(v as any)}
              >
                <SelectTrigger id="dataType" className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "string",
                    "integer",
                    "float",
                    "boolean",
                    "array",
                    "json",
                    "date_time",
                  ].map((dt) => (
                    <SelectItem key={dt} value={dt}>
                      {dt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="component" className="text-right">
                Component
              </Label>
              <Input
                id="component"
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="presentationType" className="text-right">
                Presentation Type
              </Label>
              <Select
                value={presentationType}
                onValueChange={(v) => setPresentationType(v as any)}
              >
                <SelectTrigger id="presentationType" className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "text",
                    "html",
                    "date",
                    "datetime",
                    "bool",
                    "image",
                    "file",
                    "hidden",
                  ].map((pt) => (
                    <SelectItem key={pt} value={pt}>
                      {pt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="assets" className="text-right pt-2">
                Assets
              </Label>
              <Textarea
                id="assets"
                value={assets}
                onChange={(e) => setAssets(e.target.value)}
                className="col-span-3"
                placeholder="Enter URLs separated by commas or new lines"
              />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="configurationSchema" className="text-right pt-2">
                Configuration Schema
              </Label>
              <Textarea
                id="configurationSchema"
                value={configurationSchema}
                onChange={(e) => setConfigurationSchema(e.target.value)}
                className="col-span-3"
                placeholder="Enter key-value pairs separated by commas or new lines"
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the field type{" "}
              <span className="font-semibold">{currentFieldType?.label}</span>.
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

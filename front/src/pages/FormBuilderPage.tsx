import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getClient } from "@/services/api";
import { components } from "@/types/api.d";
import { fieldComponentRegistry } from "@/components/form-fields";
import { PlusCircle, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { AxiosResponse } from "axios";

type FieldInstance = components["schemas"]["FieldInstance"];
type LocalFieldInstance = Omit<FieldInstance, "id"> & { id?: string | number };
type FieldType = components["schemas"]["FieldType-field_type.read"];
type FormDefinition = components["schemas"]["FormDefinition"];

const SortableField: React.FC<{
  field: LocalFieldInstance;
  fieldTypes: FieldType[];
  onEdit: (fieldId: any) => void;
  onDelete: (fieldId: any) => void;
}> = ({ field, fieldTypes, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const fieldType = fieldTypes.find(
    (ft) => `/api/field_types/${ft.id}` === field.component,
  );
  const FieldComponent = fieldType
    ? fieldComponentRegistry[fieldType.component]
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between border p-3 rounded-md bg-gray-50 cursor-grab"
    >
      <div className="flex-grow">
        {FieldComponent ? (
          <FieldComponent field={field} />
        ) : (
          <div>
            <Label>{field.label}</Label>
            <div className="text-xs text-gray-400 mt-1">
              Type: {fieldType?.component || "Unknown"} (ID: {field.id})
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center ml-4">
        <Button variant="ghost" size="sm" onClick={() => onEdit(field.id!)}>
          Configure
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(field.id!)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const FormBuilderPage: React.FC = () => {
  const { formId } = useParams<{ formId?: string }>();
  const [fields, setFields] = useState<LocalFieldInstance[]>([]);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [formName, setFormName] = useState("New Form");
  const [selectedField, setSelectedField] = useState<LocalFieldInstance | null>(
    null,
  );
  const [deletedFieldIds, setDeletedFieldIds] = useState<number[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    const fetchFieldTypes = async () => {
      const client = await getClient();
      const response = await client.api_field_types_get_collection();
      if (response.data) {
        setFieldTypes(response.data as FieldType[]);
      }
    };
    fetchFieldTypes();

    if (formId) {
      const fetchForm = async () => {
        const client = await getClient();
        const response = await client.api_form_definitions_id_get({
          id: formId,
        });
        if (response.data) {
          const formDefinition = response.data as FormDefinition;
          setFormDef(formDefinition);
          setFormName(formDefinition.code || "New Form");
          if (formDefinition.fields) {
            const fieldInstancesPromises = formDefinition.fields!.map(
              (fieldIri) =>
                client
                  .get(fieldIri)
                  .then((res: AxiosResponse<FieldInstance>) => res.data),
            );
            const fieldInstances = await Promise.all(fieldInstancesPromises);
            setFields(
              fieldInstances.sort(
                (a: FieldInstance, b: FieldInstance) => a.position - b.position,
              ),
            );
          }
        }
      };
      fetchForm();
    }
  }, [formId]);

  const addField = (fieldType: FieldType) => {
    const newField: LocalFieldInstance = {
      id: `tmp-${uuidv4()}`,
      component: `/api/field_types/${fieldType.id}`,
      label: fieldType.label,
      name: `${fieldType.slug}_${Date.now()}`,
      position: fields.length,
      validationRules: [],
      uiOptions: fieldType.defaultConfiguration || [],
      renderStrategy: "default",
      renderOptions: [],
    };
    setFields((prev) => [...prev, newField]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return items;
        }

        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        return reorderedItems.map((item, index) => ({
          ...item,
          position: index,
        }));
      });
    }
  };

  const handleFieldEdit = (fieldId: any) => {
    const fieldToEdit = fields.find((f) => f.id === fieldId);
    if (fieldToEdit) {
      setSelectedField(fieldToEdit);
    }
  };

  const handleDeleteField = (fieldId: any) => {
    if (typeof fieldId === "number") {
      setDeletedFieldIds((prev) => [...prev, fieldId]);
    }
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!selectedField) return;
    const { name, value } = e.target;
    setSelectedField({
      ...selectedField,
      [name]: value,
    });
  };

  const handleSaveFieldConfig = () => {
    if (selectedField) {
      setFields(
        fields.map((f) => (f.id === selectedField.id ? selectedField : f)),
      );
      setSelectedField(null);
    }
  };

  const saveForm = async () => {
    const client = await getClient();
    let currentFormDef = formDef;

    try {
      if (!currentFormDef) {
        const newForm = { code: formName };
        const response = await client.api_form_definitions_post(newForm);
        currentFormDef = response.data as FormDefinition;
        setFormDef(currentFormDef);
      } else if (formName !== currentFormDef.code) {
        const response = await client.api_form_definitions_id_patch(
          {
            id: String(currentFormDef.id),
          },
          { code: formName },
        );
        currentFormDef = response.data as FormDefinition;
        setFormDef(currentFormDef);
      }

      await Promise.all(
        deletedFieldIds.map((id) =>
          client.api_field_instances_id_delete({ id: String(id) }),
        ),
      );
      setDeletedFieldIds([]);

      const savedFields = await Promise.all(
        fields.map(async (field) => {
          const { id, ...payload } = {
            ...field,
            form: `/api/form_definitions/${currentFormDef!.id}`,
          };

          if (typeof field.id === "string" && field.id.startsWith("tmp-")) {
            const response = await client.api_field_instances_post(payload);
            return response.data as FieldInstance;
          } else {
            const response = await client.api_field_instances_id_patch(
              { id: String(field.id) },
              payload as any,
            );
            return response.data as FieldInstance;
          }
        }),
      );

      setFields(
        savedFields.sort(
          (a: FieldInstance, b: FieldInstance) => a.position - b.position,
        ),
      );

      alert("Form saved successfully!");
    } catch (error: any) {
      console.error("Failed to save form:", error.response?.data || error);
      alert("Error saving form. Check console for details.");
    }
  };

  const publishForm = () => {
    console.log("Publishing form:", {
      formId,
      formName,
      fields,
    });
    alert("Form published!");
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <h2 className="text-2xl font-semibold">
            {formId ? `Edit Form: ${formName}` : "Create New Form"}
          </h2>
          <div className="space-x-2">
            <Button variant="outline" onClick={saveForm}>
              Save Draft
            </Button>
            <Button onClick={publishForm}>Publish Form</Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6 flex-1 min-h-0 p-4">
          {/* Field Types Sidebar */}
          <div className="w-[250px] flex-shrink-0 bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-4">Field Types</h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              {fieldTypes.map((ft) => (
                <div
                  key={ft.id}
                  className="flex items-center justify-between bg-white p-2 rounded-md border"
                >
                  <span>{ft.label}</span>
                  <Button variant="ghost" size="sm" onClick={() => addField(ft)}>
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Preview Area */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-lg flex flex-col h-full">
            <h3 className="text-xl font-semibold mb-4">Form Preview</h3>
            <Input
              type="text"
              className="text-3xl font-bold mb-4 w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />

            <SortableContext
              items={fields.map((f) => f.id!)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 min-h-[200px] border-dashed border-2 p-4 rounded-md flex-1 overflow-y-auto">
                {fields.length === 0 && (
                  <p className="text-center text-gray-500">
                    Click the [+] button on the left to add fields.
                  </p>
                )}
                {fields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    fieldTypes={fieldTypes}
                    onEdit={handleFieldEdit}
                    onDelete={handleDeleteField}
                  />
                ))}
              </div>
            </SortableContext>

            {selectedField && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow-inner space-y-4">
                <h4 className="text-lg font-semibold">
                  Configure Field: {selectedField.label}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fieldName">Name (for submission data)</Label>
                    <Input
                      id="fieldName"
                      name="name"
                      value={selectedField.name || ""}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fieldLabel">Label</Label>
                    <Input
                      id="fieldLabel"
                      name="label"
                      value={selectedField.label || ""}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                    <Input
                      id="fieldPlaceholder"
                      name="placeholder"
                      value={
                        (selectedField.uiOptions
                          ?.filter(Boolean)
                          .find((o) => o!.startsWith("placeholder:"))
                          ?.split("placeholder:")[1]) || ""
                      }
                      onChange={(e) => {
                        if (!selectedField) return;
                        const otherOptions =
                          selectedField.uiOptions?.filter(
                            (o) => !o?.startsWith("placeholder:"),
                          ) || [];
                        setSelectedField({
                          ...selectedField,
                          uiOptions: [
                            ...otherOptions,
                            `placeholder:${e.target.value}`,
                          ],
                        });
                      }}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="fieldRequired"
                      checked={
                        selectedField.validationRules?.includes("required") ||
                        false
                      }
                      onCheckedChange={(checked) => {
                        if (!selectedField) return;
                        const otherRules =
                          selectedField.validationRules?.filter(
                            (r) => r !== "required",
                          ) || [];
                        setSelectedField({
                          ...selectedField,
                          validationRules: checked
                            ? [...otherRules, "required"]
                            : otherRules,
                        });
                      }}
                    />
                    <Label htmlFor="fieldRequired">Required</Label>
                  </div>
                  <div>
                    <Label htmlFor="renderStrategy">Render Strategy</Label>
                    <Input
                      id="renderStrategy"
                      name="renderStrategy"
                      value={selectedField.renderStrategy || ""}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="renderOptions">Render Options</Label>
                    <Input
                      id="renderOptions"
                      name="renderOptions"
                      value={selectedField.renderOptions?.join(",") || ""}
                      onChange={(e) => {
                          if (!selectedField) return;
                          setSelectedField({
                              ...selectedField,
                              renderOptions: e.target.value ? e.target.value.split(',').map(s => s.trim()) : [],
                          });
                      }}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveFieldConfig}>Apply Changes</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
};
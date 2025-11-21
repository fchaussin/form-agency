import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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

type FieldInstance = components["schemas"]["FieldInstance"];
type FieldType = components["schemas"]["FieldType"];
type FormDefinition = components["schemas"]["FormDefinition"];

const SortableField: React.FC<{
  field: FieldInstance;
  onEdit: (fieldId: number) => void;
}> = ({ field, onEdit }) => {
  const { attributes, setNodeRef, transform, transition } = useSortable({
    id: field.id!,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center justify-between border p-3 rounded-md bg-gray-50 cursor-grab"
    >
      <div>
        <Label>{field.label}</Label>
        {field.type === "text" && (
          <Input
            type="text"
            placeholder="placeholder"
            disabled
            className="w-full"
          />
        )}
        {field.type === "email" && (
          <Input
            type="email"
            placeholder="placeholder"
            disabled
            className="w-full"
          />
        )}
        {field.type === "textarea" && (
          <Textarea placeholder="placeholder" disabled className="w-full" />
        )}
        <div className="text-xs text-gray-400 mt-1">
          Type: {field.type}(ID: {field.id})
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onEdit(field.id!)}>
        Configure
      </Button>
    </div>
  );
};

export const FormBuilderPage: React.FC = () => {
  const { formId } = useParams<{ formId?: string }>();
  const [fields, setFields] = useState<FieldInstance[]>([]);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [formName, setFormName] = useState("New Form");
  const [selectedField, setSelectedField] = useState<FieldInstance | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    const fetchFieldTypes = async () => {
      const client = await getClient();
      const response = await client.api_field_types_get_collection();
      if (response.data && Array.isArray(response.data)) {
        setFieldTypes(response.data);
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
          setFormDef(response.data as FormDefinition);
          setFormName((response.data as FormDefinition).code || "New Form");
          if ((response.data as FormDefinition).fields) {
            const fieldInstancesPromises = (
              response.data as FormDefinition
            ).fields!.map((fieldIri) => client.get(fieldIri));
            const fieldInstancesResponses = await Promise.all(
              fieldInstancesPromises,
            );
            const fieldInstances = fieldInstancesResponses.map(
              (res) => res.data as FieldInstance,
            );
            setFields(fieldInstances);
          }
        }
      };
      fetchForm();
    }
  }, [formId]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = (type: string) => {
    const newField: FieldInstance = {
      id: Date.now(),
      type,
      label: `New ${type} Field`,
      name: `new_${type}_${Date.now()}`,
    };
    setFields((prev) => [...prev, newField]);
  };

  const handleFieldEdit = (fieldId: number) => {
    const fieldToEdit = fields.find((f) => f.id === fieldId);
    if (fieldToEdit) {
      setSelectedField(fieldToEdit);
    }
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

    if (!currentFormDef) {
      const newForm = {
        code: formName,
      };
      const response = await client.api_form_definitions_post(
        null,
        newForm,
        null,
      );
      currentFormDef = response.data as FormDefinition;
      setFormDef(currentFormDef);
    } else if (formName !== currentFormDef.code) {
      const updatedForm = { ...currentFormDef, code: formName };
      const response = await client.api_form_definitions_id_patch(
        {
          id: String(currentFormDef.id),
        },
        updatedForm,
      );
      currentFormDef = response.data as FormDefinition;
      setFormDef(currentFormDef);
    }

    const savedFields = await Promise.all(
      fields.map(async (field) => {
        const fieldPayload = {
          ...field,
          form: `/api/form_definitions/${currentFormDef!.id}`,
        };
        if (String(field.id).startsWith("field-")) {
          delete fieldPayload.id;
          const response = await client.api_field_instances_post(
            null,
            fieldPayload,
            null,
          );
          return response.data as FieldInstance;
        } else {
          const response = await client.api_field_instances_id_patch(
            {
              id: String(field.id),
            },
            fieldPayload,
          );
          return response.data as FieldInstance;
        }
      }),
    );
    setFields(savedFields);

    alert("Form saved!");
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
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-gray-50 p-4 rounded-lg shadow-sm space-y-4">
          <h3 className="text-lg font-semibold mb-4">Field Types</h3>
          {fieldTypes.map((ft) => (
            <Button
              key={ft.id}
              variant="secondary"
              className="w-full"
              onClick={() => addField(ft.libraryName!)}
            >
              {ft.libraryName}
            </Button>
          ))}
        </div>

        <div className="col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Form Preview</h3>
          <Input
            type="text"
            className="text-3xl font-bold mb-4 w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id!)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 min-h-[200px] border-dashed border-2 p-4 rounded-md">
                {fields.length === 0 && (
                  <p className="text-center text-gray-500">
                    Drag fields here or click buttons on the left to add.
                  </p>
                )}
                {fields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    onEdit={handleFieldEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {selectedField && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow-inner space-y-4">
              <h4 className="text-lg font-semibold">
                Configure Field: {selectedField.label}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={selectedField.uiOptions?.join("") || ""}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="fieldRequired"
                    checked={(selectedField.validationRules || []).includes(
                      "required",
                    )}
                    onCheckedChange={(checked) => {
                      const rules = selectedField.validationRules || [];
                      const newRules = checked
                        ? [...rules, "required"]
                        : rules.filter((r) => r !== "required");
                      setSelectedField({
                        ...selectedField,
                        validationRules: newRules,
                      });
                    }}
                  />
                  <Label htmlFor="fieldRequired">Required</Label>
                </div>
              </div>
              <Button onClick={handleSaveFieldConfig}>Apply Changes</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

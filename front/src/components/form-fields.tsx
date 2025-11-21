import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { components } from "@/types/api";

type FieldInstance = components["schemas"]["FieldInstance"];
type LocalFieldInstance = Omit<FieldInstance, "id"> & { id?: string | number };

interface FieldProps {
  field: LocalFieldInstance;
}

const TextField: React.FC<FieldProps> = ({ field }) => {
  const placeholder =
    (
      field.uiOptions?.filter(Boolean).find((o) => o!.startsWith("placeholder:")) || ""
    ).split("placeholder:")[1] || "";
  return (
    <div>
      <Label htmlFor={field.name}>{field.label}</Label>
      <Input
        id={field.name}
        name={field.name}
        placeholder={placeholder}
        required={field.validationRules?.includes("required")}
        disabled
      />
    </div>
  );
};

const EmailField: React.FC<FieldProps> = ({ field }) => {
  const placeholder =
    (
      field.uiOptions?.filter(Boolean).find((o) => o!.startsWith("placeholder:")) || ""
    ).split("placeholder:")[1] || "";
  return (
    <div>
      <Label htmlFor={field.name}>{field.label}</Label>
      <Input
        type="email"
        id={field.name}
        name={field.name}
        placeholder={placeholder}
        required={field.validationRules?.includes("required")}
        disabled
      />
    </div>
  );
};

const TextareaField: React.FC<FieldProps> = ({ field }) => {
  const placeholder =
    (
      field.uiOptions?.filter(Boolean).find((o) => o!.startsWith("placeholder:")) || ""
    ).split("placeholder:")[1] || "";
  return (
    <div>
      <Label htmlFor={field.name}>{field.label}</Label>
      <Textarea
        id={field.name}
        name={field.name}
        placeholder={placeholder}
        required={field.validationRules?.includes("required")}
        disabled
      />
    </div>
  );
};

export const fieldComponentRegistry: {
  [key: string]: React.ComponentType<FieldProps>;
} = {
  text: TextField,
  email: EmailField,
  textarea: TextareaField,
};

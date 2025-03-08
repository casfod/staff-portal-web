import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaPlus } from "react-icons/fa";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { Form } from "react-router-dom";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";

interface FormData {
  date: string;
  department: string;
  suggestedSupplier: string;
  requestedBy: string;
  address: string;
  finalDeliveryPoint: string;
  city: string;
  periodOfActivity: string;
  activityDescription: string;
  expenseChargedTo: string;
  accountCode: string;
  reviewedBy: string;
  approvedBy: string;
}

interface ItemGroup {
  description: string;
  frequency: number;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

const PurchaseRequesForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [itemGroup, setItemGroup] = useState<ItemGroup[]>([]);
  const [disabledStates, setDisabledStates] = useState<boolean[]>([]); // Separate state for disabled

  const addItem = () => {
    setItemGroup([
      ...itemGroup,
      {
        description: "",
        frequency: 0,
        quantity: 0,
        unit: "",
        unitCost: 0,
        total: 0,
      },
    ]);
    setDisabledStates([...disabledStates, false]); // Initialize disabled state for the new item
  };

  useEffect(() => {
    const updatedGroups = itemGroup.map((group) => ({
      ...group,
      total: parseFloat(
        (
          (group.frequency || 1) *
          (group.quantity || 1) *
          (group.unitCost || 0)
        ).toFixed(2)
      ), // Convert back to number
    }));
    setItemGroup(updatedGroups);
  }, [
    itemGroup.map((g) => g.frequency).join(","),
    itemGroup.map((g) => g.quantity).join(","),
    itemGroup.map((g) => g.unitCost).join(","),
  ]);

  const removeItem = (index: number) => {
    const newItems = itemGroup.filter((_, i) => i !== index);
    setItemGroup(newItems);
    const newDisabledStates = disabledStates.filter((_, i) => i !== index);
    setDisabledStates(newDisabledStates);
  };

  const handleChange = (
    index: number,
    field: keyof ItemGroup,
    value: string | number
  ) => {
    const newItems = [...itemGroup];
    newItems[index][field] = value as never;
    setItemGroup(newItems);
  };

  const handleEdit = (index: number) => {
    const newDisabledStates = [...disabledStates];
    newDisabledStates[index] = !newDisabledStates[index]; // Toggle disabled state
    setDisabledStates(newDisabledStates);
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Form Data:", data);
    console.log("Item Groups:", itemGroup);
    // Handle form submission
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Static inputs */}
      <Row>
        <FormRow label="Department *">
          <Input
            type="text"
            id="department"
            required
            {...register("department")}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow
          label="Suggested supplier *"
          error={errors?.suggestedSupplier?.message}
        >
          <Input
            placeholder=""
            id="suggestedSupplier"
            required
            {...register("suggestedSupplier")}
          />
        </FormRow>
        <FormRow label="Requested By *">
          <Input
            placeholder=""
            id="requestedBy"
            required
            {...register("requestedBy")}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Address *" error={errors?.address?.message}>
          <Input
            placeholder=""
            id="address"
            required
            {...register("address")}
          />
        </FormRow>
        <FormRow label="Final delivery point *">
          <Input
            placeholder=""
            id="finalDeliveryPoint"
            required
            {...register("finalDeliveryPoint")}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="City *">
          <Input placeholder="" id="city" required {...register("city")} />
        </FormRow>
        <FormRow
          label="Period of Activity *"
          error={errors?.periodOfActivity?.message}
        >
          <Input
            placeholder=""
            id="periodOfActivity"
            required
            {...register("periodOfActivity")}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow
          label="Activity Description"
          type="wide"
          error={errors?.activityDescription?.message}
        >
          <Input
            size={50}
            placeholder=""
            id="activityDescription"
            {...register("activityDescription")}
          />
        </FormRow>
      </Row>

      {/* Dynamic itemGroup */}
      <div className="flex flex-wrap justify-center gap-4 max-h-[450px] border-2 overflow-y-auto px-6 py-8 rounded-lg">
        {itemGroup.map((group, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 bg-white bg-opacity-90 border-2 w-[48%] p-6 mb-3 rounded-lg shadow-md"
          >
            <h4 className="text-gray-600 text-lg font-semibold">
              ITEM {index + 1}
            </h4>

            <FormRow label="Description *" type="wide">
              <Input
                placeholder=""
                inputSize={100}
                disabled={disabledStates[index]} // Use separate disabled state
                value={group.description}
                required
                onChange={(e) =>
                  handleChange(index, "description", e.target.value)
                }
              />
            </FormRow>

            <Row>
              <FormRow label="Frequency *" type="small">
                <Input
                  placeholder=""
                  inputSize={100}
                  type="number"
                  min="0"
                  disabled={disabledStates[index]} // Use separate disabled state
                  required
                  value={group.frequency}
                  onChange={(e) =>
                    handleChange(index, "frequency", e.target.value)
                  }
                />
              </FormRow>
              <FormRow label="Quantity *" type="small">
                <Input
                  placeholder=""
                  inputSize={100}
                  type="number"
                  min="0"
                  disabled={disabledStates[index]} // Use separate disabled state
                  value={group.quantity}
                  onChange={(e) =>
                    handleChange(index, "quantity", e.target.value)
                  }
                />
              </FormRow>
              <FormRow label="Unit" type="small">
                <Input
                  disabled={disabledStates[index]} // Use separate disabled state
                  value={group.unit}
                  placeholder=""
                  onChange={(e) => handleChange(index, "unit", e.target.value)}
                />
              </FormRow>
            </Row>

            <Row>
              <FormRow label="Unit Cost (₦) *" type="medium">
                <Input
                  type="number"
                  min="0"
                  disabled={disabledStates[index]} // Use separate disabled state
                  value={group.unitCost}
                  placeholder="123..."
                  onChange={(e) =>
                    handleChange(index, "unitCost", e.target.value)
                  }
                />
              </FormRow>
              <FormRow label="Total (₦) *" type="medium">
                <Input
                  type="number"
                  disabled={disabledStates[index]} // Use separate disabled state
                  value={group.total}
                  onChange={(e) => handleChange(index, "total", e.target.value)}
                />
              </FormRow>
            </Row>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="text-white bg-red-500 px-3 py-1 rounded-md hover:bg-red-600 transition-all"
                onClick={() => removeItem(index)}
              >
                Delete Item {index + 1}
              </button>
              <button
                type="button"
                className="text-white px-3 py-1 rounded-md bg-buttonColor hover:bg-buttonColorHover transition-all"
                onClick={() => handleEdit(index)}
              >
                {disabledStates[index] ? "Edit Item" : "Done"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 w-full">
        <Button type="button" onClick={addItem}>
          <FaPlus /> Add Item
        </Button>
        <span className="text-gray-700 font-bold">
          {itemGroup.length > 1
            ? itemGroup.length + " Items "
            : itemGroup.length + " Item "}
          Added
        </span>
      </div>

      <Row>
        <FormRow
          label="Expense Charged To *"
          type="medium"
          error={errors?.expenseChargedTo?.message}
        >
          <Input
            type="text"
            required
            id="expenseChargedTo"
            {...register("expenseChargedTo")}
          />
        </FormRow>
        <FormRow label="Account Code *" type="small">
          <Input
            type="text"
            required
            placeholder=""
            id="accountCode"
            {...register("accountCode")}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Reviewed By *" type="medium">
          <Input
            type="text"
            placeholder=""
            id="reviewedBy"
            required
            {...register("reviewedBy")}
          />
        </FormRow>
      </Row>

      <div className="flex justify-center w-full gap-4">
        <Button type="submit" size="medium">
          Save
        </Button>
        <Button type="submit" size="medium">
          Save And Send
        </Button>
      </div>
    </Form>
  );
};

export default PurchaseRequesForm;

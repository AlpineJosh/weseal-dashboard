import { useListbox } from "../listbox/listbox.context";

export const useOption = <TValue,>(value: TValue) => {
  const listbox = useListbox<TValue>();

  return {
    isSelected: listbox.selectedValue === value,
    isHighlighted: listbox.highlightedValue === value,
    select: () => listbox.setSelectedValue(value),
    highlight: () => listbox.setHighlightedValue(value),
  };
};

export const batch = {
  getDisplayId: (reference: string | null, entryDate: Date | null) => {
    return reference
      ? `${reference} (${entryDate?.toLocaleDateString()})`
      : `Entry Date: ${entryDate?.toLocaleDateString()}`;
  },
};

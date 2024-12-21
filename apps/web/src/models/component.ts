export const component = {
  encodeURLId: (id: string) => {
    return encodeURIComponent(id);
  },
  decodeURLId: (id: string) => {
    return decodeURIComponent(id);
  },
};

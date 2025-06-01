import { create } from "zustand";

interface EditModalStore {
  isOpen: boolean;
  listingId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}

const useEditModal = create<EditModalStore>((set) => ({
  isOpen: false,
  listingId: null,
  onOpen: (id: string) => set({ isOpen: true, listingId: id }),
  onClose: () => set({ isOpen: false, listingId: null }),
}));

export default useEditModal;

import { create } from "zustand";

interface ChatModalStore {
  isOpen: boolean;
  reservationId?: string;
  hostId?: string;
  hostName?: string;
  listingTitle?: string;
  onOpen: (data?: {
    reservationId?: string;
    hostId?: string;
    hostName?: string;
    listingTitle?: string;
  }) => void;
  onClose: () => void;
}

const useChatModal = create<ChatModalStore>((set) => ({
  isOpen: false,
  reservationId: undefined,
  hostId: undefined,
  hostName: undefined,
  listingTitle: undefined,
  onOpen: (data) => set({ 
    isOpen: true, 
    reservationId: data?.reservationId,
    hostId: data?.hostId,
    hostName: data?.hostName,
    listingTitle: data?.listingTitle,
  }),
  onClose: () => set({ 
    isOpen: false, 
    reservationId: undefined,
    hostId: undefined,
    hostName: undefined,
    listingTitle: undefined,
  }),
}));

export default useChatModal;


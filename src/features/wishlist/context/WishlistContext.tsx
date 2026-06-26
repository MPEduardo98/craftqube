// app/global/context/WishlistContext.tsx
"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";

export interface WishlistItem {
  productoId:   number;
  slug:         string;
  titulo:       string;
  precio:       number;
  imagenNombre: string | null;
  imagenAlt:    string | null;
  marca:        string | null;
}

interface WishlistState {
  items: WishlistItem[];
}

type Action =
  | { type: "ADD";     payload: WishlistItem }
  | { type: "REMOVE";  payload: { productoId: number } }
  | { type: "TOGGLE";  payload: WishlistItem }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; payload: WishlistItem[] };

function reducer(state: WishlistState, action: Action): WishlistState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.payload };
    case "ADD":
      if (state.items.some((i) => i.productoId === action.payload.productoId)) return state;
      return { items: [...state.items, action.payload] };
    case "REMOVE":
      return { items: state.items.filter((i) => i.productoId !== action.payload.productoId) };
    case "TOGGLE": {
      const exists = state.items.some((i) => i.productoId === action.payload.productoId);
      return {
        items: exists
          ? state.items.filter((i) => i.productoId !== action.payload.productoId)
          : [...state.items, action.payload],
      };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface WishlistContextValue {
  items:      WishlistItem[];
  totalItems: number;
  addItem:    (item: WishlistItem) => void;
  removeItem: (productoId: number) => void;
  toggleItem: (item: WishlistItem) => void;
  isWished:   (productoId: number) => boolean;
  clearAll:   () => void;
}

const WishlistContext = createContext<WishlistContextValue>({
  items: [], totalItems: 0,
  addItem: () => {}, removeItem: () => {}, toggleItem: () => {},
  isWished: () => false, clearAll: () => {},
});

const STORAGE_KEY = "cq-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const hydrated = useRef(false);

  /* Hidratar desde localStorage una vez */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: WishlistItem[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0)
          dispatch({ type: "HYDRATE", payload: parsed });
      }
    } catch { /* silent */ }
    hydrated.current = true;
  }, []);

  /* Persistir cambios */
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch { /* silent */ }
  }, [state.items]);

  const addItem    = useCallback((item: WishlistItem) => dispatch({ type: "ADD",    payload: item }), []);
  const removeItem = useCallback((productoId: number) => dispatch({ type: "REMOVE", payload: { productoId } }), []);
  const toggleItem = useCallback((item: WishlistItem) => dispatch({ type: "TOGGLE", payload: item }), []);
  const clearAll   = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const isWished   = useCallback((productoId: number) => state.items.some((i) => i.productoId === productoId), [state.items]);

  return (
    <WishlistContext.Provider value={{
      items: state.items, totalItems: state.items.length,
      addItem, removeItem, toggleItem, isWished, clearAll,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() { return useContext(WishlistContext); }
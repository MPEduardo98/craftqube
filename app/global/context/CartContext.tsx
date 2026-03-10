// app/global/context/CartContext.tsx
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
import type { CartItem, CartState } from "@/app/global/types/cart";

type Action =
  | { type: "ADD_ITEM";    payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { varianteId: number } }
  | { type: "UPDATE_QTY";  payload: { varianteId: number; cantidad: number } }
  | { type: "CLEAR" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "HYDRATE";     payload: CartItem[] };

function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {

    case "HYDRATE":
      return { ...state, items: action.payload };

    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.varianteId === action.payload.varianteId);
      const items = existing
        ? state.items.map((i) =>
            i.varianteId === action.payload.varianteId
              ? { ...i, cantidad: i.cantidad + action.payload.cantidad }
              : i
          )
        : [...state.items, action.payload];
      return { items, isOpen: true };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.varianteId !== action.payload.varianteId) };

    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.varianteId === action.payload.varianteId
            ? { ...i, cantidad: Math.max(1, action.payload.cantidad) }
            : i
        ),
      };

    case "CLEAR":       return { ...state, items: [] };
    case "OPEN_DRAWER": return { ...state, isOpen: true };
    case "CLOSE_DRAWER":return { ...state, isOpen: false };
    default:            return state;
  }
}

interface CartContextValue {
  items: CartItem[]; isOpen: boolean; totalItems: number; totalPrecio: number;
  addItem: (item: CartItem) => void; removeItem: (varianteId: number) => void;
  updateQty: (varianteId: number, cantidad: number) => void;
  clearCart: () => void; openDrawer: () => void; closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue>({
  items: [], isOpen: false, totalItems: 0, totalPrecio: 0,
  addItem: () => {}, removeItem: () => {}, updateQty: () => {},
  clearCart: () => {}, openDrawer: () => {}, closeDrawer: () => {},
});

const STORAGE_KEY = "cq-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  /**
   * hydrated evita que el efecto de persistencia sobreescriba localStorage
   * con [] antes de que la hidratación cargue los datos guardados.
   * Bug original: ambos useEffect corrían en el mismo ciclo de mount y el de
   * persistencia ganaba la carrera con state.items=[], borrando el carrito.
   */
  const hydrated = useRef(false);

  /* 1️⃣ Hidratar UNA SOLA VEZ al montar */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CartItem[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch { /* silent */ }
    hydrated.current = true; // marcar DESPUÉS del dispatch
  }, []);

  /* 2️⃣ Persistir SOLO después de la hidratación inicial */
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch { /* silent */ }
  }, [state.items]);

  const addItem     = useCallback((item: CartItem) => dispatch({ type: "ADD_ITEM",    payload: item }), []);
  const removeItem  = useCallback((varianteId: number) => dispatch({ type: "REMOVE_ITEM", payload: { varianteId } }), []);
  const updateQty   = useCallback((varianteId: number, cantidad: number) => dispatch({ type: "UPDATE_QTY",  payload: { varianteId, cantidad } }), []);
  const clearCart   = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const openDrawer  = useCallback(() => dispatch({ type: "OPEN_DRAWER" }), []);
  const closeDrawer = useCallback(() => dispatch({ type: "CLOSE_DRAWER" }), []);

  const totalItems  = state.items.reduce((s, i) => s + i.cantidad, 0);
  const totalPrecio = state.items.reduce((s, i) => s + i.precio * i.cantidad, 0);

  return (
    <CartContext.Provider value={{
      items: state.items, isOpen: state.isOpen, totalItems, totalPrecio,
      addItem, removeItem, updateQty, clearCart, openDrawer, closeDrawer,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }
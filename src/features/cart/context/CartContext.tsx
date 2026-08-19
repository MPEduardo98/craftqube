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
import { useAlert }                 from "@/shared/context/AlertContext";
import type { CartItem, CartState } from "@/features/cart/types/cart";

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
      return { ...state, items: action.payload, hidratado: true };

    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.varianteId === action.payload.varianteId);
      const items = existing
        ? state.items.map((i) =>
            i.varianteId === action.payload.varianteId
              ? { ...i, cantidad: i.cantidad + action.payload.cantidad }
              : i
          )
        : [...state.items, action.payload];
      return { ...state, items, isOpen: true };
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
  /** false hasta leer localStorage. Antes de eso items=[] no significa
   *  "carrito vacío" sino "todavía no sabemos": quien decida algo con
   *  eso —como el guard del checkout— tiene que esperar a este flag. */
  hidratado: boolean;
  addItem: (item: CartItem) => void; removeItem: (varianteId: number) => void;
  updateQty: (varianteId: number, cantidad: number) => void;
  clearCart: () => void; openDrawer: () => void; closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue>({
  items: [], isOpen: false, totalItems: 0, totalPrecio: 0, hidratado: false,
  addItem: () => {}, removeItem: () => {}, updateQty: () => {},
  clearCart: () => {}, openDrawer: () => {}, closeDrawer: () => {},
});

const STORAGE_KEY = "cq-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false, hidratado: false });
  const { error: alertaError } = useAlert();

  /**
   * hydrated evita que el efecto de persistencia sobreescriba localStorage
   * con [] antes de que la hidratación cargue los datos guardados.
   * Bug original: ambos useEffect corrían en el mismo ciclo de mount y el de
   * persistencia ganaba la carrera con state.items=[], borrando el carrito.
   */
  const hydrated = useRef(false);

  /* 1️⃣ Hidratar UNA SOLA VEZ al montar */
  useEffect(() => {
    let guardados: CartItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CartItem[] = JSON.parse(raw);
        if (Array.isArray(parsed)) guardados = parsed;
      }
    } catch { /* silent */ }
    hydrated.current = true; // marcar DESPUÉS de leer
    // Siempre se despacha, aunque no hubiera nada guardado: es lo que
    // levanta el flag `hidratado` sin meter un setState en el efecto.
    dispatch({ type: "HYDRATE", payload: guardados });
  }, []);

  /* 2️⃣ Persistir SOLO después de la hidratación inicial */
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch { /* silent */ }
  }, [state.items]);

  /* 3️⃣ Purgar lo que ya no se puede comprar
     ─────────────────────────────────────────
     El carrito guarda un snapshot del producto, así que una línea
     cuya variante desapareció de la BD se sigue pintando entera y
     con su precio. El comprador no se entera hasta el paso de pago,
     donde el cálculo del servidor corta con "Uno de los productos ya
     no está disponible" sin decir cuál. Se comprueba al cargar y se
     retira aquí, nombrando lo que se fue.

     Si la petición falla no se toca nada: una red caída no es motivo
     para vaciarle el carrito a nadie. */
  const validado = useRef(false);
  useEffect(() => {
    if (!state.hidratado || state.items.length === 0 || validado.current) return;
    validado.current = true;

    const guardados = state.items;
    void (async () => {
      try {
        const res = await fetch("/api/cart/validar", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ variante_ids: guardados.map((i) => i.varianteId) }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) return;

        const validos  = new Set<number>(json.data.validos);
        const retirados = guardados.filter((i) => !validos.has(i.varianteId));
        if (retirados.length === 0) return;

        dispatch({
          type: "HYDRATE",
          payload: guardados.filter((i) => validos.has(i.varianteId)),
        });
        alertaError(
          retirados.length === 1
            ? `"${retirados[0].titulo}" ya no está disponible y lo quitamos de tu carrito.`
            : `Quitamos ${retirados.length} productos que ya no están disponibles.`,
          "Carrito actualizado"
        );
      } catch { /* red caída: mejor dejar el carrito como está */ }
    })();
  }, [state.hidratado, state.items, alertaError]);

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
      hidratado: state.hidratado,
      addItem, removeItem, updateQty, clearCart, openDrawer, closeDrawer,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }
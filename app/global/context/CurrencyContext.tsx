// app/global/context/CurrencyContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type Currency = "MXN" | "USD";

interface CurrencyContextValue {
  currency:    Currency;
  setCurrency: (c: Currency) => void;
  format:      (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency:    "MXN",
  setCurrency: () => {},
  format:      (n) => `$${n.toFixed(2)}`,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("MXN");
  const [usdRate,  setUsdRate]       = useState<number>(0.052);

  useEffect(() => {
    const stored = localStorage.getItem("cq-currency") as Currency | null;
    if (stored === "MXN" || stored === "USD") setCurrencyState(stored);

    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((d) => { if (d.usd) setUsdRate(d.usd); })
      .catch(() => {});
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("cq-currency", c);
  }, []);

  const format = useCallback((amount: number): string => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount * usdRate) + " USD";
    }
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount) + " MXN";
  }, [currency, usdRate]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
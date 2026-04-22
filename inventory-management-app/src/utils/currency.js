import { useEffect, useState } from "react";
import api from "../services/api";

const DEFAULT_CURRENCY = "INR";
const SUPPORTED_CURRENCIES = ["USD", "EUR", "INR"];
const STORAGE_KEY = "ims-currency";
const EVENT_NAME = "ims:currency-change";
const getLocaleForCurrency = (currency) =>
  normalizeCurrency(currency) === "INR" ? "en-IN" : "en-US";

const isBrowser = typeof window !== "undefined";

const normalizeCurrency = (value) => (SUPPORTED_CURRENCIES.includes(value) ? value : DEFAULT_CURRENCY);

const readStoredCurrency = () => {
  if (!isBrowser) return DEFAULT_CURRENCY;
  return normalizeCurrency(window.localStorage.getItem(STORAGE_KEY));
};

const writeStoredCurrency = (value) => {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, normalizeCurrency(value));
};

export const setAppCurrency = (value) => {
  const nextCurrency = normalizeCurrency(value);
  writeStoredCurrency(nextCurrency);

  if (!isBrowser) return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: nextCurrency }));
};

export const useAppCurrency = () => {
  const [currency, setCurrency] = useState(readStoredCurrency);

  useEffect(() => {
    let active = true;

    const fetchCurrency = async () => {
      try {
        const response = await api.get("/settings");
        const nextCurrency = normalizeCurrency(response?.data?.currency);
        writeStoredCurrency(nextCurrency);
        if (active) {
          setCurrency(nextCurrency);
        }
      } catch {
        // Keep stored/default currency when settings fetch fails.
      }
    };

    fetchCurrency();

    if (!isBrowser) {
      return () => {
        active = false;
      };
    }

    const handleCurrencyChange = (event) => {
      setCurrency(normalizeCurrency(event?.detail));
    };

    window.addEventListener(EVENT_NAME, handleCurrencyChange);

    return () => {
      active = false;
      window.removeEventListener(EVENT_NAME, handleCurrencyChange);
    };
  }, []);

  return currency;
};

export const formatCurrencyValue = (value, currency, options = {}) =>
  new Intl.NumberFormat(getLocaleForCurrency(currency), {
    style: "currency",
    currency: normalizeCurrency(currency),
    ...options,
  }).format(Number(value) || 0);

export const formatCompactCurrencyValue = (value, currency) =>
  new Intl.NumberFormat(getLocaleForCurrency(currency), {
    style: "currency",
    currency: normalizeCurrency(currency),
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const getCurrencySymbol = (currency) =>
  new Intl.NumberFormat(getLocaleForCurrency(currency), {
    style: "currency",
    currency: normalizeCurrency(currency),
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value || "$";

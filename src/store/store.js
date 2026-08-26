// Lokale "Datenbank" + globaler App-Zustand.
// - Persistenz über AsyncStorage (überlebt App-Neustart).
// - Alle Buttons/Aktionen der App laufen über die hier bereitgestellten Funktionen.
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEED } from '../data/seed';

const STORAGE_KEY = 'darna:db:v1';

// Kleine ID-Hilfe für neue Datensätze
const newId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const initialState = { ...SEED, loaded: false };

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...action.payload, loaded: true };

    case 'READY':
      return { ...state, loaded: true };

    // ---- Immobilien ----
    case 'ADD_PROPERTY':
      return { ...state, properties: [action.property, ...state.properties] };

    case 'DELETE_PROPERTY':
      return { ...state, properties: state.properties.filter((p) => p.id !== action.id) };

    case 'TOGGLE_PROPERTY_MODE':
      return {
        ...state,
        properties: state.properties.map((p) => {
          if (p.id !== action.id) return p;
          // vacant/long -> airbnb, airbnb -> long
          const mode = p.mode === 'airbnb' ? 'long' : 'airbnb';
          const monthlyRentEur = mode === 'airbnb' ? p.airbnbEstEur : (p.monthlyRentEur || Math.round(p.airbnbEstEur / 1.5));
          return { ...p, mode, monthlyRentEur, yearlyRentEur: monthlyRentEur * 12 };
        }),
      };

    // ---- Mieter / Miet-Aktionen ----
    case 'RENT_ACTION':
      return {
        ...state,
        tenants: state.tenants.map((t) =>
          t.id === action.id
            ? { ...t, log: [{ at: Date.now(), text: action.text }, ...t.log] }
            : t
        ),
      };

    case 'MARK_PAID':
      return {
        ...state,
        tenants: state.tenants.map((t) =>
          t.id === action.id
            ? { ...t, status: 'paid', overdueDays: 0, overdueEur: 0, log: [{ at: Date.now(), text: 'Als bezahlt markiert' }, ...t.log] }
            : t
        ),
      };

    // ---- Handwerker ----
    case 'REQUEST_CRAFTSMAN':
      return {
        ...state,
        craftsmen: state.craftsmen.map((c) =>
          c.id === action.id ? { ...c, requested: !c.requested } : c
        ),
      };

    // ---- Markt ----
    case 'ADD_LISTING':
      return { ...state, listings: [action.listing, ...state.listings] };

    case 'DELETE_LISTING':
      return { ...state, listings: state.listings.filter((l) => l.id !== action.id) };

    // ---- Fonds ----
    case 'JOIN_FUND':
      return {
        ...state,
        funds: state.funds.map((f) => {
          if (f.id !== action.id || f.joined) return f;
          return {
            ...f,
            joined: true,
            investors: Math.min(f.investors + 1, f.maxInvestors),
            raisedEur: Math.min(f.raisedEur + f.minMonthlyEur * 12, f.goalEur),
          };
        }),
      };

    case 'RESET_DB':
      return { ...SEED, loaded: true };

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Beim Start: gespeicherte Daten laden (falls vorhanden)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
        else dispatch({ type: 'READY' });
      } catch (e) {
        // Fällt auf die Seed-Daten im Speicher zurück
        dispatch({ type: 'READY' });
      }
    })();
  }, []);

  // Bei jeder Änderung: speichern
  useEffect(() => {
    if (!state.loaded) return;
    const { loaded, ...toSave } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
  }, [state]);

  // Öffentliche Aktionen (werden von den Buttons aufgerufen)
  const actions = {
    addProperty: (data) =>
      dispatch({
        type: 'ADD_PROPERTY',
        property: {
          id: newId('p'),
          name: data.name || 'Neue Immobilie',
          city: data.city || 'Damaskus',
          mode: 'vacant',
          valueEur: Number(data.valueEur) || 0,
          yearlyRentEur: 0,
          monthlyRentEur: 0,
          airbnbEstEur: Math.round((Number(data.valueEur) || 100000) * 0.006),
        },
      }),
    deleteProperty: (id) => dispatch({ type: 'DELETE_PROPERTY', id }),
    togglePropertyMode: (id) => dispatch({ type: 'TOGGLE_PROPERTY_MODE', id }),

    rentAction: (id, text) => dispatch({ type: 'RENT_ACTION', id, text }),
    markPaid: (id) => dispatch({ type: 'MARK_PAID', id }),

    requestCraftsman: (id) => dispatch({ type: 'REQUEST_CRAFTSMAN', id }),

    addListing: (data) =>
      dispatch({
        type: 'ADD_LISTING',
        listing: {
          id: newId('l'),
          title: data.title || 'Neues Angebot',
          city: data.city || 'Damaskus',
          sqm: Number(data.sqm) || 0,
          priceEur: Number(data.priceEur) || 0,
          verifiedTitle: false,
          status: 'sale',
        },
      }),
    deleteListing: (id) => dispatch({ type: 'DELETE_LISTING', id }),

    joinFund: (id) => dispatch({ type: 'JOIN_FUND', id }),

    resetDb: () => dispatch({ type: 'RESET_DB' }),
  };

  return (
    <StoreContext.Provider value={{ state, actions }}>
      {children}
    </StoreContext.Provider>
  );
}

// Bequemer Hook für die Screens
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore muss innerhalb von <StoreProvider> verwendet werden');
  return ctx;
}

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
      // SEED zuerst, damit neue Felder (z. B. users) auch bei alten
      // gespeicherten Daten vorhanden sind (Migration).
      return { ...SEED, ...action.payload, loaded: true };

    case 'READY':
      return { ...state, loaded: true };

    // ---- Authentifizierung ----
    case 'LOGIN':
      return { ...state, currentUserId: action.userId };

    case 'LOGOUT':
      return { ...state, currentUserId: null };

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

    case 'APPROVE_LISTING':
      return {
        ...state,
        listings: state.listings.map((l) => (l.id === action.id ? { ...l, approved: true } : l)),
      };

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

    case 'LEAVE_FUND':
      return {
        ...state,
        funds: state.funds.map((f) => {
          if (f.id !== action.id || !f.joined) return f;
          return {
            ...f,
            joined: false,
            investors: Math.max(f.investors - 1, 0),
            raisedEur: Math.max(f.raisedEur - f.minMonthlyEur * 12, 0),
          };
        }),
      };

    // ---- Zahlung eines Schuldenpostens ----
    case 'PAY_DEBT': {
      const items = state.debtItems || [];
      const debt = items.find((d) => d.id === action.id);
      if (!debt) return state;
      const paid = debt.amountEur + debt.surchargeEur;
      const payment = {
        id: `pay_${Date.now()}`,
        tenantId: debt.tenantId,
        at: Date.now(),
        method: 'Online',
        receiptNo: String(Date.now()).slice(-15),
        amountEur: paid,
        remainingEur: 0,
      };
      return {
        ...state,
        debtItems: items.filter((d) => d.id !== action.id),
        payments: [payment, ...(state.payments || [])],
      };
    }

    // ---- Nachrichten ----
    case 'SEND_MESSAGE':
      return { ...state, messages: [action.message, ...(state.messages || [])] };

    // ---- Aufträge (Handwerker/Firma) ----
    case 'SET_JOB_STATUS':
      return {
        ...state,
        jobs: (state.jobs || []).map((j) => (j.id === action.id ? { ...j, status: action.status } : j)),
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

    // approved: true, wenn direkt freigegeben (Verwalter); false = wartet auf Genehmigung (Eigentümer)
    addListing: (data, approved = false) =>
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
          approved: !!approved,
        },
      }),
    deleteListing: (id) => dispatch({ type: 'DELETE_LISTING', id }),
    approveListing: (id) => dispatch({ type: 'APPROVE_LISTING', id }),
    rejectListing: (id) => dispatch({ type: 'DELETE_LISTING', id }), // Ablehnen = entfernen

    joinFund: (id) => dispatch({ type: 'JOIN_FUND', id }),
    leaveFund: (id) => dispatch({ type: 'LEAVE_FUND', id }),

    // Aufträge: annehmen / als erledigt markieren
    acceptJob: (id) => dispatch({ type: 'SET_JOB_STATUS', id, status: 'accepted' }),
    completeJob: (id) => dispatch({ type: 'SET_JOB_STATUS', id, status: 'done' }),

    // Einen Schuldenposten bezahlen (erzeugt eine Zahlung)
    payDebt: (id) => dispatch({ type: 'PAY_DEBT', id }),

    // Nachricht senden (Absender = aktueller Benutzer)
    sendMessage: (toUserId, text) => {
      const t = String(text || '').trim();
      if (!toUserId || !t) return false;
      dispatch({
        type: 'SEND_MESSAGE',
        message: { id: newId('m'), toUserId, fromUserId: state.currentUserId, at: Date.now(), text: t },
      });
      return true;
    },

    // ---- Login / Logout ----
    // Prüft E-Mail + Passwort gegen die Benutzerliste.
    // Gibt true bei Erfolg zurück, sonst false.
    login: (email, password) => {
      const e = String(email || '').trim().toLowerCase();
      const user = (state.users || []).find(
        (u) => u.email.toLowerCase() === e && u.password === password
      );
      if (user) dispatch({ type: 'LOGIN', userId: user.id });
      return !!user;
    },
    logout: () => dispatch({ type: 'LOGOUT' }),

    resetDb: () => dispatch({ type: 'RESET_DB' }),
  };

  // Aktuell angemeldeter Benutzer (oder null)
  const currentUser = (state.users || []).find((u) => u.id === state.currentUserId) || null;

  return (
    <StoreContext.Provider value={{ state, actions, currentUser }}>
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

"use client";
// src/context/FormContext.js
import { createContext, useContext, useReducer } from "react";

// Reducer simplificado
const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_FORM_MODE":
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.formId]: {
            ...state.forms[action.formId],
            mode: action.mode,
          },
        },
      };
    case "SET_FORM_IS_FETCHED":
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.formId]: {
            ...state.forms[action.formId],
            isFetched: action.isFetched,
          },
        },
      };
    case "SET_FORM_AUTH0_TOKEN":
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.formId]: {
            ...state.forms[action.formId],
            auth0ManagementToken: action.token,
          },
        },
      };
    case "RESET_FORM":
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.formId]: {
            mode: action.mode || "create",
            isFetched: false,
            auth0ManagementToken: action.initialToken || null,
          },
        },
      };
    case "REMOVE_FORM":
      const newForms = { ...state.forms };
      delete newForms[action.formId];
      return { ...state, forms: newForms };
    default:
      return state;
  }
};

// Estado inicial
const initialState = {
  forms: {},
};

// Contexto
const FormContext = createContext();

export function FormProvider({ children }) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setFormMode = (formId, mode) =>
    dispatch({ type: "SET_FORM_MODE", formId, mode });
  const setFormIsFetched = (formId, isFetched) =>
    dispatch({ type: "SET_FORM_IS_FETCHED", formId, isFetched });
  const setFormAuth0Token = (formId, token) =>
    dispatch({ type: "SET_FORM_AUTH0_TOKEN", formId, token });
  const resetForm = (formId, initialToken, mode = "create") =>
    dispatch({ type: "RESET_FORM", formId, initialToken, mode });
  const removeForm = (formId) => dispatch({ type: "REMOVE_FORM", formId });

  return (
    <FormContext.Provider
      value={{
        forms: state.forms,
        setFormMode,
        setFormIsFetched,
        setFormAuth0Token,
        resetForm,
        removeForm,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

// Hook personalizado
export function useFormState(formId, initialToken) {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormState deve ser usado dentro de um FormProvider");
  }

  const {
    forms,
    setFormMode,
    setFormIsFetched,
    setFormAuth0Token,
    resetForm,
    removeForm,
  } = context;

  return {
    mode: forms[formId]?.mode || "create",
    isFetched: forms[formId]?.isFetched || false,
    auth0ManagementToken:
      forms[formId]?.auth0ManagementToken || initialToken || null,
    setMode: (mode) => setFormMode(formId, mode),
    setIsFetched: (isFetched) => setFormIsFetched(formId, isFetched),
    setAuth0ManagementToken: (token) => setFormAuth0Token(formId, token),
    resetForm: (mode) => resetForm(formId, initialToken, mode),
    removeForm: () => removeForm(formId),
  };
}

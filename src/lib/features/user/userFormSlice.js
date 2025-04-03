import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: {
    name: "",
    nickname: "",
    picture: null,
    birth_date: "",
    cpf: "",
    password: "",
    addresses: [],
    emails: [],
    telephones: [],
  },
  previewImage: null,
  mode: "create", // 'create', 'edit', 'view'
  isFetched: false,
  isSubmitting: false,
  formId: null,
  errors: {},
};

const userFormSlice = createSlice({
  name: "userForm",
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setPreviewImage: (state, action) => {
      state.previewImage = action.payload;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setIsFetched: (state, action) => {
      state.isFetched = action.payload;
    },
    setIsSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    setFormId: (state, action) => {
      state.formId = action.payload;
    },
    setErrors: (state, action) => {
      state.errors = action.payload;
    },
    resetForm: (state, action) => {
      return {
        ...initialState,
        formId: action.payload.formId || null,
        mode: action.payload.mode || "create",
      };
    },
    // Ações específicas para subformulários
    addAddress: (state, action) => {
      state.formData.addresses.push(action.payload);
    },
    updateAddress: (state, action) => {
      const { index, data } = action.payload;
      state.formData.addresses[index] = data;
    },
    removeAddress: (state, action) => {
      state.formData.addresses.splice(action.payload, 1);
    },
    addEmail: (state, action) => {
      state.formData.emails.push(action.payload);
    },
    updateEmail: (state, action) => {
      const { index, data } = action.payload;
      state.formData.emails[index] = data;
    },
    removeEmail: (state, action) => {
      state.formData.emails.splice(action.payload, 1);
    },
    addTelephone: (state, action) => {
      state.formData.telephones.push(action.payload);
    },
    updateTelephone: (state, action) => {
      const { index, data } = action.payload;
      state.formData.telephones[index] = data;
    },
    removeTelephone: (state, action) => {
      state.formData.telephones.splice(action.payload, 1);
    },
  },
});

export const {
  setFormData,
  setPreviewImage,
  setMode,
  setIsFetched,
  setIsSubmitting,
  setFormId,
  setErrors,
  resetForm,
  addAddress,
  updateAddress,
  removeAddress,
  addEmail,
  updateEmail,
  removeEmail,
  addTelephone,
  updateTelephone,
  removeTelephone,
} = userFormSlice.actions;

export default userFormSlice.reducer;

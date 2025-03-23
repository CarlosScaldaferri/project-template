// components/ErrorDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CustomButton from "../form/button/CustomButton";

const ErrorDialog = ({ open, onClose, title = "Erro", errors }) => {
  // Função para renderizar os erros de forma flexível
  const renderErrors = () => {
    if (!errors) return <p>Nenhum erro fornecido.</p>;

    // Se for uma string simples
    if (typeof errors === "string") {
      return <p>{errors}</p>;
    }

    // Se for um objeto com propriedade 'submit'
    if (errors.submit) {
      return <p>{errors.submit}</p>;
    }

    // Se for um objeto com múltiplas chaves
    if (typeof errors === "object" && Object.keys(errors).length > 0) {
      return (
        <ul>
          {Object.entries(errors).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      );
    }

    // Fallback para outros casos
    return <p>Erro desconhecido.</p>;
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="error-dialog-title">
      <DialogTitle id="error-dialog-title">{title}</DialogTitle>
      <DialogContent>{renderErrors()}</DialogContent>
      <DialogActions>
        <CustomButton onClick={onClose} color="primary">
          Fechar
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;

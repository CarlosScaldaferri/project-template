import CustomButton from "./button/CustomButton";

// components/form/Form.jsx
export default function Form({
  onSubmit,
  children,
  className,
  showDefaultButtons = true, // Novo prop para controle
  isSubmitting = false,
  onSave,
  onSaveAndNew,
  onSaveAndClose,
  onCancel,
  onClear,
  isDirty = false, // Para controle de disabled
}) {
  return (
    <form onSubmit={onSubmit} className={`flex flex-col ${className}`}>
      {children}

      {showDefaultButtons && (
        <footer className="pl-4 pb-5 pt-10 flex flex-wrap gap-4 border-t border-light-border dark:border-dark-border">
          <CustomButton
            type="button"
            variant="secondary"
            onClick={onClear}
            disabled={!isDirty || isSubmitting}
            className="px-4 py-2"
          >
            Limpar
          </CustomButton>
          <CustomButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="px-4 py-2"
            disabled={isSubmitting}
          >
            Cancelar
          </CustomButton>
          <CustomButton
            type="submit"
            variant="primary"
            onClick={onSave}
            className="px-4 py-2"
            disabled={isSubmitting || !isDirty}
            isLoading={isSubmitting}
          >
            Salvar e continuar
          </CustomButton>
          <CustomButton
            type="button"
            variant="primary"
            onClick={onSaveAndNew}
            className="px-4 py-2"
            disabled={isSubmitting || !isDirty}
          >
            Salvar e Novo
          </CustomButton>
          <CustomButton
            type="button"
            variant="primary"
            onClick={onSaveAndClose}
            className="px-4 py-2"
            disabled={isSubmitting || !isDirty}
          >
            Salvar e Fechar
          </CustomButton>
        </footer>
      )}
    </form>
  );
}

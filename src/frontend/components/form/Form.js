import CustomButton from "./button/CustomButton";

export default function Form({
  onSubmit,
  children,
  className,
  showDefaultButtons = true,
  isSubmitting = false,
  onSave,
  onSaveAndNew,
  onSaveAndClose,
  onCancel,
  onClear,
  isDirty = false,
}) {
  return (
    <form onSubmit={onSubmit} className={`flex flex-col ${className}`}>
      {children}
      {showDefaultButtons && (
        <footer className="py-6 flex flex-wrap gap-3 border-t border-light-border dark:border-dark-border">
          <CustomButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="px-4 py-2 text-sm"
            disabled={isSubmitting}
          >
            Cancelar
          </CustomButton>
          <CustomButton
            type="button"
            variant="secondary"
            onClick={onClear}
            className="px-4 py-2 text-sm"
            disabled={!isDirty || isSubmitting}
          >
            Limpar
          </CustomButton>
          <div className="flex gap-3">
            <CustomButton
              type="submit"
              variant="primary"
              onClick={onSave}
              className="px-4 py-2 text-sm"
              disabled={isSubmitting || !isDirty}
              isLoading={isSubmitting}
            >
              Salvar
            </CustomButton>
            <CustomButton
              type="button"
              variant="primary"
              onClick={onSaveAndNew}
              className="px-4 py-2 text-sm"
              disabled={isSubmitting || !isDirty}
            >
              Salvar e Novo
            </CustomButton>
            <CustomButton
              type="button"
              variant="primary"
              onClick={onSaveAndClose}
              className="px-4 py-2 text-sm"
              disabled={isSubmitting || !isDirty}
            >
              Salvar e Fechar
            </CustomButton>
          </div>
        </footer>
      )}
    </form>
  );
}

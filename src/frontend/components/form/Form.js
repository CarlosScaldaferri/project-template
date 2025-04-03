export default function Form({ onSubmit, children, className }) {
  return (
    <form
      onSubmit={onSubmit}
      className={`flex flex-col bg-light-background-form-primary dark:bg-dark-background-form-primary border-r border-light-border dark:border-dark-border ${className}`}
    >
      {children}
    </form>
  );
}

// Função auxiliar simples para formatar valores (pode expandir se necessário)
const formatCellDisplay = (value, columnDef) => {
  if (value === null || typeof value === "undefined" || value === "")
    return "-";

  // Formatação específica pode ser feita aqui ou via cellRenderer
  if (columnDef?.type === "date" && value) {
    try {
      // Tenta formatar como data local, ajuste se precisar de UTC ou formato específico
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    } // Retorna string se falhar
  }

  // Para selects, se options forem passadas na columnDef (opcional)
  if (columnDef?.type === "select" && Array.isArray(columnDef.options)) {
    const option = columnDef.options.find((opt) => opt.value === value);
    return option ? option.label : String(value);
  }

  // Retorna como string por padrão
  return String(value);
};

export default formatCellDisplay;

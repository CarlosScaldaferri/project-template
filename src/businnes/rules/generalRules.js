export const applyCPFMask = (valor) => {
  return valor
    .replace(/\D/g, "") // Remove tudo que não é dígito
    .slice(0, 11) // Limita a 11 caracteres numéricos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const applyTelephoneMask = (valor) => {
  // Remove tudo que não é dígito
  let digits = valor.replace(/\D/g, "");

  // Se começa com 55, assume que é o DDI e remove
  if (digits.startsWith("55")) {
    digits = digits.slice(2); // Remove o 55 inicial
  }

  // Define o tamanho máximo com base na quantidade de dígitos (sem o DDI)
  const maxLength = digits.length > 10 ? 11 : 10; // 11 para celular, 10 para fixo
  digits = digits.slice(0, maxLength); // Limita ao tamanho correto (DDD + número)

  // Inicia a formatação com +55
  let formatted = digits.length > 0 ? "+55" : "";

  // Adiciona o DDD entre parênteses
  if (digits.length > 2) {
    formatted += ` (${digits.slice(0, 2)})`;
    digits = digits.slice(2); // Remove o DDD dos dígitos restantes
  } else if (digits.length > 0) {
    formatted += ` (${digits}`;
    return formatted; // Retorna parcial se o DDD não estiver completo
  }

  // Formata o número restante com hífen
  if (digits.length > 0) {
    formatted += " ";
    if (maxLength === 10) {
      // Máscara para fixo: +55 (XX) XXXX-XXXX (12 dígitos com DDI)
      if (digits.length > 4) {
        formatted += `${digits.slice(0, 4)}-${digits.slice(4)}`;
      } else {
        formatted += digits;
      }
    } else {
      // Máscara para celular: +55 (XX) XXXXX-XXXX (13 dígitos com DDI)
      if (digits.length > 5) {
        formatted += `${digits.slice(0, 5)}-${digits.slice(5)}`;
      } else {
        formatted += digits;
      }
    }
  }

  return formatted;
};

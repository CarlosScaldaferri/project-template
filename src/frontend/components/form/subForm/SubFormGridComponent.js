// src/components/subForm/SubFormGridComponent.jsx
"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Checkbox,
  Box, // Adicionado para container
  Typography, // Adicionado para mensagem de 'sem dados'
} from "@mui/material";
import {
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material"; // Usar DeleteOutline ou FiTrash2 se preferir
import formatCellDisplay from "./shared/formatCellDisplay";

const SubFormGridComponent = ({
  data = [],
  columnDefs = [],
  idField = "internalId", // Campo que identifica unicamente a linha (vem do useFieldArray)
  onEdit, // Função chamada ao clicar em Editar (recebe o índice da linha)
  onDelete, // Função chamada ao clicar em Excluir (recebe o índice da linha)
  noDataMessage = "Nenhum item adicionado.",
  isSubmitting = false, // Para desabilitar botões durante o submit
}) => {
  // Encontra a definição da coluna de ações (se existir)
  const actionColumnDef = columnDefs.find((col) => col.isActionColumn);
  const actionColumnId = actionColumnDef?.id;

  // Encontra a definição da coluna principal (se existir)
  const mainCheckboxColumnDef = columnDefs.find(
    (col) => col.isMainCheckboxColumn
  );
  const mainCheckboxColumnId = mainCheckboxColumnDef?.id;

  if (!data || data.length === 0) {
    return (
      <Box className="w-full py-4 text-center">
        <Typography
          variant="body2"
          className="text-light-text-muted dark:text-dark-text-muted"
        >
          {noDataMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      // Estilo do container para se assemelhar ao original
      className="w-full text-light-text-table dark:text-dark-text-table bg-light-background-table dark:bg-dark-background-table border border-light-border dark:border-dark-border"
      sx={{
        overflowX: "auto", // Permite scroll horizontal se necessário
        background: "transparent", // Fundo transparente para usar cores de tema
        borderWidth: "1px",
        borderColor: "var(--color-light-border, #e0e0e0)", // Usa variável de tema se definida, senão fallback
        ".dark &": {
          borderColor: "var(--color-dark-border, #424242)",
        },
      }}
    >
      <Table size="small" aria-label="Tabela de sub-formulário">
        {/* Cabeçalho da Tabela */}
        <TableHead>
          <TableRow
            // Estilo do cabeçalho
            className="bg-light-background-table-header dark:bg-dark-background-table-header"
            sx={{
              borderBottom: "1px solid",
              borderColor: "var(--color-light-border-table-header, #e0e0e0)",
              ".dark &": {
                borderColor: "var(--color-dark-border-table-header, #424242)",
              },
            }}
          >
            {columnDefs.map((col) => (
              <TableCell
                key={col.id}
                align={col.align || "left"}
                style={{ width: col.width }} // Aplicar largura diretamente
                // Estilo das células do cabeçalho
                className="truncate p-3 text-xs sm:text-sm font-medium text-light-text-table-header dark:text-dark-text-table-header"
                sx={{
                  padding: { xs: "8px 12px", sm: "10px 16px" }, // Ajustar padding
                  whiteSpace: "nowrap", // Evitar quebra de linha no header
                  borderBottom: "none", // Remover borda inferior da célula
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* Corpo da Tabela */}
        <TableBody>
          {data.map((item, index) => {
            const itemKey = item?.[idField] ?? `subitem-${index}`;
            // Lógica de zebra striping
            const isEvenRow = index % 2 === 0;
            const rowBgClass = isEvenRow
              ? "bg-light-background dark:bg-dark-background"
              : "bg-light-background-form-secondary dark:bg-dark-background-form-secondary"; // Cores de fundo alternadas

            return (
              <TableRow
                key={itemKey}
                hover
                className={`${rowBgClass} hover:bg-light-accent dark:hover:bg-dark-accent`} // Adiciona hover
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 }, // Remove borda da última linha
                }}
              >
                {columnDefs.map((col) => {
                  let cellContent = null;

                  // --- Renderização Especial para Colunas de Ação e Principal ---
                  if (col.isActionColumn) {
                    cellContent = (
                      <div className="flex gap-1 justify-center items-center">
                        {onEdit && (
                          <Tooltip title="Editar">
                            <span>
                              {" "}
                              {/* Span para habilitar tooltip quando botão estiver disabled */}
                              <IconButton
                                size="small"
                                onClick={() => onEdit(index)} // Passa o índice
                                disabled={isSubmitting}
                                className="text-light-primary dark:text-dark-primary hover:text-light-primary-dark dark:hover:text-dark-primary-dark disabled:opacity-50"
                                sx={{ padding: "4px" }}
                              >
                                <EditIcon fontSize="inherit" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Excluir">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => onDelete(index)} // Passa o índice
                                disabled={isSubmitting}
                                className="text-light-danger dark:text-dark-danger hover:text-light-danger-dark dark:hover:text-dark-danger-dark disabled:opacity-50"
                                sx={{ padding: "4px" }}
                              >
                                <DeleteIcon fontSize="inherit" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    );
                  } else if (col.isMainCheckboxColumn) {
                    // Se a coluna principal definiu um renderer, usa ele
                    if (col.cellRenderer) {
                      cellContent = col.cellRenderer(item, index);
                    } else {
                      // Fallback: Renderiza um checkbox simples (mas idealmente o renderer vem da props)
                      cellContent = (
                        <Checkbox
                          checked={!!item?.is_main}
                          disabled
                          size="small"
                          sx={{ padding: "4px" }}
                        />
                      );
                    }
                  }
                  // --- Renderização Padrão ou Customizada ---
                  else {
                    // Usa renderer customizado se fornecido
                    if (col.cellRenderer) {
                      cellContent = col.cellRenderer(item, index);
                    } else {
                      // Formatação padrão
                      const rawValue = item?.[col.id];
                      const formattedValue = formatCellDisplay(rawValue, col);
                      // Adiciona tooltip para texto truncado
                      cellContent = (
                        <Tooltip
                          title={
                            String(formattedValue).length > 30
                              ? formattedValue
                              : ""
                          }
                          placement="top"
                        >
                          <span className="truncate block">
                            {" "}
                            {/* Span com block para truncar */}
                            {formattedValue}
                          </span>
                        </Tooltip>
                      );
                    }
                  }

                  // Retorna a célula
                  return (
                    <TableCell
                      key={`${itemKey}-${col.id}`}
                      align={col.align || "left"}
                      // Estilo das células do corpo
                      className="text-light-text-table dark:text-dark-text-table text-xs sm:text-sm"
                      sx={{
                        padding: { xs: "6px 12px", sm: "8px 16px" }, // Padding ajustado
                        borderBottom: "1px solid",
                        borderColor: "var(--color-light-border, #e0e0e0)",
                        ".dark &": {
                          borderColor: "var(--color-dark-border, #424242)",
                        },
                        // Para truncar texto se não for um componente complexo
                        maxWidth: col.width || 200, // Limita largura máxima para tooltip funcionar
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {/* Renderiza o conteúdo da célula */}
                      {/* Precisamos de um wrapper div para centralizar o checkbox/ações corretamente */}
                      {col.isActionColumn || col.isMainCheckboxColumn ? (
                        <div
                          className={`flex ${col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : "justify-start"} items-center h-full`}
                        >
                          {cellContent}
                        </div>
                      ) : (
                        cellContent // Renderiza diretamente para outros tipos
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SubFormGridComponent;

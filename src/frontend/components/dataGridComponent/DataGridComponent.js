// src/components/DataGridComponent.jsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination, // Continua sendo o container principal
  LinearProgress,
  InputAdornment,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  useMediaQuery,
  useTheme,
  Pagination, // Importado para paginação customizada
} from "@mui/material";
import {
  Person as PersonIcon,
  FileDownload as FileDownloadIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ViewColumn as ViewColumnIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Sort as SortIcon,
} from "@mui/icons-material";
import { format, isValid as isDateValid } from "date-fns";
import { utils, writeFile } from "xlsx";
import debounce from "lodash.debounce";

// Funções auxiliares genéricas (mantidas)
const applyTelephoneMask = (value) => {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
};
const getPictureUrlHelper = (picturePath, baseUrl) => {
  if (
    !picturePath ||
    typeof picturePath !== "string" ||
    picturePath.trim() === ""
  )
    return null;
  if (picturePath.startsWith("http://") || picturePath.startsWith("https://"))
    return picturePath;
  if (!baseUrl) return null;
  const finalBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${finalBaseUrl}${picturePath}`;
};
// -------------------------------------------------------------

// --- Componente Customizado para Ações de Paginação ---
function CustomPaginationActions(props) {
  const {
    count,
    page,
    rowsPerPage,
    onPageChange,
    showFirstButton = true,
    showLastButton = true,
  } = props;
  const theme = useTheme();
  const totalPages = Math.ceil(count / rowsPerPage);
  const handlePageChange = (event, value) => {
    onPageChange(event, value - 1);
  };

  if (totalPages <= 1) return null;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Pagination
        count={totalPages}
        page={page + 1}
        onChange={handlePageChange}
        color="primary"
        size="small"
        showFirstButton={showFirstButton}
        showLastButton={showLastButton}
        siblingCount={1}
        boundaryCount={1}
        sx={{ "& ul": { justifyContent: "center" } }}
      />
    </Box>
  );
}
// ----------------------------------------------------------

const DataGridComponent = ({
  columnDefs: initialColumnDefs,
  searchApiUrl,
  configKey,
  entityName = "Itens",
  viewUrlPrefix,
  editUrlPrefix,
  deleteUrlPrefix,
  idField = "id",
  urlIdParamName = idField,
  defaultSortField = "id",
  defaultSortDirection = "asc",
  pictureColumnId = "picture",
  imageBaseUrl,
  actionColumnId = "actions",
  fixedColumns = [actionColumnId].filter(Boolean),
  extraFetchParams = {},
  customFormatters = {},
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  initialRowsPerPage = 10,
  cardTitleField = "name",
  cardSubtitleField,
  confirmDeleteMessage = (itemId) =>
    `Tem certeza que deseja excluir o item ID ${itemId}?`,
  noDataMessage = `Nenhum(a) ${entityName.toLowerCase()} encontrado(a).`,
  searchPlaceholder = "Filtrar...",
  groupingLabel = "Agrupar Por",
  exportButtonLabel = "Exportar Excel",
  exportFileName = "export.xlsx",
  columnSelectorLabel = "Colunas",
  cardSortLabel = "Ordenar Por",
  onRowClick,
}) => {
  const router = useRouter();
  const theme = useTheme();

  // --- Hooks e State (sem alterações) ---
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [sortConfig, setSortConfig] = useState({
    field: defaultSortField,
    direction: defaultSortDirection,
  });
  const [groupingField, setGroupingField] = useState("");
  const [visibleColumnIds, setVisibleColumnIds] = useState(() =>
    initialColumnDefs.map((c) => c.id)
  );
  const [viewMode, setViewMode] = useState("grid");
  const [filterTerm, setFilterTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const columnSelectorAnchorRef = useRef(null);
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
  const cardsContainerRef = useRef(null);
  const [dynamicCardWidth, setDynamicCardWidth] = useState(null);
  const MIN_CARD_WIDTH_PX = 350;
  const storageKey = useMemo(
    () => `dataGridConfig_${configKey || entityName}`,
    [configKey, entityName]
  );

  // --- Load/Save Config Effects ---
  useEffect(() => {
    if (!configKey)
      console.warn(
        "DataGridComponent: 'configKey' prop is recommended for saving state."
      );
    let loadedViewMode = "grid";
    const isInitiallyMobile = isMobile;
    let loadedSortConfig = {
      field: defaultSortField,
      direction: defaultSortDirection,
    };
    let loadedVisibleColumns = initialColumnDefs.map((c) => c.id);
    let loadedRowsPerPage = initialRowsPerPage;
    let loadedGroupingField = "";
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const savedConfig = localStorage.getItem(storageKey);
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          loadedSortConfig = parsedConfig.sortConfig || loadedSortConfig;
          loadedRowsPerPage = parsedConfig.rowsPerPage || loadedRowsPerPage;
          loadedGroupingField =
            parsedConfig.groupingField || loadedGroupingField;
          loadedViewMode = parsedConfig.viewMode || loadedViewMode;
          const validSavedIds = (parsedConfig.visibleColumnIds || []).filter(
            (id) => initialColumnDefs.some((c) => c.id === id)
          );
          if (validSavedIds.length > 0) {
            loadedVisibleColumns = validSavedIds;
          }
        }
      } catch (err) {
        console.error("Error loading grid configuration:", err);
        loadedSortConfig = {
          field: defaultSortField,
          direction: defaultSortDirection,
        };
        loadedVisibleColumns = initialColumnDefs.map((c) => c.id);
        loadedRowsPerPage = initialRowsPerPage;
        loadedGroupingField = "";
        loadedViewMode = "grid";
      }
    }
    setSortConfig(loadedSortConfig);
    setRowsPerPage(loadedRowsPerPage);
    setGroupingField(loadedGroupingField);
    setVisibleColumnIds(loadedVisibleColumns);
    const finalInitialViewMode = isInitiallyMobile ? "card" : loadedViewMode;
    setViewMode(finalInitialViewMode);
    requestAnimationFrame(() => {
      setIsInitialLoadComplete(true);
    });
  }, [
    storageKey,
    configKey,
    initialColumnDefs,
    defaultSortField,
    defaultSortDirection,
    initialRowsPerPage,
    isMobile,
  ]);
  useEffect(() => {
    if (
      isInitialLoadComplete &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      try {
        const configToSave = {
          sortConfig,
          rowsPerPage,
          groupingField,
          visibleColumnIds,
          viewMode,
        };
        localStorage.setItem(storageKey, JSON.stringify(configToSave));
      } catch (err) {
        console.error("Error saving grid configuration:", err);
      }
    }
  }, [
    sortConfig,
    rowsPerPage,
    groupingField,
    visibleColumnIds,
    viewMode,
    storageKey,
    isInitialLoadComplete,
  ]);

  // --- Data Fetching Logic ---
  const fetchData = useCallback(
    async (
      currentPage,
      currentRowsPerPage,
      currentSort,
      currentFilter,
      currentGroup
    ) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        const startIndex = currentPage * currentRowsPerPage;
        params.append("startIndex", String(startIndex));
        params.append("endIndex", String(startIndex + currentRowsPerPage));
        params.append("sort", currentSort.field);
        params.append("order", currentSort.direction);
        if (currentGroup && viewMode === "grid") {
          params.append("group", currentGroup);
          // console.warn( // Keep commented unless debugging grouping
          //   "Grouping parameter sent to API. Ensure API supports it or handles local sorting override."
          // );
        }
        if (currentFilter && currentFilter.trim() !== "") {
          params.append("search", currentFilter.trim());
        }
        Object.entries(extraFetchParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
        const endpoint = `${searchApiUrl}?${params.toString()}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          let errorBody = null;
          try {
            errorBody = await response.json();
          } catch (e) {
            /* ignore */
          }
          const errMsg =
            errorBody?.message ||
            response.statusText ||
            `Erro HTTP ${response.status}`;
          throw new Error(
            `Erro ao buscar ${entityName.toLowerCase()}: ${errMsg}`
          );
        }
        const result = await response.json();
        if (result.ok && Array.isArray(result.data)) {
          setData(result.data);
          const receivedTotalCount =
            result.meta?.totalCount ??
            result.totalCount ??
            result.meta?.pagination?.total ??
            0;
          const validTotalCount =
            typeof receivedTotalCount === "number" &&
            !isNaN(receivedTotalCount) &&
            receivedTotalCount >= 0
              ? receivedTotalCount
              : 0;
          setTotalRowCount(validTotalCount);
          // Reset page if current page becomes invalid
          if (currentPage > 0 && startIndex >= validTotalCount) {
            setPage(0);
          }
        } else {
          throw new Error(
            result.message ||
              `Formato inválido ao buscar ${entityName.toLowerCase()}.`
          );
        }
      } catch (err) {
        console.error(`Falha ao buscar ${entityName.toLowerCase()}:`, err);
        setError(
          err.message ||
            `Erro inesperado ao buscar ${entityName.toLowerCase()}.`
        );
        setData([]);
        setTotalRowCount(0);
      } finally {
        setLoading(false);
      }
    },
    [searchApiUrl, entityName, extraFetchParams, viewMode]
  );
  const debouncedFetchData = useMemo(
    () => debounce(fetchData, 500),
    [fetchData]
  );
  useEffect(() => {
    if (isInitialLoadComplete) {
      debouncedFetchData(
        page,
        rowsPerPage,
        sortConfig,
        activeSearchTerm,
        groupingField
      );
    }
    return () => debouncedFetchData.cancel();
  }, [
    page,
    rowsPerPage,
    sortConfig,
    activeSearchTerm,
    groupingField,
    debouncedFetchData,
    isInitialLoadComplete,
  ]);

  // --- Handlers ---
  const handleSortRequest = (fieldId) => {
    if (groupingField && viewMode === "grid") return;
    setSortConfig({
      field: fieldId,
      direction:
        sortConfig.field === fieldId && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
    setPage(0);
  };
  const handleInputChange = (event) => setFilterTerm(event.target.value);
  const handleSearchClick = () => {
    setActiveSearchTerm(filterTerm);
    setPage(0);
  };
  const handleFilterKeyDown = (event) => {
    if (event.key === "Enter") handleSearchClick();
  };
  const handleGroupingChange = (event) => {
    if (viewMode === "grid") {
      setGroupingField(event.target.value);
      setPage(0);
    } else {
      setGroupingField("");
    }
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleViewClick = (item) => {
    if (viewUrlPrefix && item?.[idField])
      router.push(`${viewUrlPrefix}?${urlIdParamName}=${item[idField]}`);
    else console.warn("View action invalid.", item);
  };
  const handleEditClick = (item) => {
    if (editUrlPrefix && item?.[idField])
      router.push(`${editUrlPrefix}?${urlIdParamName}=${item[idField]}`);
    else console.warn("Edit action invalid.", item);
  };
  const handleDeleteClick = (item) => {
    if (deleteUrlPrefix && item?.[idField]) {
      if (window.confirm(confirmDeleteMessage(item[idField])))
        router.push(`${deleteUrlPrefix}?${urlIdParamName}=${item[idField]}`);
    } else console.warn("Delete action invalid.", item);
  };
  const handleToggleColumnVisibility = (columnId) => {
    if (fixedColumns.includes(columnId)) return;
    setVisibleColumnIds((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };
  const handleSetViewMode = (mode) => {
    if (mode !== viewMode) {
      setViewMode(mode);
      if (mode === "card") {
        setGroupingField("");
      }
    }
  };
  const handleExportExcel = () => {
    if (data.length === 0) return;
    setLoading(true);
    try {
      const columnsToExport = initialColumnDefs.filter(
        (col) =>
          visibleColumnIds.includes(col.id) && !fixedColumns.includes(col.id)
      );
      const dataToExport = data.map((item) => {
        const row = {};
        columnsToExport.forEach((col) => {
          let value = formatValueInternal(item[col.id], col, item);
          if (React.isValidElement(value)) value = item[col.id] ?? "";
          row[col.label] = value;
        });
        return row;
      });
      const worksheet = utils.json_to_sheet(dataToExport);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, entityName.substring(0, 31));
      const colWidths = columnsToExport.map((col) => ({
        wch: Math.min(50, Math.max(15, (col.label?.length || 10) * 1.2)),
      }));
      worksheet["!cols"] = colWidths;
      writeFile(workbook, exportFileName || `export_${entityName}.xlsx`);
    } catch (exportError) {
      console.error("Erro ao exportar Excel:", exportError);
      alert(`Erro ao gerar arquivo Excel. ${exportError.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleCardSortFieldChange = (event) => {
    const newField = event.target.value;
    setSortConfig({ field: newField, direction: "asc" });
    setPage(0);
  };
  const handleCardSortDirectionToggle = () => {
    setSortConfig((prev) => ({
      ...prev,
      direction: prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // --- Formatter ---
  const formatValueInternal = useCallback(
    (value, column, item) => {
      if (value === null || typeof value === "undefined" || value === "")
        return "-";
      if (!column) return String(value);
      if (customFormatters[column.id]) {
        try {
          return customFormatters[column.id](value, item);
        } catch (e) {
          console.error(`Erro customFormatter ${column.id}:`, e);
          return `Erro`;
        }
      }
      if (column.formatter) {
        try {
          return column.formatter(value, item);
        } catch (e) {
          console.error(`Erro formatter ${column.id}:`, e);
          return `Erro`;
        }
      }
      if (column.type === "telephone") {
        try {
          return applyTelephoneMask(String(value));
        } catch (e) {
          console.error(`Erro mask tel ${value}:`, e);
          return String(value);
        }
      }
      if (column.type === "date" || column.type === "dateTime") {
        try {
          const date = new Date(value);
          if (!isDateValid(date)) return "Data Inválida";
          const formatString =
            column.type === "date" ? "dd/MM/yyyy" : "dd/MM/yyyy HH:mm";
          return format(date, formatString);
        } catch (e) {
          console.error(`Erro format date ${value}:`, e);
          return "Erro Data";
        }
      }
      if (column.type === "currency") {
        try {
          const numberValue = Number(value);
          if (isNaN(numberValue)) return "-";
          return numberValue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        } catch (e) {
          console.error(`Erro format currency ${value}:`, e);
          return String(value);
        }
      }
      if (column.type === "boolean") {
        return value ? "Sim" : "Não";
      }
      return String(value);
    },
    [customFormatters]
  );

  // --- Columns for Rendering ---
  const columnsForRendering = useMemo(
    () => initialColumnDefs.filter((col) => visibleColumnIds.includes(col.id)),
    [initialColumnDefs, visibleColumnIds]
  );

  // --- Table Rendering (MODIFIED for Zebra Striping) ---
  const renderTableRows = useCallback(() => {
    const actualColumnsToRender = columnsForRendering;
    if (loading && data.length === 0) return null;
    if (!loading && data.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={actualColumnsToRender.length}
            align="center"
            // Apply Tailwind class for consistent text color
            className="py-4 text-center text-light-text-muted dark:text-dark-text-muted"
          >
            {activeSearchTerm
              ? `${noDataMessage} para "${activeSearchTerm}".`
              : noDataMessage}
          </TableCell>
        </TableRow>
      );
    }
    let currentGroupValue = null;
    const rows = [];
    let dataRowIndex = 0; // <--- Initialize data row index for striping
    const dataToRender = [...data];

    // Apply local sorting when grouping is active
    if (groupingField && viewMode === "grid" && dataToRender.length > 0) {
      dataToRender.sort((a, b) => {
        const groupColDef = initialColumnDefs.find(
          (c) => c.id === groupingField
        );
        const valA = formatValueInternal(a[groupingField], groupColDef, a);
        const valB = formatValueInternal(b[groupingField], groupColDef, b);
        let compare = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: "base",
        });
        if (compare === 0) {
          const sortColDef = initialColumnDefs.find(
            (c) => c.id === sortConfig.field
          );
          const sortValA = a[sortConfig.field];
          const sortValB = b[sortConfig.field];
          if (sortValA < sortValB) compare = -1;
          else if (sortValA > sortValB) compare = 1;
          else compare = 0;
          if (sortConfig.direction === "desc") compare *= -1;
        }
        return compare;
      });
    }

    dataToRender.forEach((item, index) => {
      const itemKey = item?.[idField] ?? `row-${index}`;
      const groupValue =
        groupingField && viewMode === "grid" ? item?.[groupingField] : null;

      // Render Grouping Row
      if (
        groupingField &&
        viewMode === "grid" &&
        groupValue !== currentGroupValue
      ) {
        const groupColumn = initialColumnDefs.find(
          (c) => c.id === groupingField
        );
        rows.push(
          <TableRow
            key={`group-${groupValue}-${index}`}
            // Apply Tailwind background for group header
            className="bg-light-background-table-header dark:bg-dark-background-table-header"
          >
            <TableCell
              colSpan={actualColumnsToRender.length}
              // Apply Tailwind styling for group header cell
              className="py-2 px-4 font-semibold text-sm text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border"
            >
              {groupColumn?.label || groupingField}:{" "}
              {formatValueInternal(groupValue, groupColumn, item)}
            </TableCell>
          </TableRow>
        );
        currentGroupValue = groupValue;
        dataRowIndex = 0; // <--- Reset data row index for new group
      }

      // Render Data Row
      const isOddRow = dataRowIndex % 2 !== 0; // <--- Check if data row index is odd
      const rowBgClass = isOddRow
        ? "bg-light-background-table dark:bg-dark-background-table" // <--- Odd row color
        : "bg-light-background dark:bg-dark-background"; // <--- Even row color

      rows.push(
        <TableRow
          hover
          key={itemKey}
          // Apply Tailwind classes for zebra striping and base text color
          className={`${rowBgClass} text-light-text-table dark:text-dark-text-table last:border-b-0`}
          sx={{
            // Keep original sx for cursor and MUI hover behavior
            "&:last-child td, &:last-child th": { border: 0 },
            cursor: onRowClick ? "pointer" : "default",
            "&:hover": {
              backgroundColor: onRowClick
                ? theme.palette.action.selected
                : undefined,
              // Optional: You could refine hover with Tailwind's hover: variants if needed
              // e.g., add `hover:bg-light-primary/10 dark:hover:bg-dark-primary/10` to className
            },
          }}
          onClick={
            onRowClick
              ? (e) => {
                  e.stopPropagation();
                  onRowClick(item);
                }
              : undefined
          }
        >
          {actualColumnsToRender.map((column) => {
            const value = item?.[column.id];
            let cellContent = null;
            let isReactNode = false;
            if (column.id === actionColumnId) {
              isReactNode = true;
              cellContent = (
                <Stack
                  direction="row"
                  spacing={0.5}
                  justifyContent="center"
                  alignItems="center"
                >
                  {viewUrlPrefix && (
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClick(item);
                        }}
                        disabled={!item?.[idField]}
                      >
                        <VisibilityIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {editUrlPrefix && (
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(item);
                        }}
                        disabled={!item?.[idField]}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {deleteUrlPrefix && (
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(item);
                        }}
                        color="error"
                        disabled={!item?.[idField]}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              );
            } else if (column.id === pictureColumnId) {
              isReactNode = true;
              const imageUrl = getPictureUrlHelper(value, imageBaseUrl);
              cellContent = (
                <Avatar
                  src={imageUrl}
                  sx={{ width: 40, height: 40, margin: "auto" }}
                >
                  {!imageUrl && <PersonIcon />}
                </Avatar>
              );
            } else {
              cellContent = formatValueInternal(value, column, item);
              isReactNode = React.isValidElement(cellContent);
            }
            return (
              <TableCell
                key={`${itemKey}-${column.id}`}
                align={column.align || "left"}
                // Use Tailwind for padding and border, inherit text color from row
                className="py-2 px-4 text-sm border-b border-light-border dark:border-dark-border"
                sx={{
                  // Keep original sx for width/overflow constraints
                  width: column.width,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                  // padding: "8px", // Replaced by py-2 px-4
                  borderBottom: "none", // Disable MUI border as Tailwind handles it
                  ...(!isReactNode && {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: column.maxWidth || column.width || 200,
                  }),
                }}
              >
                {isReactNode ? (
                  cellContent
                ) : (
                  <Tooltip title={String(cellContent)} placement="bottom-start">
                    <span>{cellContent}</span>
                  </Tooltip>
                )}
              </TableCell>
            );
          })}
        </TableRow>
      );
      dataRowIndex++; // <--- Increment data row index *after* rendering the row
    });
    return rows;
  }, [
    loading,
    data,
    columnsForRendering,
    activeSearchTerm,
    noDataMessage,
    groupingField,
    viewMode,
    idField,
    onRowClick,
    actionColumnId,
    pictureColumnId,
    viewUrlPrefix,
    editUrlPrefix,
    deleteUrlPrefix,
    imageBaseUrl,
    theme.palette.action,
    sortConfig,
    initialColumnDefs,
    formatValueInternal, // Keep dependencies from original code
    handleViewClick,
    handleEditClick,
    handleDeleteClick, // Add handlers used inside map
    confirmDeleteMessage,
    entityName,
    urlIdParamName, // Add other potentially used props
  ]);

  // --- Dynamic Card Width Effect ---
  useLayoutEffect(() => {
    const calculateCardWidth = () => {
      let targetWidth = null;
      if (
        viewMode === "card" &&
        cardsContainerRef.current &&
        data.length >= 3 // Check data length before calculating columns
      ) {
        const containerWidth = cardsContainerRef.current.offsetWidth;
        if (containerWidth > 0) {
          let intendedNumColumns = 1;
          if (isLg) intendedNumColumns = 4;
          else if (isMd) intendedNumColumns = 3;
          else if (isSm) intendedNumColumns = 2;
          const spacingValue = 2; // Corresponds to gap-4 in Tailwind (16px)
          const gapPx = parseInt(theme.spacing(spacingValue), 10) || 16;
          const totalGap =
            intendedNumColumns > 1 ? (intendedNumColumns - 1) * gapPx : 0;
          const idealStretchedWidth =
            (containerWidth - totalGap) / intendedNumColumns;
          if (idealStretchedWidth >= MIN_CARD_WIDTH_PX) {
            targetWidth = idealStretchedWidth;
          }
        }
      }
      // Only update if the value changes to avoid unnecessary re-renders
      setDynamicCardWidth((prev) =>
        prev !== targetWidth ? targetWidth : prev
      );
    };
    const debouncedCalculate = debounce(calculateCardWidth, 150);
    calculateCardWidth(); // Initial calculation
    window.addEventListener("resize", debouncedCalculate);
    return () => {
      window.removeEventListener("resize", debouncedCalculate);
      debouncedCalculate.cancel();
    };
  }, [viewMode, data.length, isLg, isMd, isSm, theme, MIN_CARD_WIDTH_PX]); // Add MIN_CARD_WIDTH_PX

  // --- Card Rendering ---
  const renderCards = useCallback(() => {
    if (loading && data.length === 0) return null;
    if (!loading && data.length === 0) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          width="100%"
        >
          {/* Apply Tailwind text color */}
          <Typography
            variant="subtitle1"
            className="text-light-text-muted dark:text-dark-text-muted"
          >
            {activeSearchTerm
              ? `${noDataMessage} para "${activeSearchTerm}".`
              : noDataMessage}
          </Typography>
        </Box>
      );
    }
    // Sort data locally for card view
    const sortedData = [...data].sort((a, b) => {
      const field = sortConfig.field;
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      const valA = a[field];
      const valB = b[field];
      let compare = 0;
      if (valA < valB) compare = -1;
      else if (valA > valB) compare = 1;
      return compare * direction;
    });
    const elements = sortedData.map((item, index) => {
      const itemKey = item?.[idField] ?? `card-${index}`;
      const showPicture =
        pictureColumnId && visibleColumnIds.includes(pictureColumnId);
      const showTitle =
        cardTitleField && visibleColumnIds.includes(cardTitleField);
      const showSubtitle =
        cardSubtitleField && visibleColumnIds.includes(cardSubtitleField);
      const bodyColumns = initialColumnDefs.filter(
        (col) =>
          visibleColumnIds.includes(col.id) &&
          ![
            actionColumnId,
            pictureColumnId,
            cardTitleField,
            cardSubtitleField,
          ].includes(col.id)
      );
      return (
        <Card
          key={itemKey}
          // Keep original sx for dynamic width and MUI elevation/hover behavior
          sx={{
            minWidth: MIN_CARD_WIDTH_PX,
            width: dynamicCardWidth ? `${dynamicCardWidth}px` : "auto",
            flexGrow: dynamicCardWidth ? 0 : 1,
            flexBasis: dynamicCardWidth
              ? `${dynamicCardWidth}px`
              : `${MIN_CARD_WIDTH_PX}px`,
            height: "auto",
            display: "flex",
            flexDirection: "column",
            cursor: onRowClick ? "pointer" : "default",
            "&:hover": { boxShadow: onRowClick ? 6 : 2 },
            // Apply Tailwind background/text colors
            backgroundColor: "var(--color-light-background-card)", // Use CSS var or direct value
            color: "var(--color-light-text)",
            ".dark &": {
              // Target dark mode
              backgroundColor: "var(--color-dark-background-card)",
              color: "var(--color-dark-text)",
            },
          }}
          onClick={
            onRowClick
              ? (e) => {
                  e.stopPropagation();
                  onRowClick(item);
                }
              : undefined
          }
          elevation={2} // Keep MUI elevation
        >
          {/* Card Picture */}
          {showPicture &&
            (() => {
              const imageUrl = getPictureUrlHelper(
                item?.[pictureColumnId],
                imageBaseUrl
              );
              if (imageUrl) {
                return (
                  <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={`Imagem de ${item?.[cardTitleField] || entityName}`}
                    sx={{
                      height: "128px",
                      width: "128px",
                      objectFit: "cover",
                      display: "block",
                      margin: "16px auto 8px auto",
                      borderRadius: "50%",
                    }}
                  />
                );
              } else {
                return (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      height: "128px",
                      width: "128px",
                      bgcolor: "grey.200", // Keep MUI grey or use Tailwind bg-light-background-form-secondary dark:bg-dark-background-form-secondary
                      color: "text.secondary", // Keep MUI secondary text or use Tailwind text-light-muted dark:text-dark-muted
                      margin: "16px auto 8px auto",
                      borderRadius: "50%",
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Box>
                );
              }
            })()}
          {/* Card Content */}
          <CardContent
            sx={{
              flexGrow: 1,
              pt: showPicture ? 0.5 : 1.5,
              pb: 1,
              overflow: "hidden",
            }}
          >
            {showTitle && (
              <Tooltip
                title={String(item?.[cardTitleField] || "")}
                placement="top"
                disableHoverListener={
                  String(item?.[cardTitleField] || "").length < 30
                }
              >
                <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  align="center"
                  sx={{
                    wordBreak: "break-word",
                    lineHeight: 1.3,
                    maxHeight: "3.9em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    mb: 1,
                  }}
                >
                  {formatValueInternal(
                    item?.[cardTitleField],
                    initialColumnDefs.find((c) => c.id === cardTitleField),
                    item
                  )}
                </Typography>
              </Tooltip>
            )}
            {showSubtitle && (
              <Tooltip
                title={String(item?.[cardSubtitleField] || "")}
                placement="top"
                disableHoverListener={
                  String(item?.[cardSubtitleField] || "").length < 40
                }
              >
                <Typography
                  variant="body2"
                  align="center"
                  // Apply Tailwind text color for subtitle
                  className="text-light-text-label dark:text-dark-text-label"
                  sx={{
                    mb: 1.5,
                    wordBreak: "break-word",
                    maxHeight: "3em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {formatValueInternal(
                    item?.[cardSubtitleField],
                    initialColumnDefs.find((c) => c.id === cardSubtitleField),
                    item
                  )}
                </Typography>
              </Tooltip>
            )}
            {bodyColumns.map((col) => (
              <Box
                key={col.id}
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ mb: 0.5, gap: 1 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "500",
                    mr: 1,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                  // Apply Tailwind text color for label
                  className="text-light-text-label dark:text-dark-text-label"
                >
                  {col.label}:
                </Typography>
                <Tooltip
                  title={String(formatValueInternal(item?.[col.id], col, item))}
                  placement="top-end"
                  disableHoverListener={
                    String(formatValueInternal(item?.[col.id], col, item))
                      .length < 25
                  }
                >
                  <Typography
                    variant="caption"
                    sx={{ textAlign: "right", wordBreak: "break-word" }}
                  >
                    {formatValueInternal(item?.[col.id], col, item)}
                  </Typography>
                </Tooltip>
              </Box>
            ))}
          </CardContent>
          {/* Card Actions */}
          {(viewUrlPrefix || editUrlPrefix || deleteUrlPrefix) && (
            <CardActions
              sx={{
                justifyContent: "center",
                borderTop: 1,
                borderColor: "divider",
                pt: 1,
                pb: 1,
                mt: "auto",
              }}
            >
              {viewUrlPrefix && (
                <Tooltip title="Visualizar">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewClick(item);
                    }}
                    disabled={!item?.[idField]}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              )}
              {editUrlPrefix && (
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(item);
                    }}
                    disabled={!item?.[idField]}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              {deleteUrlPrefix && (
                <Tooltip title="Excluir">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(item);
                    }}
                    color="error"
                    disabled={!item?.[idField]}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </CardActions>
          )}
        </Card>
      );
    });
    return (
      <Box
        ref={cardsContainerRef}
        display="flex"
        flexWrap="wrap"
        gap={theme.spacing(2)} // Use theme spacing for consistency or replace with Tailwind gap-4
        sx={{ pt: 2 }}
        justifyContent="flex-start" // Keep items aligned to the start
      >
        {elements}
      </Box>
    );
  }, [
    loading,
    data,
    activeSearchTerm,
    noDataMessage,
    idField,
    initialColumnDefs,
    pictureColumnId,
    imageBaseUrl,
    cardTitleField,
    cardSubtitleField,
    visibleColumnIds,
    actionColumnId,
    viewUrlPrefix,
    editUrlPrefix,
    deleteUrlPrefix,
    onRowClick,
    theme,
    dynamicCardWidth,
    formatValueInternal,
    entityName,
    sortConfig,
    handleViewClick,
    handleEditClick,
    handleDeleteClick,
    MIN_CARD_WIDTH_PX, // Add dependencies
  ]);

  // --- Sortable Columns ---
  const sortableColumns = useMemo(
    () =>
      initialColumnDefs.filter(
        (col) => col.id !== actionColumnId && col.sortable !== false
      ), // Exclude non-sortable
    [initialColumnDefs, actionColumnId]
  );

  // --- JSX Final ---
  return (
    <Box sx={{ width: "100%" }}>
      {/* Toolbar */}
      <Paper sx={{ mb: 4, mt: 4, border: 0 }} elevation={0} variant="outlined">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          flexWrap="wrap"
        >
          {/* Seção Esquerda: Filtro e Controles Condicionais */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{
              flexGrow: 1,
              minWidth: { xs: "100%", sm: "300px" },
              mb: { xs: 1, md: 0 },
            }}
          >
            {/* Search Field - Apply Tailwind colors via sx or InputProps/InputLabelProps if needed */}
            <TextField
              label={searchPlaceholder}
              variant="outlined"
              size="small"
              fullWidth
              value={filterTerm}
              onChange={handleInputChange}
              onKeyDown={handleFilterKeyDown}
              disabled={loading}
              // sx={{ // Example applying Tailwind colors via sx
              //   '& .MuiInputBase-root': { backgroundColor: 'var(--color-light-background-form)', color: 'var(--color-light-text)'},
              //   '.dark & .MuiInputBase-root': { backgroundColor: 'var(--color-dark-background-form)', color: 'var(--color-dark-text)'},
              //   '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-light-border)' },
              //   '.dark & .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-dark-border)' },
              // }}
              InputProps={{
                // className: "dark:text-dark-text", // Example using direct class (might need !important)
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="buscar"
                      onClick={handleSearchClick}
                      edge="end"
                      size="small"
                      disabled={loading}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              // InputLabelProps={{ className: "dark:text-dark-text-label" }}
            />
            {viewMode === "grid" && (
              <FormControl
                size="small"
                sx={{ minWidth: { xs: "100%", sm: 180 } }}
              >
                <InputLabel id={`group-by-label-${entityName}`}>
                  {groupingLabel}
                </InputLabel>
                <Select
                  labelId={`group-by-label-${entityName}`}
                  label={groupingLabel}
                  value={groupingField}
                  onChange={handleGroupingChange}
                  disabled={loading || viewMode !== "grid"}
                >
                  <MenuItem value="">
                    <em>Nenhum</em>
                  </MenuItem>
                  {initialColumnDefs
                    .filter((c) => c.groupable)
                    .map((col) => (
                      <MenuItem key={col.id} value={col.id}>
                        {col.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
            {viewMode === "card" && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 180, flexGrow: 1 }}>
                  <InputLabel id={`card-sort-label-${entityName}`}>
                    {cardSortLabel}
                  </InputLabel>
                  <Select
                    labelId={`card-sort-label-${entityName}`}
                    label={cardSortLabel}
                    value={sortConfig.field}
                    onChange={handleCardSortFieldChange}
                    disabled={loading}
                  >
                    {sortableColumns.map((col) => (
                      <MenuItem key={col.id} value={col.id}>
                        {col.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Tooltip
                  className="p-[0.30rem] rounded-[3px] border border-light-border dark:border-dark-border"
                  title={
                    sortConfig.direction === "asc"
                      ? "Ordem Ascendente"
                      : "Ordem Descendente"
                  }
                >
                  <span>
                    <IconButton
                      onClick={handleCardSortDirectionToggle}
                      disabled={loading}
                      size="small"
                    >
                      {sortConfig.direction === "asc" ? (
                        <ArrowUpwardIcon fontSize="inherit" />
                      ) : (
                        <ArrowDownwardIcon fontSize="inherit" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            )}
          </Stack>
          {/* Seção Direita: Botões Gerais */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            justifyContent={{ xs: "flex-start", sm: "flex-end" }}
          >
            <Tooltip title={columnSelectorLabel}>
              <span>
                <Button
                  ref={columnSelectorAnchorRef}
                  variant="outlined"
                  size="medium"
                  onClick={() => setColumnSelectorOpen(true)}
                  startIcon={<ViewColumnIcon />}
                  aria-controls={
                    columnSelectorOpen ? "column-selector-menu" : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={columnSelectorOpen ? "true" : undefined}
                  disabled={loading}
                >
                  <Typography sx={{ display: { xs: "none", md: "inline" } }}>
                    {columnSelectorLabel}
                  </Typography>
                  <Typography sx={{ display: { xs: "inline", md: "none" } }}>
                    Colunas
                  </Typography>
                </Button>
              </span>
            </Tooltip>
            {viewMode === "grid" && (
              <Button
                variant="outlined"
                size="medium"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportExcel}
                disabled={loading || data.length === 0}
              >
                <Typography sx={{ display: { xs: "none", md: "inline" } }}>
                  {exportButtonLabel}
                </Typography>
                <Typography sx={{ display: { xs: "inline", md: "none" } }}>
                  Excel
                </Typography>
              </Button>
            )}
            {!isMobile && (
              <Box
                sx={{
                  display: "inline-flex",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                  alignSelf: "center",
                  height: "35px",
                }}
              >
                <Tooltip title="Visualizar em Tabela">
                  <IconButton
                    onClick={() => handleSetViewMode("grid")}
                    color={viewMode === "grid" ? "primary" : "default"}
                    size="medium"
                    sx={{
                      borderRadius: 0,
                      borderRight: 1,
                      borderColor: "divider",
                    }}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Visualizar em Cards">
                  <IconButton
                    onClick={() => handleSetViewMode("card")}
                    color={viewMode === "card" ? "primary" : "default"}
                    size="medium"
                    sx={{ borderRadius: 0 }}
                  >
                    <GridViewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Popover Seletor de Colunas */}
      <Popover
        id="column-selector-menu"
        open={columnSelectorOpen}
        anchorEl={columnSelectorAnchorRef.current}
        onClose={() => setColumnSelectorOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        // Apply Tailwind background to Popover Paper
        PaperProps={{
          className: "bg-light-background-form dark:bg-dark-background-form",
        }}
      >
        <Paper
          sx={{
            width: 280,
            maxHeight: 400,
            overflow: "auto",
            background: "inherit",
          }}
          elevation={0}
        >
          <List dense>
            {initialColumnDefs
              .filter((col) => !fixedColumns.includes(col.id))
              .map((column) => {
                const isVisible = visibleColumnIds.includes(column.id);
                const labelId = `column-checkbox-label-${column.id}`;
                return (
                  <ListItem key={column.id} disablePadding>
                    <ListItemButton
                      role={undefined}
                      onClick={() => handleToggleColumnVisibility(column.id)}
                      dense
                    >
                      <ListItemIcon sx={{ minWidth: "auto", mr: 1.5 }}>
                        <Checkbox
                          edge="start"
                          checked={isVisible}
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ "aria-labelledby": labelId }}
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText id={labelId} primary={column.label} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
          </List>
        </Paper>
      </Popover>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Indicador de Loading */}
      {loading && (
        <LinearProgress
          sx={{
            width: "100%",
            mb: viewMode === "grid" ? -0.5 : 2,
            position: "relative",
            top: viewMode === "grid" ? -8 : 0,
          }}
        />
      )}

      {/* Renderização Condicional: Grid ou Cards */}
      {viewMode === "grid" && (
        <TableContainer
          component={Paper}
          sx={{ overflowX: "auto" }}
          elevation={0}
          variant="outlined"
        >
          <Table
            stickyHeader
            sx={{ minWidth: 650 }}
            aria-label={`tabela de ${entityName.toLowerCase()}`}
          >
            <TableHead>
              <TableRow
                // Apply Tailwind background to header row
                className="bg-light-background-table-header dark:bg-dark-background-table-header"
              >
                {columnsForRendering.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    sortDirection={
                      sortConfig.field === column.id
                        ? sortConfig.direction
                        : false
                    }
                    // Apply Tailwind text color to header cells
                    className="text-light-text dark:text-dark-text"
                    sx={{
                      // Keep original sx for sizing, borders, etc.
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      fontWeight: "bold",
                      padding: "10px 16px",
                      backgroundColor: "transparent", // Make cell background transparent to show row background
                      whiteSpace: "nowrap",
                      borderBottom: 2,
                      borderColor: "divider",
                    }}
                  >
                    {column.sortable !== false && !groupingField ? (
                      <TableSortLabel
                        active={sortConfig.field === column.id}
                        direction={
                          sortConfig.field === column.id
                            ? sortConfig.direction
                            : "asc"
                        }
                        onClick={() => handleSortRequest(column.id)}
                        disabled={loading || !!groupingField}
                        // IconComponent={sortConfig.field === column.id ? (sortConfig.direction === "asc" ? ArrowUpwardIcon : ArrowDownwardIcon) : undefined}
                        // sx={{ '& .MuiTableSortLabel-icon': { color: 'inherit !important' } }} // Style icon if needed
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{renderTableRows()}</TableBody>
            {/* Rows get styled in renderTableRows */}
          </Table>
        </TableContainer>
      )}
      {viewMode === "card" && (
        <Box sx={{ position: "relative" }}>{renderCards()}</Box>
      )}

      {/* --- PAGINAÇÃO --- */}
      {(totalRowCount > 0 || loading) && (
        <TablePagination
          component={Paper}
          elevation={0}
          variant="outlined"
          sx={{
            mt: 2,
            borderTop: 1,
            borderColor: "divider",
            // Apply Tailwind background/text colors to the container
            backgroundColor: "var(--color-light-background)",
            color: "var(--color-light-text)",
            ".dark &": {
              backgroundColor: "var(--color-dark-background)",
              color: "var(--color-dark-text)",
            },
            "& .MuiToolbar-root": {
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              px: { xs: 1, sm: 2 },
              py: 1,
              gap: 1,
            },
            "& .MuiTablePagination-actions": {
              order: { xs: 2, sm: 1 },
              flexGrow: { sm: 1 },
              justifyContent: "center",
              width: { xs: "100%", sm: "auto" },
              m: 0,
              p: 0,
              mt: { xs: 1, sm: 0 },
            },
            "& .MuiTablePagination-selectLabel": {
              order: { xs: 1, sm: 2 },
              mb: { xs: 1, sm: 0 },
              ml: { sm: "auto" },
            },
            "& .MuiTablePagination-input": {
              order: { xs: 1, sm: 2 },
              mb: { xs: 1, sm: 0 },
            },
            "& .MuiTablePagination-spacer": { display: "none" },
            // Style Select input within pagination
            "& .MuiSelect-select": {
              // backgroundColor: 'var(--color-light-background-form)', // Example
              // '.dark &': { backgroundColor: 'var(--color-dark-background-form)' }
            },
          }}
          count={totalRowCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={() => ""}
          ActionsComponent={CustomPaginationActions}
          showFirstButton={true}
          showLastButton={true}
        />
      )}
    </Box>
  );
};

export default DataGridComponent;

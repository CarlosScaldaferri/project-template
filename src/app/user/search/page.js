// src/app/user/search/page.jsx (ou onde estiver seu arquivo)
"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import DataGridComponent from "@/frontend/components/dataGridComponent/DataGridComponent";
import { FaSearch } from "react-icons/fa";

// Definições de coluna (mantidas)
const userColumnDefs = [
  {
    id: "picture",
    label: "Foto",
    sortable: false,
    groupable: false,
    align: "center",
    width: "80px",
  },
  {
    id: "id",
    label: "ID",
    sortable: true,
    groupable: true,
    align: "left",
    width: "90px",
  },
  { id: "name", label: "Nome", sortable: true, groupable: true, align: "left" },
  {
    id: "nickname",
    label: "Apelido",
    sortable: true,
    groupable: true,
    align: "left",
    width: "150px",
  },
  {
    id: "mainEmail",
    label: "Email Principal",
    sortable: true,
    groupable: true,
    align: "left",
    width: "250px",
  },
  {
    id: "mainTelephone",
    label: "Telefone Principal",
    sortable: true,
    groupable: true,
    align: "left",
    width: "180px",
    type: "telephone",
  },
  {
    id: "birth_date",
    label: "Nascimento",
    sortable: true,
    groupable: false,
    align: "left",
    width: "130px",
    type: "date",
  },
  {
    id: "cpf",
    label: "CPF",
    sortable: true,
    groupable: true,
    align: "left",
    width: "150px",
  },
  {
    id: "actions",
    label: "Ações",
    sortable: false,
    groupable: false,
    align: "center",
    width: "150px",
  },
];

const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL + process.env.NEXT_PUBLIC_UPLOADS;

const UserSearchPage = () => {
  return (
    <Box
      sx={{ padding: 3, width: "100%" }}
      className="border border-light-border dark:border-dark-border space-y-3"
    >
      <header className="pb-5 pt-5 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <FaSearch className="w-[3.5rem] h-[3.5rem] text-light-primary dark:text-dark-primary" />
          <div className="flex flex-col">
            <h1 className="text-[30px] text-light-text dark:text-dark-text">
              Pesquisa de Usuários
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted">
              Use os filtros abaixo para encontrar os usuários desejados.
            </p>
          </div>
        </div>
      </header>

      <DataGridComponent
        configKey="userSearchGrid_v2" // Boa prática mudar a chave ao adicionar configs persistidas
        columnDefs={userColumnDefs}
        searchApiUrl="/api/user/search"
        entityName="Usuários"
        idField="id"
        urlIdParamName="userId"
        viewUrlPrefix="/user/view"
        editUrlPrefix="/user/edit"
        deleteUrlPrefix="/user/delete"
        defaultSortField="id"
        defaultSortDirection="asc"
        pictureColumnId="picture"
        imageBaseUrl={IMAGE_BASE_URL}
        actionColumnId="actions"
        initialRowsPerPage={10}
        exportFileName="usuarios.xlsx"
        confirmDeleteMessage={(userId) =>
          `Tem certeza que deseja excluir o usuário ID ${userId}?`
        }
        extraFetchParams={{
          main_email: "true",
          main_telephone: "true",
        }}
        // Props específicas do Card View
        cardTitleField="name" // Campo para o título principal do card
        cardSubtitleField="nickname" // Campo para o subtítulo (opcional)
        cardFieldsToShow={3} // Quantos outros campos mostrar no card
      />
    </Box>
  );
};

export default UserSearchPage;

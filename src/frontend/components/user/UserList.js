"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const UserList = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/getAllUsers/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Erro na requisição");

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = () => {
    console.log(`Pesquisando: ${search}`);
  };

  const handleAddUser = () => {
    console.log("Adicionar usuário");
    // Aqui pode abrir um modal ou redirecionar para a tela de criação de usuário
  };

  const handleEditUser = (id) => {
    console.log(`Editar usuário: ${id}`);
  };

  const handleDeleteUser = (id) => {
    console.log(`Excluir usuário: ${id}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Usuários</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar usuários"
          className="p-2 border rounded w-full"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-GREEN-500 text-white rounded"
        >
          Pesquisar
        </button>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Adicionar
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 border-b pb-2 font-bold text-left">
        <p>Imagem</p>
        <p>Nome</p>
        <p>Nickname</p>
        <p>Ações</p>
      </div>

      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.sub}
            className="grid grid-cols-4 gap-4 p-2 border-b items-center"
          >
            <Image
              src={user.picture}
              alt={user.name}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
            <p>{user.name}</p>
            <p>{user.nickname}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditUser(user.sub)}
                className="px-2 py-1 bg-yellow-500 text-white rounded"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteUser(user.sub)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Excluir
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="mt-4">Nenhum usuário encontrado.</p>
      )}
    </div>
  );
};

export default UserList;

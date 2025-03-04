"use client";
import { applyCPFMask } from "@/businnes/indivisibleRules/userRules";
import Button from "@/components/form/button/Button";
import Form from "@/components/form/Form";
import CustomImage from "@/components/form/image/CustomImage";
import CustomInput from "@/components/form/input/CustomInput";
import CustomSelect from "@/components/form/select/CustomSelect";
import { useState, useEffect, useCallback } from "react";
import { FaEdit, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import { MdPerson } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export default function UserForm({ userId }) {
  const [userData, setUserData] = useState(() => ({
    name: "",
    nickname: "",
    picture: "",
    birth_date: "",
    cpf: "",
    gender: "",
    addresses: [
      {
        id: Date.now(),
        zip_code: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        country: "",
        is_main: false,
      },
    ],
    emails: [
      { id: Date.now(), email: "", is_main: false, email_verified: false },
    ],
    phones: [{ id: Date.now(), phone: "", is_main: false }],
  }));
  const [mode, setMode] = useState("create");

  const fetchUserData = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) throw new Error("Erro ao buscar dados do usuário");
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      setMode("edit");
      fetchUserData(userId);
    } else {
      setMode("create");
    }
  }, [userId, fetchUserData]);

  const handleChange = useCallback((e, index, field) => {
    const { name, value, type, checked } = e.target;
    if (field && typeof index === "number") {
      setUserData((prev) => ({
        ...prev,
        [field]: prev[field].map((item, i) =>
          i === index
            ? { ...item, [name]: type === "checkbox" ? checked : value }
            : item
        ),
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  }, []);

  const handleCpfChange = useCallback((e) => {
    const maskedValue = applyCPFMask(e.target.value);
    setUserData((prev) => ({ ...prev, cpf: maskedValue }));
  }, []);

  const createEmptyAddress = () => ({
    id: Date.now(),
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "",
    is_main: false,
  });

  const createEmptyEmail = () => ({
    id: Date.now(),
    email: "",
    is_main: false,
    email_verified: false,
  });

  const createEmptyPhone = () => ({
    id: Date.now(),
    phone: "",
    is_main: false,
  });

  const addItem = useCallback((field) => {
    setUserData((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        field === "addresses"
          ? createEmptyAddress()
          : field === "emails"
            ? createEmptyEmail()
            : createEmptyPhone(),
      ],
    }));
  }, []);

  const removeItem = useCallback((field, index) => {
    setUserData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }, []);

  const handleMainToggle = useCallback((field, index) => {
    setUserData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => ({
        ...item,
        is_main: i === index ? !item.is_main : false,
      })),
    }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!e.currentTarget.checkValidity()) {
        e.currentTarget.reportValidity();
        return;
      }
      console.log("Formulário enviado:", userData);
    },
    [userData]
  );

  return (
    <Form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl bg-neutral-white shadow-xl p-5"
    >
      {/* Header */}
      <div className="bg-primary-light text-primary-dark rounded-lg shadow-md p-2">
        <h2 className=" flex justify-center items-center text-xl">
          <FaEdit className="mr-2" /> EDITANDO PERFIL
        </h2>
      </div>

      {/* Profile Section */}
      <div className="bg-primary-light p-3 mt-2 rounded-lg shadow-md">
        <div className="bg-neutral-white border border-neutral-light  rounded-lg p-4 space-y-4">
          <div className="flex space-x-4">
            <div className="relative h-[7.7rem] w-fit rounded-lg">
              <label
                htmlFor="file-upload"
                className="cursor-pointer group flex items-center justify-center w-full h-full"
              >
                {userData.picture ? (
                  <CustomImage
                    src={userData.picture}
                    alt="Foto do usuário"
                    className="object-cover p-[0.10rem] w-full h-full rounded-lg" // Usando object-cover para preencher o contêiner
                  />
                ) : (
                  <MdPerson className="text-neutral-medium h-[7.7rem] w-auto  border border-neutral-medium rounded-lg" /> // Ajustando o tamanho do ícone
                )}

                {mode !== "view" && (
                  <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-neutral-dark opacity-0 group-hover:opacity-50  transition-opacity">
                    <span className="text-neutral-white text-sm">
                      Alterar Foto
                    </span>
                  </div>
                )}
              </label>

              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*"
                disabled={mode === "view"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () =>
                      setUserData((prev) => ({
                        ...prev,
                        picture: reader.result,
                      }));
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <div className="flex-1 space-y-4">
              <CustomInput
                label="Nome"
                name="name"
                value={userData.name}
                onChange={handleChange}
                disabled={mode === "view"}
              />
              <CustomInput
                label="Apelido"
                name="nickname"
                value={userData.nickname}
                onChange={handleChange}
                disabled={mode === "view"}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <CustomInput
                label="Data de Nascimento"
                name="birth_date"
                type="date"
                value={userData.birth_date}
                onChange={handleChange}
                disabled={mode === "view"}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <CustomInput
                label="CPF"
                name="cpf"
                value={userData.cpf}
                onChange={handleCpfChange}
                disabled={mode === "view"}
                maxLength={14}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <CustomSelect
                label="Gênero"
                name="gender"
                value={userData.gender}
                onChange={handleChange}
                disabled={mode === "view"}
                options={[
                  { value: "", label: "" },
                  { value: "masculino", label: "Masculino" },
                  { value: "feminino", label: "Feminino" },
                  { value: "outro", label: "Outro" },
                  { value: "prefiro_nao_dizer", label: "Prefiro não dizer" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="bg-primary-light p-3 mt-2 shadow-md rounded-lg space-y-3">
        <div className="flex items-center justify-between border border-neutral-light rounded-lg bg-neutral-white p-3">
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-xl text-primary-dark mr-2" />
            <h3 className="text-lg text-primary-dark">ENDEREÇOS</h3>
          </div>
          {mode !== "view" && (
            <FiPlus
              className="mr-2 text-2xl text-primary-dark"
              onClick={() => addItem("addresses")}
            />
          )}
        </div>
        {userData.addresses.map((address, index) => (
          <div
            key={address.id}
            className="bg-neutral-white p-3 space-y-3 border border-neutral-light rounded-lg"
          >
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[150px]">
                <CustomInput
                  label="CEP"
                  name="zip_code"
                  value={address.zip_code}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <CustomInput
                  label="Rua/Avenida"
                  name="street"
                  value={address.street}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex-1 min-w-[100px]">
                <CustomInput
                  label="Número"
                  name="number"
                  value={address.number}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <CustomInput
                  label="Complemento"
                  name="complement"
                  value={address.complement}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <CustomInput
                  label="Bairro"
                  name="neighborhood"
                  value={address.neighborhood}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <CustomInput
                  label="Cidade"
                  name="city"
                  value={address.city}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex-1 min-w-[100px]">
                <CustomInput
                  label="Estado"
                  name="state"
                  value={address.state}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <CustomInput
                  label="País"
                  name="country"
                  value={address.country}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
              </div>
            </div>
            <div className="flex flex-col items-end space-y-3 whitespace-nowrap text-neutral-medium">
              <label className="flex items-center">
                <CustomInput
                  type="checkbox"
                  name="is_main"
                  checked={address.is_main}
                  onChange={() => handleMainToggle("addresses", index)}
                  disabled={mode === "view"}
                />
                Este é o principal?
              </label>
              {mode !== "view" && (
                <FiTrash2
                  className="mr-2 text-2xl text-primary-dark"
                  onClick={() => removeItem("addresses", index)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Emails Section */}
      <div className="bg-primary-light p-3 mt-2 shadow-md space-y-3 rounded-lg">
        <div className="flex items-center justify-between bg-neutral-white p-3 border border-neutral-light rounded-lg">
          <div className="flex items-center">
            <FaEnvelope className="text-xl text-primary-dark mr-2" />
            <h3 className="text-lg text-primary-dark">E-MAILS</h3>
          </div>
          {mode !== "view" && (
            <FiPlus
              className="mr-2 text-2xl text-primary-dark"
              onClick={() => addItem("emails")}
            />
          )}
        </div>
        {userData.emails.map((email, index) => (
          <div
            key={email.id}
            className="bg-neutral-white p-3 space-y-3 border border-neutral-light rounded-lg"
          >
            <CustomInput
              label="E-mail"
              name="email"
              value={email.email}
              onChange={(e) => handleChange(e, index, "emails")}
              disabled={mode === "view"}
            />
            <div className="flex flex-col items-end space-y-3 whitespace-nowrap text-neutral-medium">
              <label className="flex items-center">
                <CustomInput
                  type="checkbox"
                  name="is_main"
                  checked={email.is_main}
                  onChange={() => handleMainToggle("emails", index)}
                  disabled={mode === "view"}
                />
                Este é o principal?
              </label>
              {mode !== "view" && (
                <FiTrash2
                  className="mr-2 text-2xl text-primary-dark"
                  onClick={() => removeItem("emails", index)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Phones Section */}
      <div className="bg-primary-light p-3 mt-2 shadow-md space-y-3 rounded-lg">
        <div className="flex items-center justify-between bg-neutral-white p-3 border border-neutral-light rounded-lg">
          <div className="flex items-center">
            <FaPhone className="text-xl text-primary-dark mr-2" />
            <h3 className="text-lg text-primary-dark">TELEFONES</h3>
          </div>
          {mode !== "view" && (
            <FiPlus
              className="mr-2 text-2xl text-primary-dark"
              onClick={() => addItem("phones")}
            />
          )}
        </div>
        {userData.phones.map((phone, index) => (
          <div
            key={phone.id}
            className="bg-neutral-white p-3 space-y-3 border border-neutral-light rounded-lg"
          >
            <CustomInput
              label="Telefone"
              name="phone"
              value={phone.phone}
              onChange={(e) => handleChange(e, index, "phones")}
              disabled={mode === "view"}
            />
            <div className="flex flex-col items-end space-y-3 whitespace-nowrap text-neutral-medium">
              <label className="flex items-center">
                <CustomInput
                  type="checkbox"
                  name="is_main"
                  checked={phone.is_main}
                  onChange={() => handleMainToggle("phones", index)}
                  disabled={mode === "view"}
                />
                Este é o principal?
              </label>
              {mode !== "view" && (
                <FiTrash2
                  className="mr-2 text-2xl text-primary-dark"
                  onClick={() => removeItem("phones", index)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form Actions */}
      {mode !== "view" && (
        <div className="flex justify-end gap-4 mt-4">
          <Button type="submit" variant="primary">
            Salvar
          </Button>
          <Button type="button" variant="secondary">
            Cancelar
          </Button>
        </div>
      )}
    </Form>
  );
}

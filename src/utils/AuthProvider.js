// src/utils/AuthProvider.js
"use client";

import { SessionProvider } from "next-auth/react";
import PropTypes from "prop-types";

const AuthProvider = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;

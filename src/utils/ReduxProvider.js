// src/utils/AuthProvider.js
"use client";

import { store } from "@/lib/store";
import PropTypes from "prop-types";
import { Provider } from "react-redux";

const ReduxProvider = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

ReduxProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ReduxProvider;

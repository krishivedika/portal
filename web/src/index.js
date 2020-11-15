import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { SharedContextProvider } from "./context";
import axios from "axios";

axios.defaults.withCredentials = true;

ReactDOM.render(
  <SharedContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SharedContextProvider>,
  document.getElementById("root")
);

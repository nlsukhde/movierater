import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Signup from "./pages/Signup";
import MovieRaterHomeScreen from "./pages/Homescreen";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/homescreen" element={<MovieRaterHomeScreen />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

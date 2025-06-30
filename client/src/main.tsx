import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Signup from "./pages/Signup";
import MovieRaterHomeScreen from "./pages/Homescreen";
import MovieDetailPage from "./pages/Review";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/homescreen" element={<MovieRaterHomeScreen />} />
        <Route path="/review" element={<MovieDetailPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Signup from "./pages/Signup";
import MovieRaterHomeScreen from "./pages/Homescreen";
import MovieDetailPage from "./pages/Review";
import LatestReviewsPage from "./pages/LatestReviewsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MyReviewsPage from "./pages/MyReviewsPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/homescreen"
          element={
            <ProtectedRoute>
              <MovieRaterHomeScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/:id"
          element={
            <ProtectedRoute>
              <MovieDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <LatestReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reviews"
          element={
            <ProtectedRoute>
              <MyReviewsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

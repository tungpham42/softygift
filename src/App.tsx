import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import enUs from "antd/locale/en_US";
import CreateEventPage from "./pages/CreateEvent/CreateEventPage";
import GiftRequestPage from "./pages/GiftRequest/GiftRequestPage";
import SuccessPage from "./pages/Success/SuccessPage";

function App() {
  return (
    <ConfigProvider
      locale={enUs}
      theme={{
        token: {
          colorPrimary: "#ff5a5f", // Warm, friendly coral
          colorInfo: "#ff5a5f",
          borderRadius: 12, // Softer inputs and buttons
          fontFamily: '"Lexend Deca", sans-serif',
          colorTextHeading: "#2c3e50",
          colorBgContainer: "#ffffff",
        },
        components: {
          Card: {
            paddingLG: 32, // More breathing room
          },
          Button: {
            controlHeight: 44, // Taller, more clickable buttons
            fontSize: 16,
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CreateEventPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/gift" element={<GiftRequestPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

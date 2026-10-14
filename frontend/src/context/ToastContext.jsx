import { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, Slide } from "@mui/material";

const ToastContext = createContext(null);

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
    duration: 4000,
  });

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const showToast = useCallback((message, severity = "info", duration = 4000) => {
    setToast({
      open: true,
      message,
      severity,
      duration,
    });
  }, []);

  const showSuccess = useCallback((message, duration = 4000) => {
    showToast(message, "success", duration);
  }, [showToast]);

  const showError = useCallback((message, duration = 5000) => {
    showToast(message, "error", duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration = 4000) => {
    showToast(message, "info", duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration = 4000) => {
    showToast(message, "warning", duration);
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        hideToast,
      }}
    >
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.duration}
        onClose={hideToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={SlideTransition}
        sx={{ mt: 7, zIndex: 9999 }}
      >
        <Alert
          onClose={hideToast}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            fontWeight: 600,
            fontSize: "0.875rem",
            alignItems: "center",
            ...(toast.severity === "success" && {
              backgroundColor: "#10B981",
              color: "#FFFFFF",
            }),
            ...(toast.severity === "error" && {
              backgroundColor: "#EF4444",
              color: "#FFFFFF",
            }),
            ...(toast.severity === "warning" && {
              backgroundColor: "#F59E0B",
              color: "#FFFFFF",
            }),
            ...(toast.severity === "info" && {
              backgroundColor: "#4F46E5",
              color: "#FFFFFF",
            }),
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

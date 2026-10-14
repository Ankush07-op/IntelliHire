import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4F46E5",      // Modern Indigo
      light: "#EEF2FF",
      dark: "#4338CA",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#7C3AED",      // Violet
      light: "#F5F3FF",
      dark: "#6D28D9",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#10B981",      // Emerald
      light: "#ECFDF5",
      dark: "#059669",
    },
    info: {
      main: "#0EA5E9",      // Sky Blue
      light: "#F0F9FF",
      dark: "#0284C7",
    },
    warning: {
      main: "#F59E0B",      // Amber
      light: "#FFFBEB",
      dark: "#D97706",
    },
    error: {
      main: "#EF4444",      // Rose/Red
      light: "#FEF2F2",
      dark: "#DC2626",
    },
    background: {
      default: "#F8FAFC",   // Clean Slate-50
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",   // Slate-900
      secondary: "#64748B", // Slate-500
    },
    divider: "#E2E8F0",
  },

  typography: {
    fontFamily: [
      "'Plus Jakarta Sans'",
      "'Inter'",
      "-apple-system",
      "BlinkMacSystemFont",
      "'Segoe UI'",
      "Roboto",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontWeight: 700, letterSpacing: "-0.025em" },
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 600, letterSpacing: "-0.015em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500, color: "#64748B" },
    body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.5, color: "#64748B" },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 18px",
          fontWeight: 600,
          boxShadow: "none",
          transition: "all 0.15s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
          },
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#4338CA",
          },
        },
        outlined: {
          borderColor: "#E2E8F0",
          "&:hover": {
            borderColor: "#CBD5E1",
            backgroundColor: "#F8FAFC",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: "#FFFFFF",
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&:last-child": {
            paddingBottom: "24px",
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.75rem",
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#F8FAFC",
            fontWeight: 700,
            color: "#475569",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderBottom: "1px solid #E2E8F0",
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#F1F5F9",
          padding: "14px 16px",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#0F172A",
          boxShadow: "none",
          borderBottom: "1px solid #E2E8F0",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#4F46E5",
            borderWidth: "2px",
          },
        },
      },
    },
  },
});

export default theme;
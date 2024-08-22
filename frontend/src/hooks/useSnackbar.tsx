import React, { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, Alert, AlertColor, Slide, SlideProps } from "@mui/material";

interface SnackbarContextProps {
  setSnackBar: (message: string, status: AlertColor) => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined
);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [snackbarMessage, setSnackbarMessage] = useState<{
    message: string;
    status: AlertColor;
  } | null>(null);

  const handleCloseSnackbar = () => {
    setSnackbarMessage(null);
  };

  const value = {
    setSnackBar: (message: string, status: AlertColor) => {
      setSnackbarMessage({ message, status });
    },
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {snackbarMessage && (
        <Snackbar
          open={Boolean(snackbarMessage)}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          TransitionComponent={(props: SlideProps) => (
            <Slide {...props} direction="up" />
          )}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarMessage.status}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage.message}
          </Alert>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
};

export default function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
}

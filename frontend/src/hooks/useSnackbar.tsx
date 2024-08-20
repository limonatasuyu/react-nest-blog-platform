import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Snackbar, Alert, AlertColor, Slide, SlideProps } from "@mui/material";

const createToastContainer = () => {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.style.position = "fixed";
  container.style.bottom = "10px";
  container.style.right = "10px";
  container.style.zIndex = "9999";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "1rem";
  document.body.appendChild(container);
  return container;
};

export default function useSnackbar() {
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState<{
    message: string;
    status: AlertColor;
  }>({ message: "", status: "success" });

  function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="up" />;
  }

  function handleCloseSnackbar() {
    setIsSnackbarOpen(false);
  }

  function setSnackBar(message: string, status: AlertColor) {
    setIsSnackbarOpen(true);
    setSnackbarMessage({ message, status });
  }

  const container =
    document.getElementById("toast-container") || createToastContainer();
  const toastId = Date.now();
  const toastElement = document.createElement("div");
  toastElement.id = String(toastId);
  container.appendChild(toastElement);

  const root = createRoot(toastElement);
  root.render(
    <Snackbar
      open={isSnackbarOpen}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={handleCloseSnackbar}
        severity={snackbarMessage.status}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {JSON.stringify(snackbarMessage.message)}
      </Alert>
    </Snackbar>
  );

  return { setSnackBar };
}

import { useState } from "react";
import Layout2 from "../Layout2";
import { TextField, Typography, Button } from "@mui/material";

export default function ActivateUserPage() {
  const [textValue, setTextValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = new URL(document.location.toString()).searchParams;
  const userId = params.get("user_id");

  if (!userId) {
    setTimeout(() => {
      window.location.pathname = "/login";
    }, 4000);
    return <div>Some error happened</div>;
  }

  function handleSubmit() {
    if (!textValue || textValue.length < 6) {
      setError("Invalid Code");
      return;
    }
    setIsSubmitting(true);

    fetch("http://localhost:5000/user/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { user_id: String(userId), activationCode: textValue },
    })
      .then()
      .catch()
      .finally(() => setIsSubmitting(false));
  }

  return (
    <Layout2>
      <Typography color="black">We sent you an activation code</Typography>
      <TextField
        sx={{ mt: 2, mb: 2 }}
        value={textValue}
        type="text"
        error={Boolean(error)}
        helperText={error}
        onChange={(e) => {
          if (e.target.value.length <= 6 && !isNaN(Number(e.target.value)))
            setTextValue(e.target.value);
          if (e.target.value.length == 6) setError("");
        }}
      />
      <Button
        disabled={isSubmitting}
        onClick={handleSubmit}
        variant="contained"
      >
        Submit
      </Button>
    </Layout2>
  );
}

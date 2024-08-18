import { useState, KeyboardEvent } from "react";
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Chip,
  Box,
} from "@mui/material";

const TagsInput = ({
  values,
  error,
  touched,
  name,
  setFieldValue,
}: {
  values: string[];
  error: string;
  touched: boolean;
  name: string;
  setFieldValue: (name: string, val: string[]) => void;
}) => {
  const [tagValue, setTagValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "," || e.key === " " || e.key == "Enter") && tagValue.trim()) {
      e.preventDefault();
      setFieldValue(name, [...values, tagValue.trim()]);
      setTagValue("");
    } else if (e.key === "Backspace" && values.length && !tagValue.length) {
      e.preventDefault()
      const lastTag = values.pop()
      setFieldValue("tags", values); 
      setTagValue(lastTag ?? "")
    }
  };

  const handleDelete = (tagToDelete: string) => {
    setFieldValue(
      "tags",
      values.filter((tag) => tag !== tagToDelete)
    );
  };

  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel htmlFor="tags" error={Boolean(error)}>
        Tags
      </InputLabel>
      <OutlinedInput
        id="tags"
        value={tagValue}
        onChange={(e) => setTagValue(e.target.value)}
        onKeyDown={handleKeyDown}
        error={Boolean(error)}
        type="text"
        label="Tags"
        startAdornment={
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pr: 1 }}>
            {values.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleDelete(tag)}
              />
            ))}
          </Box>
        }
      />
      <FormHelperText error>{touched && error}</FormHelperText>
    </FormControl>
  );
};

export default TagsInput;

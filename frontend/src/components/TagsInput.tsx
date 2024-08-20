import { useState, KeyboardEvent } from "react";
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Chip,
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
      <InputLabel htmlFor="tags" 
        //error={Boolean(error)}
      >
        Tags
      </InputLabel>
      <OutlinedInput
        sx={{ height: "fit-content", display: "flex", gap: 1, flexWrap: "wrap", p: 2 }}
        id="tags"
        value={tagValue}
        onChange={(e) => setTagValue(e.target.value)}
        onKeyDown={handleKeyDown}
        //error={Boolean(error)}
        type="text"
        label="Tags"
        inputProps={{ style: { width: "min-content", flexGrow: 1, padding: 0 } }}
        startAdornment={
          <>
            {values.map((tag, index) => ( <Chip
                key={index}
                label={tag}
                sx={{ height: "2rem" }}
                onDelete={() => handleDelete(tag)}
              />
            ))}
          </>
        }
      />
      <FormHelperText error>{touched && error}</FormHelperText>
    </FormControl>
  );
};

export default TagsInput;

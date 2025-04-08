import { TextField } from "@mui/material";

type InputProps = {
  label: string;
  name: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  disabled: boolean;
  error?: string;
  className?: string;
}

const Input = (props: InputProps) => {
  const { label, name, value, onChange, disabled, error, className = '' } = props;
  return <TextField
    label={label}
    name={name}
    value={value}
    slotProps={{
      inputLabel: {
        shrink: true
      }
    }}
    onChange={onChange}
    disabled={disabled}
    fullWidth
    error={error ? true : false}
    helperText={error ?? undefined}
    className={className}
  />;
}

export default Input;
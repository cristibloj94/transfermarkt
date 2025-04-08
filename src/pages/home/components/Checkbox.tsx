import { FormControlLabel, Checkbox } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

type CheckboxFieldProps = {
  name: string;
  disabled: boolean;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  label: string;
  principal?: boolean;
}

const CheckboxField = (props: CheckboxFieldProps) => {
  const { name, disabled, checked, onChange, label, principal } = props;
  return <FormControlLabel
    control={
      <Checkbox
        name={name}
        disabled={disabled}
        checked={checked}
        onChange={onChange}
        icon={principal ? <StarBorderIcon /> : <CheckBoxOutlineBlankIcon />}
        checkedIcon={principal ? <StarIcon /> : <CheckBoxIcon />}
      />
    }
    label={label}
  />;
}

export default CheckboxField;
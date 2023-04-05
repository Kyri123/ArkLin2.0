import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { ILTELoadingButton } from "../../../Types/AdminLTE";

export function LTELoadingButton(Props: ILTELoadingButton) {
  if (Props.Hide || (Props.Permission !== undefined && !Props.Permission)) {
    return <></>;
  }

  return (
    <Button {...Props} disabled={Props.IsLoading}>
      {Props.IsLoading ? (
        <FontAwesomeIcon icon={Props.LoadingIcon || "spinner"} spin={true} />
      ) : (
        Props.children
      )}
    </Button>
  );
}

export function LTEToggleButton(
  Props: ILTELoadingButton & {
    Value: boolean;
    OnToggle: (NewValue: boolean) => void;
  }
) {
  if (Props.Hide || (Props.Permission !== undefined && !Props.Permission)) {
    return <></>;
  }

  return (
    <LTELoadingButton
      {...Props}
      className={Props.className || "btn-sm rounded-0"}
      BtnColor={Props.Value ? "success" : "danger"}
      onClick={() => Props.OnToggle(!Props.Value)}
    >
      <FontAwesomeIcon icon={Props.Value ? "check" : "times"} />{" "}
      {Props.children}
    </LTELoadingButton>
  );
}

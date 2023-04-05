import { useContext, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { LTELoadingButton } from "../../../../Components/Elements/AdminLTE/AdminLTE_Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CLTEInput from "../../../../Components/Elements/AdminLTE/AdminLTE_Inputs";
import { API_User } from "../../../../Lib/Api/API_User";
import { IMO_Accounts } from "../../../../Shared/Api/MongoDB";
import AlertContext from "../../../../Context/AlertContext";
import AccountContext from "../../../../Context/AccountContext";

export default function SPUser() {
  const Account = useContext(AccountContext);
  const GAlert = useContext(AlertContext);
  const [IsSending, setIsSending] = useState(false);
  const [Form, setForm] = useState<IMO_Accounts>({
    ...Account.Account.GetDBInformation(),
  });
  const [[NewPassword, NewPasswordAgain], setNewPassword] = useState(["", ""]);
  const [DisableSend, setDisableSend] = useState(false);

  useEffect(() => {
    const Username = Form.username.length >= 6;
    const Mail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(Form.mail);
    const Password =
      (NewPassword === "" && NewPasswordAgain === "") ||
      (NewPasswordAgain === NewPassword && NewPassword.length >= 6);
    setDisableSend(!(Username && Mail && Password));
  }, [NewPassword, NewPasswordAgain, Form]);

  const SaveSettings = async () => {
    setIsSending(true);
    const Response = await API_User.UserSettings_EditAccount(Form, [
      NewPassword,
      NewPasswordAgain,
    ]);
    GAlert.DoSetAlert(Response);
    setIsSending(false);
  };

  return (
    <>
      <Card.Body>
        <CLTEInput
          InputAlert={Form.username.length < 6 ? "is-invalid" : ""}
          Value={Form.username}
          OnValueSet={(Value) => setForm({ ...Form, username: Value })}
        >
          Benutzername
        </CLTEInput>

        <CLTEInput
          Type={"email"}
          InputAlert={
            !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(Form.mail)
              ? "is-invalid"
              : ""
          }
          Value={Form.mail}
          OnValueSet={(Value) => setForm({ ...Form, mail: Value })}
        >
          E-Mail
        </CLTEInput>

        <CLTEInput
          Type={"password"}
          InputAlert={
            (NewPassword.length < 6 && NewPassword !== "") ||
            NewPasswordAgain !== NewPassword
              ? "is-invalid"
              : NewPasswordAgain === NewPassword && NewPassword.length >= 6
              ? "is-valid"
              : ""
          }
          Value={NewPassword}
          OnValueSet={(Value) => setNewPassword([Value, NewPasswordAgain])}
        >
          Neues Password
        </CLTEInput>

        <CLTEInput
          Type={"password"}
          InputAlert={
            NewPasswordAgain !== NewPassword
              ? "is-invalid"
              : NewPassword.length >= 6
              ? "is-valid"
              : ""
          }
          Value={NewPasswordAgain}
          OnValueSet={(Value) => setNewPassword([NewPassword, Value])}
        >
          Neues Password wiederholen
        </CLTEInput>
      </Card.Body>
      <Card.Footer>
        <LTELoadingButton
          onClick={SaveSettings}
          Disabled={DisableSend}
          IsLoading={IsSending}
        >
          <FontAwesomeIcon icon={"save"} /> Speichern{" "}
        </LTELoadingButton>
      </Card.Footer>
    </>
  );
}

import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUserVerify } from "../../api";
import { ROUTES } from "../../routes";
import { useAppContext } from "../../components/AppContext/AppContext";
import { useTranslation } from "react-i18next";

function UserVerifyPage() {
  const { t } = useTranslation("common");
  const { token } = useParams();

  const { setUser, setMessages } = useAppContext();
  let navigate = useNavigate();

  React.useEffect(() => {
    apiUserVerify(token).then((response) => {
      if (response.status === 200) {
        setUser(response.data);
        setMessages([
          { message: t("pages.user-verify.alert.success"), type: "success" },
        ]);
        setTimeout(() => setMessages(undefined), 5000);
        navigate(ROUTES["user-dashboard"].path, { replace: true });
      } else {
        setMessages([
          { message: t("pages.user-verify.alert.error"), type: "error" },
        ]);
        setTimeout(() => setMessages(undefined), 5000);
        navigate(ROUTES["user-login"].path, { replace: true });
      }
    });
  }, []);

  return <></>;
}

export default UserVerifyPage;

import { Container, Typography } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import FormJoin from "../../components/FormJoin/FormJoin";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../components/AppContext/AppContext";
import ImageHeroUserJoin from "../../assets/images/heros/user-join.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";

function UserJoinPage() {
  const { t } = useTranslation("common");
  let navigate = useNavigate();

  const { user } = useAppContext();

  React.useEffect(() => {
    if (user) {
      navigate(ROUTES["user-dashboard"].path, { replace: true });
    }
  }, [user]);

  const content = (
    <>
      <Typography
        variant="h4"
        fontWeight="700"
        align="center"
        marginBottom="48px"
      >
        {t("pages.user-join.subtitle")}
      </Typography>
      <FormJoin />
    </>
  );

  return (
    <PageImageHero
      title={t("pages.user-join.title")}
      content={content}
      hero={ImageHeroUserJoin}
    />
  );
}

export default UserJoinPage;

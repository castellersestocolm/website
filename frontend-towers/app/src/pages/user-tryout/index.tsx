import { Typography } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import FormTryout from "../../components/FormTryout/FormTryout";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../components/AppContext/AppContext";
import ImageHeroUserTryout from "../../assets/images/heros/user-tryout.jpg";
import PageImageHero from "../../components/PageImageHero/PageImageHero";

function UserTryoutPage() {
  const { t } = useTranslation("common");
  let navigate = useNavigate();

  const { user } = useAppContext();

  React.useEffect(() => {
    if (user) {
      navigate(ROUTES["user-dashboard"].path);
    }
  }, [user, navigate]);

  const content = (
    <>
      <Typography
        variant="h4"
        fontWeight="700"
        align="center"
        marginBottom="48px"
      >
        {t("pages.user-tryout.subtitle")}
      </Typography>
      <FormTryout />
    </>
  );

  return (
    <PageImageHero
      title={t("pages.user-tryout.title")}
      content={content}
      hero={ImageHeroUserTryout}
    />
  );
}

export default UserTryoutPage;

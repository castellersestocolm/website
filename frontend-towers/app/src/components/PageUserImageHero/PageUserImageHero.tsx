import * as React from "react";
import { useAppContext } from "../AppContext/AppContext";
import { PermissionLevel } from "../../enums";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import PageImageHero from "../PageImageHero/PageImageHero";

export default function PageUserImageHero({
  title,
  content,
  contentPost,
  hero,
  finishedRegistration = false,
  loading = false,
}: any) {
  let navigate = useNavigate();

  const { user } = useAppContext();

  if (user === null || (user && user.permission_level < PermissionLevel.USER)) {
    navigate(ROUTES["user-login"].path);
  }

  return (
    <PageImageHero
      title={title}
      content={content}
      contentPost={contentPost}
      hero={hero}
      finishedRegistration={finishedRegistration}
      loading={loading}
    />
  );
}

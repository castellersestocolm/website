import * as React from "react";
import { useAppContext } from "../AppContext/AppContext";
import PageBase from "../PageBase/PageBase";
import { PermissionLevel } from "../../enums";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";

export default function PageSuperAdmin({
  title,
  content,
  finishedRegistration = false,
  loading = false,
}: any) {
  let navigate = useNavigate();

  const { user } = useAppContext();

  if (
    user === null ||
    (user && user.permission_level < PermissionLevel.SUPERADMIN)
  ) {
    navigate(ROUTES["user-login"].path);
  }

  return (
    <PageBase
      title={title}
      content={content}
      finishedRegistration={finishedRegistration}
      loading={loading}
    />
  );
}

import * as React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../AppContext/AppContext";
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import styles from "../../pages/user-dashboard/styles.module.css";
import Box from "@mui/material/Box";
import IconMail from "@mui/icons-material/Mail";
import { capitalizeFirstLetter } from "../../utils/string";

export default function FormDashboardEmails() {
  const { t } = useTranslation("common");

  const { user } = useAppContext();

  return (
    <>
      {user.emails && user.emails.length > 0 && (
        <>
          <List className={styles.userFamilyList}>
            {user.emails.filter((userEmail: any) => userEmail.email !== user.email).map((userEmail: any, i: number, row: any) => (
              <Box key={i}>
                <ListItemButton disableTouchRipple dense>
                  <ListItemIcon>
                    <IconMail />
                  </ListItemIcon>
                  <ListItemText
                    primary={userEmail.email}
                    secondary={
                      t("pages.user-dashboard.form-emails.created") +
                      " " +
                      capitalizeFirstLetter(
                        new Date(userEmail.created_at)
                          .toISOString()
                          .slice(0, 10),
                      ) +
                      " " +
                      new Date(userEmail.created_at).toTimeString().slice(0, 5)
                    }
                  />
                </ListItemButton>
                {i + 1 < row.length && <Divider />}
              </Box>
            ))}
          </List>
          <Divider />
        </>
      )}
    </>
  );
}

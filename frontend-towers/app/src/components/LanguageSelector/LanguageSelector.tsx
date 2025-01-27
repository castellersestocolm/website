import { useTranslation } from "react-i18next";
import * as React from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import styles from "./styles.module.css";

export const LanguageSelector = () => {
  const [t, i18n] = useTranslation("common");

  return (
    <>
      <PopupState variant="popover" popupId="demo-popup-menu">
        {(popupState) => (
          <React.Fragment>
            <Button
              className={styles.languageButton}
              variant="text"
              disableTouchRipple
              {...bindTrigger(popupState)}
            >
              {i18n.resolvedLanguage}
            </Button>
            <Menu {...bindMenu(popupState)}>
              {i18n.resolvedLanguage !== "en" && (
                <MenuItem
                  onClick={() => {
                    i18n.changeLanguage("en");
                    popupState.close();
                  }}
                >
                  EN
                </MenuItem>
              )}
              {i18n.resolvedLanguage !== "sv" && (
                <MenuItem
                  onClick={() => {
                    i18n.changeLanguage("sv");
                    popupState.close();
                  }}
                >
                  SV
                </MenuItem>
              )}
              {i18n.resolvedLanguage !== "ca" && (
                <MenuItem
                  onClick={() => {
                    i18n.changeLanguage("ca");
                    popupState.close();
                  }}
                >
                  CA
                </MenuItem>
              )}
            </Menu>
          </React.Fragment>
        )}
      </PopupState>
    </>
  );
};

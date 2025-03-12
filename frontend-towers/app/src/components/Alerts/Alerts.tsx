import * as React from "react";
import IconCheck from "@mui/icons-material/Check";
import { Collapse } from "@mui/material";
import styles from "./styles.module.css";
import { Alert } from "@mui/lab";
import { useAppContext } from "../AppContext/AppContext";
import { TransitionGroup } from "react-transition-group";
import Box from "@mui/material/Box";

export default function Alerts() {
  const { messages } = useAppContext();

  return (
    <Box
      sx={{
        marginBottom: {
          xs: messages ? "32px" : "0",
          md: messages ? "48px" : "0",
        },
      }}
    >
      <TransitionGroup>
        {messages &&
          messages.map((message: any) => (
            <Collapse className={styles.alert}>
              <Alert
                icon={<IconCheck fontSize="inherit" />}
                severity={message.type}
              >
                {message.message}
              </Alert>
            </Collapse>
          ))}
      </TransitionGroup>
    </Box>
  );
}

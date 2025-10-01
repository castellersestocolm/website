import * as React from "react";
import IconCheck from "@mui/icons-material/Check";
import IconPriorityHigh from "@mui/icons-material/PriorityHigh";
import { Collapse } from "@mui/material";
import styles from "./styles.module.css";
import Alert from "@mui/material/Alert";
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
                icon={
                  message.type === "success" ? (
                    <IconCheck fontSize="inherit" />
                  ) : (
                    <IconPriorityHigh fontSize="inherit" />
                  )
                }
                severity={message.type}
              >
                {message.message.split("\n").map((msg: string, ix: number) => {
                  return (
                    <>
                      {ix > 0 && <br />}
                      {msg}
                    </>
                  );
                })}
              </Alert>
            </Collapse>
          ))}
      </TransitionGroup>
    </Box>
  );
}

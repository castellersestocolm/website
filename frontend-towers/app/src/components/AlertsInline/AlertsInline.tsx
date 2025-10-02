import * as React from "react";
import IconCheck from "@mui/icons-material/Check";
import IconPriorityHigh from "@mui/icons-material/PriorityHigh";
import styles from "./styles.module.css";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

export default function AlertsInline({ messages }: any) {
  return (
    <Box>
      {messages &&
        messages.map((message: any) => (
          <Alert
            icon={
              message.type === "success" ? (
                <IconCheck fontSize="inherit" />
              ) : (
                <IconPriorityHigh fontSize="inherit" />
              )
            }
            severity={message.type}
            className={styles.alertBox}
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
        ))}
    </Box>
  );
}

import * as React from "react";

const AppContext = React.createContext({
  user: undefined,
  setUser: (user: any) => {},
  messages: [],
  setMessages: (messages: any) => {},
  familyMemberRequests: [],
  setFamilyMemberRequests: (requests: any) => {},
  familyMemberRequestsReceived: [],
  setFamilyMemberRequestsReceived: (requests: any) => {},
  rehearsal: undefined,
  setRehearsal: (rehearsal: any) => {},
  cart: undefined,
  setCart: (cart: any) => {},
  order: undefined,
  setOrder: (order: any) => {},
} as any);

export const useAppContext = () => React.useContext(AppContext);

export default AppContext;

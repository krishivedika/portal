import React, {useEffect, useState} from "react";

import NotificationService from "./services/notification";
import AuthService from "./services/auth";

const sharedContext = {
  user: {},
  spinning: false,
  notificationCount: 0,
};

const SharedContext = React.createContext([{}, () => {}]);
const SharedContextProvider = (props) => {
  const [state, setState] = useState(sharedContext);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      NotificationService.getNotifications().then(response => {
        setState((state) => ({...state, notificationCount: response.data.notifications.filter(x => x.isRead == false).length}));
      });
    }
  }, []);

  return (
    <SharedContext.Provider value={[state, setState]}>
      {props.children}
    </SharedContext.Provider>
  );
}

export { SharedContext, SharedContextProvider};

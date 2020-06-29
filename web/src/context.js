import React, {useState} from "react";

const sharedContext = {
  user: {},
  spinning: false,
};

const SharedContext = React.createContext([{}, () => {}]);
const SharedContextProvider = (props) => {
  const [state, setState] = useState(sharedContext);
  return (
    <SharedContext.Provider value={[state, setState]}>
      {props.children}
    </SharedContext.Provider>
  );
}

export { SharedContext, SharedContextProvider};

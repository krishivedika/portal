import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout, Spin } from "antd";

import './App.less';
import Routes from "./routes";
import authHeader from "./services/authHeader";
import AuthService from "./services/auth";
import config from "./config";
import { Admin, Login, Onboarding, UserProfile } from "./screens";
import { Header } from "./components";
import { SharedContext } from "./context";

axios.defaults.baseURL = config.REACT_APP_API_URL;
axios.defaults.headers.common['x-access-token'] = authHeader()['x-access-token'];

const { Footer, Content } = Layout;

const App = (props) => {

  const [state, setState] = useContext(SharedContext);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    axios.interceptors.request.use(req => {
      setState(state => ({ ...state, spinning: true }));
      return req;
    });
    axios.interceptors.response.use(res => {
      setState(state => ({ ...state, spinning: false }));
      return res;
    }, err => {
      setState(state => ({ ...state, spinning: false }));
      if (err.response.status === 403) {
        AuthService.logout();
        window.location.href = "/";
      }
      return Promise.reject(err);
    });
    setLoad(true);
  }, []);

  return (
    <>
      {load &&
        <Router>
          <Layout style={{ height: "100vh" }}>
            <Header />
            <Spin spinning={state.spinning} size="large">
              <Content>
                <Switch>
                  <Route exact path={Routes.ROOT} component={Login} />
                  <Route exact path={Routes.ONBOARDING} component={Onboarding} />
                  <Route exact path={Routes.PROFILE} component={UserProfile} />
                  <Route exact path={Routes.ADMIN} component={Admin} />
                </Switch>
              </Content>
            </Spin>
            <Footer style={{ textAlign: "center", position: "sticky" }}>
              &copy; {new Date().getFullYear()} Krishivedika Private Ltd
            </Footer>
          </Layout>
        </Router>
      }
    </>
  );
}

export default App;

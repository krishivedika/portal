import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout, Spin } from "antd";

import './App.less';
import Routes from "./routes";
import AuthService from "./services/auth";
import config from "./config";
import { Admin, Login, Reset, Onboarding, UserProfile, Staff, FarmRecords, CropRecords, Home } from "./screens";
import { Header } from "./components";
import { SharedContext } from "./context";

axios.defaults.baseURL = config.REACT_APP_API_URL;

const { Footer, Content } = Layout;

const App = (props) => {

  const [state, setState] = useContext(SharedContext);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.interceptors.request.use(req => {
      setState(state => ({ ...state, spinning: true }));
      return req;
    });
    axios.interceptors.response.use(res => {
      setState(state => ({ ...state, spinning: false }));
      return res;
    }, err => {
      setState(state => ({ ...state, spinning: false }));
      console.log(err);
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
              <Content  style={{marginBottom: '100px'}}>
                <Switch>
                  <Route exact path={Routes.ROOT} component={Home} />
                  <Route exact path={Routes.LOGIN} render={(props) => < Login {...props} type="member" />} />
                  <Route exact path={Routes.STAFF} render={(props) => < Login {...props} type="staff" />} />
                  <Route exact path={Routes.RESET} component={Reset} />
                  <Route exact path={Routes.SIGNUP} component={Onboarding} />
                  <Route exact path={Routes.PROFILE} component={UserProfile} />
                  <Route exact path={Routes.FARMRECORDS} component={FarmRecords} />
                  <Route exact path={Routes.CROPRECORDS} component={CropRecords} />
                  <Route exact path={Routes.ADMIN} component={Admin} />
                  <Route exact path={Routes.USERMANAGEMENT} component={Staff} />
                </Switch>
              </Content>
            </Spin>
            <Footer style={{ width: '100vw', bottom: 0, textAlign: "center", position: "fixed" }}>
              &copy; {new Date().getFullYear()} Krishivedika Private Ltd
            </Footer>
          </Layout>
        </Router>
      }
    </>
  );
}

export default App;

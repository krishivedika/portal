import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout } from 'antd';
import "./App.css";

import Header from "./components/common/Header";
import Login from "./components/screens/Login";
import Register from "./components/screens/registerScreen";
import Profile from "./components/screens/UserProfile";
import BoardUser from "./components/screens/Member";
import BoardAdmin from "./components/screens/Admin";

const { Footer } = Layout;

class App extends Component {
  render() {
    return (
      <Router>
        <Layout>
          <Header />
          <Footer style={{ textAlign: 'center' }}>Copyright 2020 Krishivedika Private Ltd</Footer>
          <div>
            <Switch>
              <Route exact path="/" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/profile" component={Profile} />
              <Route path="/admin" component={BoardAdmin} />
            </Switch>
          </div>
        </Layout>
      </Router>
    );
  }
}

export default App;

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import "./header.css";
import logo from "../../images/kv_logo_8.jpg";
import config from "../../config";

import AuthService from "../../services/auth";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

const { Header } = Layout;
class NavigationBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showAdminBoard: false,
      currentUser: undefined,
      menuItems: [],
      menu: "",
      collapsed: true,
      isMobile: false,
    };
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  handleWindowResize = () => {
    this.setState({ isMobile: window.innerWidth < 768 });
  };

  componentDidMount() {
    window.addEventListener("resize", this.handleWindowResize);
    this.filterMenuItems(this.state.currentUser, this.state.showAdminBoard);
    const user = AuthService.getCurrentUser();
    if (user) {
      this.setState(
        {
          currentUser: user,
          showAdminBoard: user.roles.includes("ROLE_ADMIN"),
        },
        () =>
          this.filterMenuItems(
            this.state.currentUser,
            this.state.showAdminBoard
          )
      );
    }
  }

  logOut = () => {
    AuthService.logout();
  };

  filterMenuItems = (user, admin) => {
    if (admin) {
      this.setState(
        {
          menuItems: config.ADMIN_MENU_ITEMS,
        },
        () => this.renderMenuItems(this.state.menuItems)
      );
    } else if (user) {
      this.setState(
        {
          menuItems: config.MEMBER_MENU_ITEMS,
        },
        () => this.renderMenuItems(this.state.menuItems)
      );
    } else {
      this.setState(
        {
          menuItems: config.MAIN_MENU_ITEMS,
        },
        () => this.renderMenuItems(this.state.menuItems)
      );
    }
  };

  renderMenuItems = (menuItems) => {
    const { currentUser } = this.state;
    let menu = menuItems.map((item, key) => {
      let formattedItem = item.split(" ")[0].toLowerCase();
      return (
        <Menu.Item key={key}>
          <Link to={`/${formattedItem}`}>
            {formattedItem === "profile" ? currentUser.username : item}
          </Link>
        </Menu.Item>
      );
    });
    this.setState({ menu });
  };

  render() {
    const { isMobile } = this.state;
    const { currentUser, showAdminBoard } = this.state;
    return (
      <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
        <div className="header-container">
          <div className="logo">
            <img src={logo} alt="KrishiVidya" />
          </div>
          <div className="menu-items">
            {!isMobile ? (
              <Menu mode="horizontal">
                {!currentUser ? (
                  <Menu.Item key="logout">
                    <Link to="/">LOGIN</Link>
                  </Menu.Item>
                ) : null}
                {this.state.menu}
                {currentUser || showAdminBoard ? (
                  <Menu.Item key="logout">
                    <a href="/" onClick={this.logOut}>
                      LOGOUT
                    </a>
                  </Menu.Item>
                ) : null}
              </Menu>
            ) : (
              <Button
                type="primary"
                onClick={this.toggleCollapsed}
                style={{ marginBottom: 16 }}
              >
                {React.createElement(
                  this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined
                )}
              </Button>
            )}
          </div>
          <Menu
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            mode="inline"
            inlineCollapsed={this.state.collapsed}
          >
            {!currentUser ? (
              <Menu.Item key="logout">
                <Link to="/">LOGIN</Link>
              </Menu.Item>
            ) : null}
            {this.state.menu}
            {currentUser || showAdminBoard ? (
              <Menu.Item key="logout">
                <a href="/" onClick={this.logOut}>
                  LOGOUT
                </a>
              </Menu.Item>
            ) : null}
          </Menu>
        </div>
      </Header>
    );
  }
}

export default NavigationBar;

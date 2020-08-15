import React, { useEffect, useState, useContext } from "react";
import { Layout, Menu, Button, Row, Col, Dropdown } from "antd";
import { useHistory } from "react-router-dom";
import { MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, DownOutlined, WindowsFilled } from "@ant-design/icons";

import AuthService from "../../services/auth";
import Routes from "../../routes";
import constants from "../../constants";
import logoImage from "../../images/logo.jpg";
import { SharedContext } from "../../context";

const { Header } = Layout;

const NavigationBar = (props) => {
  const [state, setState] = useContext(SharedContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [menu, setMenu] = useState('');
  const [currentTab, setCurrentTab] = useState('');
  const [menuItems, setMenuItem] = useState([]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const logOut = () => {
    AuthService.logout();
  };

  const filterMenuItems = () => {
    if (!state.user.hasOwnProperty("roles")) {
      setMenuItem(constants.MAIN_MENU_ITEMS);
      setCurrentTab('LOGIN');
    }
    else {
      switch (state.user.roles[0]) {
        case 'SADMIN':
          setMenuItem(constants.SYSTEM_ADMIN_MENU_ITEMS);
          setCurrentTab('ADMIN');
          break;
        case 'ADMIN':
          setMenuItem(constants.ADMIN_MENU_ITEMS);
          setCurrentTab('USERMANAGEMENT');
          break;
        case 'CSR':
          setMenuItem(constants.CSR_MENU_ITEMS);
          setCurrentTab('USERMANAGEMENT');
          break;
        case 'FIELD_AGENT':
          setMenuItem(constants.FIELD_AGENT_MENU_ITEMS);
          setCurrentTab('USERMANAGEMENT');
          break;
        case 'FARMER':
          setMenuItem(constants.MEMBER_MENU_ITEMS);
          setCurrentTab('PROFILE');
          break;
        default:
          setMenuItem(constants.MAIN_MENU_ITEMS);
      }
    }
  };
  const history = useHistory();
  const navigate = (path) => {
    if (path === "/" && window.location.href.slice(-1) !== "/") {
      history.push(path)
    }
    else if (window.location.href.includes(path)) {
      window.location.reload();
    }
    else history.push(path);
  };

  const renderMenuItems = (menuItems) => {
    let menu = menuItems.map(item => {
      let formattedItem = item.replace(" ", "").toUpperCase();
      return (
        <Menu.Item key={formattedItem}>
          <Button type="link" onClick={() => navigate(Routes[formattedItem])}>{item}</Button>
        </Menu.Item>
      );
    });
    setMenu(menu);
  };

  useEffect(() => {
    if (state.user.hasOwnProperty("roles")) setIsLoggedIn(true);
    filterMenuItems();
    renderMenuItems(menuItems)
  }, [state.user, menuItems]);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user && !state.user.hasOwnProperty("roles")) {
      setState(state => ({ ...state, user: user }));
    }
  }, []);

  return (
    <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
      <Row>
        <Col xs={16} md={16} lg={3} xl={3} offset={0}>
          <img src={logoImage} alt="KrishiVedika" />
        </Col>
          <>
            <Col xs={0} sm={0} md={0} lg={9} xl={9} offset={1}>
              <Menu mode="horizontal" selectedKeys={[currentTab]} onClick={(e) => setCurrentTab(e.key)}>
                {!isLoggedIn &&
                  <Menu.Item key="LOGIN">
                    <Button type="link" onClick={() => navigate(Routes.ROOT)}>Sign In</Button>
                  </Menu.Item>
                }
                {menu}
              </Menu>
            </Col>
            <Col xs={0} sm={0} md={0} lg={11} xl={11} push={7}>
              <Menu mode="horizontal" selectedKeys={[]} >
                {isLoggedIn &&
                  <Menu.Item key="USER">
                    <Dropdown overlay={
                      <Menu >
                        <Menu.Item key="profile">
                          <div onClick={() => navigate(Routes.PROFILE)}>Profile</div>
                        </Menu.Item>
                        <Menu.Item key="logout">
                          <a href="/" onClick={logOut}>Sign Out</a>
                        </Menu.Item>
                      </Menu>
                    } trigger={['click']}>
                      <Button type="link" className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                        Welcome, {state.user.firstName} ({state.user.roles.includes("FARMER") ? "Member" : state.user.roles}) <UserOutlined /> <DownOutlined />
                      </Button>
                    </Dropdown>
                  </Menu.Item>
                }
              </Menu>
            </Col>
          </>
            <Col xs={{span: 2, offset: 2}} md={2} offset={4} lg={0} xl={0}>
              <Button
                className="nav-button"
                type="primary"
                onClick={toggleCollapsed}
                style={{ marginBottom: 16 }}
              >
                {React.createElement(
                  collapsed ? MenuUnfoldOutlined : MenuFoldOutlined
                )}
              </Button>
            </Col>
      </Row>
      <Menu
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        mode="inline"
        inlineCollapsed={collapsed}
        onClick={toggleCollapsed}
      >
        {!isLoggedIn &&
          <Menu.Item key="LOGIN">
            <Button type="link" onClick={() => navigate(Routes.ROOT)}>Sign In</Button>
          </Menu.Item>
        }
        {menu}
        {isLoggedIn &&
          <Menu.Item key="profile">
            <div style={{color: "#88c73f", marginLeft: '15px'}} onClick={() => navigate(Routes.PROFILE)}>Profile</div>
          </Menu.Item>
        }
        {isLoggedIn &&
          <Menu.Item key="LOGOUT">
            <a style={{color: "#88c73f", marginLeft: '15px'}} href="/" onClick={logOut}>Sign Out</a>
          </Menu.Item>
        }
      </Menu>
    </Header>
  );
};

export default NavigationBar;

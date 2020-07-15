import React, { useEffect, useState, useContext } from "react";
import { Layout, Menu, Button, Row, Col, Dropdown } from "antd";
import { Link } from "react-router-dom";
import { MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, DownOutlined } from "@ant-design/icons";


import AuthService from "../../services/auth";
import Routes from "../../routes";
import constants from "../../constants";
import logoImage from "../../images/logo.jpg";
import { SharedContext } from "../../context";

const { Header } = Layout;

const NavigationBar = (props) => {
  const [state, setState] = useContext(SharedContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [menu, setMenu] = useState('');
  const [currentTab, setCurrentTab] = useState('');
  const [menuItems, setMenuItem] = useState([]);

  const handleWindowResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

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

  const renderMenuItems = (menuItems) => {
    let menu = menuItems.map(item => {
      let formattedItem = item.replace(" ", "");
      return (
        <Menu.Item key={formattedItem}>
          <Link to={`${Routes[formattedItem]}`}>{item}</Link>
        </Menu.Item>
      );
    });
    setMenu(menu);
  };

  useEffect(() => {
    if (state.user.hasOwnProperty("roles")) setIsLoggedIn(true);
    filterMenuItems();
    renderMenuItems(menuItems)
    window.addEventListener("load", handleWindowResize);
    window.addEventListener("resize", handleWindowResize);
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
<<<<<<< HEAD
        <Col xs={16} sm={18} md={10} lg={3} xl={4} offset={1}>
=======
        <Col xs={16} md={isMobile ? 18 : 4} lg={3} xl={4} offset={1}>
>>>>>>> 1ec5e69... added responsiveness
          <img src={logoImage} alt="KrishiVedika" />
        </Col>
        {!isMobile ? (
          <>
<<<<<<< HEAD
            <Col xs={2} sm={2} md={5} lg={9} xl={9} offset={2}>
=======
            <Col md={10} lg={9} xl={9} offset={1}>
>>>>>>> 1ec5e69... added responsiveness
              <Menu mode="horizontal" selectedKeys={[currentTab]} onClick={(e) => setCurrentTab(e.key)}>
                {!isLoggedIn &&
                  <Menu.Item key="LOGIN">
                    <Link to="/">LOGIN</Link>
                  </Menu.Item>
                }
                {menu}
              </Menu>
            </Col>
<<<<<<< HEAD
            <Col xs={2} sm={2} md={5} lg={7} xl={7} offset={1}>
=======
            <Col md={5} lg={7} xl={7}>
>>>>>>> 1ec5e69... added responsiveness
              <Menu mode="horizontal" selectedKeys={[]} >
                {isLoggedIn &&
                  <Menu.Item key="USER">
                    <Dropdown overlay={
                      <Menu >
                        <Menu.Item key="profile">
                          <Link to={Routes.PROFILE}>PROFILE</Link>
                        </Menu.Item>
                        <Menu.Item key="logout">
                          <a href="/" onClick={logOut}>LOGOUT</a>
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
        ) : (
            <Col xs={2} md={3} offset={2}>
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
          )}
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
            <Link to="/">LOGIN</Link>
          </Menu.Item>
        }
        {menu}
        {isLoggedIn &&
          <Menu.Item key="profile">
            <Link to={Routes.PROFILE}>PROFILE</Link>
          </Menu.Item>
        }
        {isLoggedIn &&
          <Menu.Item key="LOGOUT">
            <a href="/" onClick={logOut}>LOGOUT</a>
          </Menu.Item>
        }
      </Menu>
    </Header>
  );
};

export default NavigationBar;

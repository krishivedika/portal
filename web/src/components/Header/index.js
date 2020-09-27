import React, { useEffect, useState, useContext } from "react";
import { Badge, Layout, Menu, Button, Row, Col, Dropdown } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import { BellOutlined, MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, DownOutlined, WindowsFilled } from "@ant-design/icons";

import AuthService from "../../services/auth";
import Routes from "../../routes";
import constants from "../../constants";
import logoImage from "../../images/logo.jpg";
import { SharedContext } from "../../context";
import { Notifications } from "../../components";

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
    const user = AuthService.getCurrentUser();
    if (!user?.hasOwnProperty("roles")) {
      setMenuItem(constants.MAIN_MENU_ITEMS);
      setCurrentTab('LOGIN');
    }
    else {
      switch (user.roles[0]) {
        case 'SADMIN':
          setMenuItem(constants.SYSTEM_ADMIN_MENU_ITEMS);
          break;
        case 'ADMIN':
          setMenuItem(constants.ADMIN_MENU_ITEMS);
          break;
        case 'CSR':
          setMenuItem(constants.CSR_MENU_ITEMS);
          break;
        case 'FIELD_AGENT':
          setMenuItem(constants.FIELD_AGENT_MENU_ITEMS);
          break;
        case 'FARMER':
          setMenuItem(constants.MEMBER_MENU_ITEMS);
          break;
        case 'SME':
          setMenuItem(constants.SME);
          break
        default:
          setMenuItem(constants.MAIN_MENU_ITEMS);
      }
    }
  };
  const history = useHistory();
  const navigate = (path) => {
    setCurrentTab(path);
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
        <Menu.Item key={Routes[formattedItem]}>
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

  const location = useLocation();
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user?.hasOwnProperty("roles")) {
      setState(state => ({ ...state, user: user }));
    }
    setCurrentTab(location.pathname);
  }, []);

  return (
    <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
      <Row>
        <Col xs={16} md={16} lg={3} xl={3} offset={0}>
          <img onClick={() => history.push("/")} src={logoImage} alt="KrishiVedika" />
        </Col>
          <>
            <Col xs={0} sm={0} md={0} lg={15} xl={15} offset={1}>
              <Menu mode="horizontal" selectedKeys={[currentTab]} onClick={(e) => setCurrentTab(e.key)}>
                {isLoggedIn ? menu : null}
              </Menu>
            </Col>
            <Col xs={0} sm={0} md={0} lg={5} xl={5}>
              <Row justify="end">
                <Menu mode="horizontal" selectedKeys={[]} >
                  {isLoggedIn &&
                    <Menu.Item key="NOTIFICATIONS">
                      <Dropdown trigger={['click', 'hover']}
                      overlay={
                        <Notifications />
                      }
                      overlayStyle={{width: (window.innerWidth / 2), backgroundColor: "#fff"}}
                      >
                        <Badge count={state.notificationCount} size="small">
                          <BellOutlined style={{color: '#88c73f'}}/>
                        </Badge>
                      </Dropdown>
                    </Menu.Item>
                  }
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
                  {!isLoggedIn &&
                    <Menu.Item key="LOGIN">
                      <Button type="link" onClick={() => navigate(Routes.LOGIN)}>Sign In</Button>
                    </Menu.Item>
                  }
                  {!isLoggedIn &&
                    <Menu.Item key="SIGNUP">
                      <Button type="link" onClick={() => navigate(Routes.SIGNUP)}>Sign Up</Button>
                    </Menu.Item>
                  }
                </Menu>
              </Row>
            </Col>
          </>
            <Col xs={{span: 8, offset: 0}} md={5} lg={0} xl={0}>
              <Menu
                style={{display: "inline-block"}}
                defaultSelectedKeys={["1"]}
                defaultOpenKeys={["sub1"]}
                mode="horizontal"
              >
                <Menu.Item key="NOTIFICATIONS">
                  <Dropdown trigger={['click']}
                    overlay={
                      <Notifications />
                    }
                    overlayStyle={{width: (window.innerWidth), backgroundColor: "#fff"}}
                    >
                      <Badge count={state.notificationCount} size="small">
                        <BellOutlined style={{color: '#88c73f'}}/>
                      </Badge>
                  </Dropdown>
                </Menu.Item>
              </Menu>
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
            <Button type="link" onClick={() => navigate(Routes.LOGIN)}>Sign In</Button>
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

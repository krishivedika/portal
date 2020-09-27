import React, { useContext, useEffect, useState } from "react";
import { List, Card, Button, message } from 'antd';
import { useHistory } from "react-router-dom";

import NotificationService from "../../services/notification";
import { SharedContext } from "../../context";
import Routes from "../../routes";

const Notifications = (props) => {

  const [notifications, setNotifications] = useState([]);
  const [showList, setShowList] = useState(false);
  const [state, setState] = useContext(SharedContext);

  useEffect(() => {
    setShowList(false);
    NotificationService.getNotifications().then(response => {
      setNotifications(() => response.data.notifications);
      setState((state) => ({...state, notificationCount: response.data.notifications.filter(x => x.isRead == false).length}));
      setShowList(true);
    });
  }, []);

  useEffect(() => {
    let interval;
    interval = setInterval(() => {
      setShowList(false);
      NotificationService.getNotifications().then(response => {
        setNotifications(() => response.data.notifications);
        setState((state) => ({...state, notificationCount: response.data.notifications.filter(x => x.isRead == false).length}));
        setShowList(true);
      });
    }, 1000 * 60 * 5);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const updateNotifications = (id, e) => {
    e.persist();
    setShowList(false);
    NotificationService.updateNotification({id}).then(response => {
      setNotifications(() => response.data.notifications);
      setState((state) => ({...state, notificationCount: response.data.notifications.filter(x => x.isRead == false).length}));
      setShowList(true);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  const history = useHistory();
  const goToNotifs = () => {
    history.push(Routes.NOTIFICATIONS);
  };

  return (
    <Card title="Notifications" className="g-ant-card"
    actions={[
      <Button key="mark" onClick={updateNotifications.bind(this, "all")} type="primary">Mark All as Read</Button>,
      <Button key="all" onClick={goToNotifs}>See All Notifications</Button>
    ]}
    >
      <div style={{maxHeight: '400px', overflowY: 'auto'}}>
        {showList &&
          <List
          rowKey="id"
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={item => (
            <List.Item key={item.id} extra={[
              <Button key={item.id} type="link" onClick={updateNotifications.bind(this, item.id)}>Mark Read</Button>
            ]}>
              <List.Item.Meta
                title="Crop needs attention"
                description={item.text}
              />
            </List.Item>
          )}
          />
        }
      </div>
    </Card>
  )
};

export default Notifications;

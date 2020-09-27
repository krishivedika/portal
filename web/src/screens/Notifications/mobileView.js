import React, { useState, useEffect } from "react";
import { Row, Col, Button, List, Skeleton } from "antd";

const MobileView = (props) => {
  const [notifications, setNotifications] = useState(props.notifications);

  useEffect(() => {
    setNotifications(props.notifications);
  }, [props]);

  return (
    <>
      <Row>
        <Col xs={24} lg={0} xl={0}>
          <List
            style={{padding: "10px"}}
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item key={item.id}
                actions={!item.isRead ? [
                  <Button
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      props.action();
                    }}
                  >
                    Action
                  </Button>,
                  <Button
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      props.mark(item.id);
                    }}
                  >
                    Mark Read
                  </Button>,
                ] : null}
              >
                <Skeleton active loading={false}>
                  <List.Item.Meta title={`${item.text}`}></List.Item.Meta>
                </Skeleton>
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </>
  );
};

export default MobileView;

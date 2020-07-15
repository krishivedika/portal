import React, { useState, useEffect } from "react";
import { Row, Col, List, Skeleton } from "antd";

const MobileView = (props) => {
  const [users, setUsers] = useState(props.users);

  useEffect(() => {
    setUsers(props.users);
  }, [props]);

  return (
    <>
      <Row style={{ padding: "10px" }}>
        <Col xs={23} sm={23}>
          <List
            className="demo-loadmore-list"
            itemLayout="horizontal"
            dataSource={users}
            bordered
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a
                    onClick={(event) => {
                      event.stopPropagation();
                      props.review(item, event);
                    }}
                    key="list-loadmore-edit"
                  >
                    {item.isOnboarded ? "Update" : "Review"}
                  </a>
                ]}
              >
                <Skeleton title={false} loading={item.loading} active>
                  <List.Item.Meta
                    title={item.firstName}
                    description={item.email}
                  />
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

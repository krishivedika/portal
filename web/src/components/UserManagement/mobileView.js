import React, { useState, useEffect } from "react";
import { Row, Col, List, Skeleton, Button } from "antd";

const MobileView = (props) => {
  const [users, setUsers] = useState(props.users);

  useEffect(() => {
    setUsers(props.users);
  }, [props]);

  return (
    <>
      <Row>
        <Col xs={24} md={24} lg={0} xl={0}>
          <List
            className="demo-loadmore-list"
            itemLayout="horizontal"
            dataSource={users}
            bordered
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link"
                    onClick={(event) => {
                      event.stopPropagation();
                      props.review(item, event);
                    }}
                    key="list-loadmore-edit"
                  >
                    {item.isOnboarded ? "Update" : "Review"}
                  </Button>
                ]}
              >
                <Skeleton title={false} loading={item.loading} active>
                  <List.Item.Meta
                    title={item.firstName}
                    description={item.email || item.phone}
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

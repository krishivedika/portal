import React, { useState, useEffect } from "react";
import { Collapse, Row, Col, Button, List, Skeleton } from "antd";
import { EditFilled, DeleteFilled } from "@ant-design/icons";
import UserService from "../../services/user";

const { Panel } = Collapse;

const MobileView = (props) => {
  const [expandIconPosition, setExpandIconPosition] = useState("left");
  const [farms, setFarms] = useState(props.farms);
  const [surveys, setSurveys] = useState([]);

  const onPositionChange = (expandIconPosition) => {
    setExpandIconPosition({ expandIconPosition });
  };
  const callback = (key) => {
    UserService.getSurveys(Number(key)).then((response) => {
      const tempSurveys = [...response.data.surveys];
      console.log(tempSurveys);
      setSurveys(() => tempSurveys);
    });
  };

  useEffect(() => {
    setFarms(props.farms);
  }, [props]);

  const RenderActions = (item) => {
    return (
      <>
        <Button
          type="link"
          onClick={(event) => {
            event.stopPropagation();
            props.review(item, event);
          }}
          style={{ padding: "0 5px" }}
        >
          Add Survey
        </Button>
        <Button
          type="link"
          onClick={(event) => {
            event.stopPropagation();
            event.target.innerHTML = "Update";
            props.review(item, event);
          }}
          icon={<EditFilled />}
        />
        <Button
          type="link"
          onClick={(event) => {
            event.stopPropagation();
            props.deleteRecord(item);
          }}
          icon={<DeleteFilled />}
        />
      </>
    );
  };

  return (
    <>
      <Row style={{ padding: "10px" }}>
        <Col xs={23} sm={23}>
          <Collapse
            accordion={true}
            onChange={callback}
            expandIconPosition={expandIconPosition}
          >
            {props.farms.map((item, key) => {
              return (
                <Panel
                  header={item.name}
                  key={item.id}
                  extra={<RenderActions item={item} />}
                >
                  <List
                    className="demo-loadmore-list"
                    itemLayout="horizontal"
                    dataSource={surveys}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <a
                            onClick={(event) => {
                              event.stopPropagation();
                              event.target.innerHTML = "Edit"
                              props.review(item, event);
                            }}
                            key="list-loadmore-edit"
                          >
                            Edit
                          </a>,
                          <a key="list-loadmore-more">View</a>,
                        ]}
                      >
                        <Skeleton title={false} loading={item.loading} active>
                          <List.Item.Meta
                            title={<a href="https://ant.design">{item.name}</a>}
                          />
                        </Skeleton>
                      </List.Item>
                    )}
                  />
                </Panel>
              );
            })}
          </Collapse>
        </Col>
      </Row>
    </>
  );
};

export default MobileView;

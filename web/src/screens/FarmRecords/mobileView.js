import React, { useState, useEffect } from "react";
import { Collapse, Row, Col, Button, List, Skeleton } from "antd";
import { EditFilled, DeleteFilled } from "@ant-design/icons";

const { Panel } = Collapse;

const MobileView = (props) => {
  const [farms, setFarms] = useState(props.farms);
  const [surveys, setSurveys] = useState([]);

  const callback = (key) => {
    props.farms.forEach(farm => {
      if (farm.id === Number(key)) {
        setSurveys(() => [...farm.Surveys]);
      }
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
            props.review(item.item, "add_survey");
          }}
          style={{ padding: "0 5px" }}
        >
          Add Survey
        </Button>
        <Button
          type="link"
          onClick={(event) => {
            event.stopPropagation();
            props.review(item, "edit_farm");
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
            expandIconPosition={"left"}
          >
            {farms.map((item, key) => {
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
                      <List.Item key={item.id}
                        actions={[
                          <a
                            onClick={(event) => {
                              event.stopPropagation();
                              props.review(item, "edit_survey");
                            }}
                            key="list-loadmore-edit"
                          >
                            Edit
                          </a>,
                        ]}
                      >
                        <Skeleton active loading={false}>
                          <List.Item.Meta title={item.name}></List.Item.Meta>
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

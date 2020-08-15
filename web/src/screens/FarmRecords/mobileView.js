import React, { useState, useEffect } from "react";
import { Collapse, Row, Col, Button, List, Skeleton } from "antd";
import { EditFilled, DeleteFilled, ReloadOutlined, AppstoreOutlined } from "@ant-design/icons";

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
        {item.item.isActive &&
          <>
          <Button
            size="small"
            type="primary"
            onClick={(event) => {
              event.stopPropagation();
              props.review(item.item, "add_survey");
            }}
          >
            + Survey
          </Button>
          <Button
            size="small"
            type="secondary"
            onClick={(event) => {
              event.stopPropagation();
              props.review(item.item, "edit_farm");
            }}>
            <EditFilled /> Farm
          </Button>
          <Button
            size="small"
            type="secondary"
            onClick={() => props.reviewPartition(item.item, "partition_farm")}
            >
              <AppstoreOutlined /> Plot
            </Button>
          <Button
            size="small"
            type="danger"
            onClick={(event) => {
              event.stopPropagation();
              props.deleteRecord(item.item);
            }}>
            <DeleteFilled /> Delete
          </Button>
        </>
        }
        {!item.item.isActive &&
          <Button
            size="small"
            type="danger"
            onClick={(event) => {
              event.stopPropagation();
              props.restoreRecord(item.item);
            }}>
            <ReloadOutlined /> Restore Farm
          </Button>
        }
      </>
    );
  };

  return (
    <>
      <Row style={{ padding: "10px" }}>
        <Col xs={24} lg={0} xl={0}>
          <Collapse
            accordion={true}
            onChange={callback}
            expandIconPosition={"left"}
          >
            {farms.map((item, key) => {
              return (
                <Panel
                  header={`${item.name} (${item.khata})`}
                  key={item.id}
                  extra={<RenderActions item={item} />}
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={[{ number: 'Survey #', subdivision: 'Subdivision #', extent: 'Acres' }]}
                    renderItem={(item) => (
                      <List.Item key={item.id}
                      >
                        <Skeleton active loading={false}>
                          <List.Item.Meta title={`${item.number} (${item.subdivision}) Extent: ${item.extent}`}></List.Item.Meta>
                        </Skeleton>
                      </List.Item>
                    )}
                  />
                  <List
                    itemLayout="horizontal"
                    dataSource={surveys}
                    renderItem={(item) => (
                      <List.Item key={item.id}
                        actions={[
                          <Button
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              props.review(item, "edit_survey");
                            }}
                          >
                            <EditFilled /> Survey
                          </Button>,
                        ]}
                      >
                        <Skeleton active loading={false}>
                          <List.Item.Meta title={`${item.number} (${item.subdivision}) Extent: ${item.extent.toFixed(4)}`}></List.Item.Meta>
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

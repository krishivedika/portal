import React, { useState, useEffect } from "react";
import { Collapse, Row, Col, Button, List, Skeleton } from "antd";

const { Panel } = Collapse;

const MobileView = (props) => {
  const [farms, setFarms] = useState(props.farms);
  const [layers, setLayers] = useState([]);

  const callback = (key) => {
    props.farms.forEach(farm => {
      if (farm.id === Number(key)) {
        setLayers(() => [...farm.Layers]);
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
          <Button
            type="link"
            onClick={(event) => {
              event.stopPropagation();
              props.deleteCropRecord(item.item);
            }}
          >
            Delete
          </Button>
        }
      </>
    );
  };

  return (
    <>
      <Row>
        <Col xs={23} lg={0} xl={0}>
          <Collapse
            accordion={true}
            onChange={callback}
            expandIconPosition={"left"}
          >
            {farms.map((item, key) => {
              return (
                <Panel
                  header={`${item.name} (${item.Farm.name})`}
                  key={item.id}
                  extra={<RenderActions item={item} />}
                >
                  <List
                    className="demo-loadmore-list"
                    itemLayout="horizontal"
                    dataSource={layers}
                    renderItem={(item) => (
                      <List.Item key={item.id}
                        actions={[
                          <Button
                            type="secondary"
                            onClick={(event) => {
                              event.stopPropagation();
                              props.showActivity(item);
                            }}
                            key="list-loadmore-edit"
                          >
                            PoP
                          </Button>,
                        ]}
                      >
                        <Skeleton active loading={false}>
                          <List.Item.Meta title={`${item.crop} (${new Date(item.date).toDateString()})`}></List.Item.Meta>
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

import React, { useState, useEffect } from "react";
import { Collapse, Row, Col, Button, List, Skeleton } from "antd";
import { EditFilled, DeleteFilled, ReloadOutlined, AppstoreOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const MobileView = (props) => {
  const [warehouses, setWarehouses] = useState([]);
  const [inventories, setInventories] = useState([]);

  const callback = (key) => {
    props.warehouses.forEach(warehouse => {
      if (warehouse.id === Number(key)) {
        setInventories(() => [...warehouse.Inventories]);
      }
    });
  };

  useEffect(() => {
    setWarehouses(props.warehouses);
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
              props.review(item.item, "add_inventory");
            }}
          >
            + Inventory
          </Button>
        </>
        }
      </>
    );
  };

  return (
    <>
      <Row>
        <Col xs={24} lg={0} xl={0}>
          <Collapse
            accordion={true}
            onChange={callback}
            expandIconPosition={"left"}
          >
            {warehouses.map((item, key) => {
              return (
                <Panel
                  header={`${item.name}`}
                  key={item.id}
                  extra={<RenderActions item={item} />}
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={inventories}
                    renderItem={(item) => (
                      <List.Item key={item.id}
                      >
                        <Skeleton active loading={false}>
                          <List.Item.Meta title={`${item.item} Quantity: ${item.quantity}, Metric: ${item.metric}`}></List.Item.Meta>
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

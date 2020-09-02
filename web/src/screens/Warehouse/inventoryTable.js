import React, { useEffect, useState } from "react";
import { Table, Tooltip, Button } from "antd";
import { EditFilled } from "@ant-design/icons";

const InventoryTable = (props) => {
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);

  const columns = [
    { title: "Inventory Item Name", dataIndex: "item", key: "item" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Metric", dataIndex: "metric", key: "metric" },
    { title: "Total Cost Value", key: "totalCost", render: (_, item) => (<>{item.price * item.quantity}</>) },
    { title: "Updated At", dataIndex: "updatedAt", key: "updatedAt", render: (_, item) => (<>{new Date(item.updatedAt).toDateString()}</>) },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <>
          {item.isActive &&
            <>
              <Tooltip placement="top" title='Edit Inventory'>
                <Button type="link" icon={<EditFilled />} onClick={() => props.review(item, "edit_inventory")} />
              </Tooltip>
            </>
          }
        </>
      ),
    },
  ];

  useEffect(() => {
    props.dataSource.forEach(warehouse => {
      if (warehouse.id === props.warehouse.id) {
        setWarehouses(() => warehouse.Inventories);
      }
    });
    setLoading(false);
  }, [props]);

  return (
    <Table
      columns={columns}
      dataSource={warehouses}
      pagination={false}
      loading={loading}
      bordered
      rowKey="id"
      style={{ margin: "15px 0px" }}
    />
  );
};

export default InventoryTable;

import React, { useEffect, useState } from "react";
import { Table, Tooltip, Button } from "antd";
import { EditFilled } from "@ant-design/icons";

const MachineryTable = (props) => {
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);

  const columns = [
    { title: "Machinery Item Name", dataIndex: "item", key: "item" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Manufacturer", dataIndex: "manufacturer", key: "manufacturer" },
    { title: "Details", dataIndex: "details", key: "details", render: (_, item) => (<Tooltip placement="top" title={item.details}>{item.details ? item.details.slice(0,10) : ""}</Tooltip>) },
    { title: "Total Cost Value", key: "totalCost", render: (_, item) => (<>{item.price * item.quantity}</>) },
    { title: "Updated At", dataIndex: "updatedAt", key: "updatedAt", render: (_, item) => (<>{new Date(item.updatedAt).toDateString()}</>) },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <>
          {item.isActive &&
            <>
              <Tooltip placement="top" title='Edit Machinery'>
                <Button type="link" icon={<EditFilled />} onClick={() => props.review(item, "edit_machinery")} />
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
        setWarehouses(() => warehouse.Machinery);
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

export default MachineryTable;

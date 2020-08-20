import React, { useEffect, useState } from "react";
import { Table } from "antd";

const SurveyTable = (props) => {
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);

  const columns = [
    { title: "Inventory Item Name", dataIndex: "item", key: "item" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Metric", dataIndex: "metric", key: "metric" },
    { title: "Updated At", dataIndex: "updatedAt", key: "updatedAt", render: (_, item) => (<>{new Date(item.updatedAt).toDateString()}</>) },
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

export default SurveyTable;

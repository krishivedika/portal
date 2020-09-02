import React, { useState, useEffect } from "react";
import { Table, Row, Col } from "antd";

const Chc = () => {

  const [rentedMachinery, setRentedMachinery] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { title: "Item Name", dataIndex: "name", key: "name" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Date of Rental", dataIndex: "date", key: "date" },
    { title: "Lease Expiration", dataIndex: "expiry", key: "expiry" },
  ];

  useEffect(() => {
    setRentedMachinery(() => [
      { id: 1, name: 'Trailer', price: '125000', date: 'Wed Aug 19 2020', expiry: 'Wed Aug 19 2021' },
      { id: 2, name: 'Tractor-40 HP', price: '625000', date: 'Wed Aug 19 2020', expiry: 'Wed Aug 19 2021' },
    ]);
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [rentedMachinery]);

  return (
    <>
      <Row style={{ padding: "10px", borderTop: "1px solid #90d150" }}>
        <Col xs={12} md={12} lg={14} xl={14}>
        </Col>
        <Col
          xs={10}
          md={10}
          lg={8}
          xl={8}
          offset={2}
          style={{ textAlign: "end" }}
        >
          <a target="_blank" type="primary" href="http://www.krishivedika.com/">
            Purchase at KrisiVedika
          </a>
        </Col>
      </Row>
      <Row style={{ padding: "10px" }}>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={24}
          xl={24}
        >
          <Table
            className="g-table-striped-rows g-ant-table-cell"
            ellipses={true}
            loading={loading}
            dataSource={rentedMachinery}
            columns={columns}
            rowKey="id"
            bordered
          />
        </Col>
      </Row>
    </>
  )
}

export default Chc;

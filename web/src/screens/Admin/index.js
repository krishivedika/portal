import React, { useState, useEffect } from "react";
import { Row, Col } from 'antd';

import { UserManagement } from "../../components";

const Admin = () => {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setLoading(false);
  }, []);

  return (
    <Row>
      <Col xs={{ span: 22, offset: 2 }} xl={{ span: 24, offset: 0 }}>
        <UserManagement />
      </Col>
    </Row>
  );
}

export default Admin;

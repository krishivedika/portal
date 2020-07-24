import React from "react";
import { Row, Col } from 'antd';

import { UserManagement } from "../../components";

const Staff = () => {

  return (
    <Row>
      <Col xs={{ span: 22, offset: 2 }} xl={{ span: 24, offset: 0 }} style={{ marginTop: '20px' }}>
        <UserManagement />
      </Col>
    </Row>
  );
}

export default Staff;

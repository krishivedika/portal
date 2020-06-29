import React, { useState, useEffect, useContext } from "react";
import { List, Row, Col, Card } from 'antd';
import { AuditOutlined } from '@ant-design/icons';

import { UserManagement } from "../../components";
import { SharedContext } from "../../context";

const Admin = () => {

  const [state, _] = useContext(SharedContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setLoading(false);
  }, [state.user]);

  return (
    <Row>
      <Col xs={{ span: 22, offset: 2 }} xl={{ span: 20, offset: 2 }}>
        <List
          itemLayout="horizontal"
          dataSource={[state.user]}
          loading={loading}
          renderItem={item => (
            <Card>
              <List.Item>
                <List.Item.Meta
                  avatar={<AuditOutlined style={{ fontSize: '40px' }} />}
                  title={`Welcome, ${item.firstName}`}
                  description={`Email: ${item.email} Role: ${item.roles}`}
                />
              </List.Item>
            </Card>
          )}
        />
      </Col>
      <Col xs={{ span: 22, offset: 2 }} xl={{ span: 20, offset: 2 }} style={{ marginTop: '20px' }}>
        <UserManagement />
      </Col>
    </Row>
  );
}

export default Admin;

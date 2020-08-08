import React, { useEffect, useState } from "react";
import { Tag, Form, InputNumber, Button, Input, Row, Col, message, Checkbox } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { Chart } from "@antv/g2";

const layout = {
  labelCol: { offset: 0, span: 4 },
  wrapperCol: { span: 20 },
};

const PartitionForm = (props) => {

  let chart;
  const [partitions, setPartitions] = useState([]);
  const [partitionExtents, setPartitionExtents] = useState({});

  useEffect(() => {
    setPartitions(() => {
      const data = [...JSON.parse(props.data.partitions).partitions]
      return data;
    });
  }, [props]);

  useEffect(() => {
    chart = new Chart({
      container: 'container',
      height: 250,
      width: 300,
    });
    chart.coordinate('theta', {
      radius: 0.75,
    });
    chart.legend(false);
    chart
    .interval()
    .color('item').position('area').label('item')
    .adjust('stack');
    chart.data(partitions);
    chart.render();
    return () => {
      chart.destroy();
    }
  }, [partitions, partitionExtents]);

  const onInputChange = (e, item) => {
    setPartitions((state) => {
      const newData = [...state];
      newData.forEach(p => {
        if (p.item === item) p.area = e;
      });
      chart.data(newData);
      chart.render();
      return newData;
    });
  }

  const addPartition = () => {
    if (partitions.length === 10) {
      message.warning('Maximum partitions is reached');
    } else {
      setPartitions((state) => {
        const newData = [...state, { item: `Plot ${partitions.length + 1}`, area: 1 }];
        chart.data(newData);
        chart.render();
        return newData;
      });
    }
  }

  const deletePartition = () => {
    if (partitions.length === 1) {
      message.warning('Minimum of 1 plot is required');
    } else {
      setPartitions((state) => {
        const newData = [...state.slice(0, state.length - 1)];
        chart.data(newData);
        chart.render();
        return newData;
      });
    }
  }

  const addExtent = (e, item, extent) => {
    if (e.target.checked) {
      setPartitionExtents(state => ({...state, [item]: (state[item] || 0) + extent}));
    } else {
      setPartitionExtents(state => ({...state, [item]: (state[item] || 0) - extent}));
    }
  }

  return (
    <div style={{ margin: '15px' }}>
      <Tag icon={<SyncOutlined spin />} color="processing" style={{ marginBottom: '10px' }}>
        Plotting Farm: {props.data.name}
      </Tag>
      <Form form={props.form} onFinish={props.onFinish} layout="inline">
        <Button type="primary" htmlType="submit">Save</Button>
        <Row style={{ marginTop: '15px'}}>
          <Col>
            <Button onClick={addPartition}> + Add Plot</Button>
            <Button style={{ marginBottom: '15px', marginLeft: '5px' }} onClick={deletePartition}> - Remove Plot</Button>
            <div id="container" style={{ marginBottom: '15px' }}></div>
            {partitions.map((p, index) => (
              <div key={index}>
                <Input.Group>
                  <Form.Item initialValue={p.area} name={p.item} label={`Plot ${index + 1}`}
                  rules= {[() => ({
                    validator(rule, value) {
                      if (value < partitionExtents[p.item]) {
                        return Promise.resolve();
                      }
                      return Promise.reject('The area should be less than total Survey Extent areas.');
                    },
                  })
                  ]}>
                    <InputNumber precision={4} placeholder='Acres' onChange={(e) => onInputChange(e, p.item)} />
                  </Form.Item>
                  <Form.Item>
                    <Checkbox.Group>
                      {props.data.Surveys.map((s) => (
                        <Checkbox onChange={(e) => addExtent(e, p.item, s.extent)} key={`${p.item}_${s.number}`} value={s.extent} style={{ lineHeight: '32px' }}>
                          # {s.number} (Acres: {s.extent})
                        </Checkbox>
                      ))}
                    </Checkbox.Group>
                  </Form.Item>
                </Input.Group>
              </div>
            ))}
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default PartitionForm;

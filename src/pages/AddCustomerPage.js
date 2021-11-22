import React, {Component} from 'react';
import API from "../server-apis/api";
import {Button, Card, Col, Divider, Form, Input, InputNumber, Layout, notification, Row, Space} from "antd";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import {Content} from "antd/es/layout/layout";

class AddCustomerPage extends Component {
    constructor(props) {
        super(props);
        this.onFinish = this.onFinish.bind(this);
    }
    onFinish = (values) => {
       API.post(`/customers/add`,values)
            .then((res) => {
                this.successfullyAdded();
            })
            .catch(error => {
                // this.setState({ errorMessage: error.message });
                this.errorHappend(error);
                console.error('There was an error!', error);
            });
    };

    onFinishFailed = (errorInfo) => {console.log('Failed:', errorInfo);
    };
    successfullyAdded = () => {
        notification.info({
            message: `Notification`,
            description:
                'Customer is successfully added',
            placement:"bottomRight",
            icon: <CheckCircleFilled style={{ color: '#0AC035' }} />
        });
    };
    errorHappend = (error) => {
        notification.info({
            message: `Notification`,
            description:
                `There was an error! ${error}`,
            placement:"bottomRight",
            icon: <InfoCircleFilled style={{ color: '#f53333' }} />
        });
    };
    render() {
        return (
            <Layout style={{alignItems: 'center',marginTop:"2em"}}>
                <div>Add info about new customer</div>
                <Content >
                    <Form name="addProductForm"
                          layout="vertical"
                          initialValues={{  remember: true,}}
                          onFinish={this.onFinish}
                          onFinishFailed={this.onFinishFailed}
                          autoComplete="off">
                        <Space size="large" align="start">
                            <Card title="Enter company info" style={{ width: "42em" }}>
                                <Form.Item label="Company name" name="name" rules={[ {required: true,message: 'Please enter name',}, ]}>
                                    <Input />
                                </Form.Item>

                                <Form.Item label="Address" name="address" rules={[ {required: true,message: 'Please enter Address',}, ]}>
                                    <Input />
                                </Form.Item>
                                <Space >
                                    <Form.Item label="City" name="city" rules={[ {required: true,message: 'Please enter city',}, ]} >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Zip" name="zip" rules={[ {required: true,message: 'Please enter zip',}, ]}>
                                        <InputNumber />
                                    </Form.Item>
                                    <Form.Item label="State" name="state" rules={[ {required: true,message: 'Please enter state',}, ]}>
                                        <Input />
                                    </Form.Item>
                                </Space>
                            </Card>
                            <div>
                                <Card title="Enter contact person info" style={{ width: "42em" }}>
                                    <Form.Item label="Contact Person Name" name="contactPersonName">
                                        <Input />
                                    </Form.Item>

                                    <Form.Item label="Contact Person Email" name="contactPersonEmail">
                                        <Input />
                                    </Form.Item>
                                </Card>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{width:"10em",float:"right" , marginTop:"2em"}}>
                                        Save
                                    </Button>
                                </Form.Item>
                        </div>

                        </Space>
                        {/*<Row>*/}
                        {/*    <Col xs={{ span: 5, offset: 1 }} sm={{ span:10,order: 2 }} md={{ span:10,order: 3 }} lg={{ span: 6, offset: 4 }}>*/}
                        {/*        <Card title="Add new company info" style={{ width: "30em" }}>*/}

                        {/*        </Card>*/}
                        {/*    </Col>*/}
                        {/*    <Col xs={{ span: 11, offset: 1 }} sm={{ span:10,order: 1 }} md={{ span:10,order: 4 }}lg={{ span: 6, offset: 3 }}>*/}
                        {/*        <Card title="Contact info" style={{ width: "30em" }}>*/}

                        {/*        </Card>*/}
                        {/*    </Col>*/}
                        {/*</Row>*/}
                    </Form>
                </Content>
            </Layout>
        );
    }
}

export default AddCustomerPage;
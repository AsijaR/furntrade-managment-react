import React, {Component} from 'react';
import {Form, Input, Button, Space, InputNumber, Select} from "antd";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import API from "../server-apis/api";

class AddNewProductsToOrder extends Component {
    constructor(props) {
        super(props);
        this.state= {
            data: [],
            error: null
        };
        this.onFinish=this.onFinish.bind(this);
    }
    onFinish = values => {
        const params = new URLSearchParams();
        params.append('quantity', values.quantity);
        API.patch(`orders/${this.props.orderId}/add-product/${values.product}`,params,{ headers: { Authorization: this.props.token}})
            .then((res) => {
                console.log(res);
                //this.successfullyAdded();
            })
            .catch(error => {
                // this.setState({ errorMessage: error.message });
             //   this.errorHappend(error);
                console.error('There was an error!', error);
            });
    };
    async componentDidMount() {
        await API.get(`products`,{ headers: { Authorization: this.props.token}})
            .then(
                (res) => {
                    const products = res.data._embedded.productList;
                    this.setState({data:products });
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            )
    }

    render() {
        const { error, data } = this.state;
        let options = []
        if (data.length > 0) {
            data.forEach(role => {
                let roleDate = {};
                roleDate.value = role.id;
                roleDate.label = role.name;
                options.push(roleDate)
            })
        }
        if (error) {
            return <div>Error: {error.message}</div>;
        }  else {
            return (
            <div>
            <Form onFinish={this.onFinish} autoComplete="off">
                <Form.Item  label="Choose a product" name="product" rules={[{ required: true, message: 'Missing product' }]}>
                    <Select mode="single" options={options} />
                </Form.Item>
                <Form.Item label="Choose a quantity" name="quantity" rules={[{ required: true, message: 'Missing quantity' }]}>
                    <InputNumber placeholder="Quantity" />
                </Form.Item>
                {/*<Form.List name="products">*/}
                {/*    {(fields, { add, remove }) => (*/}
                {/*        <>*/}
                {/*            {fields.map(({ key, name, ...restField }) => (*/}
                {/*                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">*/}
                {/*                    <Form.Item*/}
                {/*                        {...restField} name={[name, 'first']} rules={[{ required: true, message: 'Missing product' }]}>*/}
                {/*                        <Input placeholder="Product ID" />*/}
                {/*                    </Form.Item>*/}
                {/*                    <Form.Item*/}
                {/*                        {...restField} name={[name, 'last']} rules={[{ required: true, message: 'Missing quantity' }]}>*/}
                {/*                        <InputNumber placeholder="Quantity" />*/}
                {/*                    </Form.Item>*/}
                {/*                    <MinusCircleOutlined onClick={() => remove(name)} />*/}
                {/*                </Space>*/}
                {/*            ))}*/}
                {/*            <Form.Item>*/}
                {/*                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>*/}
                {/*                    Add field*/}
                {/*                </Button>*/}
                {/*            </Form.Item>*/}
                {/*        </>*/}
                {/*    )}*/}
                {/*</Form.List>*/}
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form></div>
        );
    }
    }
}

export default AddNewProductsToOrder;
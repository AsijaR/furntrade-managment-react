import React, {Component} from 'react';
import {Form, Button, InputNumber, Select, notification} from "antd";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
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
        if(!this.props.isNewOrder)
        {
            const params = new URLSearchParams();
            params.append('quantity', values.quantity);
            API.patch(`orders/${this.props.orderId}/add-product/${values.product}`,params,{ headers: { Authorization: this.props.token}})
                .then((res) => {
                    let orderedProducts=res.data.orderedProducts.map((p)=>{
                        return {
                            id: p.product.id,
                            color: p.product.color,
                            model: p.product.model,
                            name: p.product.name,
                            price: p.product.price,
                            quantity: p.quantity,
                        }
                    })
                    var addedProd=orderedProducts.slice(-1).pop();
                    this.props.handler(res.data,addedProd);
                    this.successfullyAdded("Product is successfully added to the order.");
                })
                .catch(error => {
                    if(error.response.status===403)
                        this.errorHappend("Product already exists in the order.");
                    else  this.errorHappend(error);// this.setState({ errorMessage: error.message });
                    console.error('There was an error!', error);
                });
        }
        else{
            const newProd=this.state.data.find(({id})=>id===values.product);
            const product = {
                id: newProd.id,
                color: newProd.color,
                model: newProd.model,
                name: newProd.name,
                price: newProd.price,
                quantity: values.quantity
            };
            this.props.handler(this.state.data,product);
        }
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
    successfullyAdded = (message) => {
        notification.info({
            message: `Notification`,
            description:message,
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
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Add product
                    </Button>
                </Form.Item>
            </Form>
            </div>
        );
    }
    }
}

export default AddNewProductsToOrder;
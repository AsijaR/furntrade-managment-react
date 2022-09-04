import React, {Component} from 'react';
import {Form, Button, InputNumber, Select, notification, Space} from "antd";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import API from "../server-apis/api";
import Text from "antd/es/typography/Text";
import {Link} from "react-router-dom";
import authService from '../services/auth.service';

class AddNewProductsToOrder extends Component {
    constructor(props) {
        super(props);
        this.state= {
            data: [],
            addingDataLoading:false,
            errorMessage: null
        };
        this.onFinish=this.onFinish.bind(this);
    }
    
    onFinish = values => {
        if(!this.props.isNewOrder)
        {
            console.log("nije nova");
            if(this.props.products.some(p=>p.id===values.product)){
                notification.info({
                    message: `Notification`,
                    description:
                        `Product already exists in the list.`,
                    placement:"bottomRight",
                    icon: <InfoCircleFilled style={{ color: '#f53333' }} />
                });
                console.log("poslo parent"+ JSON.stringify(this.props.products));
                console.log("values"+JSON.stringify(values));
            }
        else {
                this.setState({addingDataLoading:true});
                const params = new URLSearchParams();
                params.append('quantity', values.quantity);
                API.patch(`orders/${this.props.orderId}/add-product/${values.product}`, params, {headers: {Authorization: this.props.token}})
                    .then((res) => {
                        let orderedProducts = res.data.orderedProducts.map((p) => {
                            return {
                                id: p.product.id,
                                color: p.product.color,
                                model: p.product.model,
                                name: p.product.name,
                                price: p.product.price,
                                quantity: p.quantity,
                            }
                        })
                        var addedProd = orderedProducts.slice(-1).pop();
                        this.props.handler(res.data, addedProd);
                        this.successfullyAdded("Product is successfully added to the order.");
                        this.setState({addingDataLoading:false});
                    })
                    .catch(error => {
                        try {
                            var message=JSON.stringify(error.response.data.error_message);
                            if(message.includes("The Token has expired"))
                            {
                                this.setState({errorMessage:"Your token has expired"});
                                this.errorHappend("Your token has expired.");
                                authService.logout();
                            }
                        } 
                        catch (error) {
                            this.setState({errorMessage:error})
                        }
                        if (error.response.status === 403)
                            this.errorHappend("Product already exists in the order.");
                        else this.errorHappend("Failed to save");
                        console.error('There was an error!', error);
                    });
            }
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
            this.successfullyAdded("Product is successfully added to the order.");
        }
    };
    componentDidMount() 
    {  
       API.get(`products/all`,{ headers: { Authorization: this.props.token}}).then((res) => {
                    const products = res.data._embedded.productList;
                    this.setState({data:products});
                }
            )
            .catch(error => {
                try {
                    var message=JSON.stringify(error.response.data.error_message);
                    if(message.includes("The Token has expired"))
                    {
                        this.setState({errorMessage:"Your token has expired"});
                        this.errorHappend("Your token has expired.");
                        authService.logout();
                    }
                } 
                catch (error) {
                    this.setState({errorMessage:error})
                }
                this.errorHappend("Failed to load data");
                console.error('There was an error!', error);
            });
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
                {error},
            placement:"bottomRight",
            icon: <InfoCircleFilled style={{ color: '#f53333' }} />
        });
    };
    render() {
        const { errorMessage,data,addingDataLoading} = this.state;
        let options = []
        if (data.length > 0) {
            data.forEach(role => {
                let roleDate = {};
                roleDate.value = role.id;
                roleDate.label = role.name;
                options.push(roleDate)
            })
        }
        if (errorMessage) {
            return <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Text style={{fontSize:"22px"}}>Error: {this.state.errorMessage}</Text>
                {errorMessage.includes("token")&&(<Link to="/login">
                    <Button>Click here to login again</Button>
                </Link>)}
            </Space>;
        }else {
            return (
            <div>
                <Form onFinish={this.onFinish} autoComplete="off">
                <Form.Item  label="Choose a product" name="product" rules={[{ required: true, message: 'Missing product' }]}>
                    <Select mode="single" options={options} />
                </Form.Item>
                <Form.Item label="Choose a quantity" name="quantity" rules={[{ required: true, message: 'Missing quantity' }]}>
                    <InputNumber placeholder="Quantity" min={1}/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={addingDataLoading}>
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
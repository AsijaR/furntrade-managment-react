import React, {Component} from 'react';
import {Row, Col, Typography, Input, Form, Select, DatePicker, Space, Button, Modal, Divider, notification} from "antd";
import moment from 'moment';
import API from "../server-apis/api";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import OrderedProductsTable from "../components/OrderedProductsTable";
import AddNewProductsToOrder from "../components/AddNewProductsToOrder";
import {Link} from "react-router-dom";
import authService from '../services/auth.service';
const { RangePicker } = DatePicker;
const { Text } = Typography;

class OrderDetails extends Component {
    constructor(props) {
        super(props);
        this.state={
            data: [],
            orderId:0,
            selectedCustomer:"",
            orderStatus:"",
            customers:[],
            products:[],
            totalOrderPrice:0,
            initialFormValues:[],
            isNewOrder:true,
            errorMessage: null,
            isLoaded: false,
            isModalVisible:false
            
        }
        this.token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        this.onFinish=this.onFinish.bind(this);
        this.onFinishFailed=this.onFinishFailed.bind(this);
        this.handler = this.handler.bind(this);
        this.removehandler = this.removehandler.bind(this);
        this.updateTotalPrice=this.updateTotalPrice.bind(this);
    }
    updateTotalPrice(price) {
        this.setState({
            totalOrderPrice:price
        });
    }
    removehandler(updatedProducts)
    {
        this.setState({products: updatedProducts });
    }
handler(order,newProduct) {
        if(!this.state.isNewOrder)
        {
            this.setState({
                data:order,
                products:  [...this.state.products,newProduct]
            });
        }
        else
        {
            if(this.state.products.some(p=>p.id===newProduct.id)){
                notification.info({
                    message: `Notification`,
                    description:
                        `Product already exists in the list.`,
                    placement:"bottomRight",
                    icon: <InfoCircleFilled style={{ color: '#f53333' }} />
                });
            }
            else
            {
                var currentOrderPrice=this.state.totalOrderPrice+(newProduct.price*newProduct.quantity);
                this.setState({
                    //   newOrderData:order,
                    products:  [...this.state.products,newProduct],
                    totalOrderPrice:currentOrderPrice
                })
            }
        }
    }
    selectSomeProperties(account) {
        return Object.keys(account).reduce(function(obj, k) {
            if (["id","name","address","city"].includes(k)) {
                obj[k] = account[k];
            }
            return obj;
        }, {});
    }
    reformatArrray(account) {
        return account.map(function(customer) {
            var newObj = {};
            newObj["id"] = customer.id;
            newObj["fullName"] = customer.name+","+ customer.address+","+customer.city;
            // return our new object.
            return newObj;
        });
    }
    async componentDidMount() {
        let url = window.location.pathname;
        if(url!=="/orders/create-new-order")
        {
            // var currentCustomer="";
            var orderId = url.substring(url.lastIndexOf('/') + 1);
            this.setState({orderId:orderId})
            await API.get(`orders/${orderId}`,{ headers: { Authorization: this.token}})
                .then(
                    (res) => {
                        const orderDetails = res.data;
                        let orderedProducts=orderDetails.orderedProducts.map((p)=>{
                            return {
                                id: p.product.id,
                                color: p.product.color,
                                model: p.product.model,
                                name: p.product.name,
                                price: p.product.price,
                                quantity: p.quantity,
                            }
                        })
                        this.setState({
                            isLoaded: true,
                            isNewOrder:false,
                            data:orderDetails,
                            products:orderedProducts,
                            orderStatus:orderDetails.status,
                            totalOrderPrice:orderDetails.totalOrderPrice,
                            initialFormValues: {
                                customer: orderDetails.customer.name,
                                shippmentDate: moment(orderDetails.shippmentDate),
                                note1: orderDetails.note1,
                                note2: orderDetails.note2,
                                status: orderDetails.status
                            }
                        });
                    }
                ).catch(error => {
                    var message=JSON.stringify(error.response.data.error_message);
                    if(message.includes("The Token has expired"))
                    {
                        this.setState({errorMessage:"Your token has expired"});
                        this.errorHappend("Your token has expired.");
                        authService.logout();
                    }
                    else
                    {
                        this.setState({errorMessage:error})
                    }
                    this.errorHappend("Failed to load data");
                    console.error('There was an error!', error);
                });
        }
        else{
            this.setState({isLoaded:true,
                initialFormValues: {
                    status: "Waiting"
                }});
        }
        await API.get(`customers`,{ headers: { Authorization: this.token}})
            .then(
                (res) => {
                    const customerList = res.data._embedded.customerList;
                    var c=[];
                    var name="";
                    customerList.forEach(x=>{
                        c.push(this.selectSomeProperties(x));
                    })
                    var fullNameArray = this.reformatArrray(c);
                    fullNameArray.forEach(x=>{
                        if(x.fullName.includes(this.state.selectedCustomer))
                           name=x.fullName;
                    })
                    this.setState({customers:fullNameArray,selectedCustomer:name});
                }
            )
            .catch(error => {
                var message=JSON.stringify(error.response.data.error_message);
                if(message.includes("The Token has expired"))
                {
                    this.setState({errorMessage:"Your token has expired"});
                    this.errorHappend("Your token has expired.");
                    authService.logout();
                }
                else
                {
                    this.setState({errorMessage:error})
                }
                this.errorHappend("Failed to load data");
                console.error('There was an error!', error);
            });
    }
    createNewOrder(customerName,values)
    {
        const order={
            customerName:customerName,
            shippmentDate:values.shippmentDate,
            note1:values.note1,
            note2:values.note2,
        }
        var products=this.state.products.map((p)=>{
            const product={
                id: p.id,
                color: p.color,
                model: p.model,
                name: p.name,
                price: p.price,
            }
            const productInfo={
                product:product,
                quantity:p.quantity
            }
            return productInfo;
        });

        if (products.length===0)
        {
            this.errorHappend("Please add products to create order");
        }
        else{
            API.post(`/orders/add`,{order,products},{ headers: { Authorization: this.token}})
                .then((res) => {
                    this.successfullyAdded("Order is successfully created!");
                    console.log(res);
                })
                .catch(error => {
                    var message=JSON.stringify(error.response.data.error_message);
                    if(message.includes("The Token has expired"))
                    {
                        this.setState({errorMessage:"Your token has expired"});
                        this.errorHappend("Your token has expired.");
                        authService.logout();
                    }
                    else
                    {
                        this.setState({errorMessage:error})
                    }
                    this.errorHappend("Failed to save");
                    console.error('There was an error!', error);
                });
        }
    }
    onFinish = (values) => {
        var customerName=this.state.selectedCustomer.split(",")[0];
        if(this.state.isNewOrder)
        {
            this.createNewOrder(customerName,values)
        }
        else
        {
            API.put(`/orders/update/${this.state.orderId}`,
                {
                    customerName:customerName,
                    shippmentDate:values.shippmentDate,
                    status:values.status,
                    note1:values.note1,
                    note2:values.note2
                    },
                { headers: { Authorization: this.token}})
                .then((res) => {
                    this.successfullyAdded("Order is updated");
                })
                .catch(error => {
                    var message=JSON.stringify(error.response.data.error_message);
                    if(message.includes("The Token has expired"))
                    {
                        this.setState({errorMessage:"Your token has expired"});
                        this.errorHappend("Your token has expired.");
                        authService.logout();
                    }
                    else
                    {
                        this.setState({errorMessage:error})
                    }
                    this.errorHappend("Failed to save");
                    console.error('There was an error!', error);
                });
        }
    };
    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
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
    showModal = () => {
        this.setState({
            isModalVisible:  true
        })
    };
    handleCancel = () => {
        this.setState({
            isModalVisible:  false
        })
    };
    render() {
        const { errorMessage, isLoaded, data,totalOrderPrice,initialFormValues,isNewOrder,customers,products,isModalVisible } = this.state;
        let header;
        if(!isNewOrder){
            header=<Text mark style={{fontSize:"22px"}} >Order id: {data.id}</Text>;
        }
        else {
            header=<Text style={{fontSize:"22px"}} >Create new order</Text>
        }
        const disabledDate = (current) => {
            return current && current < moment().endOf('day');
          };
        let options = []
        if (customers.length > 0) {
            customers.forEach(role => {
                let roleDate = {};
                roleDate.value = role.id;
                roleDate.label = role.fullName;
                options.push(roleDate)
            })
        }
        if (errorMessage) {
            return <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Text style={{fontSize:"22px"}}>Error: {errorMessage}</Text>
                {errorMessage.includes("token")&&(<Link to="/login">
                    <Button>Click here to login again</Button>
                </Link>)}
            </Space>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <Space direction="vertical" style={{width:"100%"}}>
                    {header}
                    <Button type="default" onClick={this.showModal} style={{float:"right", marginRight:"4.5em"}} size="middle"> Add more products to the order</Button>
                    <Modal title="Add product to the order" visible={isModalVisible} destroyOnClose={true} onOk={this.handleOk} onCancel={this.handleCancel}
                           footer={[<Button key="back" onClick={this.handleCancel}> Cancel </Button>]}>
                        <AddNewProductsToOrder orderId={data.id} token={this.token} handler={this.handler} isNewOrder={isNewOrder} products={products}/>
                    </Modal>
                    <Form name="basic"
                        initialValues={initialFormValues}
                        onFinish={this.onFinish} onFinishFailed={this.onFinishFailed} autoComplete="off">
                        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                            <Col className="gutter-row" span={8}>
                                <div style={{ padding: '8px' }}>
                                    <Form.Item label="Customer" name="customer" rules={[ {required: true,message: 'Please pick a customer',}, ]}>
                                        <Select mode="single" options={options} />
                                    </Form.Item>

                                    <Form.Item label="Shipping date" name="shippmentDate" rules={[ {required: true,message: 'Please pick a date',}, ]}>
                                        <DatePicker format="DD.MM.YYYY" disabledDate={disabledDate} onChange={this.onChange} picker="date" />
                                    </Form.Item>

                                    <Form.Item label="Status" name="status" rules={[ {required: true,message: 'Please pick a status',}, ]} >
                                        <Select mode="single" disabled={isNewOrder}>
                                            <Select.Option value="WAITING">Waiting</Select.Option>
                                            <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
                                            <Select.Option value="COMPLETED">Completed</Select.Option>
                                            <Select.Option value="CANCELLED">Cancelled</Select.Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item label="Note 1" name="note1" rules={[ {required: false},{
                                        pattern: /^[a-zA-Z0-9_@/.#$%*()+?! ]+$/,
                                        message: 'Note can only include letters,numbers and some special characters.',
                                    } ]}>
                                        <Input/>
                                    </Form.Item>
                                    <Form.Item label="Note 2" name="note2" rules={[ {required: false},{
                                        pattern: /^[a-zA-Z0-9_@/.#$%*()+?! ]+$/,
                                        message: 'Name can only include letters,numbers and some special characters.',
                                    } ]}>
                                        <Input/>
                                    </Form.Item>
                                    <Space direction="horizontal">
                                        <Text strong>Total price: {totalOrderPrice} €</Text>
                                    </Space>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" style={{width:"10em", marginTop:"2em", marginRight:"4em"}}>Save</Button>
                                    </Form.Item>
                                </div>
                            </Col>
                            <Divider type="vertical" style={{ height: "22em", backgroundColor: "#7c7d7c" }}/>
                            <Col className="gutter-row" span={15}>
                                <div style={{ padding: '8px' }}>
                                    <h3>Ordered products</h3>
                                    <OrderedProductsTable orderId={data.id} removehandler={this.removehandler} products={products} token={this.token} updateTotalPrice={this.updateTotalPrice}/>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Space>
        )};
    }
}

export default OrderDetails;
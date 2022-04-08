import React, {Component} from 'react';
import {Button, Col, DatePicker, Divider, Form, Input, Modal, Row, Select, Space, Typography} from "antd";
import AddNewProductsToOrder from "../components/AddNewProductsToOrder";
import OrderedProductsTable from "../components/OrderedProductsTable";
import API from "../server-apis/api";

const { Text } = Typography;

class CreateNewOrder extends Component {
    constructor(props) {
        super(props);
        this.state={
            newOrderData: [],
            customers:[],
            products:[],
            totalOrderPrice:[],
            error: null,
            isLoaded: false,
            isModalVisible:false
        }
        this.token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        this.onFinish=this.onFinish.bind(this);
        this.onFinishFailed=this.onFinishFailed.bind(this);
        this.handler = this.handler.bind(this)
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
                    this.setState({customers:fullNameArray});
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }
    handler(order,newProduct) {
        console.log("novo dodala",newProduct)

        this.setState({
         //   newOrderData:order,
            products:  [...this.state.products,newProduct]
        })
        console.log("nova lista prod",this.state.products)
    }
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
    onFinish = (values) => {
        console.log('Success:', values);
        //ovde bi mogla da kreiram objekat koji mi treba request

    };
    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    render() {
        const { error, isLoaded, newOrderData,customers,products,isModalVisible } = this.state;
        let options = []
        if (customers.length > 0) {
            customers.forEach(role => {
                let roleDate = {};
                roleDate.value = role.id;
                roleDate.label = role.fullName;
                options.push(roleDate)
            })
        }
        return (
            <Space direction="vertical" style={{width:"100%"}}>
                {/*<Text mark style={{fontSize:"22px"}} >Order id: {data.id}</Text>*/}
                <Button type="default" onClick={this.showModal} style={{float:"right", marginRight:"4.5em"}} size="middle"> Add more products to the order</Button>
                <Modal title="Add product to the order" visible={isModalVisible} onClose={this.handleCancel}
                       footer={[<Button key="back" onClick={this.handleCancel}> Cancel </Button>]}>
                    <AddNewProductsToOrder token={this.token} handler={this.handler} isNewOrder={true}/>
                </Modal>
                <Form name="basic" onFinish={this.onFinish} onFinishFailed={this.onFinishFailed} autoComplete="off">
                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        <Col className="gutter-row" span={8}>
                            <div style={{ padding: '8px' }}>
                                <Form.Item label="Customer" name="customer" rules={[ {required: true,message: 'Please pick a customer',}, ]}>
                                    <Select mode="single" options={options} />
                                </Form.Item>

                                <Form.Item label="Shipping date" name="shippmentDate" rules={[ {required: true,message: 'Please pick a date',}, ]}>
                                    <DatePicker format="DD.MM.YYYY" onChange={this.onChange} picker="date" />
                                </Form.Item>

                                <Form.Item label="Note 1" name="note1" rules={[ {required: false,message: 'Please pick a date',},{
                                    pattern: /^[a-zA-Z0-9]+$/,
                                    message: 'Name can only include letters and numbers.',
                                } ]}>
                                    <Input/>
                                </Form.Item>
                                <Form.Item label="Note 2" name="note2" rules={[ {required: false,message: 'Please pick a date',},{
                                    pattern: /^[a-zA-Z0-9]+$/,
                                    message: 'Name can only include letters and numbers.',
                                } ]}>
                                    <Input/>
                                </Form.Item>
                                {/*<Space direction="horizontal">*/}
                                {/*    <Text strong>Total price: €</Text>*/}
                                {/*</Space>*/}
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{width:"10em", marginTop:"3em", marginRight:"4em"}}>Save</Button>
                                </Form.Item>
                            </div>
                        </Col>
                        <Divider type="vertical" style={{ height: "22em", backgroundColor: "#7c7d7c" }}/>
                        <Col className="gutter-row" span={15}>
                            <div style={{ padding: '8px' }}>
                                <h3>Ordered products</h3>
                                <OrderedProductsTable products={products} isNewOrder={true} token={this.token}/>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Space>
        );
    }
}

export default CreateNewOrder;
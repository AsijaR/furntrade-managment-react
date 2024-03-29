import React, {Component} from 'react';
import EditableTableRow, {EditableContext} from "./EditableTableRow";
import EditableTableCell from "./EditableTableCell";
import {Button, notification, Popconfirm, Space, Table, Typography} from "antd";
import {orderedProductsDataColumns} from "../tableColumnsData/orderedProductsDataColumns";
import API from "../server-apis/api";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import Text from "antd/es/typography/Text";
import {Link} from "react-router-dom";
import authService from '../services/auth.service';

class OrderedProductsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data:[],
            isRemoved:false,
            loading: false,
            editingKey: "",
            errorMessage:null
        };
        this.isEditing= (record) => record.id === this.state.editingKey;
        this.saveData=this.saveData.bind(this);
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
       
        if (nextProps.products !== this.props.products) {
            this.setState({ data: nextProps.products });
        }
    }
    componentDidMount() {
        this.setState({data:this.props.products});
    }
    isRemovedFunc(){
        return true;
    }
    isEditing =(record) => {
        return record.id === this.state.editingKey;
    };
    edit(record) {
        this.setState({ editingKey: record.id,});
    }
    cancel = () => {
        this.setState({ editingKey: ""});
    };

    async remove(id) {
        var total=0;
        var isOrderNew=window.location.href.toString().includes("create-new-order");
        if(this.state.data.length===1)
        {
            this.errorHappend("Order needs to have at least one product");
            return;
        }
        if (isOrderNew){
            let updatedProducts = [...this.state.data].filter(i => i.id !== id);
            updatedProducts.forEach(x=>{
                total+=x.price*x.quantity;
            });
          
            this.setState({data: updatedProducts,isRemoved:true});
            this.props.removehandler(updatedProducts);
            this.props.updateTotalPrice(total);
            this.successfullyAdded("Product is deleted");
        }
        else {
            const params = new URLSearchParams();
            params.append('quantity', 0);
             API.patch(`orders/${this.props.orderId}/remove-product/${id}`, params, {headers: {Authorization: this.props.token}})
                .then(() => {
                    let updatedProducts = [...this.state.data].filter(i => i.id !== id);
                    updatedProducts.forEach(x=>{  total+=x.price*x.quantity;});
                    this.setState({data: updatedProducts,isRemoved:true});
                    this.props.removehandler(updatedProducts);
                    this.props.updateTotalPrice(total);
                    this.successfullyAdded("Product is deleted");

                }).catch((error) => {
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
                this.errorHappend("Failed to delete product");
                console.error('There was an error!', error);
            });
        }
    }
    async updateOrderTotalPrice(total){
         API.put(`/orders/update/${this.props.orderId}`,
        {
            totalOrderPrice:total
        },
        { headers: { Authorization: this.props.token}})
        .then((res) => {
            this.successfullyAdded("Order is updated");
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
            this.errorHappend("Failed to save");
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
                `${error}`,
            placement:"bottomRight",
            icon: <InfoCircleFilled style={{ color: '#f53333' }} />
        });
    };
    saveData(form,id) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.props.products];
            const index = newData.findIndex(item => id === item.id);
            const item = newData[index];
            newData.splice(index, 1, {
                ...item,
                ...row
            });
            API.patch(`/orders/${this.props.orderId}/product/${id}/change-quantity/`, row,{ headers: { Authorization: this.props.token}})
                .then((response) => {
                    this.setState({ data: newData, editingKey: "" });
                    this.successfullyAdded("Product info is updated")
                })
                .catch((error)=>{
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
                    this.errorHappend("Failed to save changes");
                    console.error('There was an error!', error);
                });
        });
        this.setState({ editingKey: "",isEditing:false });

    }
    render() {
        const components = {
            body: {
                row: EditableTableRow,
                cell: EditableTableCell
            }
        };

        const columns = orderedProductsDataColumns.map(col => {
            if (col.dataIndex === 'actions') {
                return {
                    ...col,
                    render: (text, record) => {
                        const editable = this.isEditing(record);
                        return editable ? (
                            <span>
                                <EditableContext.Consumer>
                                    {(form) => ( <Typography.Link onClick={() => this.saveData(form, record.id)} style={{ marginRight: 8 }}>Save</Typography.Link> )}
                                </EditableContext.Consumer>
                                <Typography.Link  onClick={this.cancel}>Cancel</Typography.Link>
                </span>
                        ) : (
                            <Space size='middle'>
                                {/*<Typography.Link disabled={this.state.editingKey !== ''} onClick={() => this.edit(record.id)}>Edit</Typography.Link>*/}
                                <Popconfirm title='Are you sure you want to delete this product from order?' onConfirm={() => this.remove(record.id)}>
                                    <Typography.Link disabled={this.state.editingKey !== ''} type="danger">Delete</Typography.Link>
                                </Popconfirm>
                            </Space>
                        );
                    }
                };
            }
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => {
                    const checkInput = index => {
                        switch (index) {
                            case "quantity":
                                return "number";
                            default:
                                return "text";
                        }
                    };
                    return {
                        record,
                        inputType: checkInput(col.dataIndex),
                        dataIndex: col.dataIndex,
                        title: col.title,
                        editing: this.isEditing(record)
                    };
                }
            };
        });
        const { loading,data,errorMessage } = this.state;
        if (errorMessage!==null&&errorMessage.includes("token")) {
            return <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Text style={{fontSize:"22px"}}>Error: {this.state.errorMessage}</Text>
                <Link to="/login">
                    <Button>Click here to login again</Button>
                </Link>
            </Space>;
        } else {
        return (
            <div>
                <Table components={components} bordered dataSource={data} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/>
            </div>
        );
    }}
}

export default OrderedProductsTable;
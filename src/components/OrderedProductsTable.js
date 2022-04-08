import React, {Component} from 'react';
import EditableTableRow, {EditableContext} from "./EditableTableRow";
import EditableTableCell from "./EditableTableCell";
import {notification, Popconfirm, Space, Table, Typography} from "antd";
import {orderedProductsDataColumns} from "../tableColumnsData/orderedProductsDataColumns";
import API from "../server-apis/api";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";

class OrderedProductsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data:this.props.products,
            loading: false,
            editingKey: "",
            errorMessage:""
        };
        this.isEditing= (record) => record.id === this.state.editingKey;
        this.saveData=this.saveData.bind(this);
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.products !== this.props.products) {
            this.setState({ data: nextProps.products });
        }
    }
    columns = [
        ...orderedProductsDataColumns,
        {
            title: "Actions",
            dataIndex: "actions",
            width: "10%",
            render: (text, record) => {
               const editable = this.isEditing(record);
                return editable ?(
                            <span>
                                <EditableContext.Consumer>
                                  {form => (<Typography.Link onClick={() => this.saveData(form, record.id)} style={{ marginRight: 8 }}>Save</Typography.Link>)}
                                </EditableContext.Consumer>
                                <Typography.Link onClick={this.cancel}>Cancel</Typography.Link>
                            </span>
                        ) : (
                            <Space size="middle">
                                <Typography.Link onClick={() => this.edit(record)}>Edit</Typography.Link>
                                <Popconfirm title="Are you sure you want to delete this customer?" onConfirm={() => this.remove(record.id)}>
                                    <Typography.Link style={{color:"red"}}>Delete</Typography.Link>
                                </Popconfirm>
                            </Space>
                        );
            }
        }
    ];
    // isEditing =(record) => {
    //     console.log("u isEditing sam -> "+this.state.editingKey+" <-je nesto");
    //     return record.id === this.state.editingKey;
    // };
    edit(record) {
        console.log("u editovanje sam kliknula")
        this.setState({ editingKey: record.id,});
    }
    cancel = () => {
        this.setState({ editingKey: ""});
    };

    async remove(id) {
        const params = new URLSearchParams();
        params.append('quantity', 0);
        API.patch(`orders/${this.props.orderId}/remove-product/${id}`,params,{ headers: { Authorization: this.props.token}})
            .then(() => {
                let updatedCustomers = [...this.state.data].filter(i => i.id !== id);
                this.setState({data: updatedCustomers});
                this.successfullyAdded("Product is deleted");
            }).catch(()=>this.errorHappend("Failed to deleted"));
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
                .catch(error => {
                    this.setState({ errorMessage: error.message });
                    this.errorHappend("Failed to save changes.")
                    console.error('There was an error!', error);
                });
       //     console.log(newData)
        });
        this.setState({ editingKey: "",isEditing:false });

    }
    render() {
      //  console.log(this.props.products)
        const components = {
            body: {
                row: EditableTableRow,
                cell: EditableTableCell
            }
        };
        const columns = this.columns.map(col => {
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
        const { loading,data } = this.state;
        return (
            <div>
                <Table components={components} bordered dataSource={data} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/>
            </div>
        );
    }
}

export default OrderedProductsTable;
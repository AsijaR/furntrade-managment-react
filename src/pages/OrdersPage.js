import React, {Component} from 'react';
import {ordersDataColumns} from "../tableColumnsData/ordersDataColumns";
import EditableTableRow, {EditableContext} from "../components/EditableTableRow";
import {Badge, Button, Layout, notification, Popconfirm, Space, Table} from "antd";
import API from "../server-apis/api";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import EditableTableCell from "../components/EditableTableCell";
import {Link} from "react-router-dom";
import {Content} from "antd/es/layout/layout";
import Search from "antd/es/input/Search";

class OrdersPage extends Component {
    constructor(props) {
        super(props);
        this.onSearch = this.onSearch.bind(this);
    }
    state = {
        data: [],
        // pagination: {
        //     current: 1,
        //     pageSize: 10,
        // },
        loading: false,
        editingKey: "",
        errorMessage:""
    };
    columns = [
        ...ordersDataColumns,
        {
            title: "Actions",
            dataIndex: "actions",
            width: "10%",
            render: (text, record) => {
                const editable = this.isEditing(record);
                return (
                    <div>
                        {editable ? (
                            <span>
                                <EditableContext.Consumer>
                                  {form => (<a onClick={() => this.saveData(form, record.id)} style={{ marginRight: 8 }}>Save</a>)}
                                </EditableContext.Consumer>
                                <a onClick={this.cancel}>Cancel</a>
                            </span>
                        ) : (
                            <Space size="middle">
                                <a onClick={() => this.edit(record.id)}>Edit</a>
                                <Popconfirm title="Are you sure you want to delete this order?"
                                            onConfirm={() => this.remove(record.id)}>
                                    <a style={{color:"red"}}>Delete</a>
                                </Popconfirm>
                            </Space>
                        )}
                    </div>
                );
            }
        }
    ];
    isEditing = record => {
        return record.id === this.state.editingKey;
    };

    edit(id) {
        this.setState({ editingKey: id });
    }

    cancel = () => {
        this.setState({ editingKey: "" });
    };
    componentDidMount() {
        this.setState({ loading: true });
        const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        API.get(`orders`,{ headers: { Authorization: token}})
            .then(res => {
                // console.log(res.data._embedded.productList);
                const orders = res.data._embedded.ordersDtoList;
                this.setState({loading: false,data:orders });
            });
    }
    async remove(id) {
        const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        API.delete(`/orders/${id}`,{ headers: { Authorization: token}})
            .then(() => {
                let updatedOrders = [...this.state.data].filter(i => i.id !== id);
                this.setState({data: updatedOrders});
                this.successfullyAdded("Order is deleted");
            }).catch((error)=>{
            this.errorHappend("");
        });
    }

    hasWhiteSpace(s) {
        return /\s/g.test(s);
    }
    saveData(form,id) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => id === item.id);
            const item = newData[index];
            newData.splice(index, 1, {
                ...item,
                ...row
            });
            const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
            const response = API.put(`/orders/update/${id}`, row,{headers: { Authorization: token}})
                .then((response )=>
                {
                    this.setState({ data: newData, editingKey: "" });
                    this.successfullyAdded("Order is updated");
                })
                .catch(error => {
                    this.setState({ errorMessage: error.message });
                    this.errorHappend("");
                    console.error('There was an error!', error);
                });
        });
    }
    //VRATI SE NA OVO NISU TACNI PODACI
    onSearch (value){
        this.setState({ loading: true });
        if(value===""||this.hasWhiteSpace(value))
            this.componentDidMount();
        else{
            const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
            API.get(`orders/search/`, { params: { productName: value },headers: { Authorization: token}})
                .then(res => {
                    // console.log(res.data._embedded.productList);
                    const products = res.data._embedded.productList;
                    this.setState({loading: false,data:products });
                });
        }
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
        const expandedRowRender = () => {
            const columns = [
                { title: 'Date', dataIndex: 'date', key: 'date' },
                { title: 'Name', dataIndex: 'name', key: 'name' },
                {
                    title: 'Status',
                    key: 'state',
                    render: () => (
                        <span>
            <Badge status="success" />
            Finished
          </span>
                    ),
                },
                { title: 'Upgrade Status', dataIndex: 'upgradeNum', key: 'upgradeNum' },
                {
                    title: 'Action',
                    dataIndex: 'operation',
                    key: 'operation',
                    render: () => (
                        <Space size="middle">
                            <a>Pause</a>
                            <a>Stop</a>
                        </Space>
                    ),
                },
            ];

            const data = [];
            for (let i = 0; i < 3; ++i) {
                data.push({
                    key: i,
                    date: '2014-12-24 23:12:00',
                    name: 'This is production name',
                    upgradeNum: 'Upgraded: 56',
                });
            }
            return <Table columns={columns} dataSource={data} pagination={false} />;
        };
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
                            case "price":
                                return "number";
                            default:
                                return "text";
                        }
                    };
                    return {
                        record,
                        // inputType: col.dataIndex === "age" ? "number" : "text",
                        inputType: checkInput(col.dataIndex),
                        dataIndex: col.dataIndex,
                        title: col.title,
                        editing: this.isEditing(record)
                    };
                }
            };
        });
        const { data, loading } = this.state;
        return (
            <Layout>
                <div>
                    <Link to="/add-product">
                        <Button style={{float:"right", background: "#0AC035",marginBottom:"1em", marginTop:"1em" }}
                                type="primary">New order</Button>
                    </Link>
                </div>
                <Content>
                    <div style={{marginBottom:"1em"}}>
                        <Search placeholder="Search order by id" onSearch={this.onSearch}  />
                    </div>
                    <Table expandable={{ expandedRowRender }} components={components} bordered dataSource={data} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/>
                </Content>
            </Layout>
        );
    }
}

export default OrdersPage;
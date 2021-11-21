import React, {Component} from 'react';
import API from "../server-apis/api";
import {Button, Layout, Popconfirm, Space, Table} from "antd";
import {Content} from "antd/es/layout/layout";
import EditableTableRow, {EditableContext} from "../components/EditableTableRow";
import {customersDataColumns} from "../tableColumnsData/customersDataColumns";
import EditableTableCell from "../components/EditableTableCell";
const { Column } = Table;

class CustomersPage extends Component {
    state = {
        data: [],
        loading: false,
        editingKey: "",
        errorMessage:""
    };
    columns = [
        ...customersDataColumns,
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
                                <a onClick={()=>this.cancel()}>Cancel</a>
                            </span>
                        ) : (
                            <Space size="middle">
                                <a onClick={() => this.edit(record.id)}>Edit</a>
                                <Popconfirm title="Are you sure you want to delete this customer?"
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
        API.get(`customers`)
            .then(res => {
                const customers = res.data._embedded.customerList;
                this.setState({loading: false,data:customers });
            })
    }
    async remove(id) {
        API.delete(`/customers/${id}`)
            .then(() => {
                let updatedCustomers = [...this.state.data].filter(i => i.id !== id);
                this.setState({data: updatedCustomers});
            });
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
            const response = API.put(`/customers/update/${id}`, row)
                .then(response => this.setState({ data: newData, editingKey: "" }))
                .catch(error => {
                    this.setState({ errorMessage: error.message });
                    console.error('There was an error!', error);
                });
        });
    }
    render() {
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
                            case "zip":
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
        const { data, loading } = this.state;
        return (
            <Layout>
                <div >
                    <Button style={{float:"right", background: "#0AC035",marginBottom:"1em", marginTop:"1em" }} type="primary">New customer</Button>
                </div>
                <Content>
                    <Table components={components} bordered dataSource={data} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/>
                </Content>
            </Layout>
        );
    }
}

export default CustomersPage;
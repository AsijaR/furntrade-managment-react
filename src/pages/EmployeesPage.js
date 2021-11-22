import React, {Component} from 'react';
import {Button, Layout, Popconfirm, Space, Table} from "antd";
import {Link} from "react-router-dom";
import {Content} from "antd/es/layout/layout";
import Search from "antd/es/input/Search";
import EditableTableRow, {EditableContext} from "../components/EditableTableRow";
import EditableTableCell from "../components/EditableTableCell";
import API from "../server-apis/api";
import {employeesDataColumns} from "../tableColumnsData/employeesDataColumns";

class EmployeesPage extends Component {
    constructor(props) {
        super(props);
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
        ...employeesDataColumns,
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
                                <a onClick={()=>this.cancel}>Cancel</a>
                            </span>
                        ) : (
                            <Space size="middle">
                                <a onClick={() => this.edit(record.id)}>Edit</a>
                                <Popconfirm title="Are you sure you want to delete this product?"
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
        API.get(`employees`)
            .then(res => {
                // console.log(res.data._embedded.productList);
                const employees = res.data._embedded.appUserList;
                this.setState({loading: false,data:employees });
            })
    }
    async remove(id) {
        API.delete(`/employees/${id}`)
            .then(() => {
                let updatedProducts = [...this.state.data].filter(i => i.id !== id);
                this.setState({data: updatedProducts});
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
            const response = API.put(`/employees/update/1${id}`, row)
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
                                type="primary">New product</Button>
                    </Link>
                </div>
                <Content>
                    <div style={{marginBottom:"1em"}}>
                        <Search placeholder="Search products by name" onSearch={this.onSearch}  />
                    </div>
                    <Table components={components} bordered dataSource={data} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/>
                </Content>
            </Layout>
        );
    }
}

export default EmployeesPage;
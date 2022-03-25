import React, {Component} from 'react';
import EditableTableRow, {EditableContext} from "./EditableTableRow";
import EditableTableCell from "./EditableTableCell";
import {Popconfirm, Space, Table} from "antd";
import {orderedProductsDataColumns} from "../tableColumnsData/orderedProductsDataColumns";

class OrderDetailsFirstCol extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    state = {
        data: [{
            id: "5",
            name: "sara",
            model: "model",
            color: "yellow",
            material: "cottonn",
            price: 402.0,
            quantity:10
        },
            {
            id: "8",
            name: "sara",
            model: "model",
            color: "yellow",
            material: "cottonn",
            price: 402.0,
            quantity:14
        },
        ],
        loading: false,
        editingKey: "",
        errorMessage:""
    };

    columns = [
        ...orderedProductsDataColumns,
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
                                <Popconfirm title="Are you sure you want to remove this product?"
                                            onConfirm={() => this.remove(record.username)}>
                                    <a style={{color:"red"}}>Remove</a>
                                </Popconfirm>
                            </Space>
                        )}
                    </div>
                );
            }
        }
    ];
    edit(id) {
        this.setState({ editingKey: id });
    }
    cancel = () => {
        this.setState({ editingKey: "" });
    };
    isEditing = record => {
        return record.id === this.state.editingKey;
    };

    saveData(form,username) {}
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
                       //  inputType: col.dataIndex === "age" ? "number" : "text",
                        inputType: checkInput(col.dataIndex),
                        dataIndex: col.dataIndex,
                        title: col.title,
                        editing: this.isEditing(record)
                    };
                }
            };
        });
        const { data, loading } = this.state;
        console.log(this.props.products)
        return (
            <div>
                <Table components={components} bordered dataSource={this.props.products} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/>
            </div>
        );
    }
}

export default OrderDetailsFirstCol;
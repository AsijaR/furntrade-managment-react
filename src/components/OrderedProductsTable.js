import React, {Component} from 'react';
import EditableTableRow, {EditableContext} from "./EditableTableRow";
import EditableTableCell from "./EditableTableCell";
import {Popconfirm, Space, Table} from "antd";
import {orderedProductsDataColumns} from "../tableColumnsData/orderedProductsDataColumns";
import API from "../server-apis/api";

class OrderedProductsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
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
                                            onConfirm={() => this.remove(record.id)}>
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
    async remove(id) {
        console.log(id);
        let updatedProducts= [...this.props.products].filter(i => i.id !== id);
     //   this.setState({data: updatedProducts});
        //this.state.data=updatedProducts;
        console.log(this.state.data);
    }

    saveData(form,id) {

        //this.props.products.quantity=
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
            console.log(newData)
        });

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
        //console.log("ovoooo"+this.props.products)
        return (
            <div>
                <Table components={components} bordered dataSource={this.props.products} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/>
            </div>
        );
    }
}

export default OrderedProductsTable;
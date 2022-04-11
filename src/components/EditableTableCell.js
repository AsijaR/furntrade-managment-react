import React, {Component} from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, InputNumber, Select, DatePicker } from "antd";
import moment from "moment";
import {EditableContext} from "./EditableTableRow";

const FormItem = Form.Item;
const Option = Select.Option;
class EditableTableCell extends Component {
    getInput = (record, dataIndex, title, getFieldDecorator) => {
        switch (this.props.inputType) {
            case "number":
                return (
                    <FormItem style={{ margin: 0 }}>
                        {getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: true,
                                    message: `Please Input ${title}!`
                                }
                            ],
                            initialValue: record[dataIndex]
                        })(
                            <InputNumber formatter={value => value} parser={value => value} />
                        )}
                    </FormItem>
                );
            case "date":
                return (
                    <FormItem style={{ margin: 0 }}>
                        {getFieldDecorator(dataIndex, {
                            initialValue: moment(record[dataIndex], this.dateFormat)
                        })(<DatePicker format={this.dateFormat} />)}
                    </FormItem>
                );
            case "select":
                return (
                    <FormItem style={{ margin: 0 }}>
                        {getFieldDecorator(dataIndex, {
                            initialValue: record[dataIndex]
                        })(
                            <Select style={{ width: 150 }}>
                                {[...Array(11).keys()]
                                    .filter(x => x > 0)
                                    .map(c => `Product ${c}`)
                                    .map((p, index) => (
                                        <Option value={p} key={index}>
                                            {p}
                                        </Option>
                                    ))}
                            </Select>
                        )}
                    </FormItem>
                );
            default:
                return (
                    <FormItem style={{ margin: 0 }}>
                        {getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: true,
                                    message: `Please Input ${title}!`
                                }
                            ],
                            initialValue: record[dataIndex]
                        })(<Input />)}
                    </FormItem>
                );
        }
    }
    render() {
        const { editing, dataIndex, title, inputType, record, index,...restProps} = this.props;
        return (
           <EditableContext.Consumer>
               {form => {
                   const { getFieldDecorator } = form;
                   return (
                       <td {...restProps}>
                           {editing ?
                               this.getInput(record, dataIndex, title, getFieldDecorator)
                               : restProps.children}
                       </td>
                   );
               }}
           </EditableContext.Consumer>
        );
    }
}

export default EditableTableCell;
import * as React from 'react';
import {Button, Icon, message, Modal, Progress} from "antd";
import './index.less';
import {getFileType, getHolderType, getTotalSize} from "@/components/upload/utils";

interface UploadProps {
    visible: boolean;
    onCancel?: () => void;
    onOk?: () => void;
    // 最大的大小 -1 为不限制
    totalSize?: number;
    // 单个文件的最大大小
    singleMaxSize?: number,
    accept: string
}

interface FileInfo {
    name: string,
    file: File,
    progress: number,
    // pending : 准备 , success ： 成功， fail：失败， uploading：上传中
    status: string
}

interface UploadState {
    fileList: Array<FileInfo>
}

export class UploadFile extends React.PureComponent<UploadProps, UploadState> {


    uploadInput: any = React.createRef();

    state = {
        fileList: []
    };

    upFiles = () => {
        this.uploadInput.current.click();
    };


    pushFile = (files: Array<File>) => {
        const {totalSize} = this.props;
        let filterList = this.checkList(files);

        if (totalSize !== -1 && (getTotalSize(filterList) + getTotalSize(this.state.fileList) > totalSize)) {
            message.error(`总文件大小不能超过${totalSize}`)
            return;
        }

        const fileList: Array<FileInfo> = filterList.map((item: File, index) => {
            return {
                name: item.name,
                file: item,
                progress: 50,
                status: 'pending'
            }
        });

        this.setState({
            fileList: this.state.fileList.concat(fileList)
        });
    };


    checkList = fileList => {
        // 过滤添加的文件，不能重复添加，不能添加超过最大大小的文件
        const list = this.state.fileList;
        const singleMaxSize = this.props.singleMaxSize;

        return fileList.filter(file => {
            const isRepeat = list.find(item => item.file.name === file.name);
            const isTolarge = file.size > singleMaxSize;
            if (isTolarge) {
                message.error(`${file.name}文件超过${singleMaxSize}，不能添加`);
            }
            return !isRepeat && !isTolarge;
        });
    };

    uploadFile = file => {

    };

    handleDrop = e => {
        e.preventDefault();
        let fileList = [...e.dataTransfer.files];
        console.log(fileList);
        // 判断拖拽文件类型
        let accept = this.props.accept;
        const fileTypeArr = fileList[0] && fileList[0].name.split('.') || [];
        const type = '.' + fileTypeArr[fileTypeArr.length - 1];
        let acceptList = accept.split(',');
        if (!fileList.length || !acceptList.includes(type.toLowerCase())) {
            return false;
        }

        this.pushFile(fileList);
    };

    removeFile = index => {
        let fileList = [...this.state.fileList];
        fileList.splice(index, 1);
        this.setState({
            fileList
        });
    };

    render() {
        const {visible, onCancel, onOk, accept} = this.props;
        const {fileList} = this.state;
        const dropAreaProps = {
            onDragOver: e => e.preventDefault(),
            onDragEnter: e => e.preventDefault(),
            onDragLeave: e => e.preventDefault(),
            onDrop: this.handleDrop
        };

        return (
            <div className={"upload-file"}>
                <input
                    type="file"
                    multiple={true}
                    ref={this.uploadInput}
                    accept={accept}
                    onChange={e => {
                        this.pushFile(Array.from(e.currentTarget.files));
                        // 防止文件删除后立即添加不成功
                        e.target.value = '';
                    }}
                />
                <Modal
                    className="single-upload-modal"
                    visible={visible}
                    onCancel={onCancel}
                    onOk={onOk}
                    footer={null}
                    title="上传文件"
                    getContainer={false}
                >
                    <div className={"upload-file-container"} {...dropAreaProps}>
                        <ul>
                            {
                                fileList && fileList.length > 0 && fileList.map((item: FileInfo, index) => {
                                    return <li key={index}>
                                        <div
                                            className={`upload-item-placeholder upload-item-placeholder-${getHolderType(getFileType(item))}`}>
                                            {getFileType(item)}
                                            {
                                                item.status === 'pending' &&
                                                <Icon
                                                    theme="twoTone"
                                                    twoToneColor="#FF0000"
                                                    onClick={() => {
                                                        this.removeFile(index)
                                                    }}
                                                    className={"upload-icon-delete"}
                                                    type="close-circle"
                                                />
                                            }
                                            {
                                                item.status === 'success' &&
                                                <Icon
                                                    theme="twoTone"
                                                    twoToneColor="#52c41a"
                                                    type="check-circle"
                                                />
                                            }
                                            {
                                                item.status === 'fail' &&
                                                <Icon
                                                    theme="twoTone"
                                                    twoToneColor="#FF0000"
                                                    type="exclamation-circle"
                                                />
                                            }
                                            {item.status === 'uploading' &&
                                            <div className="progress-wrapper">
                                                <Progress
                                                    percent={item.progress}
                                                    showInfo={false}
                                                />
                                            </div>
                                            }
                                        </div>
                                        <p className={"upload-item-name"}>{item.name}</p>
                                    </li>
                                })
                            }
                        </ul>
                    </div>
                    <Button onClick={this.upFiles}>点击选择文件</Button>
                    <Button onClick={this.uploadFile}>上传</Button>
                </Modal>
            </div>
        );
    }

}

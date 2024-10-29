/* eslint-disable no-unused-vars */

import RecylingBinIcon from "../icon/recyclingbin";
import { Pencil, Save, CircleX } from 'lucide-react'
import React, { useState } from "react";
import ToastMessageLayout from "../toast.jsx";

/* eslint-disable react/prop-types */
const PassportCard = ({ passportCustomer, etourCustomer, loadingPassports, progress, handleDeleteObject, onSave }) => {
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('');

    const [editedCustomer, setEditedCustomer] = useState({ ...passportCustomer });
    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (e, field) => {
        setEditedCustomer((prev) => ({ ...prev, [field]: e.target.value }));
    }

    const handleSaveInterface = () => {
        setIsEditing(false);
        setToastMessage('Lưu thông tin chỉnh sửa khách hàng thành công!');
        setToastType('success');
        setTimeout(() => setToastMessage(''), 2000);
    }

    const toogleEdit = () => {
        setIsEditing(!isEditing)
    }

    const handleCancel = () => {
        setEditedCustomer({ ...passportCustomer });
        setIsEditing(false);
    }

    const handleSave = () => {
        Object.assign(passportCustomer, editedCustomer);
        setIsEditing(false);
        // onSave(editedCustomer);
        // setIsEditing(false);
    }

    const isDateFormatted = (dateString) => {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        return regex.test(dateString);
    };

    const formatDate = (dateString) => {
        try {
            if (isDateFormatted(dateString)) {
                return dateString;
            }
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        } catch (error) {
            return 'N/A';
        }
    };

    const cleanString = (str) => {
        return str?.trim().toLowerCase();
    };

    const formatGender = (gender) => {
        const lowerCaseGender = gender?.toLowerCase();
        if (lowerCaseGender === 'f' || lowerCaseGender === 'nữ' || lowerCaseGender === 'nu') {
            return 'Nữ';
        } else if (lowerCaseGender === 'm' || lowerCaseGender === 'nam' || lowerCaseGender === 'male') {
            return 'Nam';
        } else {
            return 'N/A';
        }
    };
    return (
        <div>
            <ToastMessageLayout toastMessage={toastMessage} toastType={toastType} />
            {loadingPassports ? (
                <div className="flex flex-col justify-center items-center">
                    <div className="radial-progress" style={{ "--value": progress }} role="progressbar">{progress}%</div>
                    <p className='font-semibold flex justify-center items-center text-center mt-4'>Đang tải dữ liệu
                        khách hàng...</p>
                </div>
            ) : (
                <div>
                    {passportCustomer ? (
                        <div>
                            <div className="card bg-yellow-200 shadow-xl w-full">
                                <div className="card-body">
                                    {isEditing ? (
                                        <>
                                            <p className='font-bold'>Họ tên:&nbsp;
                                                <input
                                                    className={(etourCustomer && cleanString(etourCustomer.fullName) !== cleanString(passportCustomer.fullName)) ? "text-red-600 text-sm custom-input w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-yellow-100" : "text-sm custom-input w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-yellow-100"}
                                                    value={editedCustomer.fullName}
                                                    onChange={(e) => handleInputChange(e, 'fullName')}
                                                    readOnly={!isEditing}
                                                />
                                            </p>
                                            <p>Giới tính:&nbsp;
                                                <select
                                                    value={formatGender(editedCustomer.sex || '')}
                                                    onChange={(e) => handleInputChange(e, 'sex')}
                                                    className={`select select-bordered bg-yellow-100 ${etourCustomer && cleanString(etourCustomer.gender) !== cleanString(formatGender(passportCustomer.sex)) ? "text-red-600" : ""}`}
                                                >
                                                    <option value="Nam">Nam</option>
                                                    <option value="Nữ">Nữ</option>
                                                </select>
                                            </p>
                                            <p>Nơi sinh:&nbsp;
                                                <input
                                                    className={(etourCustomer && cleanString(etourCustomer.birthPlace) !== cleanString(passportCustomer.placeOfBirth)) ? "text-red-600 text-sm custom-input w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-yellow-100" : "text-sm custom-input w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-yellow-100"}
                                                    value={editedCustomer.placeOfBirth || 'Chưa có thông tin'}
                                                    onChange={(e) => handleInputChange(e, 'placeOfBirth')}
                                                    readOnly={!isEditing}
                                                />
                                            </p>
                                            <p>Quốc tịch:&nbsp;
                                                <input
                                                    className={(etourCustomer && cleanString(etourCustomer.nationality) !== cleanString(passportCustomer.nationality)) ? "text-red-600 text-sm custom-input w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-yellow-100" : "text-sm custom-input w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-yellow-100"}
                                                    value={editedCustomer.nationality || 'Chưa có thông tin'}
                                                    onChange={(e) => handleInputChange(e, 'nationality')}
                                                    readOnly={!isEditing}

                                                />
                                            </p>
                                            <p className='font-bold'>Số Passport:&nbsp;
                                                <input
                                                    className={(etourCustomer && cleanString(etourCustomer.visaInfor.documentNumber) !== cleanString(passportCustomer.passportNo)) ? "text-red-600 text-sm custom-input w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-yellow-100" : "text-sm custom-input w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-yellow-100"}
                                                    value={editedCustomer.passportNo || 'Chưa có thông tin'}
                                                    onChange={(e) => handleInputChange(e, 'passportNo')}
                                                    readOnly={!isEditing}
                                                />
                                            </p>
                                            <p>Ngày sinh:
                                                <span
                                                    className={(etourCustomer && formatDate(etourCustomer.dateOfBirth) !== formatDate(passportCustomer.dateOfBirth)) ? "text-red-600" : ""}>
                                                    &nbsp;{formatDate(passportCustomer.dateOfBirth) || 'Chưa có thông tin'}
                                                </span>
                                            </p>
                                            <p>Ngày cấp:
                                                <span
                                                    className={(etourCustomer && formatDate(etourCustomer.issueDate) !== formatDate(passportCustomer.dateOfIssue)) ? "text-red-600" : ""}>
                                                    &nbsp;{formatDate(passportCustomer.dateOfIssue) || 'Chưa có thông tin'}
                                                </span>
                                            </p>
                                            <p>Ngày hết hạn:
                                                <span
                                                    className={(etourCustomer && formatDate(etourCustomer.expireDate) !== formatDate(passportCustomer.dateOfExpiry)) ? "text-red-600" : ""}>
                                                    &nbsp;{formatDate(passportCustomer.dateOfExpiry) || 'Chưa có thông tin'}
                                                </span>
                                            </p>
                                            <p className='font-bold'>Số CCCD/CMND:&nbsp;
                                                <input
                                                    className={(etourCustomer && cleanString(etourCustomer.idCardInfor.documentNumber) !== cleanString(passportCustomer.idCardNo)) ? "text-red-600 text-sm custom-input w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-yellow-100" : "text-sm custom-input w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-yellow-100"}
                                                    value={editedCustomer.idCardNo}
                                                    onChange={(e) => handleInputChange(e, 'idCardNo')}
                                                    readOnly={!isEditing}

                                                />
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-bold">Họ tên:&nbsp;
                                                <span
                                                    className={(etourCustomer && cleanString(etourCustomer.fullName) !== cleanString(passportCustomer.fullName)) ? "text-red-600" : ""}
                                                >
                                                    {editedCustomer.fullName}
                                                </span>
                                            </p>
                                            <p>Giới tính:&nbsp;
                                                <span
                                                    className={`m-1 ${etourCustomer && cleanString(etourCustomer.gender) !== cleanString(formatGender(passportCustomer.sex)) ? "text-red-600" : ""}`}
                                                >
                                                    {formatGender(editedCustomer.sex)}
                                                </span>
                                            </p>
                                            <p>Nơi sinh:&nbsp;
                                                <span
                                                    className={(etourCustomer && cleanString(etourCustomer.birthPlace) !== cleanString(passportCustomer.placeOfBirth)) ? "text-red-600" : ""}
                                                >
                                                    {editedCustomer.placeOfBirth}
                                                </span>
                                            </p>
                                            <p>Quốc tịch:&nbsp;
                                                <span
                                                    className={(etourCustomer && cleanString(etourCustomer.nationality) !== cleanString(passportCustomer.nationality)) ? "text-red-600" : ""}
                                                >
                                                    {editedCustomer.nationality}
                                                </span>
                                            </p>
                                            <p className="font-bold">Số Passport:&nbsp;
                                                <span
                                                    className={(etourCustomer && cleanString(etourCustomer.visaInfor.documentNumber) !== cleanString(passportCustomer.passportNo)) ? "text-red-600" : ""}
                                                >
                                                    {editedCustomer.passportNo}
                                                </span>
                                            </p>
                                            <p>Ngày sinh:
                                                <span
                                                    className={(etourCustomer && formatDate(etourCustomer.dateOfBirth) !== formatDate(passportCustomer.dateOfBirth)) ? "text-red-600" : ""}>
                                                    &nbsp;{formatDate(passportCustomer.dateOfBirth) || 'Chưa có thông tin'}
                                                </span>
                                            </p>
                                            <p>Ngày cấp:
                                                <span
                                                    className={(etourCustomer && formatDate(etourCustomer.issueDate) !== formatDate(passportCustomer.dateOfIssue)) ? "text-red-600" : ""}>
                                                    &nbsp;{formatDate(passportCustomer.dateOfIssue) || 'Chưa có thông tin'}
                                                </span>
                                            </p>
                                            <p>Ngày hết hạn:
                                                <span
                                                    className={(etourCustomer && formatDate(etourCustomer.expireDate) !== formatDate(passportCustomer.dateOfExpiry)) ? "text-red-600" : ""}>
                                                    &nbsp;{formatDate(passportCustomer.dateOfExpiry) || 'Chưa có thông tin'}
                                                </span>
                                            </p>
                                            <p className="font-bold">Số CCCD/CMND:&nbsp;
                                                <span
                                                    className={(etourCustomer && formatDate(etourCustomer.idCardInfor.documentNumber) !== formatDate(passportCustomer.idCardNo)) ? "text-red-600" : ""}
                                                >
                                                   {editedCustomer.idCardNo || 'Chưa có thông tin'}
                                                </span>
                                            </p>
                                        </>
                                    )}
                                    <div className='flex justify-end gap-4'>
                                        {isEditing ? (
                                            <>
                                                <div className="tooltip" data-tip="Lưu thông tin chỉnh sửa">
                                                    <button className="btn btn-success rounded-xl" onClick={handleSave}>
                                                        <Save className="text-white size-5" />
                                                    </button>
                                                </div>
                                                <div className="tooltip" data-tip="Chỉnh sửa thông tin">
                                                    <button className="btn btn-info rounded-xl" onClick={toogleEdit}>
                                                        <Pencil className="text-white size-5" />
                                                    </button>
                                                </div>
                                                <div className="tooltip" data-tip="Hủy thông tin chỉnh sửa">
                                                    <button className="btn btn-warning rounded-xl" onClick={handleCancel}>
                                                        <CircleX className="text-white size-5" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="tooltip" data-tip="Chỉnh sửa thông tin">
                                                    <button className="btn btn-info rounded-xl" onClick={toogleEdit}>
                                                        <Pencil className="text-white size-5" />
                                                    </button>
                                                </div>
                                                <div className="tooltip" data-tip="Xóa">
                                                    <button
                                                        className="group relative flex h-12 w-12 flex-col items-center justify-center overflow-hidden rounded-xl bg-red-400 tooltip hover:bg-red-600"
                                                        onClick={() => handleDeleteObject(passportCustomer.passportNo)}
                                                    >
                                                        <RecylingBinIcon />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card bg-yellow-200 shadow-xl w-full">
                            <div className="card-body">
                                <p>Họ tên: Chưa có thông tin</p>
                                <p>Giới tính: Chưa có thông tin</p>
                                <p>Nơi sinh: Chưa có thông tin</p>
                                <p>Quốc tịch: Chưa có thông tin</p>
                                <p>Số Passport: Chưa có thông tin</p>
                                <p>Ngày sinh: Chưa có thông tin</p>
                                <p>Ngày cấp: Chưa có thông tin</p>
                                <p>Ngày hết hạn: Chưa có thông tin</p>
                                <p>Số CCCD/CMND: Chưa có thông tin</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default PassportCard;
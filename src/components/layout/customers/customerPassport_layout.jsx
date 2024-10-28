/* eslint-disable no-unused-vars */

import RecylingBinIcon from "../icon/recyclingbin";
import {Save} from 'lucide-react'
import {useState} from "react";

/* eslint-disable react/prop-types */
const PassportCard = ({passportCustomer, etourCustomer, loadingPassports, progress, handleDeleteObject, onSave}) => {
    const [editedCustomer, setEditedCustomer] = useState({...passportCustomer});
    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (e, field) => {
        setEditedCustomer((prev) => ({...prev, [field]: e.target.value}));
    }

    const handleSave = () => {
        // Object.assign(passportCustomer, editedCustomer);
        // setIsEditing(false);
        onSave(editedCustomer);
        setIsEditing(false);
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
            {loadingPassports ? (
                <div className="flex flex-col justify-center items-center">
                    <div className="radial-progress" style={{"--value": progress}} role="progressbar">{progress}%</div>
                    <p className='font-semibold flex justify-center items-center text-center mt-4'>Đang tải dữ liệu
                        khách hàng...</p>
                </div>
            ) : (
                <div>
                    {passportCustomer ? (
                        <div>
                            <div className='bg-yellow-200 p-4 rounded-xl'>
                                <p className='font-bold'>Họ tên:&nbsp;
                                    <input
                                        className={(etourCustomer && cleanString(etourCustomer.fullName) !== cleanString(passportCustomer.fullName)) ? "text-red-600 border-transparent bg-transparent w-1/2" : "border-transparent bg-transparent w-1/2"}
                                        value={editedCustomer.fullName}
                                        onChange={(e) => handleInputChange(e, 'fullName')}
                                    />
                                </p>
                                <p>Giới tính:&nbsp;
                                    <div className="dropdown inline-block">
                                        <div
                                            tabIndex={0}
                                            role="button"
                                            className={`m-1 ${etourCustomer && cleanString(etourCustomer.gender) !== cleanString(formatGender(passportCustomer.sex)) ? "text-red-600" : ""}`}
                                        >
                                            {editedCustomer.sex || 'Chưa có thông tin'}
                                        </div>
                                        <ul
                                            tabIndex={0}
                                            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                                        >
                                            <li onClick={() => handleInputChange({target: {value: 'Nam'}}, 'sex')}>
                                                <a>Nam</a>
                                            </li>
                                            <li onClick={() => handleInputChange({target: {value: 'Nữ'}}, 'sex')}>
                                                <a>Nữ</a>
                                            </li>
                                        </ul>
                                    </div>
                                </p>
                                <p>Nơi sinh:&nbsp;
                                    <input
                                        className={(etourCustomer && cleanString(etourCustomer.birthPlace) !== cleanString(passportCustomer.placeOfBirth)) ? "text-red-600 border-transparent bg-transparent w-1/2" : "border-transparent bg-transparent w-1/2"}
                                        value={editedCustomer.placeOfBirth || 'Chưa có thông tin'}
                                        onChange={(e) => handleInputChange(e, 'placeOfBirth')}
                                    />
                                </p>
                                <p>Quốc tịch:&nbsp;
                                    <input
                                        className={(etourCustomer && cleanString(etourCustomer.nationality) !== cleanString(passportCustomer.nationality)) ? "text-red-600 border-transparent bg-transparent w-1/2" : "border-transparent bg-transparent w-1/2"}
                                        value={editedCustomer.nationality || 'Chưa có thông tin'}
                                        onChange={(e) => handleInputChange(e, 'nationality')}
                                    />
                                </p>
                                <p className='font-bold'>Số Passport:&nbsp;
                                    <input
                                        className={(etourCustomer && cleanString(etourCustomer.documentNumber) !== cleanString(passportCustomer.passportNo)) ? "text-red-600 border-transparent bg-transparent" : "border-transparent bg-transparent"}
                                        value={editedCustomer.passportNo || 'Chưa có thông tin'}
                                        onChange={(e) => handleInputChange(e, 'passportNo')}
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
                                <div className='flex justify-end gap-4'>
                                    <div className="tooltip" data-tip="Lưu thông tin chỉnh sửa">
                                        <button className="btn btn-info rounded-xl" onClick={handleSave}>
                                            <Save className="text-white size-5"/>
                                        </button>
                                    </div>
                                    <div className="tooltip" data-tip="Xóa">
                                        <button
                                            className="group relative flex h-12 w-12 flex-col items-center justify-center overflow-hidden rounded-xl bg-red-400 tooltip hover:bg-red-600"
                                            onClick={() => handleDeleteObject(passportCustomer.passportNo)}
                                            data-tip="Xóa"
                                        >
                                            <RecylingBinIcon/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='bg-yellow-200 p-4 rounded-xl'>
                            <p>Họ tên: Chưa có thông tin</p>
                            <p>Giới tính: Chưa có thông tin</p>
                            <p>Nơi sinh: Chưa có thông tin</p>
                            <p>Quốc tịch: Chưa có thông tin</p>
                            <p>Số Passport: Chưa có thông tin</p>
                            <p>Ngày sinh: Chưa có thông tin</p>
                            <p>Ngày cấp: Chưa có thông tin</p>
                            <p>Ngày hết hạn: Chưa có thông tin</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default PassportCard;
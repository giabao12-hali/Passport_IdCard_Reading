/* eslint-disable no-unused-vars */

import RecylingBinIcon from "../icon/recyclingbin";

/* eslint-disable react/prop-types */
const PassportCard = ({ passportCustomer, etourCustomer, loadingPassports, progress, handleDeleteObject }) => {
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
                    <div className="radial-progress" style={{ "--value": progress }} role="progressbar">{progress}%</div>
                    <p className='font-semibold flex justify-center items-center text-center mt-4'>Đang tải toàn bộ dữ liệu khách hàng...</p>
                </div>
            ) : (
                <div>
                    {passportCustomer ? (
                        <div>
                            <div className='bg-yellow-200 p-4 rounded-xl'>
                                <p className='font-bold'>Họ tên:
                                    <span className={(etourCustomer && cleanString(etourCustomer.fullName) !== cleanString(passportCustomer.fullName)) ? "text-red-600" : ""}>
                                        &nbsp;{passportCustomer.fullName || 'Chưa có thông tin'}
                                    </span>
                                </p>
                                <p>Giới tính:
                                    <span className={(etourCustomer && cleanString(etourCustomer.gender) !== cleanString(formatGender(passportCustomer.sex))) ? "text-red-600" : ""}>
                                        &nbsp;{formatGender(passportCustomer.sex) || 'Chưa có thông tin'}
                                    </span>
                                </p>
                                <p>Nơi sinh:
                                    <span className={(etourCustomer && cleanString(etourCustomer.birthPlace) !== cleanString(passportCustomer.placeOfBirth)) ? "text-red-600" : ""}>
                                        &nbsp;{passportCustomer.placeOfBirth || 'Chưa có thông tin'}
                                    </span>
                                </p>
                                <p>Quốc tịch:
                                    <span className={(etourCustomer && cleanString(etourCustomer.nationality) !== cleanString(passportCustomer.nationality)) ? "text-red-600" : ""}>
                                        &nbsp;{passportCustomer.nationality || 'Chưa có thông tin'}
                                    </span>
                                </p>
                                <p className='font-bold'>Số Passport:
                                    <span className={(etourCustomer && etourCustomer.documentNumber !== passportCustomer.passportNo) ? "text-red-600" : ""}>
                                        &nbsp;{passportCustomer.passportNo || 'Chưa có thông tin'}
                                    </span>
                                </p>
                                <p>Ngày sinh:
                                    <span className={(etourCustomer && formatDate(etourCustomer.dateOfBirth) !== formatDate(passportCustomer.dateOfBirth)) ? "text-red-600" : ""}>
                                        &nbsp;{formatDate(passportCustomer.dateOfBirth) || 'Chưa có thông tin'}
                                    </span>
                                </p>
                                <p>Ngày cấp:
                                    <span className={(etourCustomer && formatDate(etourCustomer.issueDate) !== formatDate(passportCustomer.dateOfIssue)) ? "text-red-600" : ""}>
                                        &nbsp;{formatDate(passportCustomer.dateOfIssue) || 'Chưa có thông tin'}
                                    </span>
                                </p>
                                <p>Ngày hết hạn:
                                    <span className={(etourCustomer && formatDate(etourCustomer.expireDate) !== formatDate(passportCustomer.dateOfExpiry)) ? "text-red-600" : ""}>
                                        &nbsp;{formatDate(passportCustomer.dateOfExpiry) || 'Chưa có thông tin'}
                                    </span>
                                </p>
                                <div className='flex justify-end'>
                                    <button
                                        className="group relative flex h-12 w-12 flex-col items-center justify-center overflow-hidden rounded-xl bg-red-400 hover:bg-red-600"
                                        onClick={() => handleDeleteObject(passportCustomer.passportNo)}
                                    >
                                        <RecylingBinIcon />
                                    </button>
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
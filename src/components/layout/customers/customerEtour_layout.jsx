/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
const CustomersEtourLayout = ({ customerPair, index, activeCustomer, setActiveCustomer, loading, progress }) => {
    const etourCustomer = customerPair.bookingCustomer;
    const passportCustomer = customerPair.passportCustomer;
    const displayCustomer = etourCustomer || passportCustomer;
    const imageUrl = customerPair.imageUrl || displayCustomer?.imageUrl;

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
        return str?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || '';
    };
    return (
        <div key={index} >
            {loading ? (
                <div className="flex flex-col justify-center items-center">
                    <div className="radial-progress" style={{ "--value": progress }} role="progressbar">{progress}%</div>
                    <p className='font-semibold flex justify-center items-center text-center mt-4'>Đang tải toàn bộ dữ liệu khách hàng...</p>
                </div>
            ) : (
                <div>
                    <div className="card w-full shadow-xl border border-solid border-black border-opacity-10">
                        <div className="card-body">
                            {imageUrl ? (
                                <>
                                    {activeCustomer === index ? (
                                        <div>
                                            <img src={imageUrl} alt="Customer Passport" className='rounded-xl mb-4' />
                                        </div>
                                    ) : (
                                        <>
                                            <p className='font-bold'>Họ tên:
                                                <span className={(passportCustomer && cleanString(displayCustomer?.fullName) !== cleanString(passportCustomer?.fullName)) ? "text-red-600" : ""}>
                                                    &nbsp;{displayCustomer?.fullName || "Chưa có thông tin"}
                                                </span>
                                            </p>
                                            <p>Giới tính:
                                                <span className={(passportCustomer && cleanString(displayCustomer?.gender) !== cleanString(formatGender(passportCustomer?.sex))) ? "text-red-600" : ""}>
                                                    &nbsp;{displayCustomer?.gender || "Chưa có thông tin"}
                                                </span>
                                            </p>
                                            <p>Nơi sinh:
                                                <span className={(passportCustomer && cleanString(displayCustomer?.birthPlace) !== cleanString(passportCustomer?.placeOfBirth)) ? "text-red-600" : ""}>
                                                    &nbsp;{displayCustomer?.birthPlace || "Chưa có thông tin"}
                                                </span>
                                            </p>
                                            <p>Quốc tịch:
                                                <span className={(passportCustomer && cleanString(displayCustomer?.nationality) !== cleanString(passportCustomer?.nationality)) ? "text-red-600" : ""}>
                                                    &nbsp;{displayCustomer?.nationality || "Chưa có thông tin"}
                                                </span>
                                            </p>
                                            <p className='font-bold'>Số Passport:
                                                <span className={(passportCustomer && displayCustomer?.visaInfor.documentNumber !== passportCustomer?.passportNo) ? "text-red-600" : ""}>
                                                    &nbsp;{displayCustomer?.visaInfor.documentNumber || "Chưa có thông tin"}
                                                </span>
                                            </p>
                                            <p>Ngày sinh:
                                                <span className={(passportCustomer && formatDate(displayCustomer?.dateOfBirth) !== formatDate(passportCustomer?.dateOfBirth)) ? "text-red-600" : ""}>
                                                    &nbsp;{formatDate(displayCustomer?.dateOfBirth) || "Chưa có thông tin"}
                                                </span>
                                            </p>
                                            <p>Ngày cấp:
                                                <span className={(passportCustomer && formatDate(displayCustomer?.issueDate) !== formatDate(passportCustomer?.dateOfIssue)) ? "text-red-600" : ""}>
                                                    &nbsp;{formatDate(displayCustomer?.issueDate) || "Chưa có thông tin"}
                                                </span>
                                            </p>
                                            <p>Ngày hết hạn:
                                                <span className={(passportCustomer && formatDate(displayCustomer?.expireDate) !== formatDate(passportCustomer?.dateOfExpiry)) ? "text-red-600" : ""}>
                                                    &nbsp;{formatDate(displayCustomer?.expireDate) || "Chưa có thông tin"}
                                                </span>
                                            </p>
                                            <p className='font-bold'>Số CCCD/CMND:
                                                <span className={(passportCustomer && displayCustomer?.idCardInfor.documentNumber !== passportCustomer?.idCardNo) ? "text-red-600" : ""}>
                                                    &nbsp;{displayCustomer?.idCardInfor.documentNumber || "Chưa có thông tin"}
                                                </span>
                                            </p>
                                        </>
                                    )}
                                    <div className='flex justify-end'>
                                        <button className='btn btn-info rounded-xl' onClick={() => setActiveCustomer(activeCustomer === index ? null : index)}>
                                            {activeCustomer === index ? 'Ẩn hình ảnh' : 'Xem hình ảnh'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className='font-bold'>Họ tên:
                                        <span className={(passportCustomer && cleanString(displayCustomer?.fullName) !== cleanString(passportCustomer?.fullName)) ? "text-red-600" : ""}>
                                            &nbsp;{displayCustomer?.fullName || "Chưa có thông tin"}
                                        </span>
                                    </p>
                                    <p>Giới tính:
                                        <span className={(passportCustomer && cleanString(displayCustomer?.gender) !== cleanString(formatGender(passportCustomer?.sex))) ? "text-red-600" : ""}>
                                            &nbsp;{displayCustomer?.gender || "Chưa có thông tin"}
                                        </span>
                                    </p>
                                    <p>Nơi sinh:
                                        <span className={(passportCustomer && cleanString(displayCustomer?.birthPlace) !== cleanString(passportCustomer?.placeOfBirth)) ? "text-red-600" : ""}>
                                            &nbsp;{displayCustomer?.birthPlace || "Chưa có thông tin"}
                                        </span>
                                    </p>
                                    <p>Quốc tịch:
                                        <span className={(passportCustomer && cleanString(displayCustomer?.nationality) !== cleanString(passportCustomer?.nationality)) ? "text-red-600" : ""}>
                                            &nbsp;{displayCustomer?.nationality || "Chưa có thông tin"}
                                        </span>
                                    </p>
                                    <p className='font-bold'>Số Passport:
                                        <span className={(passportCustomer && displayCustomer?.visaInfor.documentNumber !== passportCustomer?.passportNo) ? "text-red-600" : ""}>
                                            &nbsp;{displayCustomer?.visaInfor.documentNumber || "Chưa có thông tin"}
                                        </span>
                                    </p>
                                    <p>Ngày sinh:
                                        <span className={(passportCustomer && formatDate(displayCustomer?.dateOfBirth) !== formatDate(passportCustomer?.dateOfBirth)) ? "text-red-600" : ""}>
                                            &nbsp;{formatDate(displayCustomer?.dateOfBirth) || "Chưa có thông tin"}
                                        </span>
                                    </p>
                                    <p>Ngày cấp:
                                        <span className={(passportCustomer && formatDate(displayCustomer?.issueDate) !== formatDate(passportCustomer?.dateOfIssue)) ? "text-red-600" : ""}>
                                            &nbsp;{formatDate(displayCustomer?.issueDate) || "Chưa có thông tin"}
                                        </span>
                                    </p>
                                    <p>Ngày hết hạn:
                                        <span className={(passportCustomer && formatDate(displayCustomer?.expireDate) !== formatDate(passportCustomer?.dateOfExpiry)) ? "text-red-600" : ""}>
                                            &nbsp;{formatDate(displayCustomer?.expireDate) || "Chưa có thông tin"}
                                        </span>
                                    </p>
                                    <p className="font-bold">Số CCCD/CMND:&nbsp;
                                        <span
                                            className={(passportCustomer && displayCustomer?.idCardInfor.documentNumber !== passportCustomer?.idCardNo) ? "text-red-600" : ""}
                                        >
                                            {displayCustomer?.idCardInfor.documentNumber || "Chưa có thông tin"}
                                        </span>
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomersEtourLayout;
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Frown, Smile, UserRoundX } from 'lucide-react';
import not_found_user from './lotties/not_found_user'
import { useLocation, useNavigate } from 'react-router-dom';

const IdCardRead = () => {
    // customer state
    const [customersEtour, setCustomersEtour] = useState([]);
    const [customersIdCard, setCustomersIdCard] = useState([]);
    const [totalGuest, setTotalGuest] = useState(0);

    const [mergedCustomers, setMergedCustomers] = useState([]);

    const [totalGuestIdCards, setTotalGuestIdCards] = useState(0);
    const [bookingNo, setBookingNo] = useState("");
    const [tourCode, setTourCode] = useState("");

    // query params state
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const bookingId = queryParams.get('bookingId');
    const navigate = useNavigate();

    // loading & error state
    const [loading, setLoading] = useState(false);
    const [loadingIdCards, setLoadingIdCards] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [errorIdCard, setErrorIdCard] = useState(null);

    // search state
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage] = useState(10);

    // image modal state
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState([]);

    // state for select file
    const [fileArray, setFileArray] = useState([]);

    // toast state
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('');

    useEffect(() => {
        document.title = 'Trích xuất thông tin CCCD/CMND';
    })

    const handleButtonClickRoute = () => {
        navigate(`/passport-read?bookingId=${bookingId}`);
    }

    //#region API
    useEffect(() => {
        const fetchCustomers = async () => {
            if (!bookingId) return;
            try {
                setLoading(true);
                const response = await axios.get(`http://108.108.110.22:4105/api/Booking/GetBookingMember?BookingId=${bookingId}`);
                const { memberInfors, totalGuest, bookingNo, tourCode } = response.data.response;

                const customerData = memberInfors.map((member, index) => ({
                    stt: index + 1,
                    fullName: member.fullName,
                    gender: member.gender === 1 ? 'Nam' : 'Nữ',
                    personalKind: member.personalKind === 0 ? 'Người lớn' : 'Trẻ em',
                    dateOfBirth: member.visaInfor?.dateOfBirth || 'N/A',
                    issueDate: member.visaInfor?.issueDate || 'Chưa có thông tin',
                    expireDate: member.visaInfor?.expireDate || 'Chưa có thông tin',
                    documentNumber: member.visaInfor?.documentNumber || 'Chưa có thông tin',
                    birthPlace: member.birthPlace || 'Chưa có thông tin',
                    address: member.address || 'Chưa có thông tin',
                    nationality: member.nationality || 'Chưa có thông tin',
                }));

                setCustomersEtour(customerData);
                setTotalGuest(totalGuest);
                setBookingNo(bookingNo);
                setTourCode(tourCode);
            } catch (err) {
                setError('Đã xảy ra lỗi khi tải dữ liệu eTour.');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [bookingId]);

    useEffect(() => {
        const fetchIdCardData = async () => {
            if (fileArray.length === 0) return;

            try {
                setLoadingIdCards(true);
                const formData = new FormData();
                fileArray.forEach(file => {
                    formData.append('imageFile', file);
                });

                const uploadResponse = await axios.post('http://108.108.110.73:1212/api/Vision/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },

                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                    }
                });

                const extractedTexts = uploadResponse.data.extractedTexts;
                if (!extractedTexts || extractedTexts.length === 0) throw new Error('Không có chuỗi JSON nào được trích xuất từ ảnh.');

                const data = JSON.stringify({ extractedTexts });
                const apiURL = fileArray.length === 1
                    ? 'http://108.108.110.113:8086/api/v1/get-o-result'
                    : 'http://108.108.110.113:8086/api/v1/get-o-array';

                const response = await axios.post(apiURL, data, {
                    headers: { 'Content-Type': 'text/plain' },
                });

                const idCardsData = fileArray.length === 1 ? [response.data] : response.data.passports;
                const totalIdCard = fileArray.length === 1 ? 1 : response.data.passports.length;
                setCustomersIdCard(idCardsData);
                setTotalGuestIdCards(totalIdCard);
            } catch (error) {
                setErrorIdCard('Đã xảy ra lỗi khi tải dữ liệu Passport.');
            } finally {
                setLoadingIdCards(false);
            }
        };

        if (fileArray.length > 0) {
            fetchIdCardData();
        }
    }, [fileArray]);

    useEffect(() => {
        if (customersEtour.length > 0 || customersIdCard.length > 0) {
            const mergedData = customersEtour.map(etourCustomer => {
                const matchedIdCardCustomer = customersIdCard.find(
                    passportCustomer => passportCustomer.idCardNo === etourCustomer.documentNumber
                );
                return {
                    bookingCustomer: etourCustomer,
                    idCardCustomer: matchedIdCardCustomer || null,
                };
            });
            setMergedCustomers(mergedData);
        }
    }, [customersEtour, customersIdCard]);
    //#endregion

    //#region Get save customer API
    const handleSave = async () => {
        try {
            const payload = {
                extractedData: customersIdCard.map((customer) => ({
                    type: customer.type,
                    fullName: customer.fullName,
                    nationality: customer.nationality,
                    dateOfBirth: customer.dateOfBirth,
                    sex: customer.sex,
                    dateOfIssue: customer.dateOfIssue,
                    placeOfIssue: customer.placeOfIssue,
                    passportNo: customer.passportNo,
                    placeOfBirth: customer.placeOfBirth,
                    idCardNo: customer.idCardNo,
                    dateOfExpiry: customer.dateOfExpiry,
                    issuingAuthority: customer.issuingAuthority
                }))
            };
            const response = await axios.post('http://108.108.110.73:1212/api/Customers/save', payload);

            if (response.status === 200) {
                setToastMessage('Lưu thông tin khách hàng thành công!');
                setToastType('success');

                setTimeout(() => {
                    setToastMessage('');
                }, 3000);
            } else {
                setToastMessage('Có lỗi ở hệ thống khi lưu thông tin khách hàng.');
                setToastType('error');

                setTimeout(() => {
                    setToastMessage('');
                }, 3000);
            }

        } catch (error) {
            setToastMessage('Đã có dữ liệu của CCCD/CMND trong hệ thống.');
            setToastType('error');

            setTimeout(() => {
                setToastMessage('');
            }, 3000);
        }
    }
    //#endregion

    //#region handle check data
    const cleanString = (str) => {
        return str?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || '';
    };
    //#endregion

    //#region handle preview picture
    const handlePreviewPicture = (event) => {
        const files = event.target.files;
        const fileArr = Array.from(files);
        const previewUrls = fileArr.map(file => URL.createObjectURL(file));

        setFileArray(fileArr);
        setPreviewImage(previewUrls);
    };
    //#endregion

    //#region handle format date
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
    //#endregion

    //#region handle format gender
    const formatGender = (gender) => {
        const lowerCaseGender = gender?.toLowerCase();
        if (lowerCaseGender === 'f' || lowerCaseGender === 'nữ' || lowerCaseGender === 'nu') {
            return 'Nữ';
        } else if (lowerCaseGender === 'm' || lowerCaseGender === 'nam') {
            return 'Nam';
        } else {
            return 'N/A';
        }
    };
    //#endregion

    //#region Image click
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const handleCloseImage = (e) => {
        if (e.target.id === "image-modal") {
            setSelectedImage(null);
        }
    };
    //#endregion

    const handleClose = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.close();
    };
    //#endregion

    //#region Searching
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };
    const filteredCustomersEtour = customersEtour.filter(customer =>
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCustomersIdCard = customersIdCard.filter(customer =>
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    //#endregion

    //#region Pagination
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;

    const currentCustomersEtours = filteredCustomersEtour.slice(indexOfFirstCustomer, indexOfLastCustomer);
    const currentCustomersIdCards = filteredCustomersIdCard.slice(indexOfFirstCustomer, indexOfLastCustomer);

    const totalPages = Math.ceil(filteredCustomersEtour.length / customersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    //#endregion
    return (
        <div className='w-full min-h-screen p-4 mobile:p-0 tablet:p-0'>

            <div className="navbar bg-base-100 mobile:flex-col mobile:gap-4">
                <div className="flex-1 gap-8 items-center">
                    <p className="text-xl font-semibold mobile:text-sm mobile:text-left">Code Tour:</p>
                    <input
                        type="text"
                        value={tourCode || ''}
                        className="input input-ghost input-sm"
                        disabled
                    />
                </div>
                <div className="flex-none items-center gap-8">
                    <p className="text-xl font-semibold mobile:text-sm mobile:text-left">Số Booking:</p>
                    <input
                        type="text"
                        value={bookingNo || ''}
                        className="input input-ghost input-sm"
                        disabled
                    />
                </div>
            </div>
            <div className='flex justify-between items-center w-full mobile:flex mobile:flex-col'>
                <div className='mobile:pt-4'>
                    <button className='btn btn-info no-animation mobile:h-auto mobile:text-balance' onClick={handleButtonClickRoute}>Đọc Passport</button>
                </div>
                <div className='handle-pictures flex gap-4 my-4 pb-4 items-center mobile:flex-col'>
                    <p className='font-normal text-xl text-balance flex-1 mobile:text-center mobile:text-base'>Đính kèm ảnh CCCD/CMND</p>
                    <input type="file" accept='image/*' multiple onChange={handlePreviewPicture} className="file-input file-input-bordered file-input-accent max-w-xs w-full flex-none" />
                </div>
            </div>
            {previewImage.length > 0 && (
                <div className="carousel w-full">
                    {previewImage.map((imageUrl, index) => (
                        <div
                            key={index}
                            id={`slide${index + 1}`}
                            className="carousel-item relative w-full flex justify-center"
                        >
                            <img
                                src={imageUrl}
                                className="shadow-2xl rounded-xl h-auto w-1/3 bg-center object-center cursor-pointer"
                                alt={`Slide ${index + 1}`}
                                onClick={() => handleImageClick(imageUrl)}
                            />
                            <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                                <a
                                    href={`#slide${index === 0 ? previewImage.length : index}`}
                                    className="btn btn-circle"
                                >
                                    ❮
                                </a>
                                <a
                                    href={`#slide${(index + 1) % previewImage.length === 0 ? 1 : index + 2}`}
                                    className="btn btn-circle"
                                >
                                    ❯
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className='my-5 flex mobile:flex-col mobile:gap-4'>
                <div className='w-full flex justify-between mobile:w-full'>
                    <label className="input input-bordered flex items-center w-full mobile:">
                        <input
                            type="text"
                            className="w-full"
                            placeholder="Tìm kiếm theo tên..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-4 w-4 opacity-70">
                            <path
                                fillRule="evenodd"
                                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                clipRule="evenodd" />
                        </svg>
                    </label>
                </div>
            </div>
            <div className="w-full justify-center">
                <div className="grid grid-cols-2 gap-4 mobile:flex mobile:flex-col">

                    {/* Cột eTour */}
                    <div className="mobile:p-4">
                        <h3 className="font-semibold text-center text-2xl mb-2 mobile:text-lg mobile:uppercase">Danh sách eTour</h3>
                        <div className="flex justify-end mb-3">
                            <p className="text-lg mobile:text-base">Tổng số khách trong eTour: <span className="font-semibold">{totalGuest}</span></p>
                        </div>
                        {loading ? (
                            <div className="flex flex-col justify-center items-center mobile:flex-col">
                                <span className="loading loading-infinity w-28"></span>
                                <p className='font-semibold flex justify-center items-center text-center'>
                                    Đang tải dữ liệu khách hàng...
                                    <Smile className='ml-2 w-6 mobile:mt-2' />
                                </p>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center mobile:flex-col">
                                <p className='font-semibold text-balance text-center'>Đã có lỗi xảy ra ở phía hệ thống, vui lòng thử lại sau</p>
                                <Frown className='ml-2 w-6 mobile:mt-2' />
                            </div>
                        ) : (
                            <>
                                {Math.max(currentCustomersEtours.length, currentCustomersIdCards.length) > 0 ? (
                                    Array.from({ length: Math.max(currentCustomersEtours.length, currentCustomersIdCards.length) }).map((_, index) => (
                                        <div key={index} className="border mb-4 p-4 bg-yellow-200 rounded-2xl">
                                            <p><strong>Khách hàng {index + 1 + (currentPage - 1) * customersPerPage}</strong></p>
                                            {currentCustomersEtours[index] ? (
                                                <>
                                                    <p>Họ tên: {currentCustomersEtours[index].fullName}</p>
                                                    <p>Giới tính: {currentCustomersEtours[index].gender}</p>
                                                    <p>Nơi sinh: {currentCustomersEtours[index].birthPlace}</p>
                                                    <p>Quốc tịch: {currentCustomersEtours[index].nationality}</p>
                                                    <p>Số CCCD/CMND: {currentCustomersEtours[index].documentNumber}</p>
                                                    <p>Ngày sinh: {formatDate(currentCustomersEtours[index].dateOfBirth)}</p>
                                                    <p>Ngày cấp: {formatDate(currentCustomersEtours[index].issueDate)}</p>
                                                    <p>Ngày hết hạn: {formatDate(currentCustomersEtours[index].expireDate)}</p>
                                                </>
                                            ) : (
                                                <p className='text-center font-semibold text-lg'>Chưa có thông tin khách hàng</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex justify-center items-center mobile:flex-col py-4">
                                        <p className='font-semibold text-balance text-center'>
                                            Không tìm thấy khách hàng nào từ eTour
                                        </p>
                                        <UserRoundX className='ml-2 w-6 mobile:mt-2' />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className='hidden mobile:divider mobile:px-4'></div>

                    <div className="mobile:p-4">
                        <h3 className="font-semibold text-center text-2xl mb-2 mobile:text-lg mobile:uppercase">Danh sách CCCD/CMND</h3>
                        <div className='flex justify-end mb-3 mobile:text-base'>
                            <p className='text-lg'>Tổng số khách nhập từ CCCD/CMND: <span className='font-semibold'>{totalGuestIdCards}</span></p>
                        </div>
                        {loadingIdCards ? (
                            <div className="flex flex-col justify-center items-center">
                                <div className="radial-progress" style={{ "--value": progress }} role="progressbar">{progress}%</div>
                                <p className='font-semibold flex justify-center items-center text-center mt-4'>Đang tải dữ liệu khách hàng...</p>
                            </div>
                        ) : errorIdCard ? (
                            <div className="flex justify-center items-center mobile:flex-col">
                                <p className='font-semibold flex justify-center items-center text-center'>Đã có lỗi xảy ra ở phía hệ thống, vui lòng thử lại sau</p>
                                <Frown className='ml-2 w-6 mobile:mt-2' />
                            </div>
                        ) : (
                            <>
                                {customersIdCard.length > 0 ? (
                                    Array.from({ length: Math.max(currentCustomersEtours.length, customersIdCard.length) }).map((_, index) => {
                                        const etourCustomer = currentCustomersEtours[index];
                                        const idCardCustomer = customersIdCard[index];

                                        return (
                                            <div key={index} className="border mb-4 p-4 rounded-2xl">
                                                <p><strong>Khách hàng {index + 1 + (currentPage - 1) * customersPerPage}</strong></p>
                                                {idCardCustomer ? (
                                                    <div>
                                                        <p>
                                                            Họ tên:
                                                            <span className={(etourCustomer && cleanString(etourCustomer.fullName) !== cleanString(idCardCustomer.fullName)) || !etourCustomer ? "text-red-600" : ""}>
                                                                &nbsp;{idCardCustomer.fullName}
                                                            </span>
                                                        </p>
                                                        <p>
                                                            Giới tính:
                                                            <span className={(etourCustomer && cleanString(etourCustomer.gender) !== cleanString(formatGender(idCardCustomer.sex))) || !etourCustomer ? "text-red-600" : ""}>
                                                                &nbsp;{formatGender(idCardCustomer.sex)}
                                                            </span>
                                                        </p>
                                                        <p>
                                                            Nơi sinh:
                                                            <span className={(etourCustomer && cleanString(etourCustomer.birthPlace) !== cleanString(idCardCustomer.placeOfBirth)) || !etourCustomer ? "text-red-600" : ""}>
                                                                &nbsp;{idCardCustomer.placeOfBirth || 'Chưa có thông tin'}
                                                            </span>
                                                        </p>
                                                        <p>
                                                            Quốc tịch:
                                                            <span className={(etourCustomer && cleanString(etourCustomer.nationality) !== cleanString(idCardCustomer.nationality)) || !etourCustomer ? "text-red-600" : ""}>
                                                                &nbsp;{idCardCustomer.nationality || 'Chưa có thông tin'}
                                                            </span>
                                                        </p>
                                                        <p>
                                                            Số CCCD/CMND:
                                                            <span className={(etourCustomer && etourCustomer.documentNumber !== idCardCustomer.idCardNo) || !etourCustomer ? "text-red-600" : ""}>
                                                                &nbsp;{idCardCustomer.idCardNo}
                                                            </span>
                                                        </p>
                                                        <p>
                                                            Ngày sinh:
                                                            <span className={(etourCustomer && formatDate(etourCustomer.dateOfBirth) !== formatDate(idCardCustomer.dateOfBirth)) || !etourCustomer ? "text-red-600" : ""}>
                                                                &nbsp;{formatDate(idCardCustomer.dateOfBirth)}
                                                            </span>
                                                        </p>
                                                        <p>
                                                            Ngày cấp:
                                                            <span className={(etourCustomer && formatDate(etourCustomer.issueDate) !== formatDate(idCardCustomer.dateOfIssue)) || !etourCustomer ? "text-red-600" : ""}>
                                                                &nbsp;{formatDate(idCardCustomer.dateOfIssue)}
                                                            </span>
                                                        </p>
                                                        <p>
                                                            Ngày hết hạn:
                                                            <span className={(etourCustomer && formatDate(etourCustomer.expireDate) !== formatDate(idCardCustomer.dateOfExpiry)) || !etourCustomer ? "text-red-600" : ""}>
                                                                &nbsp;{formatDate(idCardCustomer.dateOfExpiry)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className='text-center font-semibold text-lg mobile:text-base'>Chưa có thông tin khách hàng</p>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex justify-center items-center mobile:flex-col py-4">
                                        <p className='font-semibold text-balance text-center'>Không tìm thấy khách hàng nào từ CCCD/CMND</p>
                                        <UserRoundX className='ml-2 w-6 mobile:mt-2' />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <footer className='my-12'>
                <div className="join my-4 flex justify-center">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <input
                            key={i + 1}
                            className="join-item btn btn-square"
                            type="radio"
                            name="options"
                            aria-label={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            defaultChecked={i + 1 === currentPage}
                        />
                    ))}
                </div>
                <div className='gap-4 flex justify-end items-center mr-4 pb-2 mobile:mx-1.5 mobile:gap-3'>
                    <div>
                        <button className="btn btn-accent no-animation mobile:h-auto mobile:text-balance" >Lưu và cập nhật eTour</button>
                    </div>
                    <div>
                        <button className="btn btn-accent no-animation" onClick={handleSave}>Lưu</button>
                    </div>
                    {toastMessage && (
                        <div className={`toast toast-top toast-center z-50`}>
                            <div className={`alert ${toastType === 'success' ? 'alert-success' : 'alert-error'}`}>
                                <span>{toastMessage}</span>
                            </div>
                        </div>
                    )}
                    <div>
                        <button className="btn btn-error no-animation" onClick={handleClose}>Thoát</button>
                    </div>
                </div>
            </footer>
            {selectedImage && (
                <div
                    id="image-modal"
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    onClick={handleCloseImage}
                >
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <img src={selectedImage} alt="Zoomed Avatar" className="max-h-screen max-w-screen" />
                    </div>
                </div>
            )}

        </div>
    );
}

export default IdCardRead;
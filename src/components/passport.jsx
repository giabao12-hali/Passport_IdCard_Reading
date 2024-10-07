/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Frown, Smile, UserRoundX } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const PassportRead = () => {
    // customer state
    const [customersEtour, setCustomersEtour] = useState([]);
    const [customersPassport, setCustomersPassport] = useState([]);
    const [totalGuest, setTotalGuest] = useState(0);
    const [totalGuestPassports, setTotalGuestPassports] = useState(0);

    const [mergedCustomers, setMergedCustomers] = useState([]);

    // query params state
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const bookingId = queryParams.get('bookingId');
    const navigate = useNavigate();

    // loading & error state
    const [loading, setLoading] = useState(true);
    const [loadingPassports, setLoadingPassports] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [errorPassport, setErrorPassport] = useState(null);

    // search state
    const [currentPage, setCurrentPage] = useState(1);
    const customersPerPage = 10;

    // image modal state
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState([]);

    // state for select file
    const [fileArray, setFileArray] = useState([]);

    // toast state
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('');

    //#region Document Title
    useEffect(() => {
        document.title = 'Trích xuất thông tin Passport';
    })
    //#endregion


    //#region API

    //#region Call API region
    useEffect(() => {
        const fetchCustomers = async () => {
            if (!bookingId) return;
            try {
                setLoading(true);
                const response = await axios.get(`http://108.108.110.22:4105/api/Booking/GetBookingMember?BookingId=${bookingId}`);
                const { memberInfors, totalGuest } = response.data.response;

                const customerData = memberInfors.map((member, index) => ({
                    memberId: member.memberId,
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
            } catch (err) {
                setError('Đã xảy ra lỗi khi tải dữ liệu eTour.');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [bookingId]);

    useEffect(() => {
        const fetchPassportData = async () => {
            if (fileArray.length === 0) return;

            try {
                setLoadingPassports(true);
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

                const passportsData = fileArray.length === 1 ? [response.data] : response.data.passports;
                const totalPassport = fileArray.length === 1 ? 1 : response.data.passports.length;
                setCustomersPassport(passportsData);
                setTotalGuestPassports(totalPassport);
            } catch (error) {
                setErrorPassport('Đã xảy ra lỗi khi tải dữ liệu Passport.');
            } finally {
                setLoadingPassports(false);
            }
        };

        if (fileArray.length > 0) {
            fetchPassportData();
        }
    }, [fileArray]);
    //#endregion

    useEffect(() => {
        console.log("Booking ID: ", bookingId);
    
        if (!bookingId) return;
    
        let isMounted = true;
    
        const getListCustomers = async () => {
            console.log("Calling API...");
            try {
                const response = await axios.get(`http://108.108.110.73:1212/api/Customers/get-list-customers-by-bookingId/${bookingId}`);
    
                if (isMounted) {
                    console.log("API response: ", response.data);
                    setCustomersPassport(response.data.customerBooking);
                }
            } catch (err) {
                console.error("API Error: ", err);
                setError('Đã xảy ra lỗi khi tải dữ liệu khách hàng.');
            } finally {
                setLoading(false);
            }
        };
    
        getListCustomers();
    
        return () => {
            console.log("Cleaning up...");
            isMounted = false;
        };
    }, [bookingId]);
    


    //#region Merge customers
    useEffect(() => {
        if (customersEtour.length > 0 || customersPassport.length > 0) {
            let mergedData = [];
            customersEtour.forEach(etourCustomer => {
                const matchedPassportCustomer = customersPassport.find(
                    passportCustomer => passportCustomer.passportNo === etourCustomer.documentNumber
                );
                mergedData.push({
                    bookingCustomer: etourCustomer,
                    passportCustomer: matchedPassportCustomer || null,
                });
            });
            customersPassport.forEach(passportCustomer => {
                const matchedEtourCustomer = customersEtour.find(
                    etourCustomer => etourCustomer.documentNumber === passportCustomer.passportNo
                );
                if (!matchedEtourCustomer) {
                    mergedData.push({
                        bookingCustomer: null,
                        passportCustomer: passportCustomer,
                    });
                }
            });

            setMergedCustomers(mergedData);
        }
    }, [customersEtour, customersPassport]);
    //#endregion

    //#region Save API
    const handleSave = async () => {
        try {
            const queryParams = new URLSearchParams(window.location.search);
            const bookingId = queryParams.get('bookingId');

            if (!bookingId) {
                setToastMessage('Không tìm thấy Booking ID.');
                setToastType('error');
                return;
            }

            const payload = {
                extractedData: customersPassport.map((customer) => ({
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
                    issuingAuthority: customer.issuingAuthority,
                    bookingId: bookingId
                }))
            };
            
            const response = await axios.post(`http://108.108.110.73:1212/api/Customers/save?bookingId=${bookingId}`, payload, {
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/json'
                }
            });

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
            setToastMessage('Đã có dữ liệu của Passport trong hệ thống.');
            setToastType('error');

            setTimeout(() => {
                setToastMessage('');
            }, 3000);
        }
    };
    //#endregion

    //#endregion




    //#region Function

    //#region Check data
    const cleanString = (str) => {
        return str?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || '';
    };
    //#endregion

    //#region Route to ID Card
    const handleButtonClickRoute = () => {
        navigate(`/idcard-read?bookingId=${bookingId}`);
    }
    //#endregion

    //#region Picture

    //#region Preview picture
    const handlePreviewPicture = (event) => {
        const files = event.target.files;
        const fileArr = Array.from(files);
        const previewUrls = fileArr.map(file => URL.createObjectURL(file));

        setFileArray(prevFiles => [...prevFiles, ...fileArr]);
        setPreviewImage(prevImages => [...prevImages, ...previewUrls]);
    };
    //#endregion

    //#region Image click
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        document.getElementById('image_modal_checkbox').checked = true;
    };

    const handleCloseImage = (e) => {
        document.getElementById('image-modal').close();
        setSelectedImage(null);
    };

    const handleClose = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.close();
    };
    //#endregion

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

    //#region Sending JSON Data
    const handleCopyToClipboard = (event) => {
        event.preventDefault();
        const passportData = customersPassport.map((passportCustomer) => {
            const normalizedPassportNo = passportCustomer.passportNo?.trim().toUpperCase();

            const matchingMember = customersEtour.find((member) => {
                const normalizedDocumentNumber = member.documentNumber?.trim().toUpperCase();

                return normalizedDocumentNumber === normalizedPassportNo;
            });

            return {
                fullName: passportCustomer.fullName || '',
                nationality: passportCustomer.nationality || '',
                dateOfBirth: passportCustomer.dateOfBirth || '',
                sex: passportCustomer.sex || '',
                dateOfIssue: passportCustomer.dateOfIssue || '',
                placeOfIssue: passportCustomer.placeOfIssue || '',
                passportNo: passportCustomer.passportNo || '',
                placeOfBirth: passportCustomer.placeOfBirth || '',
                dateOfExpiry: passportCustomer.dateOfExpiry || '',
                issuingAuthority: passportCustomer.issuingAuthority || '',

                memberId: matchingMember ? matchingMember.memberId : 'Chưa có thông tin',
                bookingId: bookingId || 'Chưa có thông tin',
            };
        });
        const message = { copyAll: JSON.stringify(passportData, null, 2) };

        console.log("Dữ liệu JSON gửi đi: ", passportData);

        window.parent.postMessage(message, '*');
    };
    //#endregion

    //#region Pagination
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;

    const currentCustomersEtours = customersEtour.slice(indexOfFirstCustomer, indexOfLastCustomer);

    const currentCustomersPassports = customersPassport.slice(indexOfFirstCustomer, indexOfLastCustomer);

    const totalPages = Math.ceil(customersPassport.length / customersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    //#endregion

    //#endregion

    return (
        <div className='w-full min-h-screen p-4 mobile:p-0 tablet:p-4'>
            <div className='flex justify-between items-center mobile:flex mobile:flex-col'>
                <button className='btn btn-info no-animation mobile:h-auto mobile:text-balance translate-y-[17px] mobile:mb-8' onClick={handleButtonClickRoute}>Đọc CCCD/CMND</button>
                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Đính kèm ảnh Passport</span>
                    </div>
                    <input type="file" accept='image/*' multiple onChange={handlePreviewPicture} className="file-input file-input-bordered file-input-accent max-w-xs w-full flex-none" />
                </label>
            </div>

            <div>
                {previewImage.length > 0 && (
                    <div className="carousel w-full py-12">
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
                <input type="checkbox" id="image_modal_checkbox" className="modal-toggle" />
                <div className="modal">
                    <div className="modal-box">
                        {selectedImage && (
                            <img src={selectedImage} alt="Zoomed Avatar" className="max-h-screen max-w-screen" />
                        )}
                    </div>
                    <label className="modal-backdrop" htmlFor="image_modal_checkbox">Close</label>
                </div>
            </div>

            <div className="w-full justify-center py-6">
                <div className="grid grid-cols-2 gap-4 mobile:flex mobile:flex-col">
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
                            <div className="flex flex-col justify-center items-center ">
                                <p className='font-semibold flex items-center text-center mobile:flex-col'>
                                    Đã có lỗi xảy ra ở phía hệ thống, vui lòng thử lại sau
                                    <Frown className='ml-2 w-6 mobile:mt-2' />
                                </p>
                            </div>
                        ) : (
                            <>
                                {Math.max(currentCustomersEtours.length, currentCustomersPassports.length) > 0 ? (
                                    Array.from({ length: Math.max(currentCustomersEtours.length, currentCustomersPassports.length) }).map((_, index) => (
                                        <div key={index} className="border mb-4 p-4 bg-yellow-200 rounded-2xl">
                                            <p><strong>Khách hàng {index + 1 + (currentPage - 1) * customersPerPage}</strong></p>
                                            {currentCustomersEtours[index] ? (
                                                <>
                                                    <p>Họ tên: {currentCustomersEtours[index].fullName}</p>
                                                    <p>Giới tính: {currentCustomersEtours[index].gender}</p>
                                                    <p>Nơi sinh: {currentCustomersEtours[index].birthPlace}</p>
                                                    <p>Quốc tịch: {currentCustomersEtours[index].nationality}</p>
                                                    <p>Số Passport: {currentCustomersEtours[index].documentNumber}</p>
                                                    <p>Ngày sinh: {formatDate(currentCustomersEtours[index].dateOfBirth)}</p>
                                                    <p>Ngày cấp: {formatDate(currentCustomersEtours[index].issueDate)}</p>
                                                    <p>Ngày hết hạn: {formatDate(currentCustomersEtours[index].expireDate)}</p>
                                                </>
                                            ) : (
                                                <div>
                                                    <p>Họ tên:<span>&nbsp;Chưa có thông tin</span></p>
                                                    <p>Giới tính:<span>&nbsp;Chưa có thông tin</span></p>
                                                    <p>Nơi sinh:<span>&nbsp;Chưa có thông tin</span></p>
                                                    <p>Quốc tịch:<span>&nbsp;Chưa có thông tin</span></p>
                                                    <p>Số Passport:<span>&nbsp;Chưa có thông tin</span></p>
                                                    <p>Ngày sinh:<span>&nbsp;Chưa có thông tin</span></p>
                                                    <p>Ngày cấp:<span>&nbsp;Chưa có thông tin</span></p>
                                                    <p>Ngày hết hạn:<span>&nbsp;Chưa có thông tin</span></p>
                                                </div>
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
                        <h3 className="font-semibold text-center text-2xl mb-2 mobile:text-lg mobile:uppercase">Danh sách Passport</h3>
                        <div className='flex justify-end mb-3 mobile:text-base'>
                            <p className='text-lg'>Tổng số khách nhập từ Passport: <span className='font-semibold'>{totalGuestPassports}</span></p>
                        </div>
                        {loadingPassports ? (
                            <div className="flex flex-col justify-center items-center">
                                <div className="radial-progress" style={{ "--value": progress }} role="progressbar">{progress}%</div>
                                <p className='font-semibold flex justify-center items-center text-center mt-4'>Đang tải dữ liệu khách hàng...</p>
                            </div>
                        ) : errorPassport ? (
                            <div className="flex justify-center items-center mobile:flex-col">
                                <p className='font-semibold flex justify-center items-center text-center'>Đã có lỗi xảy ra ở phía hệ thống, vui lòng thử lại sau</p>
                                <Frown className='ml-2 w-6 mobile:mt-2' />
                            </div>
                        ) : (
                            <>
                                {customersPassport.length > 0 ? (
                                    mergedCustomers.map((customerPair, index) => {
                                        const etourCustomer = customerPair.bookingCustomer;
                                        const passportCustomer = customerPair.passportCustomer;
                                        return (
                                            <div key={index} className="border mb-4 p-4 rounded-2xl">
                                                <p><strong>Khách hàng {index + 1 + (currentPage - 1) * customersPerPage}</strong></p>
                                                {passportCustomer ? (
                                                    <div>
                                                        <p>Họ tên:<span className={(etourCustomer && cleanString(etourCustomer.fullName) !== cleanString(passportCustomer.fullName)) || !etourCustomer ? "text-red-600" : ""}>&nbsp;{passportCustomer.fullName}</span></p>
                                                        <p>Giới tính:<span className={(etourCustomer && cleanString(etourCustomer.gender) !== cleanString(formatGender(passportCustomer.sex))) || !etourCustomer ? "text-red-600" : ""}>&nbsp;{formatGender(passportCustomer.sex)}</span></p>
                                                        <p>Nơi sinh:<span className={(etourCustomer && cleanString(etourCustomer.birthPlace) !== cleanString(passportCustomer.placeOfBirth)) || !etourCustomer ? "text-red-600" : ""}>&nbsp;{passportCustomer.placeOfBirth || 'Chưa có thông tin'}</span></p>
                                                        <p>Quốc tịch:<span className={(etourCustomer && cleanString(etourCustomer.nationality) !== cleanString(passportCustomer.nationality)) || !etourCustomer ? "text-red-600" : ""}>&nbsp;{passportCustomer.nationality || 'Chưa có thông tin'}</span></p>
                                                        <p>Số Passport:<span className={(etourCustomer && etourCustomer.documentNumber !== passportCustomer.passportNo) || !etourCustomer ? "text-red-600" : ""}>&nbsp;{passportCustomer.passportNo}</span></p>
                                                        <p>Ngày sinh:<span className={(etourCustomer && formatDate(etourCustomer.dateOfBirth) !== formatDate(passportCustomer.dateOfBirth)) || !etourCustomer ? "text-red-600" : ""}>&nbsp;{formatDate(passportCustomer.dateOfBirth)}</span></p>
                                                        <p>Ngày cấp:<span className={(etourCustomer && formatDate(etourCustomer.issueDate) !== formatDate(passportCustomer.dateOfIssue)) || !etourCustomer ? "text-red-600" : ""}>&nbsp;{formatDate(passportCustomer.dateOfIssue)}</span></p>
                                                        <p>Ngày hết hạn:<span className={(etourCustomer && formatDate(etourCustomer.expireDate) !== formatDate(passportCustomer.dateOfExpiry)) || !etourCustomer ? "text-red-600" : ""}>&nbsp;{formatDate(passportCustomer.dateOfExpiry)}</span></p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p>Họ tên:<span>&nbsp;Chưa có thông tin</span></p>
                                                        <p>Giới tính:<span>&nbsp;Chưa có thông tin</span></p>
                                                        <p>Nơi sinh:<span>&nbsp;Chưa có thông tin</span></p>
                                                        <p>Quốc tịch:<span>&nbsp;Chưa có thông tin</span></p>
                                                        <p>Số Passport:<span>&nbsp;Chưa có thông tin</span></p>
                                                        <p>Ngày sinh:<span>&nbsp;Chưa có thông tin</span></p>
                                                        <p>Ngày cấp:<span>&nbsp;Chưa có thông tin</span></p>
                                                        <p>Ngày hết hạn:<span>&nbsp;Chưa có thông tin</span></p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex justify-center items-center mobile:flex-col py-4">
                                        <p className='font-semibold text-balance text-center'>Không tìm thấy khách hàng</p>
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
                        <button className="btn btn-accent no-animation mobile:h-auto mobile:text-balance" onClick={handleCopyToClipboard}>Lưu và cập nhật eTour</button>
                    </div>
                    <div>
                        <button className="btn btn-accent no-animation mobile:h-auto mobile:text-balance" onClick={handleSave}>Lưu</button>
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
        </div>
    );
}

export default PassportRead;
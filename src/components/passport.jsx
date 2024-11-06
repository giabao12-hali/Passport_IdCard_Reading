/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserRoundX } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import FooterLayout from './layout/footer';
import PreviewImageLayout from './layout/preview_image';
import ButtonActions from './layout/button_actions';
import ToastMessageLayout from './layout/toast';
import QRCode from 'react-qr-code';
import CustomersEtourLayout from './layout/customers/customerEtour_layout';
import PassportCard from './layout/customers/customerPassport_layout';

const PassportRead = () => {
    // customer state
    const [customersEtour, setCustomersEtour] = useState([]); //* mảng A
    const [listCustomers, setListCustomers] = useState([]); //* mảng B list từ api
    const [customersPassport, setCustomersPassport] = useState([]); //* mảng C upload file
    const [mergedCustomers, setMergedCustomers] = useState([]); //* mảng D = B + C

    const [newPassports, setNewPassports] = useState([]);

    const [totalGuest, setTotalGuest] = useState(0);


    const [isPassportSaved, setIsPassportSaved] = useState(false);


    // qrcode state
    const qrCodeUrl = window.location.href;
    // query params state
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const bookingParams = queryParams.get('bookingId');
    const [bookingId, setBookingId] = useState(null);
    const navigate = useNavigate();

    // loading & error state
    const [loading, setLoading] = useState(true);
    const [loadingPassports, setLoadingPassports] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [errorPassport, setErrorPassport] = useState(null);

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const customersPerPage = 10;

    // image modal state
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState([]);
    const [activeCustomer, setActiveCustomer] = useState(null);

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

    //#region Route to ID Card
    const handleButtonClickRoute = () => {
        navigate(`/idcard-read?bookingId=${bookingId}`);
    }
    //#endregion

    //#region API

    //#region Call API

    //#region Get Booking ID
    useEffect(() => {
        const fetchCustomers = async () => {
            if (!bookingParams) return;
            try {
                setLoading(true);
                const response = await axios.get(`https://api2.travel.com.vn/local/etour/Booking/GetBookingMember?BookingId=${bookingParams}`);

                if (!response.data.response) {
                    setCustomersEtour([]);
                    setTotalGuest(0);
                    return
                }
                // if (response.data.response.bookingID) {
                //     setCustomersEtour(response.data.response.bookingID);
                // }

                const { status, code, response: bookingResponse } = response.data;
                if (status != 1 || code != 200 || !bookingResponse) {
                    setCustomersEtour([]);
                    setError("Hệ thống đã xảy ra lỗi hoặc không có dữ liệu");
                    return;
                }
                setTotalGuest(bookingResponse.totalGuest);

                if (!bookingResponse.memberInfors) {
                    setCustomersEtour([]);
                    setError("Không có khách hàng trong etour");
                    return;
                }

                const { memberInfors } = bookingResponse;

                const customerData = memberInfors.map((member, index) => ({
                    memberId: member.memberId,
                    stt: index + 1,
                    fullName: member.fullName,
                    gender: member.gender === 1 ? 'Nam' : 'Nữ',
                    personalKind: member.personalKind === 0 ? 'Người lớn' : 'Trẻ em',
                    dateOfBirth: member.visaInfor?.dateOfBirth || 'N/A',
                    issueDate: member.visaInfor?.issueDate || 'Chưa có thông tin',
                    expireDate: member.visaInfor?.expireDate || 'Chưa có thông tin',
                    visaInfor: {
                        documentNumber: member.visaInfor?.documentNumber || 'Chưa có thông tin',
                    },
                    idCardInfor: {
                        documentNumber: member.idCardInfor?.documentNumber || 'Chưa có thông tin',
                    },
                    birthPlace: member.birthPlace || 'Chưa có thông tin',
                    address: member.address || 'Chưa có thông tin',
                    nationality: member.nationality || 'Chưa có thông tin',
                }));
                setCustomersEtour(customerData);
            } catch (err) {
                setError('Đã xảy ra lỗi khi tải dữ liệu eTour.');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [bookingParams]);
    //#endregion

    //#region Upload Passport & Extracted API
    useEffect(() => {
        const fetchPassportData = async () => {
            if (fileArray.length === 0) return;

            try {
                setLoadingPassports(true);
                setError(null);

                // Kiểm tra nếu totalGuest có giá trị hợp lệ
                if (totalGuest && fileArray.length > totalGuest) {
                    setToastMessage(`Bạn chỉ được upload tối đa ${totalGuest} hình ảnh.`);
                    setTimeout(() => setToastMessage(''), 2000);
                    setToastType('error');

                    // Chỉ giữ lại số file tối đa được phép
                    setFileArray(fileArray.slice(0, totalGuest));
                    setLoadingPassports(false);
                    return;
                }

                // Tạo FormData từ fileArray (giới hạn hoặc không giới hạn dựa trên totalGuest)
                const formData = new FormData();
                fileArray.slice(0, totalGuest || fileArray.length).forEach(file => {
                    formData.append('files', file);
                });

                // Gửi dữ liệu lên API
                const response = await axios.post('https://ocr-images.vietravel.com/extract-o-imgs', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                    }
                });

                const extractedPassports = response.data;
                if (!extractedPassports || extractedPassports.length === 0) {
                    throw new Error('Không có chuỗi JSON nào được trích xuất từ ảnh.');
                }

                // setCustomersPassport(extractedPassports);
                // Nếu không có dữ liệu eTour, hiển thị dữ liệu từ Passport
                // if (!customersEtour || customersEtour.length === 0) {
                const customerDataFromPassports = extractedPassports.map((passport, index) => {
                    return {
                        bookingCustomer: null,
                        passportCustomer: passport,
                        imageUrl: passport.imageUrl
                    }
                    // return {
                    //     memberId: `extracted-${index}`,
                    //     fullName: passport.fullName,
                    //     gender: ['m', 'nam', 'male'].includes(passport.sex?.toLowerCase()) ? 'Nam' : 'Nữ',
                    //     dateOfBirth: passport.dateOfBirth || 'N/A',
                    //     issueDate: passport.dateOfIssue || 'Chưa có thông tin',
                    //     expireDate: passport.dateOfExpiry || 'Chưa có thông tin',
                    //     visaInfor: {
                    //         documentNumber: passport.passportNo || 'Chưa có thông tin',
                    //         issueDate: passport.dateOfIssue || 'Chưa có thông tin',
                    //         expireDate: passport.dateOfExpiry || 'Chưa có thông tin'
                    //     },
                    //     idCardInfor: {
                    //         documentNumber: passport.idCardNo || 'Chưa có thông tin',
                    //         issueDate: passport.dateOfIssue || 'Chưa có thông tin',
                    //         expireDate: passport.dateOfExpiry || 'Chưa có thông tin'
                    //     },
                    //     birthPlace: passport.placeOfBirth || 'Chưa có thông tin',
                    //     nationality: passport.nationality || 'Chưa có thông tin',
                    //     imageUrl: passport.imageUrl
                    // }
                });

                setNewPassports(customerDataFromPassports);
                // }

            } catch (error) {
                setError('Đã xảy ra lỗi khi tải dữ liệu Passport.');
            } finally {
                setLoadingPassports(false);
            }
        };

        if (fileArray.length > 0) {
            fetchPassportData();
        }
    }, [fileArray, totalGuest]);

    //#endregion


    //#endregion

    //#region Get list customers by bookingId
    useEffect(() => {
        if (!bookingParams) return;
        let isMounted = true;

        const getListCustomers = async () => {
            try {
                const response = await axios.get(`https://beid-extract.vietravel.com/api/Customers/get-list-customers-by-bookingId/${bookingParams}`, {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                });
                const customers = response.data.customerBooking;
                if (customers && customers.length > 0) {
                    const passportData = response.data.customerBooking.map(customer => ({
                        fullName: customer.fullName,
                        nationality: customer.nationality,
                        dateOfBirth: customer.dateOfBirth,
                        sex: customer.sex === 'M' ? 'Nam' : 'Nữ',
                        dateOfIssue: customer.dateOfIssue,
                        placeOfIssue: customer.placeOfIssue,
                        passportNo: customer.passportNo,
                        idCardNo: customer.idCardNo,
                        placeOfBirth: customer.placeOfBirth,
                        dateOfExpiry: customer.dateOfExpiry,
                        issuingAuthority: customer.issuingAuthority,
                        imageUrl: customer.imageURL,
                    }));
                    setCustomersPassport(passportData);
                } else {
                    setError("Không có thông tin khách hàng trong Passport.");
                }
                if (isMounted) {
                    setListCustomers(response.data.customerBooking);
                    const dbImages = customers.map(customer => customer.imageURL).filter(url => !!url);
                    setPreviewImage(prevImages => [...dbImages, ...prevImages]);
                }
            } catch (err) {
                setError('Đã xảy ra lỗi khi tải dữ liệu khách hàng.');
            } finally {
                setLoading(false);
            }
        };
        getListCustomers();
        return () => {
            isMounted = false;
        };
    }, [bookingParams]);
    //#endregion

    //#region Merge customers
    useEffect(() => {
        if (customersEtour.length > 0 || customersPassport.length > 0) {
            let mergedData = [];

            //* Trường hợp không có dữ liệu eTour nhưng có dữ liệu Passport
            if (customersEtour.length === 0 && customersPassport.length > 0) {
                const newMergedData = customersPassport.map(passportCustomer => ({
                    bookingCustomer: null, // Đảm bảo không có thông tin eTour
                    passportCustomer: passportCustomer,
                    imageUrl: passportCustomer.imageUrl // Chỉ lấy hình ảnh từ passport
                }));

                mergedData = [...mergedData, ...newMergedData];
                setMergedCustomers(mergedData);
                return;
            }

            //* Trường hợp có cả eTour và Passport
            customersEtour.forEach(etourCustomer => {
                const matchedPassportCustomer = customersPassport.find(
                    passportCustomer => passportCustomer.passportNo === etourCustomer.documentNumber
                );

                if (matchedPassportCustomer) {
                    mergedData.push({
                        bookingCustomer: {
                            ...etourCustomer,
                            fullName: matchedPassportCustomer.fullName || etourCustomer.fullName,
                            gender: ['m', 'nam', 'male'].includes(matchedPassportCustomer.sex?.toLowerCase()) ? 'Nam' : 'Nữ',
                            dateOfBirth: matchedPassportCustomer.dateOfBirth || etourCustomer.dateOfBirth,
                            issueDate: matchedPassportCustomer.dateOfIssue || etourCustomer.issueDate,
                            expireDate: matchedPassportCustomer.dateOfExpiry || etourCustomer.expireDate,
                            visaInfor: {
                                documentNumber: matchedPassportCustomer.passportNo || etourCustomer.documentNumber
                            },
                            idCardInfor: {
                                documentNumber: matchedPassportCustomer.idCardNo || etourCustomer.idCardNo
                            },
                            birthPlace: matchedPassportCustomer.placeOfBirth || etourCustomer.birthPlace,
                            nationality: matchedPassportCustomer.nationality || etourCustomer.nationality,
                            imageUrl: matchedPassportCustomer.imageUrl || etourCustomer.imageUrl,
                        },
                        passportCustomer: matchedPassportCustomer,
                        imageUrl: matchedPassportCustomer.imageUrl
                    });
                } else {
                    mergedData.push({
                        bookingCustomer: etourCustomer,
                        passportCustomer: null,
                        imageUrl: null // Không có ảnh khi chỉ có dữ liệu eTour
                    });
                }
            });

            // Thêm các khách hàng từ Passport không có trong eTour
            const unmatchedPassportCustomers = customersPassport.filter(
                passportCustomer => !customersEtour.some(
                    etourCustomer => etourCustomer.documentNumber === passportCustomer.passportNo
                )
            );

            unmatchedPassportCustomers.forEach(passportCustomer => {
                mergedData.push({
                    bookingCustomer: null, // Không có etourCustomer, giữ nguyên null
                    passportCustomer: passportCustomer,
                    imageUrl: passportCustomer.imageUrl // Chỉ lấy ảnh từ passport
                });
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
                // extractedData: customersPassport.map((customer) => ({
                //     ...customer,
                //     bookingId: bookingId
                // }))
                extractedData: newPassports.map((customer) => ({
                    ...customer.passportCustomer,
                    bookingId: bookingId
                }))
            };

            const response = await axios.post(`https://beid-extract.vietravel.com/api/Customers/save?bookingId=${bookingId}`, payload, {
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setIsPassportSaved(true);
                setToastMessage('Đã lưu thông tin khách hàng thành công!');
                setToastType('success');
                setTimeout(() => {
                    setToastMessage('');
                    window.location.reload();
                }, 1500);
            } else {
                setToastMessage('Có lỗi ở hệ thống khi lưu thông tin khách hàng.');
                setToastType('error');
                setTimeout(() => setToastMessage(''), 3000);
            }
        } catch (error) {
            setToastMessage('Đã có số Passport trong hệ thống.');
            setToastType('error');
            setTimeout(() => setToastMessage(''), 3000);
        }
    };

    //#endregion

    //#endregion

    //#region ================Function===================

    //#region Picture

    //#region Preview picture
    const handlePreviewPicture = (event) => {
        const files = event.target.files;
        const fileArr = Array.from(files);
        const previewUrls = fileArr.map(file => URL.createObjectURL(file));

        setFileArray(prevFiles => [...prevFiles, ...fileArr]);
        setPreviewImage(prevImages => [...prevImages, ...previewUrls]);
    };


    useEffect(() => {
        setActiveCustomer(null);
    }, [currentPage]);
    //#endregion

    //#region Image click
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
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

    const formatDateToEtour = (dateString) => {
        try {
            if (isDateFormatted(dateString)) {
                return dateString;
            }
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            return `${year}-${month}-${day}`;
        } catch (error) {
            return 'N/A';
        }
    }
    //#endregion

    //#region Delete object
    const handleDeleteObject = async (passportNo) => {
        const queryParams = new URLSearchParams(window.location.search);
        const bookingId = queryParams.get('bookingId');

        if (!bookingId) {
            setToastMessage('Không tìm thấy Booking ID.');
            setToastType('error');
            return;
        }

        // Kiểm tra xem khách hàng đã lưu trong DB hay chưa
        const customerToDelete = mergedCustomers.find(customer => customer.passportCustomer?.passportNo === passportNo);

        // Cập nhật UI để xóa khách hàng
        const updatedMergedCustomers = mergedCustomers.map(customer => {
            if (customer.passportCustomer?.passportNo === passportNo) {
                return { ...customer, passportCustomer: null }; // Xóa khỏi UI
            }
            return customer;
        });

        if (customerToDelete) {
            // Nếu đã lưu trong DB, gọi API để xóa
            try {
                const response = await axios.delete(`http://108.108.110.73:1212/api/Customers/delete/${bookingId}/${passportNo}`, {
                    headers: {
                        'accept': '*/*'
                    }
                });

                if (response.status === 200) {
                    setMergedCustomers(updatedMergedCustomers);
                    setToastMessage('Xóa thông tin khách hàng thành công!');
                    setToastType('success');
                    setTimeout(() => {
                        setToastMessage('');
                        window.location.reload();
                    }, 1500);
                } else {
                    setToastMessage('Có lỗi trong quá trình xóa thông tin khách hàng.');
                    setToastType('error');
                    setTimeout(() => {
                        setToastMessage('');
                        window.location.reload();
                    }, 1500);
                }
            } catch (error) {
                // setToastMessage('Đã có lỗi xảy ra khi xóa thông tin khách hàng.');
                setToastType('error');
                // setTimeout(() => {
                //     setToastMessage('');
                // }, 1500);
            }
        } else {
            // Nếu chưa lưu trong DB, chỉ cần xóa UI và không cần gọi API
            setToastMessage('Đã xóa thông tin khách hàng.');
            setToastType('success');
            setTimeout(() => {
                setToastMessage('');
            }, 1500);
        }
    };

    const handleDeleteNewPassport = async (passportNo) => {
        const queryParams = new URLSearchParams(window.location.search);
        const bookingId = queryParams.get('bookingId');

        if (!bookingId) {
            setToastMessage('Không tìm thấy Booking ID.');
            setToastType('error');
            return;
        }

        // Cập nhật UI để xóa khách hàng
        const updatedMergedCustomers = newPassports.map(customer => {
            if (customer.passportCustomer?.passportNo === passportNo) {
                return { ...customer, passportCustomer: null, imageUrl: "" }; // Xóa khỏi UI
            }
            return customer;
        });

        // chỉ cần xóa UI và không cần gọi API
        setNewPassports(updatedMergedCustomers);
        setToastMessage('Đã xóa thông tin khách hàng.');
        setToastType('success');
        setTimeout(() => {
            setToastMessage('');
        }, 1500);
    };




    //#endregion

    //#region Sending JSON Data
    const handleCopyToClipboard = (event) => {
        event.preventDefault();

        //* Gọi đến hàm lưu 
        // handleSave();

        // * Cập nhật lên etour
        const passportData = mergedCustomers.map(({ passportCustomer }) => {
            return {
                fullName: passportCustomer?.fullName || '',
                nationality: passportCustomer?.nationality || '',
                dateOfBirth: formatDateToEtour(passportCustomer?.dateOfBirth) || '',
                sex: passportCustomer?.sex || '',
                dateOfIssue: formatDateToEtour(passportCustomer?.dateOfIssue) || '',
                placeOfIssue: passportCustomer?.placeOfIssue || '',
                passportNo: passportCustomer?.passportNo || '',
                idCardNo: passportCustomer?.idCardNo || '',
                placeOfBirth: passportCustomer?.placeOfBirth || '',
                dateOfExpiry: formatDateToEtour(passportCustomer?.dateOfExpiry) || '',
                issuingAuthority: passportCustomer?.issuingAuthority || '',
            };
        });

        const message = { copyAll: JSON.stringify(passportData, null, 2) };
        console.log("eTour Data: ", message);

        window.parent.postMessage(message, '*');
    };

    const handleCopyLink = async () => {
        const currentUrl = window.location.href;
        try {
            await navigator.clipboard.writeText(currentUrl);
            setToastMessage('Đã copy link thành công!');
            setToastType('success');
            setTimeout(() => setToastMessage(''), 1500);
        } catch (err) {
            setToastMessage('Đã xảy ra lỗi khi copy link.');
            setToastType('error');
            setTimeout(() => setToastMessage(''), 1500);
        }
    }

    //#endregion

    //#region Pagination
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const totalPages = Math.ceil(mergedCustomers.length / customersPerPage);

    // const currentCustomers = mergedCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
    const savedCustomerList = mergedCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

    const currentCustomers = newPassports.slice(indexOfFirstCustomer, indexOfLastCustomer);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    //#endregion

    //#endregion

    return (
        <div className='w-full min-h-screen p-4 mobile:p-0'>
            <div className='flex justify-between items-center mobile:flex mobile:flex-col'>
                {/* <button className='btn btn-info no-animation mobile:h-auto mobile:text-balance translate-y-[17px] mobile:mb-8' onClick={handleButtonClickRoute}>
                    Đọc CCCD/CMND
                </button> */}
                <button
                    className="btn mobile:mt-2"
                    onClick={() => document.getElementById('my_modal_2').showModal()}
                >
                    Hiển thị QR Code
                </button>

                <dialog id="my_modal_2" className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Mã QR Code</h3>
                        <div className="flex justify-center py-4">
                            <QRCode value={qrCodeUrl} />
                        </div>
                        <div className='flex justify-center items-center mt-2'>
                            <p onClick={handleCopyLink} className='cursor-pointer font-semibold underline'>
                                Nhấn vào đây kể copy link!
                            </p>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Đính kèm ảnh Passport</span>
                    </div>
                    <input type="file" accept='image/*' multiple onChange={handlePreviewPicture}
                        className="file-input file-input-bordered file-input-accent max-w-xs w-full flex-none" />
                </label>
            </div>
            {/* <div>
                <PreviewImageLayout previewImage={previewImage} />
            </div> */}
            <div className="w-full justify-center py-6">
                <div className="gap-4 mobile:flex mobile:flex-col">
                    <div className="mobile:p-4">
                        <div className='grid grid-cols-2 mobile:hidden'>
                            <h3 className="font-semibold text-center text-2xl mb-2 mobile:text-lg mobile:uppercase">Danh
                                sách eTour</h3>
                            <h3 className="font-semibold text-center text-2xl mb-2 mobile:text-lg mobile:uppercase">Danh
                                sách Passport</h3>
                        </div>
                        <ButtonActions
                            loadingPassports={loadingPassports}
                            handleSave={handleSave}
                            handleCopyToClipboard={handleCopyToClipboard}
                            handleImageClick={handleImageClick}
                            previewImage={previewImage}
                            handleClose={handleClose}
                        />
                        <ToastMessageLayout toastMessage={toastMessage} toastType={toastType} />
                        <div className='saved'>
                            {savedCustomerList.length > 0 ? (
                                savedCustomerList.map((customerPair, index) => {
                                    const etourCustomer = customerPair.bookingCustomer;
                                    const passportCustomer = customerPair.passportCustomer;
                                    const displayCustomer = etourCustomer || passportCustomer;
                                    const imageUrl = customerPair.imageUrl || displayCustomer?.imageUrl;
                                    return (
                                        <div className="p-4 rounded-2xl grid grid-cols-2 gap-4 mobile:flex mobile:flex-col"
                                            key={index}>
                                            <CustomersEtourLayout
                                                key={`${index}-etour`}
                                                customerPair={customerPair}
                                                index={index}
                                                activeCustomer={activeCustomer}
                                                setActiveCustomer={setActiveCustomer}
                                                loading={loading}
                                                progress={progress}
                                            />
                                            <PassportCard key={`${index}-passport`}
                                                passportCustomer={passportCustomer}
                                                etourCustomer={etourCustomer}
                                                loadingPassports={loadingPassports}
                                                progress={progress}
                                                handleDeleteObject={handleDeleteObject}
                                                onSave={handleSave}
                                                isEditable={false}
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col justify-center items-center py-4">
                                    {loading ? (
                                        <div className='flex items-center justify-center gap-4'>
                                            <p className='font-semibold flex justify-center items-center text-center mt-4 gap-2'>
                                                Đang tải dữ liệu khách hàng...
                                            </p>
                                            <span className="loading loading-spinner loading-lg translate-y-1"></span>
                                        </div>
                                    ) : (
                                        <>
                                            <p className='font-semibold flex justify-center items-center text-center mt-4 gap-2'>
                                                Không có dữ liệu khách hàng đã lưu
                                                <UserRoundX />
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}</div>
                        <div className='divider' />
                        <div className='flex justify-center items-center py-4'>
                            <p className='text-xl font-semibold'>
                                Danh sách khách hàng mới
                            </p>
                        </div>
                        <div className='current'>
                            {currentCustomers.length > 0 ? (
                                currentCustomers.map((customerPair, index) => {
                                    const etourCustomer = customerPair.bookingCustomer;
                                    const passportCustomer = customerPair.passportCustomer;
                                    const displayCustomer = etourCustomer || passportCustomer;
                                    const imageUrl = customerPair.imageUrl || displayCustomer?.imageUrl;
                                    return (
                                        <div className="p-4 rounded-2xl grid grid-cols-2 gap-4 mobile:flex mobile:flex-col"
                                            key={index}>
                                            <CustomersEtourLayout
                                                key={`${index}-newEtour`}
                                                customerPair={customerPair}
                                                index={index}
                                                activeCustomer={activeCustomer}
                                                setActiveCustomer={setActiveCustomer}
                                                loading={loading}
                                                progress={progress}
                                            />
                                            <PassportCard key={`${index}-newPassport`}
                                                passportCustomer={passportCustomer}
                                                etourCustomer={etourCustomer}
                                                loadingPassports={loadingPassports}
                                                progress={progress}
                                                handleDeleteObject={handleDeleteNewPassport}
                                                onSave={handleSave}
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col justify-center items-center py-4">
                                    {loadingPassports ? (
                                        <div className='flex items-center justify-center gap-4'>
                                            <p className='font-semibold flex justify-center items-center text-center mt-4 gap-2'>
                                                Đang tải dữ liệu khách hàng...
                                            </p>
                                            <span className="loading loading-spinner loading-lg translate-y-1"></span>
                                        </div>
                                    ) : (
                                        <>
                                            <p className='font-semibold flex justify-center items-center text-center mt-4 gap-2'>
                                                Chưa có thông tin khách hàng mới
                                                <UserRoundX />
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <FooterLayout totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />
        </div>
    );
}

export default PassportRead;
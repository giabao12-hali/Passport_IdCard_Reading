/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Frown, UserRoundX } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import FooterLayout from './layout/footer';
import PreviewImageLayout from './layout/preview_image';
import ButtonActions from './layout/button_actions';
import ToastMessageLayout from './layout/toast';
import { Cloudinary } from '@cloudinary/url-gen/index';
import { scale } from '@cloudinary/url-gen/actions/resize';
import CustomersEtourLayout from './layout/customers/customerEtour_layout';

const IdCardRead = () => {
    // customer state
    const [customersEtour, setCustomersEtour] = useState([]); //* mảng A
    const [customersIdCard, setCustomersIdCard] = useState([]); //* mảng B list từ api
    const [listCustomers, setListCustomers] = useState([]); //* mảng C upload file
    const [mergedCustomers, setMergedCustomers] = useState([]); //* mảng D = B + C

    // qrcode state
    const qrCodeUrl = window.location.href;

    // query params state
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const bookingParams = queryParams.get('bookingId');
    const [bookingId, setBookingId] = useState(null)
    const navigate = useNavigate();

    // loading & error state
    const [loading, setLoading] = useState(false);
    const [loadingIdCards, setLoadingIdCards] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [errorIdCard, setErrorIdCard] = useState(null);

    // search state
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

    useEffect(() => {
        document.title = 'Trích xuất thông tin CCCD/CMND';
    })

    const handleButtonClickRoute = () => {
        navigate(`/passport-read?bookingId=${bookingId}`);
    }

    const cld = new Cloudinary({
        cloud: {
            cloudName: 'dtjipla6s',
        },
    })

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'passportPresets');

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/dtjipla6s/image/upload`,
            formData
        );

        const publicId = response.data.public_id;

        //* Resize ảnh
        const image = cld.image(publicId)
            .resize(scale().width(1000).height(1000))
            .format('auto');

        return image.toURL();
    }

    //#region API
    useEffect(() => {
        const fetchCustomers = async () => {
            if (!bookingParams) return;
            try {
                setLoading(true);
                const response = await axios.get(`https://api2.travel.com.vn/local/etour/Booking/GetBookingMember?BookingId=${bookingParams}`);

                if (!response.data.response) {
                    setCustomersEtour([]);
                }
                if (response.data.response.bookingId) {
                    setCustomersEtour(response.data.response.bookingId)
                }

                const { status, code, response: bookingResponse } = response.data;
                if (status != 1 || code != 200 || !bookingResponse) {
                    setCustomersEtour([]);
                    setError("Hệ thống đã xảy ra lỗi hoặc không có dữ liệu");
                    return;
                }

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
                    dateOfBirth: member.idCardInfor?.dateOfBirth || 'N/A',
                    issueDate: member.idCardInfor?.issueDate || 'Chưa có thông tin',
                    expireDate: member.idCardInfor?.expireDate || 'Chưa có thông tin',
                    documentNumber: member.idCardInfor?.documentNumber || 'Chưa có thông tin',
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

    useEffect(() => {
        const fetchIdCardData = async () => {
            if (fileArray.length === 0) return;

            try {
                setLoadingIdCards(true);
                setError(null);

                const formData = new FormData();
                fileArray.forEach(file => {
                    formData.append('imageFiles', file);
                    formData.append('languageHint', 'en');
                });

                const cloudinaryPromises = fileArray.map(file => uploadToCloudinary(file));
                const cloudinaryUrls = await Promise.all(cloudinaryPromises);

                const visionResponse = await axios.post('https://beid-extract.vietravel.com/api/Vision/upload?language=en', formData, {
                    headers: {
                        'Access-Control-Allow-Origin': 'https://beid-extract.vietravel.com',
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                    }
                });

                const extractedIdCards = visionResponse.data.passports;
                if (!extractedIdCards || extractedIdCards.length === 0) {
                    throw new Error('Không có chuỗi JSON nào được trích xuất từ hình ảnh.');
                }

                const idCardsData = extractedIdCards.map((idCard, index) => ({
                    ...idCard,
                    imageUrl: cloudinaryUrls[index]
                }))

                setCustomersIdCard(idCardsData);

                if (!customersEtour || customersEtour.length === 0) {
                    const customerDataFromIdCards = idCardsData.map((idCard, index) => ({
                        memberId: `extracted-${index}`,
                        fullName: idCard.fullName,
                        gender: ['m', 'nam', 'male'].includes(idCard.sex?.toLowerCase()) ? 'Nam' : 'Nữ',
                        dateOfBirth: idCard.dateOfBirth || 'N/A',
                        issueDate: idCard.dateOfIssue || 'Chưa có thông tin',
                        expireDate: idCard.dateOfExpiry || 'Chưa có thông tin',
                        documentNumber: idCard.idCardNo || 'Chưa có thông tin',
                        birthPlace: idCard.placeOfBirth || 'Chưa có thông tin',
                        nationality: idCard.nationality || 'Chưa có thông tin',
                        imageUrl: idCard.imageUrl
                    }));

                    setCustomersEtour(customerDataFromIdCards);
                }
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
        if (!bookingParams) return;
        let isMounted = true;
        const getListCustomers = async () => {
            try {
                const response = await axios.get(`https://beid-extract.vietravel.com/api/Customers/get-list-customers-by-bookingId/${bookingParams}`);
                const customers = response.data.customerBooking;
                if (customers && customers.length > 0) {
                    const idCardData = response.data.customerBooking.map(customer => ({
                        fullName: customer.fullName,
                        nationality: customer.nationality,
                        dateOfBirth: customer.dateOfBirth,
                        sex: customer.sex === 'M' ? 'Nam' : 'Nữ',
                        dateOfIssue: customer.dateOfIssue,
                        placeOfIssue: customer.placeOfIssue,
                        idCardNo: customer.idCardNo,
                        placeOfBirth: customer.placeOfBirth,
                        dateOfExpiry: customer.dateOfExpiry,
                        issuingAuthority: customer.issuingAuthority,
                        imageUrl: customer.imageURL,
                    }));
                    setCustomersIdCard(idCardData);
                } else {
                    setError("Không có thông tin khách hàng trong CCCD/CMND.");
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

    //#region Merge customers
    useEffect(() => {
        if (customersEtour.length > 0 || listCustomers.length > 0 || customersIdCard.length > 0) {
            let updatedListCustomers = [...listCustomers];
            let mergedData = [];

            //* Trường hợp không có dữ liệu eTour nhưng có dữ liệu Passport
            if (customersEtour.length === 0 && customersIdCard.length > 0) {
                const newMergedData = customersIdCard.map(idCardCustomer => ({
                    bookingCustomer: {
                        memberId: `extracted-${idCardCustomer.idCardNo}`,
                        fullName: idCardCustomer.fullName,
                        gender: ['m', 'nam', 'male'].includes(idCardCustomer.sex?.toLowerCase()) ? 'Nam' : 'Nữ',
                        dateOfBirth: idCardCustomer.dateOfBirth || 'N/A',
                        issueDate: idCardCustomer.dateOfIssue || 'Chưa có thông tin',
                        expireDate: idCardCustomer.dateOfExpiry || 'Chưa có thông tin',
                        documentNumber: idCardCustomer.idCardNo || 'Chưa có thông tin',
                        birthPlace: idCardCustomer.placeOfBirth || 'Chưa có thông tin',
                        nationality: idCardCustomer.nationality || 'Chưa có thông tin',
                        imageUrl: idCardCustomer.imageUrl
                    },
                    idCardCustomer: idCardCustomer,
                    imageUrl: idCardCustomer.imageUrl
                }));

                mergedData = [...mergedData, ...newMergedData];
                setMergedCustomers(mergedData);
                return;
            }

            //* Trường hợp có cả eTour và passport
            customersEtour.forEach(etourCustomer => {
                const matchedIdCardCustomer = customersIdCard.find(
                    idCardCustomer => idCardCustomer.idCardNo === etourCustomer.documentNumber
                )

                if (matchedIdCardCustomer) {
                    updatedListCustomers.push(matchedIdCardCustomer);
                    mergedData.push({
                        bookingCustomer: {
                            ...etourCustomer,
                            fullName: matchedIdCardCustomer.fullName || etourCustomer.fullName,
                            gender: ['m', 'nam', 'male'].includes(matchedIdCardCustomer.sex?.toLowerCase()) ? 'Nam' : 'Nữ',
                            dateOfBirth: matchedIdCardCustomer.dateOfBirth || etourCustomer.dateOfBirth,
                            issueDate: matchedIdCardCustomer.dateOfIssue || etourCustomer.issueDate,
                            expireDate: matchedIdCardCustomer.dateOfExpiry || etourCustomer.expireDate,
                            documentNumber: matchedIdCardCustomer.idCardNo || etourCustomer.documentNumber,
                            birthPlace: matchedIdCardCustomer.placeOfBirth || etourCustomer.birthPlace,
                            nationality: matchedIdCardCustomer.nationality || etourCustomer.nationality,
                            imageUrl: matchedIdCardCustomer.imageUrl || etourCustomer.imageUrl,
                        },
                        idCardCustomer: matchedIdCardCustomer,
                        imageUrl: matchedIdCardCustomer.imageUrl
                    });
                } else {
                    mergedData.push({
                        bookingCustomer: etourCustomer,
                        idCardCustomer: null,
                        imageUrl: null,
                    });
                }
            });

            const unmatchedIdCardCustomers = customersIdCard.filter(
                idCardCustomer => !customersEtour.some(
                    etourCustomer => etourCustomer.documentNumber === idCardCustomer.idCardNo
                )
            );

            unmatchedIdCardCustomers.forEach(idCardCustomer => {
                updatedListCustomers.push(idCardCustomer);
                mergedData.push({
                    bookingCustomer: {
                        memberId: `extracted-${idCardCustomer.idCardNo}`,
                        fullName: idCardCustomer.fullName,
                        gender: ['m', 'nam', 'male'].includes(idCardCustomer.sex?.toLowerCase()) ? 'Nam' : 'Nữ',
                        dateOfBirth: idCardCustomer.dateOfBirth || 'N/A',
                        issueDate: idCardCustomer.dateOfIssue || 'Chưa có thông tin',
                        expireDate: idCardCustomer.dateOfExpiry || 'Chưa có thông tin',
                        documentNumber: idCardCustomer.idCardNo || 'Chưa có thông tin',
                        birthPlace: idCardCustomer.placeOfBirth || 'Chưa có thông tin',
                        nationality: idCardCustomer.nationality || 'Chưa có thông tin',
                        imageUrl: idCardCustomer.imageUrl
                    },
                    idCardCustomer: idCardCustomer,
                    imageUrl: idCardCustomer.imageUrl
                });
            });

            setMergedCustomers(prevMergedCustomers => {
                const uniqueData = mergedData.filter(newItem =>
                    !prevMergedCustomers.some(existingItem => existingItem.idCardCustomer?.idCardNo === newItem.idCardCustomer?.idCardNo)
                );

                return [...prevMergedCustomers, ...uniqueData];
            })

        }
    }, [customersEtour, listCustomers, customersIdCard]);

    //#endregion
    //#endregion

    //#region Save API
    const handleSave = async (editedCustomer) => {
        try {
            const queryParams = new URLSearchParams(window.location.search);
            const bookingId = queryParams.get('bookingId');

            if (!bookingId) {
                setToastMessage('Không tìm thấy Booking ID.');
                setToastType('error');
                return;
            }

            // const payload = {
            //     extractedData: customersIdCard.map((customer) => ({
            //         type: customer.type,
            //         fullName: customer.fullName,
            //         nationality: customer.nationality,
            //         dateOfBirth: customer.dateOfBirth,
            //         sex: customer.sex,
            //         dateOfIssue: customer.dateOfIssue,
            //         placeOfIssue: customer.placeOfIssue,
            //         passportNo: customer.passportNo,
            //         placeOfBirth: customer.placeOfBirth,
            //         idCardNo: customer.idCardNo,
            //         dateOfExpiry: customer.dateOfExpiry,
            //         issuingAuthority: customer.issuingAuthority,
            //         bookingId: bookingId
            //     }))
            // };

            const payload = {
                extractedData: customersEtour.map((customer) => ({
                    ...customer,
                    ...editedCustomer // cập nhật thông tin từ editedCustomer
                }))
            };

            const response = await axios.post(`https://beid-extract.vietravel.com/api/Customers/save?bookingId=${bookingId}`, payload, {
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
                    window.location.reload(); // Tải lại trang sau khi lưu thành công
                }, 1500);
            } else {
                setToastMessage('Có lỗi ở hệ thống khi lưu thông tin khách hàng.');
                setToastType('error');
                setTimeout(() => setToastMessage(''), 1500);

            }
        } catch (error) {
            setToastMessage('Đã có dữ liệu của CCCD/CMND trong hệ thống.');
            setToastType('error');
            setTimeout(() => setToastMessage(''), 1500);
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

        setFileArray(prevFiles => [...prevFiles, ...fileArr]);
        setPreviewImage(prevImages => [...prevImages, ...previewUrls]);
    };

    useEffect(() => {
        setActiveCustomer(null); // Reset khi chuyển trang
    }, [currentPage]);

    const handleShowImage = (index) => {
        if (activeCustomer === index) {
            setActiveCustomer(null); // Nếu đang xem hình của người này thì ẩn hình ảnh
        } else {
            setActiveCustomer(index); // Cập nhật người đang xem hình ảnh
        }
    };
    //#endregion

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const handleClose = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.close();
    };

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

    //#region Delete object
    const handleDeleteObject = (idCardNo) => {
        const updatedMergedCustomers = mergedCustomers.map(customer => {
            if (customer.idCardCustomer?.idCardNo === idCardNo) {
                return { ...customer, idCardCustomer: null };
            }
            return customer;
        });

        setMergedCustomers(updatedMergedCustomers);
    };

    //#endregion

    //#region Sending JSON Data
    const handleCopyToClipboard = (event) => {
        event.preventDefault();

        const idCardData = mergedCustomers.map(({ idCardCustomer }) => {
            return {
                fullName: idCardCustomer?.fullName || '',
                nationality: idCardCustomer?.nationality || '',
                dateOfBirth: idCardCustomer?.dateOfBirth || '',
                sex: idCardCustomer?.sex || '',
                dateOfIssue: idCardCustomer?.dateOfIssue || '',
                placeOfIssue: idCardCustomer?.placeOfIssue || '',
                idCardNo: idCardCustomer?.idCardNo || '',
                placeOfBirth: idCardCustomer?.placeOfBirth || '',
                dateOfExpiry: idCardCustomer?.dateOfExpiry || '',
                issuingAuthority: idCardCustomer?.issuingAuthority || '',
            };
        });

        const message = { copyAll: JSON.stringify(idCardData, null, 2) };

        alert('Dữ liệu đã được gửi đến hệ thống eTour!');
        console.log("Dữ liệu JSON gửi đi: ", idCardData);

        window.parent.postMessage(message, '*');
    };

    //#endregion
    //#endregion

    //#region Pagination
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;

    const totalPages = Math.ceil(mergedCustomers.length / customersPerPage);

    const currentCustomers = mergedCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);


    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    //#endregion
    return (
        <div className='w-full min-h-screen p-4 mobile:p-0 tablet:p-4'>
            <div className='flex justify-between items-center mobile:flex mobile:flex-col'>
                <button className='btn btn-info no-animation mobile:h-auto mobile:text-balance translate-y-[17px] mobile:mb-8' onClick={handleButtonClickRoute}>Đọc Passport</button>
                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Đính kèm ảnh CCCD/CMND</span>
                    </div>
                    <input type="file" accept='image/*' multiple onChange={handlePreviewPicture} className="file-input file-input-bordered file-input-accent max-w-xs w-full flex-none" />
                </label>
            </div>
            <div>
                <PreviewImageLayout previewImage={previewImage} />
            </div>
            <div className="w-full justify-center py-6">
                <div className="gap-4 mobile:flex mobile:flex-col">
                    <div className="mobile:p-4">
                        <div className='grid grid-cols-2 mobile:hidden'>
                            <h3 className="font-semibold text-center text-2xl mb-2 mobile:text-lg mobile:uppercase">Danh sách eTour</h3>
                            <h3 className="font-semibold text-center text-2xl mb-2 mobile:text-lg mobile:uppercase">Danh sách CCCD/CMND</h3>
                        </div>

                        <ButtonActions
                            loadingPassports={loadingIdCards}
                            handleSave={handleSave}
                            handleCopyToClipboard={handleCopyToClipboard}
                            handleImageClick={handleImageClick}
                            previewImage={previewImage}
                            handleClose={handleClose}
                            qrCodeUrl={qrCodeUrl}
                        />
                        <ToastMessageLayout toastMessage={toastMessage} toastType={toastType} />
                        {currentCustomers.length > 0 ? (
                            currentCustomers.map((customerPair, index) => {
                                const etourCustomer = customerPair.bookingCustomer;
                                const idCardCustomer = customerPair.idCardCustomer;
                                const displayCustomer = etourCustomer || idCardCustomer;
                                const imageUrl = customerPair.imageUrl || displayCustomer?.imageUrl;

                                return (
                                    <div key={index} className="p-4 rounded-2xl grid grid-cols-2 gap-4 mobile:flex mobile:flex-col">
                                        <CustomersEtourLayout
                                            key={index}
                                            customerPair={customerPair}
                                            index={index}
                                            activeCustomer={activeCustomer}
                                            setActiveCustomer={setActiveCustomer}
                                            loading={loading}
                                            progress={progress}
                                        />

                                        {loadingIdCards ? (
                                            <div className="flex flex-col justify-center items-center">
                                                <div className="radial-progress" style={{ "--value": progress }} role="progressbar">{progress}%</div>
                                                <p className='font-semibold flex justify-center items-center text-center mt-4'>Đang tải toàn bộ dữ liệu khách hàng...</p>
                                            </div>
                                        ) : errorIdCard ? (
                                            <div className="flex justify-center items-center mobile:flex-col">
                                                <p className='font-semibold flex justify-center items-center text-center'>Đã có lỗi xảy ra ở phía hệ thống, vui lòng thử lại sau</p>
                                                <Frown className='ml-2 w-6 mobile:mt-2' />
                                            </div>
                                        ) : (
                                            <div>
                                                {idCardCustomer ? (
                                                    <div>

                                                        <div className='bg-yellow-200 p-4 rounded-xl'>

                                                            <p className='font-bold'>Họ tên:
                                                                <span className={(etourCustomer && cleanString(etourCustomer.fullName) !== cleanString(idCardCustomer.fullName)) ? "text-red-600" : ""}>
                                                                    &nbsp;{idCardCustomer.fullName || 'Chưa có thông tin'}
                                                                </span>
                                                            </p>
                                                            <p>Giới tính:
                                                                <span className={(etourCustomer && cleanString(etourCustomer.gender) !== cleanString(formatGender(idCardCustomer.sex))) ? "text-red-600" : ""}>
                                                                    &nbsp;{formatGender(idCardCustomer.sex) || 'Chưa có thông tin'}
                                                                </span>
                                                            </p>
                                                            <p>Nơi sinh:
                                                                <span className={(etourCustomer && cleanString(etourCustomer.birthPlace) !== cleanString(idCardCustomer.placeOfBirth)) ? "text-red-600" : ""}>
                                                                    &nbsp;{idCardCustomer.placeOfBirth || 'Chưa có thông tin'}
                                                                </span>
                                                            </p>
                                                            <p>Quốc tịch:
                                                                <span className={(etourCustomer && cleanString(etourCustomer.nationality) !== cleanString(idCardCustomer.nationality)) ? "text-red-600" : ""}>
                                                                    &nbsp;{idCardCustomer.nationality || 'Chưa có thông tin'}
                                                                </span>
                                                            </p>
                                                            <p className='font-bold'>Số CCCD/CMND:
                                                                <span className={(etourCustomer && etourCustomer.documentNumber !== idCardCustomer.idCardNo) ? "text-red-600" : ""}>
                                                                    &nbsp;{idCardCustomer.idCardNo || 'Chưa có thông tin'}
                                                                </span>
                                                            </p>
                                                            <p>Ngày sinh:
                                                                <span className={(etourCustomer && formatDate(etourCustomer.dateOfBirth) !== formatDate(idCardCustomer.dateOfBirth)) ? "text-red-600" : ""}>
                                                                    &nbsp;{formatDate(idCardCustomer.dateOfBirth) || 'Chưa có thông tin'}
                                                                </span>
                                                            </p>
                                                            <p>Ngày cấp:
                                                                <span className={(etourCustomer && formatDate(etourCustomer.issueDate) !== formatDate(idCardCustomer.dateOfIssue)) ? "text-red-600" : ""}>
                                                                    &nbsp;{formatDate(idCardCustomer.dateOfIssue) || 'Chưa có thông tin'}
                                                                </span>
                                                            </p>
                                                            <p>Ngày hết hạn:
                                                                <span className={(etourCustomer && formatDate(etourCustomer.expireDate) !== formatDate(idCardCustomer.dateOfExpiry)) ? "text-red-600" : ""}>
                                                                    &nbsp;{formatDate(idCardCustomer.dateOfExpiry) || 'Chưa có thông tin'}
                                                                </span>
                                                            </p>
                                                            <div className='flex justify-end'>
                                                                <button
                                                                    className="group relative flex h-12 w-12 flex-col items-center justify-center overflow-hidden rounded-xl bg-red-400 hover:bg-red-600"
                                                                    onClick={() => handleDeleteObject(idCardCustomer.idCardNo)}
                                                                >
                                                                    <svg
                                                                        viewBox="0 0 1.625 1.625"
                                                                        className="absolute -top-7 fill-white delay-100 group-hover:top-6 group-hover:animate-[spin_1.4s] group-hover:duration-1000"
                                                                        height="10"
                                                                        width="10"
                                                                    >
                                                                        <path
                                                                            d="M.471 1.024v-.52a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099h-.39c-.107 0-.195 0-.195-.195"
                                                                        ></path>
                                                                        <path
                                                                            d="M1.219.601h-.163A.1.1 0 0 1 .959.504V.341A.033.033 0 0 0 .926.309h-.26a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099v-.39a.033.033 0 0 0-.032-.033"
                                                                        ></path>
                                                                        <path
                                                                            d="m1.245.465-.15-.15a.02.02 0 0 0-.016-.006.023.023 0 0 0-.023.022v.108c0 .036.029.065.065.065h.107a.023.023 0 0 0 .023-.023.02.02 0 0 0-.007-.016"
                                                                        ></path>
                                                                    </svg>
                                                                    <svg
                                                                        width="16"
                                                                        fill="none"
                                                                        viewBox="0 0 39 7"
                                                                        className="origin-right duration-500 group-hover:rotate-90"
                                                                    >
                                                                        <line strokeWidth="4" stroke="white" y2="5" x2="39" y1="5"></line>
                                                                        <line
                                                                            strokeWidth="3"
                                                                            stroke="white"
                                                                            y2="1.5"
                                                                            x2="26.0357"
                                                                            y1="1.5"
                                                                            x1="12"
                                                                        ></line>
                                                                    </svg>
                                                                    <svg width="12" fill="none" viewBox="0 0 33 39" className="">
                                                                        <mask fill="white" id="path-1-inside-1_8_19">
                                                                            <path
                                                                                d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"
                                                                            ></path>
                                                                        </mask>
                                                                        <path
                                                                            mask="url(#path-1-inside-1_8_19)"
                                                                            fill="white"
                                                                            d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                                                                        ></path>
                                                                        <path strokeWidth="4" stroke="white" d="M12 6L12 29"></path>
                                                                        <path strokeWidth="4" stroke="white" d="M21 6V29"></path>
                                                                    </svg>
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
                            })
                        ) : (
                            <div className="flex justify-center items-center mobile:flex-col py-4">
                                <p className='font-semibold text-balance text-center'>Không tìm thấy khách hàng</p>
                                <UserRoundX className='ml-2 w-6 mobile:mt-2' />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <FooterLayout totalPages={totalPages} currentPage={currentPage} />
        </div>
    );
}

export default IdCardRead;
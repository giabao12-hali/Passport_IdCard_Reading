/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Frown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import FooterLayout from './layout/footer';
import PreviewImageLayout from './layout/preview_image';
import ButtonActions from './layout/button_actions';
import ToastMessageLayout from './layout/toast';
import { Cloudinary } from '@cloudinary/url-gen/index';
import { scale } from '@cloudinary/url-gen/actions/resize';

const PassportRead = () => {
    // customer state
    const [customersEtour, setCustomersEtour] = useState([]); //* mảng A
    const [listCustomers, setListCustomers] = useState([]); //* mảng B list từ api
    const [customersPassport, setCustomersPassport] = useState([]); //* mảng C upload file
    const [totalGuest, setTotalGuest] = useState(0);
    const [totalGuestPassports, setTotalGuestPassports] = useState(0);

    const [mergedCustomers, setMergedCustomers] = useState([]); //* mảng D = B + C

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

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const customersPerPage = 5;

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

    //#region Cloudinary
    const cld = new Cloudinary({
        cloud: {
            cloudName: 'dtjipla6s',
        },
    });

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'passportPresets');

        //* Upload ảnh lên Cloudinary
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
    };
    //#endregion


    //#region API

    //#region Call API

    //#region Get Booking ID
    useEffect(() => {
        const fetchCustomers = async () => {
            if (!bookingId) return;
            try {
                setLoading(true);
                const response = await axios.get(`http://108.108.110.22:4105/api/Booking/GetBookingMember?BookingId=${bookingId}`);

                if (!response.data.response) {
                    setCustomersPassport([]);
                }

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
    //#endregion

    //#region Upload Passport & Extracted API
    useEffect(() => {
        const fetchPassportData = async () => {
            if (fileArray.length === 0) return;

            try {
                setLoadingPassports(true);
                setError(null);

                const formData = new FormData();
                fileArray.forEach(file => {
                    formData.append('imageFile', file);
                });

                //* Cloudinary
                const cloudinaryPromises = fileArray.map(file => uploadToCloudinary(file));
                const cloudinaryUrls = await Promise.all(cloudinaryPromises);

                //* Vision Google API
                const visionResponse = await axios.post('http://108.108.110.73:1212/api/Vision/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                    }
                });

                const extractedTexts = visionResponse.data.extractedTexts;
                if (!extractedTexts || extractedTexts.length === 0) {
                    throw new Error('Không có chuỗi JSON nào được trích xuất từ ảnh.');
                }

                //* Extracted Text
                const data = JSON.stringify({ extractedTexts });
                const apiURL = fileArray.length === 1
                    ? 'http://108.108.110.113:8086/api/v1/get-o-result'
                    : 'http://108.108.110.113:8086/api/v1/get-o-array';

                const response = await axios.post(apiURL, data, {
                    headers: { 'Content-Type': 'text/plain' },
                });

                //* Update data imageURL
                const passportsData = fileArray.length === 1
                    ? [{ ...response.data, imageUrl: cloudinaryUrls[0] }]
                    : response.data.passports.map((passport, index) => ({
                        ...passport, imageUrl: cloudinaryUrls[index]
                    }));

                setCustomersPassport(passportsData);
                setTotalGuestPassports(passportsData.length);

                //* If eTour response = null
                if (!customersEtour || customersEtour.length === 0) {
                    const customerDataFromPassports = passportsData.map((passport, index) => ({
                        memberId: `extracted-${index}`,
                        fullName: passport.fullName,
                        gender: passport.sex === 'M' ? 'Nam' : 'Nữ',
                        dateOfBirth: passport.dateOfBirth || 'N/A',
                        issueDate: passport.dateOfIssue || 'Chưa có thông tin',
                        expireDate: passport.dateOfExpiry || 'Chưa có thông tin',
                        documentNumber: passport.passportNo || 'Chưa có thông tin',
                        birthPlace: passport.placeOfBirth || 'Chưa có thông tin',
                        nationality: passport.nationality || 'Chưa có thông tin',
                        imageUrl: passport.imageUrl
                    }));

                    setCustomersEtour(customerDataFromPassports);
                }

            } catch (error) {
                setError('Đã xảy ra lỗi khi tải dữ liệu Passport.');
            } finally {
                setLoadingPassports(false);
            }
        };

        if (fileArray.length > 0) {
            fetchPassportData();
        }
    }, [fileArray]);


    //#endregion




    //#endregion

    //#region Get list customers by bookingId
    useEffect(() => {
        if (!bookingId) return;
        let isMounted = true;

        const getListCustomers = async () => {
            try {
                const response = await axios.get(`http://108.108.110.73:1212/api/Customers/get-list-customers-by-bookingId/${bookingId}`);
                const customers = response.data.customerBooking;

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
    }, [bookingId]);
    //#endregion

    //#region Merge customers
    useEffect(() => {
        if (customersEtour.length > 0 || listCustomers.length > 0 || customersPassport.length > 0) {
            let updatedListCustomers = [...listCustomers];
            let mergedData = [];

            //* Trường hợp không có dữ liệu eTour
            if (customersEtour.length === 0 && customersPassport.length > 0) {
                mergedData = customersPassport.map(passportCustomer => ({
                    bookingCustomer: {
                        memberId: `extracted-${passportCustomer.passportNo}`,
                        fullName: passportCustomer.fullName,
                        gender: passportCustomer.sex === 'M' ? 'Nam' : 'Nữ',
                        dateOfBirth: passportCustomer.dateOfBirth || 'N/A',
                        issueDate: passportCustomer.dateOfIssue || 'Chưa có thông tin',
                        expireDate: passportCustomer.dateOfExpiry || 'Chưa có thông tin',
                        documentNumber: passportCustomer.passportNo || 'Chưa có thông tin',
                        birthPlace: passportCustomer.placeOfBirth || 'Chưa có thông tin',
                        nationality: passportCustomer.nationality || 'Chưa có thông tin',
                        imageUrl: passportCustomer.imageUrl
                    },
                    passportCustomer: passportCustomer,
                    imageUrl: passportCustomer.imageUrl
                }));
                setMergedCustomers(mergedData);
                return;
            }

            //* Trường hợp có cả eTour và passport
            customersPassport.forEach(passportCustomer => {
                const indexInListCustomers = updatedListCustomers.findIndex(
                    customer => customer.passportNo === passportCustomer.passportNo
                );

                if (indexInListCustomers !== -1) {
                    updatedListCustomers[indexInListCustomers] = {
                        ...updatedListCustomers[indexInListCustomers],
                        ...passportCustomer
                    };
                } else {
                    updatedListCustomers.push(passportCustomer);
                }
            });

            customersEtour.forEach(etourCustomer => {
                const matchedPassportCustomer = updatedListCustomers.find(
                    passportCustomer => passportCustomer.passportNo === etourCustomer.documentNumber
                );

                if (matchedPassportCustomer) {
                    mergedData.push({
                        bookingCustomer: etourCustomer,
                        passportCustomer: matchedPassportCustomer,
                        imageUrl: matchedPassportCustomer.imageUrl
                    });
                } else {
                    mergedData.push({
                        bookingCustomer: {
                            memberId: `extracted-${etourCustomer.documentNumber}`,
                            fullName: etourCustomer.fullName || 'Chưa có thông tin',
                            gender: etourCustomer.gender || 'Chưa có thông tin',
                            dateOfBirth: etourCustomer.dateOfBirth || 'Chưa có thông tin',
                            issueDate: etourCustomer.issueDate || 'Chưa có thông tin',
                            expireDate: etourCustomer.expireDate || 'Chưa có thông tin',
                            documentNumber: etourCustomer.documentNumber || 'Chưa có thông tin',
                            birthPlace: etourCustomer.birthPlace || 'Chưa có thông tin',
                            nationality: etourCustomer.nationality || 'Chưa có thông tin',
                            imageUrl: null
                        },
                        passportCustomer: null,
                        imageUrl: null
                    });
                }
            });

            const unmatchedPassportCustomers = updatedListCustomers.filter(
                passportCustomer => !customersEtour.some(
                    etourCustomer => etourCustomer.documentNumber === passportCustomer.passportNo
                )
            );

            unmatchedPassportCustomers.forEach(passportCustomer => {
                mergedData.push({
                    bookingCustomer: {
                        memberId: `extracted-${passportCustomer.passportNo}`,
                        fullName: passportCustomer.fullName,
                        gender: passportCustomer.sex === 'M' ? 'Nam' : 'Nữ',
                        dateOfBirth: passportCustomer.dateOfBirth || 'N/A',
                        issueDate: passportCustomer.dateOfIssue || 'Chưa có thông tin',
                        expireDate: passportCustomer.dateOfExpiry || 'Chưa có thông tin',
                        documentNumber: passportCustomer.passportNo || 'Chưa có thông tin',
                        birthPlace: passportCustomer.placeOfBirth || 'Chưa có thông tin',
                        nationality: passportCustomer.nationality || 'Chưa có thông tin',
                        imageUrl: passportCustomer.imageUrl
                    },
                    passportCustomer: passportCustomer,
                    imageUrl: passportCustomer.imageUrl
                });
            });

            setMergedCustomers(mergedData);
        }
    }, [customersEtour, listCustomers, customersPassport]);

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
                    imageUrl: customer.imageUrl,
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
                setTimeout(() => setToastMessage(''), 3000);
            } else {
                setToastMessage('Có lỗi ở hệ thống khi lưu thông tin khách hàng.');
                setToastType('error');
                setTimeout(() => setToastMessage(''), 3000);
            }
        } catch (error) {
            setToastMessage('Đã có dữ liệu của Passport trong hệ thống.');
            setToastType('error');
            setTimeout(() => setToastMessage(''), 3000);
        }
    };

    //#endregion

    //#endregion

    //#region ================Function===================

    //#region Check data
    const cleanString = (str) => {
        return str?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || '';
    };
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


    useEffect(() => {
        setActiveCustomer(null);
    }, [currentPage]);

    const handleShowImage = (index) => {
        if (activeCustomer === index) {
            setActiveCustomer(null);
        } else {
            setActiveCustomer(index);
        }
    };
    //#endregion

    //#region Image click
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
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
    const handleDeleteObject = (passportNo) => {
        const updatedMergedCustomers = mergedCustomers.map(customer => {
            if (customer.passportCustomer?.passportNo === passportNo) {
                return { ...customer, passportCustomer: null };
            }
            return customer;
        });

        setMergedCustomers(updatedMergedCustomers);
    };

    //#endregion

    //#region Sending JSON Data
    const handleCopyToClipboard = (event) => {
        event.preventDefault();

        const passportData = mergedCustomers.map(({ passportCustomer }) => {
            return {
                fullName: passportCustomer?.fullName || '',
                nationality: passportCustomer?.nationality || '',
                dateOfBirth: formatDateToEtour(passportCustomer?.dateOfBirth) || '',
                sex: passportCustomer?.sex || '',
                dateOfIssue: formatDateToEtour(passportCustomer?.dateOfIssue) || '',
                placeOfIssue: passportCustomer?.placeOfIssue || '',
                passportNo: passportCustomer?.passportNo || '',
                placeOfBirth: passportCustomer?.placeOfBirth || '',
                dateOfExpiry: formatDateToEtour(passportCustomer?.dateOfExpiry) || '',
                issuingAuthority: passportCustomer?.issuingAuthority || '',
            };
        });

        const message = { copyAll: JSON.stringify(passportData, null, 2) };
        console.log("eTour Data: ", message);

        window.parent.postMessage(message, '*');
    };

    //#endregion

    //#region Pagination
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const totalPages = Math.ceil(mergedCustomers.length / customersPerPage);

    const currentCustomers = mergedCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);


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
                <PreviewImageLayout previewImage={previewImage} />
            </div>
            <div className="w-full justify-center py-6">
                <div className="gap-4 mobile:flex mobile:flex-col">
                    <div className="mobile:p-4">
                        <div className='grid grid-cols-2 mobile:hidden'>
                            <h3 className="font-semibold text-center text-2xl mb-2 mobile:text-lg mobile:uppercase">Danh sách eTour</h3>
                            <h3 className="font-semibold text-center text-2xl mb-2 mobile:text-lg mobile:uppercase">Danh sách Passport</h3>
                        </div>
                        <div className="flex justify-end mb-3">
                            <p className="text-lg mobile:text-base">Tổng số khách eTour: <span className="font-semibold">{totalGuest} khách</span></p>
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
                        {currentCustomers.length > 0 ? (
                            currentCustomers.map((customerPair, index) => {
                                const etourCustomer = customerPair.bookingCustomer;
                                const passportCustomer = customerPair.passportCustomer;
                                const displayCustomer = etourCustomer || passportCustomer;
                                const imageUrl = customerPair.imageUrl || displayCustomer?.imageUrl;

                                return (
                                    <div key={index} className="p-4 rounded-2xl grid grid-cols-2 gap-4 mobile:flex mobile:flex-col">
                                        {loading ? (
                                            <div className="flex flex-col justify-center items-center">
                                                <div className="radial-progress" style={{ "--value": progress }} role="progressbar">{progress}%</div>
                                                <p className='font-semibold flex justify-center items-center text-center mt-4'>Đang tải toàn bộ dữ liệu khách hàng...</p>
                                            </div>
                                        ) : error ? (
                                            <div className="flex justify-center items-center mobile:flex-col">
                                                <p className='font-semibold flex justify-center items-center text-center'>Đã có lỗi xảy ra ở phía hệ thống, vui lòng thử lại sau</p>
                                                <Frown className='ml-2 w-6 mobile:mt-2' />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className='p-4 rounded-xl border-2 border-solid relative'>
                                                    {imageUrl ? (
                                                        <>
                                                            {activeCustomer === index ? (
                                                                <div>
                                                                    <img src={imageUrl} alt="Customer Passport" className='rounded-xl w-1/2' />
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
                                                                        <span className={(passportCustomer && displayCustomer?.documentNumber !== passportCustomer?.passportNo) ? "text-red-600" : ""}>
                                                                            &nbsp;{displayCustomer?.documentNumber || "Chưa có thông tin"}
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
                                                                <span className={(passportCustomer && displayCustomer?.documentNumber !== passportCustomer?.passportNo) ? "text-red-600" : ""}>
                                                                    &nbsp;{displayCustomer?.documentNumber || "Chưa có thông tin"}
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
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {loadingPassports ? (
                                            <div className="flex flex-col justify-center items-center">
                                                <div className="radial-progress" style={{ "--value": progress }} role="progressbar">{progress}%</div>
                                                <p className='font-semibold flex justify-center items-center text-center mt-4'>Đang tải toàn bộ dữ liệu khách hàng...</p>
                                            </div>
                                        ) : errorPassport ? (
                                            <div className="flex justify-center items-center mobile:flex-col">
                                                <p className='font-semibold flex justify-center items-center text-center'>Đã có lỗi xảy ra ở phía hệ thống, vui lòng thử lại sau</p>
                                                <Frown className='ml-2 w-6 mobile:mt-2' />
                                            </div>
                                        ) : (
                                            <div>
                                                {passportCustomer ? (
                                                    <div >
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
                            <div className="flex flex-col  justify-center items-center py-4">
                                <span className="loading loading-spinner loading-lg"></span>
                                <p className='font-semibold flex justify-center items-center text-center mt-4'>Đang tải dữ liệu khách hàng...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <FooterLayout totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />
        </div>
    );
}

export default PassportRead;
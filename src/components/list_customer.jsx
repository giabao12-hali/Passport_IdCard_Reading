import { Smile, Frown, Code, CodeXml } from 'lucide-react';
import axios from "axios";
import { useState, useEffect } from "react";

const ListCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 5;

    useEffect(() => {
        document.title = 'Danh sách Khách hàng'
    })

    useEffect(() => {
        const fetchData = async () => {
            const config = {
                method: 'get',
                url: 'http://108.108.110.73:1212/api/Customers/get',
            };

            try {
                const response = await axios.request(config);
                setCustomers(response.data.customersData);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleClose = () => {
        window.close();
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
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            return 'N/A';
        }
    };

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

    const filteredCustomers = customers.filter((customer) =>
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <>
            <div className="w-full min-h-screen">
                <div className='flex justify-center my-4 items-center'>
                    <p className='uppercase font-semibold text-3xl mr-2'>Danh sách khách hàng</p>
                    <label className="swap swap-flip text-3xl -translate-y-0.5">
                        <input type="checkbox" />
                        <div className="swap-on">👥</div>
                        <div className="swap-off">👤</div>
                    </label>
                </div>
                <div className='w-full flex justify-end my-4'>
                    <label className="input input-bordered input-info flex items-center gap-2 w-2/6 mx-4">
                        <input
                            type="text"
                            className="grow"
                            placeholder="Tìm kiếm theo tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-screen">
                        <span className="loading loading-infinity w-28"></span>
                        <p className='font-semibold flex justify-center items-center text-center'>
                            Đang tải dữ liệu khách hàng...
                            <Smile className='ml-2 w-6' />
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col justify-center items-center h-screen">
                        <p className='font-semibold flex justify-center items-center text-center'>
                            Đã có lỗi xảy ra ở phía hệ thống, vui lòng thử lại sau
                            <Frown className='ml-2 w-6' />
                        </p>
                    </div>
                ) : currentCustomers.length === 0 ? (
                    <div className="flex flex-col justify-center items-center">
                        <p className='font-semibold flex justify-center items-center text-center'>
                            Hiện tại không có danh sách khách hàng
                            <Frown className='ml-2 w-6' />
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto overflow-y-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Họ tên</th>
                                        <th>Loại giấy tờ</th>
                                        <th>Giới tính</th>
                                        <th>Số Passport</th>
                                        <th>Số Căn cước</th>
                                        <th>Ngày cấp</th>
                                        <th>Ngày hết hạn</th>
                                        <th>Nơi sinh</th>
                                        <th>Nơi cấp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentCustomers.map((customer, index) => (
                                        <tr className="hover" key={index}>
                                            <th>{indexOfFirstItem + index + 1}</th>
                                            <td>
                                                <div>
                                                    <div className="font-bold">{customer.fullName}</div>
                                                    <div className="text-sm opacity-50">{customer.nationality}</div>
                                                </div>
                                            </td>
                                            <td>{customer.type}</td>
                                            <td>{formatGender(customer.sex)}</td>
                                            <td>{customer.passportNo || 'Chưa có thông tin'}</td>
                                            <td>{customer.idCardNo || 'Chưa có thông tin'}</td>
                                            <td>{formatDate(customer.dateOfIssue)}</td>
                                            <td>{formatDate(customer.dateOfExpiry)}</td>
                                            <td>{customer.placeOfBirth}</td>
                                            <td>{customer.issuingAuthority}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="join flex justify-center items-center mt-5">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    className={`join-item btn btn-square ${currentPage === i + 1 ? 'btn-active' : ''}`}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                <div className='flex justify-end items-center mx-4'>
                    <button className="btn btn-error" onClick={handleClose}>
                        Thoát
                    </button>
                </div>
            </div>

            <footer className="footer footer-center bg-base-200 text-base-content rounded p-10">
                <aside className='flex items-center'>
                    <Code className='w-4 h-4' />
                    <p className='cursor-default'>
                        Made by Vietravel
                    </p>
                    <CodeXml className='w-4 h-4 translate-y-px' />
                </aside>
            </footer>
        </>
    );
}

export default ListCustomers;

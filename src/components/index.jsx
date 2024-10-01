import { useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
    const [bookingId, setBookingId] = useState('');

    return (
        <div className="w-full min-h-screen">
            <div className="flex flex-col items-center gap-6 pt-12">
                <div className="title">
                    <div className="font-bold">
                        <p className="cursor-default underline capitalize">danh sách đoàn du lịch</p>
                    </div>
                </div>
                <div className="list_customers">
                    <div className="text-blue-500 font-bold">
                        <Link to="/list-customers" target="_blank">Xem danh sách khách hàng</Link>
                    </div>
                </div>
                <label className="form-control w-full max-w-xs gap-4">
                    <input type="text" placeholder="Nhập số Booking ID..." value={bookingId} onChange={(e) => setBookingId(e.target.value)} className="input input-bordered w-full max-w-xs" />
                    <Link
                        to={`/passport-read?bookingId=${bookingId}`}
                        target="_blank"
                        className="bg-blue-500 text-white p-2 rounded text-center"
                    >
                        Xem Danh Sách eTour qua Passport
                    </Link>
                    <Link
                        to={`/idcard-read?bookingId=${bookingId}`}
                        target="_blank"
                        className="bg-blue-500 text-white p-2 rounded text-center"
                    >
                        Xem Danh Sách eTour qua CMND
                    </Link>
                </label>
            </div>
        </div>
    );
}

export default Index;

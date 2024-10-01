// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const MemberDetails = () => {
    const { bookingId, memberId } = useParams();
    const [memberDetails, setMemberDetails] = useState(null); // Use null instead of an array for member details
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMemberDetails = async () => {
            try {
                const response = await axios.get(`https://localhost:7102/api/Booking/member/details/${bookingId}/${memberId}`, {
                    headers: { 'accept': '*/*' }
                });
                setMemberDetails(response.data);
                setLoading(false);
            } catch (err) {
                console.error("API Error:", err);
                setError(err.message || 'An error occurred while fetching member details.');
                setLoading(false);
            }
        };

        fetchMemberDetails();
    }, [bookingId, memberId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-infinity w-28"></span>
                <p className='font-semibold'>Loading member details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className='font-semibold'>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className='p-4'>
            <h2 className='text-2xl font-semibold'>Member Details</h2>
            {memberDetails ? (
                <div>
                    <p><strong>Full Name:</strong> {memberDetails.fullName}</p>
                    <p><strong>Gender:</strong> {memberDetails.gender}</p>
                    <p><strong>Nationality:</strong> {memberDetails.nationality}</p>

                    <h3 className='font-semibold mt-4'>Visa Info:</h3>
                    {memberDetails.visaInfor ? (
                        <div>
                            <p><strong>Date of Birth:</strong> {new Date(memberDetails.visaInfor.dateOfBirth).toLocaleDateString()}</p>
                            <p><strong>Issue Date:</strong> {new Date(memberDetails.visaInfor.issueDate).toLocaleDateString()}</p>
                            <p><strong>Expire Date:</strong> {new Date(memberDetails.visaInfor.expireDate).toLocaleDateString()}</p>
                        </div>
                    ) : (
                        <p>No visa information available.</p>
                    )}

                    <h3 className='font-semibold mt-4'>ID Card Info:</h3>
                    {memberDetails.idCardInfor ? (
                        <div>
                            <p><strong>Date of Birth:</strong> {new Date(memberDetails.idCardInfor.dateOfBirth).toLocaleDateString()}</p>
                            <p><strong>Issue Date:</strong> {memberDetails.idCardInfor.issueDate ? new Date(memberDetails.idCardInfor.issueDate).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Expire Date:</strong> {memberDetails.idCardInfor.expireDate ? new Date(memberDetails.idCardInfor.expireDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    ) : (
                        <p>No ID card information available.</p>
                    )}
                </div>
            ) : (
                <p>No member details found.</p>
            )}
        </div>
    );
};

export default MemberDetails;
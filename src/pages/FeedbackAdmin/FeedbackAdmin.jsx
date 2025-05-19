import React from 'react';
import './FeedbackAdmin.css';
import { useState, useEffect } from 'react';
import { AlignCenter } from 'lucide-react';

const apiURL = import.meta.env.VITE_API_BASE_URL;

const FeedbackAdmin = () => {

    const [feedbacks, setFeedbacks] = useState([]);

    //Messages
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);

    // For pagination
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
    });
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);




    const fetchFeedbacks = async () => {
        setLoading(true);
        setError(null);

        try {
            const url = `${apiURL}/Feedbacks?pageNumber=${pageNumber}&pageSize=${pageSize}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            setFeedbacks(data.items);
            setPagination({
                pageNumber: data.pageNumber,
                pageSize: data.pageSize,
                totalPages: data.totalPages,
                hasNextPage: data.hasNextPage,
                hasPreviousPage: data.hasPreviousPage,
            });

        } catch (err) {
            setError(err.message);
            console.error("Error fetching feedbacks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [pageNumber, pageSize]);


    return (


        <div className="admin-feedback-container">


            {/*Messages*/ }
            {loading && <p className="admin-loading-message-feedback">Loading feedbacks...</p>}
            { error && showError && (
                <div className="admin-modal-overlay-feedback">
                    <div className="admin-error-modal-feedback">
                        <p>{error}</p>
                        <button onClick={() => setShowError(false)} className="adminmodal-close-btn-feedback">
                            OK
                        </button>
                    </div>
                </div>
                )
             }

        
            <div className="admin-feedback-list">
                {feedbacks.map((fb) => (
                    <div key={fb.id} className="admin-feedback-item">
                        <div className="admin-feedback-header">
                            <div className="admin-feedback-user">{fb.customerName}</div>
                            <div className="admin-feedback-timestamp">
                                {new Date(fb.dateSubmitted).toLocaleDateString('en-GB')}<br />
                                {new Date(fb.dateSubmitted).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </div>

                        </div>
                        <div className="admin-feedback-message">{fb.text}</div>
                    </div>
                ))}
            </div>
        
        {/* Pagination */ }
            <div className="pagination">
                <button
                    onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
                    disabled={!pagination.hasPreviousPage}
                >
                    Previous
                </button>

                <span style={{ paddingTop: '7px' }}>Page {pagination.pageNumber}</span>

                <button
                    onClick={() => setPageNumber(p => p + 1)}
                    disabled={!pagination.hasNextPage}
                >
                    Next
                </button>
            </div>

        </div>
    );
};

export default FeedbackAdmin;
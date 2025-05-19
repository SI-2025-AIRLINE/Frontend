import React from 'react';
import './FeedbackAdmin.css';
import { useState, useEffect } from 'react';

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


        <div className="feedback-container">


            {/*Messages*/ }
            {loading && <p className="loading-message-feedback">Loading feedbacks...</p>}
            { error && showError && (
                <div className="modal-overlay-feedback">
                    <div className="error-modal-feedback">
                        <p>{error}</p>
                        <button onClick={() => setShowError(false)} className="modal-close-btn-feedback">
                            OK
                        </button>
                    </div>
                </div>
                )
             }

        
            <div className="feedback-list">
                {feedbacks.map((fb) => (
                    <div key={fb.id} className="feedback-item">
                        <div className="feedback-header">
                            <div className="feedback-user">{fb.customerName}</div>
                            <div className="feedback-timestamp">
                                {new Date(fb.dateSubmitted).toLocaleDateString('en-GB')}<br />
                                {new Date(fb.dateSubmitted).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </div>

                        </div>
                        <div className="feedback-message">{fb.text}</div>
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

                <span>Page {pagination.pageNumber}</span>

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
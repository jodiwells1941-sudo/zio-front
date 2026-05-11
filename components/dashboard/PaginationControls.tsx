import React from 'react';

/**
 * PaginationControls Component
 * Renders the Prev/Next buttons and the current page status.
 *
 * @param {object} props
 * @param {object} props.pagination - The pagination data from the API response.
 * @param {number} props.currentPage - The current page number from filterData.
 * @param {boolean} props.pageLoading - Whether the data is currently loading.
 * @param {function} props.onPageChange - Function to call when a page button is clicked.
 */
interface PaginationControlsProps {
    pagination: {
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    currentPage: number;
    pageLoading: boolean;
    onPageChange: (page: number) => void;
}

export default function PaginationControls({
    pagination,
    currentPage,
    pageLoading,
    onPageChange,
}: PaginationControlsProps) {
    const {
        last_page,
        next_page_url,
        prev_page_url,
    } = pagination;

    const buttonStyle = (isDisabled: boolean) => ({
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid white",
        background: "transparent",
        color: "white",
        // Visually reduce opacity if disabled
        opacity: isDisabled ? 0.5 : 1, 
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: 'opacity 0.2s',
    });

    return (
        <div
            style={{
                marginTop: 16,
                display: "flex",
                gap: 10,
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
            }}
        >
            {/* Prev Button */}
            <button
                disabled={!prev_page_url || pageLoading}
                // Call the handler with the previous page number
                onClick={() => onPageChange(currentPage - 1)}
                style={buttonStyle(!prev_page_url || pageLoading)}
            >
                Prev
            </button>

            {/* Page Status */}
            <span style={{ color: "white", fontSize: 14 }}>
                Page {currentPage} / {last_page}
            </span>

            {/* Next Button */}
            <button
                disabled={!next_page_url || pageLoading}
                // Call the handler with the next page number
                onClick={() => onPageChange(currentPage + 1)}
                style={buttonStyle(!next_page_url || pageLoading)}
            >
                Next
            </button>
        </div>
    );
}
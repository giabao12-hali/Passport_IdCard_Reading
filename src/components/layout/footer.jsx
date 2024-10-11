// eslint-disable-next-line react/prop-types
const FooterLayout = ({ totalPages, currentPage, handlePageChange }) => {
    return (
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
        </footer>
    );
};

export default FooterLayout;
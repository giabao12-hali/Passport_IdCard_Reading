/* eslint-disable react/prop-types */
const ToastMessageLayout = ({ toastMessage, toastType }) => {
    return (
        toastMessage && (
            <div className={`toast toast-top toast-center z-50`}>
                <div className={`alert ${toastType === 'success' ? 'alert-success' : 'alert-error'}`}>
                    <span>{toastMessage}</span>
                </div>
            </div>
        )
    );
}

export default ToastMessageLayout;
// import QrModal from "./qr_modal";

/* eslint-disable react/prop-types */
const ButtonActions = ({ loadingPassports, handleSave, handleCopyToClipboard }) => {
    return (
        <>
            <div className="gap-4 fixed flex flex-col items-end mr-8 top-3/4 right-0 z-30 mobile:mx-1.5 mobile:gap-3 ">
                {loadingPassports ? (
                    <>
                        <div>
                            <button className="btn btn-accent btn-disabled rounded-xl no-animation mobile:h-auto mobile:text-balance">
                                <span className="loading loading-spinner"></span>
                                Lưu
                            </button>
                        </div>
                        <div>
                            <button className="btn btn-accent btn-disabled rounded-xl no-animation mobile:h-auto mobile:text-balance">
                                <span className="loading loading-spinner"></span>
                                Lưu và cập nhật eTour
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <button className="btn btn-success no-animation rounded-xl mobile:h-auto mobile:text-balance" onClick={handleSave}>
                                Lưu
                            </button>
                        </div>
                        <div>
                            <button className="btn btn-info no-animation rounded-xl mobile:h-auto mobile:text-balance" onClick={handleCopyToClipboard}>
                                Cập nhật eTour
                            </button>
                        </div>
                        {/* <div>
                            <button className="btn mobile:mt-2" onClick={() => document.getElementById('my_modal_1').showModal()}>
                                Hiển thị QR Code
                            </button>
                        </div> */}
                    </>
                )}
                {/* <QrModal qrCodeUrl={qrCodeUrl}/> */}
                {/* <div>
                    <button className="btn btn-error rounded-xl no-animation" onClick={handleClose}>Thoát</button>
                </div> */}
            </div>
        </>
    );
}

export default ButtonActions;
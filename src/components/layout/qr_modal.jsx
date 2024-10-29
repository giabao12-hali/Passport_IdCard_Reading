/* eslint-disable react/prop-types */
import QRCode from "react-qr-code";

const QrModal = ({ qrCodeUrl, modalId = 'my_modal_1' }) => {
    return (
        <dialog id={modalId} className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Mã QR Code</h3>
                <div className="flex justify-center py-4">
                    <QRCode value={qrCodeUrl} />
                </div>
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn">Đóng mã QR</button>
                    </form>
                </div>
            </div>
        </dialog>
    );
}

export default QrModal;
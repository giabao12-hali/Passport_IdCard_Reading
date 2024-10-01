/* eslint-disable no-unused-vars */
import React, { useState } from "react";
const Etour = () => {
    const [valueAdults, setValueAdults] = useState("");
    const [valueChildrens, setValueChildrens] = useState("");
    const blockInvalidChar = e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();
    return (
        <div className="w-full min-h-screen p-12">
            <div className="flex flex-col gap-12">
                <div className="flex items-center gap-4">
                    <p>Người lớn</p>
                    <input type="number" placeholder="Nhập số người lớn" value={valueAdults} onKeyDown={blockInvalidChar} onChange={({ target: { value } }) => {
                        setValueAdults(value);
                    }} className="input input-bordered w-full max-w-xs" min="0" step="1" />
                </div>
                <div className="flex items-center gap-4">
                    <p>Trẻ em</p>
                    <input type="number" placeholder="Nhập số trẻ em" value={valueChildrens} onKeyDown={blockInvalidChar} onChange={({ target: { value } }) => {
                        setValueChildrens(value);
                    }} className="input input-bordered w-full max-w-xs" min="0" step="1" />
                </div>
                <div>
                    <button className="btn btn-success no-animation">Thêm</button>
                </div>
            </div>
        </div>
    );
}

export default Etour;
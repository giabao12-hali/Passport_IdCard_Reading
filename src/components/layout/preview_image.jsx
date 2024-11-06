/* eslint-disable react/prop-types */
import { useState } from 'react';
const PreviewImageLayout = ({ previewImage }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <div>
            {previewImage.length > 0 && (
                <div className="carousel w-full py-12">
                    {previewImage.map((imageUrl, index) => (
                        <div
                            key={index}
                            id={`slide${index + 1}`}
                            className="carousel-item relative w-full flex justify-center"
                        >
                            <img
                                src={imageUrl}
                                className="shadow-2xl rounded-xl max-w-md max-h-screen bg-center object-center cursor-pointer mobile:w-3/4"
                                alt={`Slide ${index + 1}`}
                                onClick={() => handleImageClick(imageUrl)}
                            />
                            <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                                <a
                                    href={`#slide${index === 0 ? previewImage.length : index}`}
                                    className="btn btn-circle"
                                >
                                    ❮
                                </a>
                                <a
                                    href={`#slide${(index + 1) % previewImage.length === 0 ? 1 : index + 2}`}
                                    className="btn btn-circle"
                                >
                                    ❯
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-start bg-black bg-opacity-20">
                    <div className="relative bg-white rounded-xl shadow-lg flex flex-col ml-24 mobile:ml-0">
                        <div className='p-4 mobile:p-1'>
                            <div className="carousel">
                                {previewImage.map((imageUrl, index) => (
                                    <div
                                        key={index}
                                        className={`carousel-item relative mobile:w-full ${selectedImage === imageUrl ? 'block' : 'hidden'}`}
                                    >
                                        <img
                                            src={imageUrl}
                                            className="shadow-2xl rounded-xl max-w-lg mx-auto object-cover bg-center mobile:w-full"
                                            alt={`Slide ${index + 1}`}
                                        />
                                        <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 flex justify-between px-4">
                                            <button
                                                onClick={() =>
                                                    setSelectedImage(previewImage[index === 0 ? previewImage.length - 1 : index - 1])
                                                }
                                                className="btn btn-circle"
                                            >
                                                ❮
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setSelectedImage(previewImage[(index + 1) % previewImage.length])
                                                }
                                                className="btn btn-circle"
                                            >
                                                ❯
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='w-full pb-4 px-4'>
                            <button
                                onClick={closeModal}
                                className=" btn btn-error text-white w-full"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}

export default PreviewImageLayout;
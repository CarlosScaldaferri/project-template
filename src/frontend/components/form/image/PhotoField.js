import { useState, useCallback, useEffect, useRef } from "react";
import { FaEdit, FaEraser, FaCheck, FaTimes, FaCamera } from "react-icons/fa";
import CustomImage from "./CustomImage";
import clsx from "clsx";
import { Controller } from "react-hook-form";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

const PhotoField = ({
  control,
  name,
  trigger,
  disabled = false,
  defaultValue = null,
  label = "Foto",
}) => {
  const [previewImage, setPreviewImage] = useState(() => {
    if (!defaultValue) return null;
    if (typeof defaultValue === "string") return defaultValue;
    if (defaultValue instanceof File) return URL.createObjectURL(defaultValue);
    return null;
  });

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [crop, setCrop] = useState(null); // { x, y, width, height }
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [stream, setStream] = useState(null);

  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const cropRef = useRef(null);

  const initializeCrop = () => {
    if (imgRef.current) {
      const imgWidth = imgRef.current.naturalWidth;
      const imgHeight = imgRef.current.naturalHeight;
      let newWidth, newHeight;

      const minDimension = Math.min(imgWidth, imgHeight);
      const aspectRatio = imgWidth / imgHeight;

      if (minDimension < 256 || (imgWidth > 256 && imgHeight > 256)) {
        if (minDimension === imgWidth) {
          newWidth = 256;
          newHeight = Math.round(newWidth / aspectRatio);
        } else {
          newHeight = 256;
          newWidth = Math.round(newHeight * aspectRatio);
        }
      } else {
        if (imgWidth < 256) {
          newWidth = 256;
          newHeight = Math.round(newWidth / aspectRatio);
        } else {
          newHeight = 256;
          newWidth = Math.round(newHeight * aspectRatio);
        }
      }

      const maxWidth = 300;
      const maxHeight = 350;
      if (newWidth > maxWidth || newHeight > maxHeight) {
        const scaleWidth = maxWidth / newWidth;
        const scaleHeight = maxHeight / newHeight;
        const scale = Math.min(scaleWidth, scaleHeight);
        newWidth = Math.round(newWidth * scale);
        newHeight = Math.round(newHeight * scale);
      }

      setImageDimensions({ width: newWidth, height: newHeight });

      const size = 128;
      const x = (newWidth - size) / 2;
      const y = (newHeight - size) / 2;
      setCrop({ x, y, width: size, height: size });
    }
  };

  useEffect(() => {
    if (!crop || !imgRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const image = imgRef.current;
    const scaleX = image.naturalWidth / imageDimensions.width;
    const scaleY = image.naturalHeight / imageDimensions.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = 128 * pixelRatio;
    canvas.height = 128 * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      128,
      128
    );
  }, [crop, imageDimensions]);

  useEffect(() => {
    if (!defaultValue) {
      setPreviewImage(null);
      return;
    }
    if (typeof defaultValue === "string") {
      setPreviewImage(defaultValue);
      return;
    }
    if (defaultValue instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(defaultValue);
    }
  }, [defaultValue]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ].includes(file.type);
      const isValidSize = file.size <= 2 * 1024 * 1024;
      if (isValidType && isValidSize) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setOriginalImage(reader.result);
          setShowCropModal(true);
          setShowOptionsModal(false);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(
          isValidType
            ? "O arquivo é muito grande (máx. 2MB)"
            : "Formato inválido"
        );
      }
    }
  }, []);

  const handleClearImage = useCallback(
    (onChange) => {
      setPreviewImage(null);
      onChange(null);
      trigger(name);
    },
    [name, trigger]
  );

  const handleSaveCrop = useCallback(
    (onChange) => {
      if (!imgRef.current || !previewCanvasRef.current) return;

      previewCanvasRef.current.toBlob(
        (blob) => {
          const file = new File([blob], "profile-image.jpg", {
            type: "image/jpeg",
          });
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewImage(reader.result);
            onChange(file);
            trigger(name);
          };
          reader.readAsDataURL(file);
        },
        "image/jpeg",
        0.9
      );

      setShowCropModal(false);
    },
    [name, trigger]
  );

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      setShowCameraModal(true);
      setShowOptionsModal(false);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      toast.error("Erro ao acessar a câmera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    setOriginalImage(canvas.toDataURL("image/jpeg"));
    setShowCropModal(true);
    stopCamera();
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-base text-light-primary dark:text-dark-primary">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div style={{ width: "128px", height: "128px" }}>
                <CustomImage
                  src={previewImage || ""}
                  alt="Foto do usuário"
                  className="object-contain rounded"
                  unoptimized={process.env.NEXT_PUBLIC_UNOPTIMIZED}
                />
              </div>

              {!disabled && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className={clsx(
                      "p-2 bg-light-primary dark:bg-dark-primary text-white rounded-full",
                      "hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark",
                      "disabled:opacity-50 flex items-center justify-center"
                    )}
                    onClick={() => setShowOptionsModal(true)}
                    disabled={disabled}
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className={clsx(
                      "p-2 bg-red-500 text-white rounded-full",
                      "hover:bg-red-600 disabled:opacity-50 flex items-center justify-center"
                    )}
                    onClick={() => handleClearImage(onChange)}
                    disabled={disabled || !previewImage}
                  >
                    <FaEraser className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {/* Renderização explícita do erro */}
            {error?.message && (
              <span className="text-red-500 text-sm">{error.message}</span>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Modal de Opções */}
            {showOptionsModal && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-medium mb-4">Alterar Foto</h3>
                  {previewImage && (
                    <div className="mb-4 flex justify-center">
                      <CustomImage
                        src={previewImage}
                        alt="Preview"
                        className="max-h-40"
                        unoptimized={process.env.NEXT_PUBLIC_UNOPTIMIZED}
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark flex items-center gap-2 justify-center"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Buscar no PC
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark flex items-center gap-2 justify-center"
                      onClick={startCamera}
                    >
                      <FaCamera /> Tirar Foto
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 flex items-center gap-2 justify-center"
                      onClick={() => setShowOptionsModal(false)}
                    >
                      <FaTimes /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Câmera */}
            {showCameraModal && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
                  <h3 className="text-lg font-medium mb-4">Tirar Foto</h3>
                  <video
                    ref={videoRef}
                    autoPlay
                    className="w-full rounded mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 flex items-center gap-2"
                      onClick={stopCamera}
                    >
                      <FaTimes /> Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark flex items-center gap-2"
                      onClick={capturePhoto}
                    >
                      <FaCamera /> Capturar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Crop */}
            {showCropModal && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
                <div
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col gap-2 w-full"
                  style={{
                    width: `${Math.min(imageDimensions.width + 32, 300)}px`,
                    height: "auto",
                  }}
                >
                  <h3 className="text-lg font-medium">Ajustar Imagem</h3>
                  <div
                    className="relative"
                    style={{
                      width: `${imageDimensions.width}px`,
                      height: `${imageDimensions.height}px`,
                    }}
                  >
                    <img
                      ref={imgRef}
                      src={originalImage}
                      alt="Imagem para recortar"
                      style={{
                        width: `${imageDimensions.width}px`,
                        height: `${imageDimensions.height}px`,
                      }}
                      onLoad={initializeCrop}
                    />
                    {crop && (
                      <div
                        ref={cropRef}
                        className="absolute border-2 border-blue-500 bg-black bg-opacity-20"
                        style={{
                          left: `${crop.x}px`,
                          top: `${crop.y}px`,
                          width: `${crop.width}px`,
                          height: `${crop.height}px`,
                          cursor: "move",
                        }}
                        onMouseDown={(e) => {
                          const startX = e.clientX - crop.x;
                          const startY = e.clientY - crop.y;
                          const handleMove = (moveEvent) => {
                            const newX = Math.max(
                              0,
                              Math.min(
                                moveEvent.clientX - startX,
                                imageDimensions.width - crop.width
                              )
                            );
                            const newY = Math.max(
                              0,
                              Math.min(
                                moveEvent.clientY - startY,
                                imageDimensions.height - crop.height
                              )
                            );
                            setCrop((prev) => ({ ...prev, x: newX, y: newY }));
                          };
                          const handleUp = () => {
                            document.removeEventListener(
                              "mousemove",
                              handleMove
                            );
                            document.removeEventListener("mouseup", handleUp);
                          };
                          document.addEventListener("mousemove", handleMove);
                          document.addEventListener("mouseup", handleUp);
                          e.preventDefault();
                        }}
                      >
                        <div
                          className="absolute w-3 h-3 bg-blue-500 rounded-full -top-1 -left-1 cursor-nwse-resize"
                          onMouseDown={(e) => {
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const startSize = crop.width;
                            const startXPos = crop.x;
                            const startYPos = crop.y;
                            const handleResize = (moveEvent) => {
                              const delta = Math.min(
                                moveEvent.clientX - startX,
                                moveEvent.clientY - startY
                              );
                              const newSize = Math.max(
                                128,
                                Math.min(
                                  startSize - delta,
                                  imageDimensions.width - startXPos,
                                  imageDimensions.height - startYPos
                                )
                              );
                              setCrop((prev) => ({
                                ...prev,
                                x: startXPos + (startSize - newSize),
                                y: startYPos + (startSize - newSize),
                                width: newSize,
                                height: newSize,
                              }));
                            };
                            const handleUp = () => {
                              document.removeEventListener(
                                "mousemove",
                                handleResize
                              );
                              document.removeEventListener("mouseup", handleUp);
                            };
                            document.addEventListener(
                              "mousemove",
                              handleResize
                            );
                            document.addEventListener("mouseup", handleUp);
                            e.stopPropagation();
                          }}
                        />
                        <div
                          className="absolute w-3 h-3 bg-blue-500 rounded-full -top-1 -right-1 cursor-nesw-resize"
                          onMouseDown={(e) => {
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const startSize = crop.width;
                            const startXPos = crop.x;
                            const handleResize = (moveEvent) => {
                              const delta = Math.max(
                                moveEvent.clientX - startX,
                                moveEvent.clientY - startY
                              );
                              const newSize = Math.max(
                                128,
                                Math.min(
                                  startSize + delta,
                                  imageDimensions.width - startXPos,
                                  imageDimensions.height - crop.y
                                )
                              );
                              setCrop((prev) => ({
                                ...prev,
                                width: newSize,
                                height: newSize,
                              }));
                            };
                            const handleUp = () => {
                              document.removeEventListener(
                                "mousemove",
                                handleResize
                              );
                              document.removeEventListener("mouseup", handleUp);
                            };
                            document.addEventListener(
                              "mousemove",
                              handleResize
                            );
                            document.addEventListener("mouseup", handleUp);
                            e.stopPropagation();
                          }}
                        />
                        <div
                          className="absolute w-3 h-3 bg-blue-500 rounded-full -bottom-1 -left-1 cursor-nesw-resize"
                          onMouseDown={(e) => {
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const startSize = crop.width;
                            const startYPos = crop.y;
                            const handleResize = (moveEvent) => {
                              const delta = Math.min(
                                moveEvent.clientX - startX,
                                moveEvent.clientY - startY
                              );
                              const newSize = Math.max(
                                128,
                                Math.min(
                                  startSize - delta,
                                  imageDimensions.width - crop.x,
                                  imageDimensions.height - startYPos
                                )
                              );
                              setCrop((prev) => ({
                                ...prev,
                                x: crop.x + (startSize - newSize),
                                y: startYPos + (startSize - newSize),
                                width: newSize,
                                height: newSize,
                              }));
                            };
                            const handleUp = () => {
                              document.removeEventListener(
                                "mousemove",
                                handleResize
                              );
                              document.removeEventListener("mouseup", handleUp);
                            };
                            document.addEventListener(
                              "mousemove",
                              handleResize
                            );
                            document.addEventListener("mouseup", handleUp);
                            e.stopPropagation();
                          }}
                        />
                        <div
                          className="absolute w-3 h-3 bg-blue-500 rounded-full -bottom-1 -right-1 cursor-nwse-resize"
                          onMouseDown={(e) => {
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const startSize = crop.width;
                            const handleResize = (moveEvent) => {
                              const delta = Math.max(
                                moveEvent.clientX - startX,
                                moveEvent.clientY - startY
                              );
                              const newSize = Math.max(
                                128,
                                Math.min(
                                  startSize + delta,
                                  imageDimensions.width - crop.x,
                                  imageDimensions.height - crop.y
                                )
                              );
                              setCrop((prev) => ({
                                ...prev,
                                width: newSize,
                                height: newSize,
                              }));
                            };
                            const handleUp = () => {
                              document.removeEventListener(
                                "mousemove",
                                handleResize
                              );
                              document.removeEventListener("mouseup", handleUp);
                            };
                            document.addEventListener(
                              "mousemove",
                              handleResize
                            );
                            document.addEventListener("mouseup", handleUp);
                            e.stopPropagation();
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-start">
                    <div className="flex flex-col items-start">
                      <div className="text-sm mb-1">Preview (128x128px)</div>
                      <div className="border border-gray-300 rounded overflow-hidden">
                        <canvas
                          ref={previewCanvasRef}
                          width="128"
                          height="128"
                          style={{ width: "128px", height: "128px" }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 flex items-center gap-1 text-sm"
                        onClick={() => setShowCropModal(false)}
                      >
                        <FaTimes /> Cancelar
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark flex items-center gap-1 text-sm"
                        onClick={() => handleSaveCrop(onChange)}
                      >
                        <FaCheck /> Salvar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

PhotoField.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  trigger: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(File),
    PropTypes.object,
  ]),
  label: PropTypes.string,
};

export default PhotoField;

import 'react-image-crop/dist/ReactCrop.css';

import React, { useState, useCallback, useRef, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import ReactCrop from 'react-image-crop';
import * as Yup from 'yup';

import {failToast, LoadingContext, LoadingButton} from '../../../../utils.js';

import {hocModal, closeModal} from '../../../../global/modal.js';


// Warging Size
const warningSize = 10485760;
// Error Size
const errorSize = 15728640;

// Setting a high pixel ratio avoids blurriness in the canvas crop preview.
const pixelRatio = 4;

// We resize the canvas down when saving on retina devices otherwise the image
// will be double or triple the preview size.
function getResizedCanvas(canvas, newWidth, newHeight) {
	const tmpCanvas = document.createElement("canvas");
	tmpCanvas.width = newWidth;
	tmpCanvas.height = newHeight;

	const ctx = tmpCanvas.getContext("2d");
	ctx.drawImage(
		canvas,
		0,
		0,
		canvas.width,
		canvas.height,
		0,
		0,
		newWidth,
		newHeight
	);

	return tmpCanvas;
}


const NewImage = function (props) {
	const [upImg, setUpImg] 					= useState();
	const input1Ref 							= useRef(null);
	const input2Ref 							= useRef(null);
	const imgRef 								= useRef(null);
	const previewCanvasRef 						= useRef(null);
	const [crop, setCrop] 						= useState({ unit: "%", width: 100, aspect: 1});
	const [completedCrop, setCompletedCrop] 	= useState(null);
	const [errorImageInput, setErrorImageInput] = useState(null);
	const loadingContext 						= useContext(LoadingContext);

	// VALIDATION SCHEMA + FUNCTION
	const imageInputSchema = Yup.mixed()
								.test('fileSize', "File Size is too large", file => (file.size <  errorSize))
								.test('fileType', "Please upload an image", file => file.type.indexOf("image/") != -1);

	const validateInputFile =  async file => {
		return await imageInputSchema.validate(file)
									.then((file) => { 
										setErrorImageInput(
											(file.size <  warningSize) ? "" :
												"File size is to big to be uploaded as is. Cropping the file should reduce its size enough to be uploaded."); 
										return file;})
									.catch((err) => { setErrorImageInput(err.message); clearImage(); return false;});
	}; 

	// Get INPUT FILE
	const onSelectFile = async e => {
		loadingContext.setLoading();
		if (e.target.files && e.target.files.length > 0) {
			var validFile = await validateInputFile(e.target.files[0]);
			if(!validFile) return;
			const reader = new FileReader();
			reader.addEventListener("load", () => setUpImg(reader.result));
			reader.readAsDataURL(validFile);
		}
		loadingContext.setLoaded();
	};

	// CLEARS INPUT FILE + CANVAS
	const clearImage = () => {
		setErrorImageInput(null);
		setUpImg(null);
		setCrop({ unit: "%", width: 100, aspect: 1});
		setCompletedCrop(null);
		input1Ref.current.value = "";
		input2Ref.current.value = "";
	}

	// CLOSES MODAL + CLEAR INPUT FILE + CANVAS
	const clearModal = () => {
		closeModal("newImageModal");
		clearImage();
	}

	// ADD IMAGE TO POST (NOT SAVING INMAGE IN BACK)
	const setNewImage = async (previewCanvas, crop) => {
		if (!crop || !previewCanvas) {
			return;
		}

		// quite useless since the ratio is set, idk it seems safer
		if(crop.width != crop.height){
			setCrop({ unit: "%", width: 100, aspect: 1});
			failToast("The image must be a square");
			return;
		}
		loadingContext.setLoading();

		const canvas = getResizedCanvas(previewCanvas, crop.width, crop.height);
		var newImage = await new Promise((resolve, reject) => {
			canvas.toBlob(
				blob => 
				{
					if (!blob) {
						failToast('Canvas is empty');
						return;
					}
					var fileUrl = window.URL.createObjectURL(blob);
					resolve({'file': blob, 'imagePath': fileUrl});
				},
				"image/png",
				1
			);
		});
		loadingContext.setLoaded();
		if(newImage.file.size > warningSize){
			failToast("The image is still to big to be uploaded, try cropping it more");
			return;
		}
		props.setNewImage(newImage);

		clearModal();
	}

	const onLoad = useCallback(img => {
		imgRef.current = img;
	}, []);

	// SETS CROPPED IMAGE IN THE CANVAS
	useEffect(() => {
		if (!completedCrop || !completedCrop.width || !completedCrop.height ||
			!previewCanvasRef.current || !imgRef.current) {
			return;
		}

		const image = imgRef.current;
		const canvas = previewCanvasRef.current;
		const crop = completedCrop;

		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;
		const ctx = canvas.getContext("2d");

		canvas.width = crop.width * pixelRatio;
		canvas.height = crop.height * pixelRatio;

		ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		ctx.imageSmoothingEnabled = false;

		ctx.drawImage(
		image,
		crop.x * scaleX,
		crop.y * scaleY,
		crop.width * scaleX,
		crop.height * scaleY,
		0,
		0,
		crop.width,
		crop.height
		);
	}, [completedCrop]);



	return (
		<div>
			<a className="modal-close close-modal-icon right">
				<i className="material-icons grey-text">close</i>
			</a>
			<div className="modal-content">
				<div className="input-field file-field">
					<button type="button" className="cyan darken-1 waves-effect waves-light btn">
						<span>Import image</span>
						<input ref={input1Ref} type="file" accept="image/*" onChange={onSelectFile} />
					</button>
					<div className="file-path-wrapper">
						<input ref={input2Ref} type="text" className={errorImageInput ? "invalid focus-white file-path" : "focus-white file-path"}/>
						{errorImageInput ?
							<span className="pink-text">{errorImageInput}</span> : "" } 
					</div>
				</div>
				<ReactCrop
					src={upImg}
					onImageLoaded={onLoad}
					crop={crop}
					onChange={c => setCrop(c)}
					onComplete={c => setCompletedCrop(c)}
				/>
				<div>
					<canvas
						ref={previewCanvasRef}
						style={{
						width: completedCrop?.width ?? 0,
						height: completedCrop?.height ?? 0
						}}
					/>
				</div>
			</div>
			<div className="modal-footer">

				<LoadingButton
					className="cyan darken-1 waves-effect waves-light btn"
					type="button"
					disabled={!completedCrop?.width || !completedCrop?.height}
					action={() => setNewImage(previewCanvasRef.current, completedCrop)}
				>
					Validate image
				</LoadingButton>
			</div>
		</div>
	);
}

const NewImageModal = hocModal(NewImage);
export default NewImageModal;

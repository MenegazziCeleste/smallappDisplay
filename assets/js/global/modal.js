import React,  { useEffect } from 'react';
import ReactDOM from 'react-dom';

export const hocModal = (WrappedComponent) => ({id, ...props}) =>{
	useEffect(() => {
		// inits modal
		let modal = document.getElementById(id);
		M.Modal.init(modal);
	}, []);
	return (<div id={id} className="modal">
				<WrappedComponent {...props} />
			</div>)	
}

export function openModal(id){
	var modal = M.Modal.getInstance(document.getElementById(id));
	modal.open();
}

export function closeModal(id){
	var modal = M.Modal.getInstance(document.getElementById(id));
	modal.close();
}
import React,  { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import {LoadingAction} from '../utils.js';


export function CommentContainer(props){
	const ref = useRef(null);

	useEffect(() => {
		ref.current.scroll({
			top: ref.current.scrollHeight,
			left: 0,
			behavior: 'smooth'
		});
	});
	const cuteDate = (date) => {
		var jsDate = new Date(date);
		return  ("00" + jsDate.getDate()).slice(-2) + "/" +
				("00" + (jsDate.getMonth() + 1)).slice(-2) + "/" +
				jsDate.getFullYear() + " " +
				("00" + jsDate.getHours()).slice(-2) + ":" +
				("00" + jsDate.getMinutes()).slice(-2) + ":" +
				("00" + jsDate.getSeconds()).slice(-2);
	};		
	return (<div className="comments-container scroll" ref={ref}>
				{props.comments.map((comment) =>
					<div key={comment.id} >
						<span className="username">
							{comment.username != null ? comment.username + " - " : ""}{comment.email}
						</span>
						<div>
							<span className={props.admin ? "comment-bulle grey darken-3 admin-comment" : "comment-bulle grey darken-3"}> 
								{comment.comment}
							</span>
							{props.admin ? 
								<LoadingAction className="material-icons pink-text waves-effect waves-circle waves-light right" action={() => props.deleteComment(comment.id)}>
									delete
								</LoadingAction>
								:
								""}
							<span className="comment-date">
								{cuteDate(comment.time.date)}
							</span>
						</div>
					</div>
				)} 
			</div>)
}
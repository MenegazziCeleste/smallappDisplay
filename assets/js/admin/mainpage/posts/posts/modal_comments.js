import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import {successToast} from '../../../../utils.js';
import {CommentContainer} from '../../../../global/comment.js';
import {hocModal} from '../../../../global/modal.js';

class UnwrappedModalComments extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'comments': [],
		};
		this.deleteComment = this.deleteComment.bind(this);
	}
	componentDidUpdate(prevProps){
		if (this.props.postId && this.props.postId !== prevProps.postId) {
			this.getComments();
		}
	}
	getComments(){
		axios.get('/api/post/comment/list/' + this.props.postId)
			.then(data => {
				this.setState({comments: data.comments});
			});	
	}
	deleteComment(commentId){
		axios.get('/api/admin/post/comment/delete/' + commentId)
			.then(data => {
				successToast("Comment deleted");
				this.getComments();
				this.props.getPosts();
			});	
	}
	render() {
		return (	
			<div>		
				<a className="modal-close close-modal-icon right">
					<i className="material-icons grey-text">close</i>
				</a>
				<div className="modal-content">
					<h4>Comments post #{this.props.postId}</h4>
					<div className="comments-wrapper grey darken-4">
						<CommentContainer comments={this.state.comments} admin={true} deleteComment={this.deleteComment}/>
					</div>
				</div>	
			</div>
		)
	}
}
const ModalComments = hocModal(UnwrappedModalComments);
export default ModalComments;

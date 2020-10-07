import React from 'react';
import ReactDOM from 'react-dom';

import {LoadingAction} from '../utils.js';


// Pagination functions
	export function Pagination(props){
		// constructs pagination 
			var pages = [];
			if(props.pagesCount > 1){
				if(props.pagesCount > 5){
					let range = 4;
					var start = 1;
					for(let i = props.page - 2; i <= props.page ; i++){
						if(i > 0){
							start = i;
							range = range - (props.page - i)
							break;
						} 
					}
					var end = 1;
					for(let i = props.page + range ; i >= props.page ; i--){
						if(i <= props.pagesCount){
							end = i;
							break;
						}else{
							start--;
						} 
					}
				}else{
					var start = 1;
					var end = props.pagesCount;
				}			
				for (let i = start; i <= end; i++) {
					let className = "";
					if(i == props.page){
						className = "active"
					}else{
						className = "waves-effect"
					}
					pages.push(<li key={"page" + i} className={className}>
									<LoadingAction action={() => props.changePage(i)}>
										{i}
									</LoadingAction>
								</li>);
				}	
			} else {
				pages.push(<li key="page1" className="disabled"><a>1</a></li>);
			}

		return (<div className="center-align">
					<ul className="pagination">
						<li key="pageFirst" className={(props.page == 1 || props.pagesCount == 1) ? "disabled" : "waves-effect"}>
							<LoadingAction className="double-chevron" action={() => (props.page == 1 || props.pagesCount == 1) ? null : props.changePage(1) }>
								<i className="material-icons">chevron_left</i>
								<i className="material-icons">chevron_left</i>
							</LoadingAction>
						</li>
						<li key="pagePrev" className={(props.page == 1 || props.pagesCount == 1) ? "disabled" : "waves-effect"}>
							<LoadingAction action={() => (props.page == 1 || props.pagesCount == 1) ? null : props.changePage(props.page - 1) }>
								<i className="material-icons">chevron_left</i>
							</LoadingAction>
						</li>
						{pages}
						<li key="pageFol" className={(props.page == props.pagesCount || props.pagesCount == 1) ? "disabled" : "waves-effect"}>
							<LoadingAction action={() => (props.page == props.pagesCount || props.pagesCount == 1) ? null : props.changePage(props.page + 1) }>
								<i className="material-icons">chevron_right</i>
							</LoadingAction>
						</li>
						<li key="pageLast" className={(props.page == props.pagesCount || props.pagesCount == 1) ? "disabled" : "waves-effect"}>
							<LoadingAction className="double-chevron" action={() => (props.page == props.pagesCount || props.pagesCount == 1) ? null : props.changePage(props.pagesCount)}>
								<i className="material-icons">chevron_right</i>
								<i className="material-icons">chevron_right</i>
							</LoadingAction>
						</li>
					</ul>
				</div>)
	}

	export function changePage(component, path, dataFunction, page){
		if(page != component.state.page && page > 0 && page <= component.state.pagesCount){
			component.props.history.push(path + page);
			component.setState({page: page}, () => component[dataFunction]());
		}
	}

	export function setPageFromHash(component, dataFunction){
		var hash = parseInt(window.location.hash.slice(1), 10);
		var page = Number.isInteger(hash) && hash > 0 ? hash : 1;
		component.setState({'page': page}, () => component[dataFunction]());	
	}

// Sort functions
	export function SortHeader(props) {
		var sortIcon = 	props.sort == undefined ?
								<i className="material-icons">unfold_more</i> :
						props.sort == "ASC" ?
								<i className="material-icons">keyboard_arrow_up</i> :	
								<i className="material-icons">keyboard_arrow_down</i>;

		return <span>
					<span>{props.column.charAt(0).toUpperCase() + props.column.slice(1)}</span>
					<LoadingAction action={() => props.changeSort(props.column)}>
						{sortIcon}
					</LoadingAction>
				</span>;
	}

	export function changeSort(component, type, dataFunction){
		var sort = {};
		sort[type] = component.state.sort[type] != undefined && component.state.sort[type] == "DESC" ? "ASC" : "DESC";
		component.setState({'sort': sort}, () => {
			component[dataFunction]();
		});
	}
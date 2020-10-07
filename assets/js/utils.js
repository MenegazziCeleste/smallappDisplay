import React,  { useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import {NavLink} from 'react-router-dom';


// Refresh function
	export function setRefresh(component) {
		// allows the server to recognize the request was send by the app via axios
		axios.defaults.headers.common['type'] = "axios";
		axios.interceptors.request.use(
			function(config){
				component.setLoading();
				return config;
			}
		)
		axios.interceptors.response.use(
			function(response){
				component.setLoaded();

				// if the response is properly constructed, process status
				if(response.data.status != undefined){
					// displays fails 
					if(response.data.status == 'fail'){
						failToast(response.data.error);
					// return data only
					}else if(response.data.status == 'success'){
						return response.data.data;
					}
				}else if(response.config.url == '/api/login_check' ||
						response.config.url == '/api/token/refresh' ||
						response.config.url == '/api/login/log_out'){
					return response;
				}
				return Promise.reject('Bad request'); 
				
			}
			, function (error) {
				component.setLoaded();

				var config = error.config;

				// if unauthorized
				if(error.response.status === 401){

					// tries to refresh the token
					if (error.response.data.refresh_token && config.url != '/api/token/refresh') {
						return axios.post('/api/token/refresh', {
								refresh_token: error.response.data.refresh_token
							})
							.then(res => {
								if(res.status === 204){
									return axios(config);
								}
							});

					// disconnects the user
					}else{
						var message = false;

						// displays connexion errors
						if((config.url == "/api/login_check")){
							message = error.response.data.message;
		
						// displays expired connexions	
						}else if(error.response.data.connexion_expired != undefined){
							message = "Connexion expired";
						}else if('connexion_expired' in window && connexion_expired != undefined){
							component.props.history.replace("/");
							message = "Connexion expired";
						}
						
						component.setLogOut(message);
					}
				}
				
				return Promise.reject(error);
			});

	}

// Toast functions
	export function successToast(message) {
		M.toast({html: message, classes: "lime darken-1"});
	}

	export function failToast(message) {
		M.toast({html: message, classes: "pink"});
	}

	export function neutralToast(message) {
		M.toast({html: message});
	}

// Loading btns
	export const LoadingContext = React.createContext({
		loading: false,
		setLoading: () => {},
		setLoaded: () => {}
	});
	export const setLoading = (component) => {
		var loadingContext = component.state.loadingContext;
		loadingContext.loading = ++loadingContext.loading;
		component.setState({loadingContext: loadingContext});
	};
	export const setLoaded = (component) => {
		var loadingContext = component.state.loadingContext;
		loadingContext.loading = --loadingContext.loading;
		component.setState({loadingContext: loadingContext});
	};

	export function LoadingAction({action, className, ...props}){
		const loadingContext = useContext(LoadingContext);

		return (<a onClick={loadingContext.loading ? () => {} : action} {...props}
					className={loadingContext.loading && className ? className.concat(" disable") : className}>
					{props.children}
				</a>)
	}
	export function LoadingButton({type="button", className, action = () => {}, ...props}){
		const loadingContext = useContext(LoadingContext);

		return (<button type={loadingContext.loading ? "button" : type} onClick={loadingContext.loading || !action ? () => {} : action} {...props}
					className={loadingContext.loading && className ? className.concat(" disable") : className}>
					{props.children}
				</button>)

	}
	export function LoadingSelect({action, ...props}){
		const loadingContext = useContext(LoadingContext);

		useEffect(() => {
			// refresh selects
			var elems = document.querySelectorAll('select');
			M.FormSelect.init(elems, []);
		}, [loadingContext.loading]);

		return (<select disabled={loadingContext.loading ? true : false} onChange={action} {...props}>
					{props.children}
				</select>)
	}

	export function LoadingIndicator(){
		const loadingContext = useContext(LoadingContext);

		const spinner = <div className="preloader-wrapper small active">
							<div className="spinner-layer spinner-white-only">
								<div className="circle-clipper left">
									<div className="circle"></div>
								</div>
								<div className="gap-patch">
									<div className="circle"></div>
								</div>
								<div className="circle-clipper right">
									<div className="circle"></div>
								</div>
							</div>
						</div>

		return (<div className="loading-indicator right">
					{loadingContext.loading ? spinner : ""}
				</div>)
	}

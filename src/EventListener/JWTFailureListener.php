<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTFailureEventInterface;
use Symfony\Component\HttpFoundation\Cookie;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;

class JWTFailureListener{


	protected $request;

	public function __construct(RequestStack $requestStack){
		$this->request = $requestStack->getCurrentRequest();
	}

	private function getFailResponse($data, $cookieToClear){
		$response = new JsonResponse($data);
		$response->headers->clearCookie($cookieToClear);
		$response->setStatusCode(JsonResponse::HTTP_UNAUTHORIZED);
		return $response; 
	}

	/**
	* @param JWTFailureEventInterface $event
	*/
	public function onJWTFail(JWTFailureEventInterface $event)
	{
		// if the request isn't made by axios (recognizable with custom header), try to refresh 
		// return to mainpage (can happen if you reload admin with expired token and refresh token)
		if($this->request->headers->get('type') != "axios"){

			$response = new RedirectResponse("/");

			// tells the front that the admin was previously connected  
			if(!$this->request->cookies->get('refresh_token') && $this->request->cookies->get('connected')){

				$response = new RedirectResponse("/?connexion_expired=true");
				$response->headers->clearCookie('connected');

			}
			
			$event->setResponse($response);
		
		}else{

			// if there is a cookie with the refresh token, try to refresh
			if($refreshToken = $this->request->cookies->get('refresh_token')){

				$response = $this->getFailResponse(['refresh_token' => $refreshToken], 'refresh_token');
				$event->setResponse($response); 

			// tells the front that the user was previously connected  
			}else if ($this->request->cookies->get('connected')){

				$response = $this->getFailResponse(['connexion_expired' => true], 'connected');
				$event->setResponse($response);   

			}
		}

	}
}
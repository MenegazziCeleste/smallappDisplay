<?php

namespace App\EventListener;

use Symfony\Component\HttpFoundation\Cookie;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;


class AuthenticationSuccessListener{

	/**
	* @param AuthenticationSuccessEvent $event
	*/
	public function onAuthenticationSuccessResponse(AuthenticationSuccessEvent $event)
	{
		// gets refresh token from the data, clears the data
		$data = $event->getData();
		$refreshToken = $data['refresh_token'];
		$event->setData([]);


		$response = $event->getResponse();

		// sets refresh token into a secure cookie
		// set expiration to the ttl in gesdinet_jwt_refresh_token config
		$response->headers->setCookie(Cookie::create('refresh_token', $refreshToken)
						->withExpires(new \DateTime("+" . $_ENV['REFRESH_TTL'] . " seconds"))
						->withSecure(true));

		// used to know when a connexion expired
		$response->headers->setCookie(Cookie::create('connected', true)
							->withSecure(true));
	}	
}